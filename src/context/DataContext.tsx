import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  User as FirebaseUser,
  UserCredential,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  ADMIN_EMAIL,
  getUserEmail,
  isAuthorizedAdminEmail,
  isAuthorizedAdminUser,
  isRunningInIframe,
  isTokenServiceDisabledError,
  formatAuthErrorMessage,
  persistenceReadyPromise,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  Blog,
  Category,
  Project,
  Profile,
  Subscriber,
  ContactMessage,
  ToastNotification,
} from '../types';
import {
  DEMO_BLOG_IDS,
  DEMO_PROJECT_IDS,
  INITIAL_BLOGS,
  INITIAL_CATEGORIES,
  INITIAL_PROJECTS,
  INITIAL_PROFILE,
} from '../data/seedData';

interface DataContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  authLoading: boolean;
  isSigningIn: boolean;
  authError: string | null;
  dataLoading: boolean;
  blogs: Blog[];
  publishedBlogs: Blog[];
  categories: Category[];
  projects: Project[];
  profile: Profile;
  subscribers: Subscriber[];
  messages: ContactMessage[];
  bookmarkedSlugs: string[];
  toasts: ToastNotification[];
  signInAdmin: () => Promise<void>;
  signInAdminWithRedirect: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  clearAuthError: () => void;
  saveBlog: (blog: Omit<Blog, 'id'> & { id?: string }) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;
  toggleBlogStatus: (id: string) => Promise<void>;
  saveCategory: (category: Omit<Category, 'id'> & { id?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveProject: (project: Omit<Project, 'id'> & { id?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  subscribeNewsletter: (email: string) => Promise<void>;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  markMessageRead: (id: string) => Promise<void>;
  toggleBookmark: (slug: string) => void;
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const REDIRECT_PENDING_KEY = 'learnwithme_auth_redirect_pending_v1';

// Module-level singleton promise so React StrictMode double-mounts share the exact same getRedirectResult call
let sharedRedirectResultPromise: Promise<UserCredential | null> | null = null;
function consumeRedirectResultOnce(): Promise<UserCredential | null> {
  if (!sharedRedirectResultPromise) {
    sharedRedirectResultPromise = persistenceReadyPromise.then(() => getRedirectResult(auth));
  }
  return sharedRedirectResultPromise;
}

const STORAGE_KEYS = {
  BLOGS: 'learnwithme_blogs_v3',
  CATEGORIES: 'learnwithme_categories_v2',
  PROJECTS: 'learnwithme_projects_v3',
  PROFILE: 'learnwithme_profile_v3',
  BOOKMARKS: 'learnwithme_bookmarks_v2',
  SUBSCRIBERS: 'learnwithme_subscribers_v2',
  MESSAGES: 'learnwithme_messages_v2',
};

const LEGACY_DEMO_KEYS = [
  'learnwithme_blogs_v1',
  'learnwithme_blogs_v2',
  'learnwithme_projects_v1',
  'learnwithme_projects_v2',
  'learnwithme_profile_v1',
  'learnwithme_profile_v2',
  'learnwithme_demo_admin_v1',
];

function isDemoBlogRecord(id: string, data: Partial<Blog>): boolean {
  if (DEMO_BLOG_IDS.has(id)) return true;
  if (data.isSample === true) return true;
  if (data.authorId === 'sample-admin') return true;
  if (data.authorName === 'CS Learning Journal (Sample)') return true;
  return false;
}

function isDemoProjectRecord(id: string, data: Partial<Project>): boolean {
  if (DEMO_PROJECT_IDS.has(id)) return true;
  if (data.isDemo === true) return true;
  if (data.name && data.name.includes('(Demo Project)')) return true;
  if (data.githubUrl && data.githubUrl.includes('your-username')) return true;
  return false;
}

function sanitizeId(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || `item-${Date.now()}`
  );
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(() => {
    try {
      return sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const signingInRef = useRef(false);
  const lastAuthNotificationRef = useRef<{ key: string; timestamp: number }>({
    key: '',
    timestamp: 0,
  });

  // Purge legacy localStorage keys that held sample/demo content
  useEffect(() => {
    try {
      LEGACY_DEMO_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore storage errors
    }
  }, []);

  const [blogs, setBlogs] = useState<Blog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
      if (!saved) return INITIAL_BLOGS;
      const parsed = JSON.parse(saved) as Blog[];
      // Preserve only genuine user-created blogs, stripping any demo records
      return Array.isArray(parsed)
        ? parsed
            .filter((b) => !isDemoBlogRecord(b.id, b))
            .map((b) => ({
              ...b,
              isSample: false,
              authorName: 'Guna Sekhar',
            }))
        : INITIAL_BLOGS;
    } catch {
      return INITIAL_BLOGS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!saved) return INITIAL_PROJECTS;
      const parsed = JSON.parse(saved) as Project[];
      // Preserve only genuine user-created projects, stripping any demo records
      return Array.isArray(parsed)
        ? parsed.filter((p) => !isDemoProjectRecord(p.id, p))
        : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!saved) return INITIAL_PROFILE;
      const parsed = JSON.parse(saved) as Profile;
      return {
        ...INITIAL_PROFILE,
        ...parsed,
        name:
          !parsed.name || parsed.name.includes('[Your Name')
            ? 'Guna Sekhar'
            : parsed.name,
        roleTitle:
          !parsed.roleTitle || parsed.roleTitle.includes('Computer Science Student')
            ? 'Integrated M.Tech CSE — 2nd Year'
            : parsed.roleTitle,
        email:
          !parsed.email ||
          parsed.email.includes('example.com') ||
          isAuthorizedAdminEmail(parsed.email)
            ? ''
            : parsed.email,
      };
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Strict administrator verification: Only the authorized administrator account can access admin controls
  const isVerifiedCloudAdmin = isAuthorizedAdminUser(user);

  const isAdmin = isVerifiedCloudAdmin;

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => {
      // Prevent duplicate identical toasts from stacking on screen
      const filtered = prev.filter(
        (t) => !(t.title === title && (t.description || '') === (description || ''))
      );
      return [...filtered, { id, title, description, type }];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const notifyAuthOnce = (
    key: string,
    title: string,
    description: string,
    type: 'success' | 'error' | 'info'
  ) => {
    const now = Date.now();
    if (
      lastAuthNotificationRef.current.key === key &&
      now - lastAuthNotificationRef.current.timestamp < 5000
    ) {
      return;
    }
    lastAuthNotificationRef.current = { key, timestamp: now };
    addToast(title, description, type);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync local storage mirror
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    } catch {
      // ignore
    }
  }, [blogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Listen to Auth state and resolve Google Sign-In redirect result
  useEffect(() => {
    let isMounted = true;
    let authStateSettled = false;
    let redirectSettled = false;

    const clearPendingFlag = () => {
      try {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY);
      } catch {
        // ignore storage errors
      }
    };

    const hadPendingRedirect = () => {
      try {
        return sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1';
      } catch {
        return false;
      }
    };

    const markReadyIfBothSettled = () => {
      if (isMounted && authStateSettled && redirectSettled) {
        setAuthLoading(false);
        setIsSigningIn(false);
        signingInRef.current = false;
      }
    };

    const verifyAndHandleUser = async (
      currentUser: FirebaseUser | null,
      fromRedirectResult = false
    ) => {
      if (!currentUser) {
        if (isMounted && !fromRedirectResult) {
          setUser(null);
        }
        return;
      }

      if (isAuthorizedAdminUser(currentUser)) {
        // Immediately grant Admin Dashboard access once the authorized admin account is verified
        if (isMounted) {
          setUser(currentUser);
          setAuthError(null);
          setAuthLoading(false);
          setIsSigningIn(false);
          signingInRef.current = false;
        }

        if (fromRedirectResult || hadPendingRedirect()) {
          clearPendingFlag();
          notifyAuthOnce(
            `signin-success-${currentUser.uid}`,
            'Signed in successfully',
            'Authenticated with your authorized administrator Google account.',
            'success'
          );
        }

        try {
          await currentUser.getIdToken();
        } catch (tokenErr) {
          if (isTokenServiceDisabledError(tokenErr)) {
            clearPendingFlag();
            const formatted = formatAuthErrorMessage(tokenErr);
            if (isMounted) {
              setUser(null);
              setAuthError(formatted.message);
            }
            notifyAuthOnce(
              `token-err-${formatted.title}`,
              formatted.title,
              formatted.message,
              'error'
            );
            await signOut(auth).catch(() => {});
          }
          return;
        }

        try {
          const resolvedEmail = getUserEmail(currentUser) || ADMIN_EMAIL;
          await setDoc(
            doc(db, 'users', currentUser.uid),
            {
              email: resolvedEmail.slice(0, 200),
              displayName: (currentUser.displayName || 'Guna Sekhar').slice(0, 120),
              role: 'admin',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not sync user record:', err);
        }
      } else {
        // Unauthorized Google account or unverified email: enforce strict admin restriction
        const attemptedKey = (getUserEmail(currentUser) || 'unauthorized').toLowerCase();
        clearPendingFlag();
        const unauthorizedMessage =
          currentUser.emailVerified === false
            ? 'This Google account does not have a verified email address. Please sign in with your verified authorized administrator Google account.'
            : 'Access denied. Only the authorized administrator Google account is allowed to access the LearnWithMe Admin Studio.';

        if (isMounted) {
          setUser(null);
          setAuthError(unauthorizedMessage);
          setIsSigningIn(false);
          signingInRef.current = false;
        }

        notifyAuthOnce(
          `unauthorized-${attemptedKey}`,
          'Unauthorized Account',
          unauthorizedMessage,
          'error'
        );

        try {
          await signOut(auth);
        } catch (signOutErr) {
          console.warn('Error signing out unauthorized account:', signOutErr);
        }
      }
    };

    // 1. Handle redirect result from signInWithRedirect()
    consumeRedirectResultOnce()
      .then(async (result) => {
        if (result?.user) {
          await verifyAndHandleUser(result.user, true);
          return;
        }
        await auth.authStateReady();
        if (auth.currentUser) {
          await verifyAndHandleUser(auth.currentUser, hadPendingRedirect());
        } else if (hadPendingRedirect()) {
          clearPendingFlag();
          const redirectBlockedMsg =
            'Full-page redirect sign-in could not restore your session because your browser blocked cross-domain authentication storage. Please click "Sign In with Google (Authorized Admin Only)" below to sign in directly.';
          if (isMounted) {
            setAuthError(redirectBlockedMsg);
          }
        }
      })
      .catch((error) => {
        clearPendingFlag();
        const formatted = formatAuthErrorMessage(error);
        if (isMounted) {
          setAuthError(formatted.message);
          setIsSigningIn(false);
          signingInRef.current = false;
        }
        notifyAuthOnce(
          `redirect-err-${formatted.title}-${formatted.message}`,
          formatted.title,
          formatted.message,
          'error'
        );
      })
      .finally(() => {
        redirectSettled = true;
        markReadyIfBothSettled();
      });

    // 2. Subscribe to continuous auth state changes
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      await verifyAndHandleUser(currentUser, false);
      authStateSettled = true;
      markReadyIfBothSettled();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Load & sync collections from Firestore, automatically deleting any demo records while preserving genuine user-created content
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    async function fetchAndSyncFirestore() {
      try {
        // 1. Fetch blogs: identify and remove demo records, preserve genuine user-created articles
        const blogsQuery = isVerifiedCloudAdmin
          ? collection(db, 'blogs')
          : query(collection(db, 'blogs'), where('status', '==', 'published'));

        const blogSnap = await getDocs(blogsQuery);
        if (isMounted) {
          const genuineBlogs: Blog[] = [];
          const demoIdsToDelete: string[] = [];

          blogSnap.forEach((docSnap) => {
            const data = docSnap.data() as Omit<Blog, 'id'>;
            if (isDemoBlogRecord(docSnap.id, data)) {
              demoIdsToDelete.push(docSnap.id);
            } else {
              genuineBlogs.push({
                id: docSnap.id,
                ...data,
                isSample: false,
                authorName: 'Guna Sekhar',
              });
            }
          });

          // If signed in as verified administrator, permanently delete demo blog records from Firestore
          if (isVerifiedCloudAdmin && demoIdsToDelete.length > 0) {
            for (const demoId of demoIdsToDelete) {
              try {
                await deleteDoc(doc(db, 'blogs', demoId));
              } catch (err) {
                console.warn(`Could not delete demo blog ${demoId}:`, err);
              }
            }
          }

          setBlogs(genuineBlogs.sort((a, b) => b.week - a.week));
        }

        // 2. Fetch categories
        const catSnap = await getDocs(collection(db, 'categories'));
        if (!catSnap.empty && isMounted) {
          const remoteCats: Category[] = [];
          catSnap.forEach((d) =>
            remoteCats.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) })
          );
          setCategories(remoteCats);
        } else if (isVerifiedCloudAdmin) {
          for (const cat of INITIAL_CATEGORIES) {
            const { id, ...rest } = cat;
            await setDoc(doc(db, 'categories', id), rest);
          }
        }

        // 3. Fetch projects: identify and remove demo records, preserve genuine user-created projects
        const projSnap = await getDocs(collection(db, 'projects'));
        if (isMounted) {
          const genuineProjects: Project[] = [];
          const demoProjIdsToDelete: string[] = [];

          projSnap.forEach((d) => {
            const data = d.data() as Omit<Project, 'id'>;
            if (isDemoProjectRecord(d.id, data)) {
              demoProjIdsToDelete.push(d.id);
            } else {
              genuineProjects.push({
                id: d.id,
                ...data,
                isDemo: false,
              });
            }
          });

          // If signed in as verified administrator, permanently delete demo project records from Firestore
          if (isVerifiedCloudAdmin && demoProjIdsToDelete.length > 0) {
            for (const demoProjId of demoProjIdsToDelete) {
              try {
                await deleteDoc(doc(db, 'projects', demoProjId));
              } catch (err) {
                console.warn(`Could not delete demo project ${demoProjId}:`, err);
              }
            }
          }

          setProjects(genuineProjects);
        }

        // 4. Fetch profile (ensure Guna Sekhar's real information is active, no fake placeholders)
        const profSnap = await getDocs(collection(db, 'profile'));
        if (!profSnap.empty && isMounted) {
          const first = profSnap.docs[0];
          const remoteProf = first.data() as Omit<Profile, 'id'>;
          const hasLegacyDummy =
            !remoteProf.name ||
            remoteProf.name.includes('[Your Name') ||
            remoteProf.roleTitle?.includes('Computer Science Student');

          if (!hasLegacyDummy) {
            setProfile((prev) => ({
              ...INITIAL_PROFILE,
              ...prev,
              ...remoteProf,
              id: first.id,
              githubUrl: remoteProf.githubUrl?.includes('your-username')
                ? ''
                : remoteProf.githubUrl || '',
              linkedinUrl: remoteProf.linkedinUrl?.includes('your-profile')
                ? ''
                : remoteProf.linkedinUrl || '',
              email:
                !remoteProf.email ||
                remoteProf.email.includes('example.com') ||
                isAuthorizedAdminEmail(remoteProf.email)
                  ? ''
                  : remoteProf.email,
            }));
          } else if (isVerifiedCloudAdmin) {
            const {
              name,
              roleTitle,
              introduction,
              education,
              learningPhilosophy,
              interests,
              skills,
              goals,
              githubUrl,
              linkedinUrl,
              email,
            } = INITIAL_PROFILE;
            await setDoc(doc(db, 'profile', 'main'), {
              name,
              roleTitle,
              introduction,
              education,
              learningPhilosophy,
              interests,
              skills,
              goals,
              githubUrl,
              linkedinUrl,
              email,
            });
          }
        } else if (isVerifiedCloudAdmin) {
          const {
            name,
            roleTitle,
            introduction,
            education,
            learningPhilosophy,
            interests,
            skills,
            goals,
            githubUrl,
            linkedinUrl,
            email,
          } = INITIAL_PROFILE;
          await setDoc(doc(db, 'profile', 'main'), {
            name,
            roleTitle,
            introduction,
            education,
            learningPhilosophy,
            interests,
            skills,
            goals,
            githubUrl,
            linkedinUrl,
            email,
          });
        }
      } catch (err) {
        if (isTokenServiceDisabledError(err)) {
          const formatted = formatAuthErrorMessage(err);
          if (isMounted) {
            setUser(null);
            setAuthError(formatted.message);
          }
          await signOut(auth).catch(() => {});
        } else {
          console.warn('Using local state:', err);
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    }

    fetchAndSyncFirestore();

    // If verified cloud admin, attach live listeners to subscribers and contact_messages
    let unsubSubscribers: (() => void) | undefined;
    let unsubMessages: (() => void) | undefined;

    if (isVerifiedCloudAdmin) {
      unsubSubscribers = onSnapshot(
        collection(db, 'subscribers'),
        (snap) => {
          const list: Subscriber[] = [];
          snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Subscriber, 'id'>) }));
          setSubscribers(list);
        },
        (err) => {
          if (isTokenServiceDisabledError(err)) {
            signOut(auth).catch(() => {});
            return;
          }
          handleFirestoreError(err, OperationType.LIST, 'subscribers');
        }
      );

      unsubMessages = onSnapshot(
        collection(db, 'contact_messages'),
        (snap) => {
          const list: ContactMessage[] = [];
          snap.forEach((d) =>
            list.push({ id: d.id, ...(d.data() as Omit<ContactMessage, 'id'>) })
          );
          setMessages(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        },
        (err) => {
          if (isTokenServiceDisabledError(err)) {
            signOut(auth).catch(() => {});
            return;
          }
          handleFirestoreError(err, OperationType.LIST, 'contact_messages');
        }
      );
    }

    return () => {
      isMounted = false;
      if (unsubSubscribers) unsubSubscribers();
      if (unsubMessages) unsubMessages();
    };
  }, [authLoading, isVerifiedCloudAdmin, user]);

  const signInAdminWithRedirect = async () => {
    if (signingInRef.current || isSigningIn) {
      return;
    }

    signingInRef.current = true;
    setIsSigningIn(true);
    setAuthError(null);

    try {
      try {
        sessionStorage.setItem(REDIRECT_PENDING_KEY, '1');
      } catch {
        // ignore storage errors
      }
      sharedRedirectResultPromise = null;
      // Call signInWithRedirect synchronously without any preceding await
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      try {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY);
      } catch {
        // ignore storage errors
      }
      signingInRef.current = false;
      setIsSigningIn(false);

      const formatted = formatAuthErrorMessage(error);
      setAuthError(formatted.message);
      notifyAuthOnce(
        `signin-err-${formatted.title}-${formatted.message}`,
        formatted.title,
        formatted.message,
        'error'
      );
    }
  };

  const signInAdmin = async () => {
    if (signingInRef.current || isSigningIn) {
      return;
    }

    // Invoke signInWithPopup synchronously on the click gesture with zero preceding awaits
    // so both standalone deployments (Vercel / Cloud Run) and embedded previews authenticate
    // immediately without cross-domain redirect storage partitioning losing the session.
    signingInRef.current = true;
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      if (credential?.user) {
        if (isAuthorizedAdminUser(credential.user)) {
          setUser(credential.user);
          setAuthError(null);
          setAuthLoading(false);
          setIsSigningIn(false);
          signingInRef.current = false;
          notifyAuthOnce(
            `signin-success-${credential.user.uid}`,
            'Signed in successfully',
            'Authenticated with your authorized administrator Google account.',
            'success'
          );
          try {
            const resolvedEmail = getUserEmail(credential.user) || ADMIN_EMAIL;
            await setDoc(
              doc(db, 'users', credential.user.uid),
              {
                email: resolvedEmail.slice(0, 200),
                displayName: (credential.user.displayName || 'Guna Sekhar').slice(0, 120),
                role: 'admin',
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (err) {
            console.warn('Could not sync user record:', err);
          }
          return;
        } else {
          const attemptedKey = (getUserEmail(credential.user) || 'unauthorized').toLowerCase();
          const unauthorizedMessage =
            'Access denied. Only the authorized administrator Google account is allowed to access the LearnWithMe Admin Studio.';
          setUser(null);
          setAuthError(unauthorizedMessage);
          setIsSigningIn(false);
          signingInRef.current = false;
          notifyAuthOnce(
            `unauthorized-${attemptedKey}`,
            'Unauthorized Account',
            unauthorizedMessage,
            'error'
          );
          await signOut(auth).catch(() => {});
          return;
        }
      }
      signingInRef.current = false;
      setIsSigningIn(false);
    } catch (error) {
      signingInRef.current = false;
      setIsSigningIn(false);

      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code || '')
          : '';
      const rawMessage = error instanceof Error ? error.message : String(error || '');

      // If a browser popup blocker prevented the popup in a standalone tab, fall back to redirect
      if (
        (code === 'auth/popup-blocked' || rawMessage.includes('auth/popup-blocked')) &&
        !isRunningInIframe()
      ) {
        await signInAdminWithRedirect();
        return;
      }

      if (isTokenServiceDisabledError(error)) {
        await signOut(auth).catch(() => {});
      }

      const formatted = formatAuthErrorMessage(error);
      setAuthError(formatted.message);
      notifyAuthOnce(
        `signin-err-${formatted.title}-${formatted.message}`,
        formatted.title,
        formatted.message,
        'error'
      );
    }
  };

  const signOutAdmin = async () => {
    try {
      try {
        sessionStorage.removeItem(REDIRECT_PENDING_KEY);
      } catch {
        // ignore storage errors
      }
      setAuthError(null);
      setIsSigningIn(false);
      signingInRef.current = false;
      await signOut(auth);
      notifyAuthOnce('signout-info', 'Signed out', 'You have exited the Admin Dashboard.', 'info');
    } catch (error) {
      console.error(error);
    }
  };

  const saveBlog = async (blogInput: Omit<Blog, 'id'> & { id?: string }): Promise<Blog> => {
    const cleanSlug = sanitizeId(blogInput.slug || blogInput.title);
    const id = blogInput.id
      ? sanitizeId(blogInput.id)
      : `week-${blogInput.week}-${cleanSlug}`.slice(0, 100);

    const payload: Omit<Blog, 'id'> = {
      title: blogInput.title.trim().slice(0, 200),
      slug: cleanSlug.slice(0, 160),
      subtitle: (blogInput.subtitle || '').trim().slice(0, 300),
      description: (blogInput.description || '').trim().slice(0, 600),
      content: blogInput.content.slice(0, 80000),
      week: Math.max(1, Math.min(520, Number(blogInput.week) || 1)),
      category: blogInput.category.trim().slice(0, 100),
      tags: (blogInput.tags || []).slice(0, 15).map((t) => t.trim().slice(0, 60)),
      coverImage: (blogInput.coverImage || 'editorial:java').trim().slice(0, 2000),
      publicationDate: (
        blogInput.publicationDate || new Date().toISOString().split('T')[0]
      ).slice(0, 64),
      readingTime: Math.max(1, Math.min(180, Number(blogInput.readingTime) || 5)),
      status: blogInput.status === 'draft' ? 'draft' : 'published',
      featured: Boolean(blogInput.featured),
      isSample: false,
      keyTakeaways: (blogInput.keyTakeaways || [])
        .slice(0, 15)
        .map((k) => k.trim().slice(0, 400)),
      authorName: (blogInput.authorName || profile.name || 'Guna Sekhar').slice(0, 120),
      authorId: user?.uid || 'admin',
    };

    const fullBlog: Blog = { id, ...payload };

    setBlogs((prev) => {
      const exists = prev.some((b) => b.id === id);
      const updated = exists ? prev.map((b) => (b.id === id ? fullBlog : b)) : [fullBlog, ...prev];
      return updated.sort((a, b) => b.week - a.week);
    });

    if (isVerifiedCloudAdmin && user) {
      try {
        await setDoc(doc(db, 'blogs', id), { ...payload, authorId: user.uid });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `blogs/${id}`);
      }
    }

    addToast(
      payload.status === 'published' ? 'Article Published!' : 'Draft Saved',
      `"${payload.title}" is now ${payload.status}.`
    );
    return fullBlog;
  };

  const deleteBlog = async (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    if (isVerifiedCloudAdmin) {
      try {
        await deleteDoc(doc(db, 'blogs', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
      }
    }
    addToast('Article Deleted', 'The article has been removed.', 'info');
  };

  const toggleBlogStatus = async (id: string) => {
    const target = blogs.find((b) => b.id === id);
    if (!target) return;
    const nextStatus: 'published' | 'draft' = target.status === 'published' ? 'draft' : 'published';
    await saveBlog({ ...target, status: nextStatus });
  };

  const saveCategory = async (catInput: Omit<Category, 'id'> & { id?: string }) => {
    const cleanSlug = sanitizeId(catInput.slug || catInput.name);
    const id = catInput.id ? sanitizeId(catInput.id) : cleanSlug;
    const payload: Omit<Category, 'id'> = {
      name: catInput.name.trim().slice(0, 100),
      slug: cleanSlug.slice(0, 100),
      description: catInput.description.trim().slice(0, 500),
      icon: (catInput.icon || 'BookOpen').trim().slice(0, 60),
    };

    setCategories((prev) => {
      const exists = prev.some((c) => c.id === id);
      return exists
        ? prev.map((c) => (c.id === id ? { id, ...payload } : c))
        : [...prev, { id, ...payload }];
    });

    if (isVerifiedCloudAdmin) {
      try {
        await setDoc(doc(db, 'categories', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
      }
    }
    addToast('Category Saved', `"${payload.name}" updated.`);
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (isVerifiedCloudAdmin) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      }
    }
    addToast('Category Removed', 'Category deleted.', 'info');
  };

  const saveProject = async (projInput: Omit<Project, 'id'> & { id?: string }) => {
    const id = projInput.id ? sanitizeId(projInput.id) : `proj-${sanitizeId(projInput.name)}`;
    const payload: Omit<Project, 'id'> = {
      name: projInput.name.trim().slice(0, 150),
      description: projInput.description.trim().slice(0, 1000),
      technologies: (projInput.technologies || []).slice(0, 20).map((t) => t.trim().slice(0, 60)),
      coverImage: (projInput.coverImage || 'project:visualizer').trim().slice(0, 2000),
      githubUrl: (projInput.githubUrl || '').trim().slice(0, 500),
      demoUrl: (projInput.demoUrl || '').trim().slice(0, 500),
      isDemo: false,
    };

    setProjects((prev) => {
      const exists = prev.some((p) => p.id === id);
      return exists
        ? prev.map((p) => (p.id === id ? { id, ...payload } : p))
        : [...prev, { id, ...payload }];
    });

    if (isVerifiedCloudAdmin) {
      try {
        await setDoc(doc(db, 'projects', id), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `projects/${id}`);
      }
    }
    addToast('Project Saved', `"${payload.name}" has been updated.`);
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (isVerifiedCloudAdmin) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    }
    addToast('Project Removed', 'Project removed from showcase.', 'info');
  };

  const saveProfile = async (profInput: Profile) => {
    const firestorePayload = {
      name: profInput.name.trim().slice(0, 120),
      roleTitle: profInput.roleTitle.trim().slice(0, 160),
      introduction: profInput.introduction.trim().slice(0, 2000),
      education: profInput.education.trim().slice(0, 1000),
      learningPhilosophy: profInput.learningPhilosophy.trim().slice(0, 1500),
      interests: (profInput.interests || []).slice(0, 20).map((i) => i.trim().slice(0, 100)),
      skills: (profInput.skills || []).slice(0, 25).map((s) => s.trim().slice(0, 100)),
      goals: (profInput.goals || []).slice(0, 15).map((g) => g.trim().slice(0, 300)),
      githubUrl: (profInput.githubUrl || '').trim().slice(0, 500),
      linkedinUrl: (profInput.linkedinUrl || '').trim().slice(0, 500),
      email: (profInput.email || '').trim().slice(0, 200),
    };

    const fullLocalProfile: Profile = {
      id: 'main',
      ...firestorePayload,
      degree: (profInput.degree || 'Integrated Master of Technology (Integrated M.Tech)').trim(),
      branch: (profInput.branch || 'Computer Science and Engineering (CSE)').trim(),
      currentYear: (profInput.currentYear || '2nd Year').trim(),
      avatarUrl: profInput.avatarUrl || '',
    };

    setProfile(fullLocalProfile);

    if (isVerifiedCloudAdmin) {
      try {
        await setDoc(doc(db, 'profile', 'main'), firestorePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'profile/main');
      }
    }
    addToast('Profile Updated', 'Your About Me page and personal profile have been updated.');
  };

  const subscribeNewsletter = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(trimmed) || trimmed.length > 200) {
      throw new Error('Please enter a valid email address.');
    }

    const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
      email: trimmed,
      subscriptionDate: new Date().toISOString(),
      status: 'active' as const,
    };

    try {
      await setDoc(doc(db, 'subscribers', subId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `subscribers/${subId}`);
    }

    setSubscribers((prev) => {
      const next = [{ id: subId, ...payload }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addToast('Welcome to LearnWithMe!', 'You are now subscribed to weekly CS learning dispatches.');
  };

  const submitContactMessage = async (
    msgInput: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
  ) => {
    const name = msgInput.name.trim();
    const email = msgInput.email.trim();
    const subject = msgInput.subject.trim();
    const message = msgInput.message.trim();

    if (name.length < 2) throw new Error('Please enter your name (at least 2 characters).');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      throw new Error('Please enter a valid email address.');
    if (subject.length < 2) throw new Error('Please enter a subject.');
    if (message.length < 5) throw new Error('Please write a message (at least 5 characters).');

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      subject: subject.slice(0, 200),
      message: message.slice(0, 4000),
      createdAt: new Date().toISOString(),
      status: 'unread' as const,
    };

    try {
      await setDoc(doc(db, 'contact_messages', msgId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contact_messages/${msgId}`);
    }

    setMessages((prev) => {
      const next = [{ id: msgId, ...payload }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addToast(
      'Message Sent!',
      'Thank you for reaching out. Your message has been recorded in Cloud Firestore.'
    );
  };

  const markMessageRead = async (id: string) => {
    const target = messages.find((m) => m.id === id);
    if (!target) return;
    const updated: ContactMessage = { ...target, status: 'read' };
    setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (isVerifiedCloudAdmin) {
      try {
        const { id: _unused, ...rest } = updated;
        await setDoc(doc(db, 'contact_messages', id), rest);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contact_messages/${id}`);
      }
    }
  };

  const toggleBookmark = (slug: string) => {
    setBookmarkedSlugs((prev) => {
      const exists = prev.includes(slug);
      const next = exists ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next));
      } catch {
        // ignore
      }
      addToast(
        exists ? 'Removed from Reading List' : 'Saved to Reading List',
        exists ? 'Bookmark removed.' : 'Article bookmarked for quick access in this browser.',
        'info'
      );
      return next;
    });
  };

  const publishedBlogs = blogs
    .filter((b) => b.status === 'published' && !isDemoBlogRecord(b.id, b))
    .sort((a, b) => b.week - a.week);

  return (
    <DataContext.Provider
      value={{
        user,
        isAdmin,
        authLoading,
        isSigningIn,
        authError,
        dataLoading,
        blogs,
        publishedBlogs,
        categories,
        projects,
        profile,
        subscribers,
        messages,
        bookmarkedSlugs,
        toasts,
        signInAdmin,
        signInAdminWithRedirect,
        signOutAdmin,
        clearAuthError,
        saveBlog,
        deleteBlog,
        toggleBlogStatus,
        saveCategory,
        deleteCategory,
        saveProject,
        deleteProject,
        saveProfile,
        subscribeNewsletter,
        submitContactMessage,
        markMessageRead,
        toggleBookmark,
        addToast,
        removeToast,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};

import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseAppletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
    firebaseAppletConfig.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure local persistence once at startup so click handlers remain synchronous
// and preserve browser user-gesture activation for popup/redirect flows.
export const persistenceReadyPromise: Promise<void> = setPersistence(
  auth,
  browserLocalPersistence
).catch((err) => {
  console.warn('Could not set auth persistence:', err);
});

// Proactively initialize Firebase Auth's hidden GAPI iframe & origin check on desktop browsers
// so signInWithPopup does not stall for 1-3 seconds downloading apis.google.com/js/api.js on first click.
export const popupResolverReadyPromise: Promise<void> = (async () => {
  if (typeof window === 'undefined') return;
  try {
    await persistenceReadyPromise;
    const internalAuth = auth as unknown as {
      _initializationPromise?: Promise<unknown>;
      _popupRedirectResolver?: {
        _initialize?: (authInstance: unknown) => Promise<unknown>;
        _originValidation?: (authInstance: unknown) => Promise<unknown>;
      };
    };
    if (internalAuth._initializationPromise) {
      await internalAuth._initializationPromise;
    }
    if (internalAuth._popupRedirectResolver?._initialize) {
      await internalAuth._popupRedirectResolver._initialize(auth);
    }
    if (internalAuth._popupRedirectResolver?._originValidation) {
      await internalAuth._popupRedirectResolver._originValidation(auth);
    }
  } catch (err) {
    console.warn('Could not pre-initialize auth popup resolver:', err);
  }
})();

/**
 * Opens the OAuth popup window synchronously on the first line of the user's click event
 * (before any async/await or GAPI network calls), then hands the open window to Firebase's
 * signInWithPopup so Chrome/Safari/Edge popup blockers never block the login flow.
 */
export async function signInWithGooglePopupSynchronously(): Promise<UserCredential> {
  if (typeof window === 'undefined') {
    return signInWithPopup(auth, googleProvider);
  }

  const width = 500;
  const height = 600;
  const top = Math.max((window.screen.availHeight - height) / 2, 0);
  const left = Math.max((window.screen.availWidth - width) / 2, 0);
  const popupFeatures = `location=yes,resizable=yes,statusbar=yes,toolbar=no,scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`;

  const originalWindowOpen = window.open.bind(window);
  let preOpenedWin: Window | null = null;

  try {
    preOpenedWin = originalWindowOpen('about:blank', '_blank', popupFeatures);
    if (preOpenedWin && !preOpenedWin.closed) {
      try {
        preOpenedWin.document.title = 'Sign in with Google — LearnWithMe';
        preOpenedWin.document.body.innerHTML =
          '<div style="font-family:system-ui,-apple-system,sans-serif;background:#FFF8EF;color:#594438;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;"><div><p style="font-size:16px;font-weight:600;margin:0 0 8px;">Connecting to Google Sign-In…</p><p style="font-size:13px;color:#887467;margin:0;">Please wait a moment.</p></div></div>';
      } catch {
        // Ignore cross-origin or document write restrictions
      }
    }
  } catch {
    preOpenedWin = null;
  }

  let intercepted = false;
  if (preOpenedWin && !preOpenedWin.closed) {
    window.open = ((url?: string | URL, target?: string, features?: string): Window | null => {
      const urlStr = url ? String(url) : '';
      if (!intercepted && preOpenedWin && !preOpenedWin.closed) {
        intercepted = true;
        window.open = originalWindowOpen;
        if (urlStr) {
          try {
            preOpenedWin.location.replace(urlStr);
          } catch {
            preOpenedWin.location.href = urlStr;
          }
        }
        try {
          preOpenedWin.focus();
        } catch {
          // ignore
        }
        return preOpenedWin;
      }
      return originalWindowOpen(url, target, features);
    }) as typeof window.open;
  }

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (preOpenedWin && !preOpenedWin.closed) {
      try {
        preOpenedWin.close();
      } catch {
        // ignore
      }
    }
    throw err;
  } finally {
    window.open = originalWindowOpen;
  }
}

export function isRunningInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'guna.chinnu07@gmail.com';

export function isAuthorizedAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase());
}

export function getUserEmail(
  user:
    | {
        email?: string | null;
        providerData?: { email?: string | null }[];
      }
    | null
    | undefined
): string | null {
  if (!user) return null;
  if (user.email && user.email.trim()) {
    return user.email.trim();
  }
  const providerWithEmail = user.providerData?.find((p) => p?.email && p.email.trim());
  return providerWithEmail?.email?.trim() || null;
}

export function isAuthorizedAdminUser(
  user:
    | {
        email?: string | null;
        emailVerified?: boolean;
        providerData?: { email?: string | null; providerId?: string | null }[];
      }
    | null
    | undefined
): boolean {
  if (!user) return false;
  const email = getUserEmail(user);
  const isGoogleProvider = Boolean(
    user.providerData?.some((p) => p?.providerId === 'google.com')
  );
  const isVerified = Boolean(user.emailVerified !== false || isGoogleProvider);
  return isVerified && isAuthorizedAdminEmail(email);
}

export function isTokenServiceDisabledError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error || '');
  const combined = `${code} ${rawMessage}`.toLowerCase();
  return (
    combined.includes('token-service-api-has-not-been-used') ||
    combined.includes('securetoken.googleapis.com')
  );
}

export function formatAuthErrorMessage(error: unknown): { title: string; message: string } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const rawMessage = error instanceof Error ? error.message : String(error || '');

  if (isTokenServiceDisabledError(error)) {
    const projectNumber = firebaseConfig.messagingSenderId || '795945975963';
    return {
      title: 'Token Service API Disabled in Google Cloud',
      message: `The Firebase Token Service API (securetoken.googleapis.com) is currently disabled in project ${projectNumber} (${firebaseConfig.projectId}). Please enable it at https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=${projectNumber} and wait 1–2 minutes before signing in again.`,
    };
  }

  if (code === 'auth/popup-blocked' || rawMessage.includes('auth/popup-blocked')) {
    if (isRunningInIframe()) {
      return {
        title: 'Popup Blocked by Browser',
        message:
          'Your browser blocked the Google Sign-In popup inside this embedded preview. Please allow popups in your browser address bar for this site, or click "Open Admin Portal in New Tab" below.',
      };
    }
    return {
      title: 'Popup Blocked by Browser',
      message:
        'Your browser blocked the Google Sign-In window. Please click the popup-blocked icon on the right side of your browser address bar, select "Always allow pop-ups and redirects", and click "Sign In with Google" again.',
    };
  }

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/redirect-cancelled-by-user'
  ) {
    return {
      title: 'Sign-In Cancelled',
      message:
        'The Google sign-in flow was closed before completion. Click "Sign In with Google" when you are ready to try again.',
    };
  }

  if (code === 'auth/redirect-operation-pending') {
    return {
      title: 'Sign-In Already in Progress',
      message: 'A Google sign-in redirect is already in progress. Please wait a moment.',
    };
  }

  if (code === 'auth/unauthorized-domain' || rawMessage.includes('auth/unauthorized-domain')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return {
      title: 'Domain Not Authorized in Firebase',
      message: `The domain "${currentHost}" is not yet added to Firebase Authorized Domains. Add "${currentHost}" in Firebase Console → Authentication → Settings → Authorized domains.`,
    };
  }

  if (code === 'auth/network-request-failed' || rawMessage.includes('auth/network-request-failed')) {
    return {
      title: 'Network Connection Issue',
      message:
        'Could not reach Google Authentication servers. Please check your internet connection and try again.',
    };
  }

  if (code === 'auth/user-disabled') {
    return {
      title: 'Account Disabled',
      message: 'This Google account has been disabled in Firebase Authentication.',
    };
  }

  if (code === 'auth/operation-not-allowed') {
    return {
      title: 'Google Sign-In Not Enabled',
      message:
        'Google Sign-In is not enabled in Firebase Console. Enable Google as a Sign-In provider under Authentication → Sign-in method.',
    };
  }

  return {
    title: 'Authentication Error',
    message:
      rawMessage.replace(/^Firebase:\s*/i, '').trim() ||
      'Could not complete Google Sign-In. Please try again.',
  };
}

export async function uploadCoverImageToStorage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `covers/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, storagePath);
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });
  return await getDownloadURL(snapshot.ref);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await auth.authStateReady();
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken();
      } catch (tokenErr) {
        if (isTokenServiceDisabledError(tokenErr)) {
          await signOut(auth).catch(() => {});
        }
      }
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (isTokenServiceDisabledError(error)) {
      await signOut(auth).catch(() => {});
      return;
    }
    if (auth.currentUser && error instanceof Error && error.message.includes('the client is offline')) {
      try {
        await auth.currentUser.getIdToken(true);
      } catch (tokenErr) {
        if (isTokenServiceDisabledError(tokenErr)) {
          await signOut(auth).catch(() => {});
        }
      }
    }
  }
}

testConnection();



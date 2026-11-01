import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signOut,
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
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure local persistence once at startup so click handlers remain synchronous
// and preserve browser user-gesture activation for popup/redirect flows.
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Could not set auth persistence:', err);
});

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
          'Your browser blocked the Google Sign-In popup inside this embedded preview. Please allow popups in your browser address bar for this site, or click "Open Admin Portal in New Tab" below to sign in via full-page redirect.',
      };
    }
    return {
      title: 'Switching to Redirect Sign-In',
      message:
        'Your browser blocked the sign-in popup window. Click "Sign In via Full-Page Redirect" below or allow popups/redirects for this site.',
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



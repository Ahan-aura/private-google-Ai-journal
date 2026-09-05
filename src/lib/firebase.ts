import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : ({} as Record<string, string | undefined>);

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
};

let appInstance;
try {
  appInstance = !getApps().length ? initializeApp(config) : getApp();
} catch (err) {
  console.error('Firebase initializeApp warning:', err);
  appInstance = getApps().length ? getApp() : initializeApp(config);
}

const app = appInstance;
export const auth = getAuth(app);

// Use named Firestore database if specified, otherwise default
const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

export default app;

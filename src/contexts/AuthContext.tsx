import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize user profile in Cloud Firestore safely
  const syncUserProfile = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Reflective Thinker',
          photoURL: currentUser.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: new Date().toISOString(),
            displayName: currentUser.displayName || snap.data()?.displayName || 'Reflective Thinker',
            photoURL: currentUser.photoURL || snap.data()?.photoURL || '',
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('User profile sync notice:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Ensure loading screen never hangs if auth takes longer than 1.5s
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1500);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        clearTimeout(fallbackTimer);
        if (!isMounted) return;
        setUser(currentUser);
        if (currentUser) {
          setError(null);
          // Sync profile in background
          syncUserProfile(currentUser).catch((err) => console.warn('Profile sync background error:', err));
        }
        setLoading(false);
      },
      (err) => {
        clearTimeout(fallbackTimer);
        if (!isMounted) return;
        console.error('Auth state observer error:', err);
        setError(err.message || 'Failed to initialize authentication.');
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      if (result.user) {
        syncUserProfile(result.user).catch((err) => console.warn('Sync notice:', err));
      }
      return result.user;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err.message || 'Google Sign-In was cancelled or failed.');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setError(err.message || 'Failed to log out.');
    }
  };

  const getIdToken = async (): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('User is not authenticated.');
    }
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

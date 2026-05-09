import { useState, useEffect, useContext, createContext, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { getAuth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isSignedIn: boolean;
  isEmailVerified: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
  role: 'admin' | 'user';
  status: 'active' | 'loading' | 'unauthenticated' | 'unverified';
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    // Defer initialization to after first paint
    const initAuth = async () => {
      try {
        const auth = await getAuth();
        const { onAuthStateChanged } = await import('firebase/auth');
        
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        });
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setLoading(false);
      }
    };

    // Use requestIdleCallback or a timeout to ensure main thread is free
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => initAuth());
    } else {
      setTimeout(initAuth, 100);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const isAdmin = useMemo(() => {
    return user?.email === 'muhammadnaveedalijatt786@gmail.com';
  }, [user]);

  const isEmailVerified = useMemo(() => {
    if (!user) return false;
    const isGoogleAccount = user.providerData?.some((provider: any) => provider.providerId === 'google.com');
    return user.emailVerified || !!isGoogleAccount;
  }, [user]);

  const signOut = async () => {
    const auth = await getAuth();
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
  };

  const getToken = async () => {
    if (!user) return null;
    const { getIdToken } = await import('firebase/auth');
    return await getIdToken(user);
  };

  const refreshUser = async () => {
    const auth = await getAuth();
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const value = {
    user,
    loading,
    isSignedIn: !!user,
    isEmailVerified,
    isAdmin,
    signOut,
    getToken,
    refreshUser,
    role: isAdmin ? 'admin' as const : 'user' as const,
    status: loading ? 'loading' as const : (user ? (isEmailVerified ? 'active' as const : 'unverified' as const) : 'unauthenticated' as const),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


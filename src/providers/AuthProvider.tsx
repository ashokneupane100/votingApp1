import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContext = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  loading: boolean;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  upgradeAnonymousAccount: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContext>({
  session: null,
  user: null,
  isAuthenticated: false,
  isAnonymous: false,
  loading: true,
  signInAnonymously: async () => {},
  signOut: async () => {},
  upgradeAnonymousAccount: async () => ({ success: false }),
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id, 'Anonymous:', session?.user?.is_anonymous);
      setSession(session);
      
      // If no session exists, sign in anonymously
      if (!session) {
        await signInAnonymously();
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session?.user?.id, 'Anonymous:', session?.user?.is_anonymous);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign in error:', error);
      } else {
        console.log('Signed in anonymously:', data.user?.id);
      }
    } catch (error) {
      console.error('Unexpected error during anonymous sign in:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        // After signing out, sign in anonymously again
        await signInAnonymously();
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  const upgradeAnonymousAccount = async (email: string, password: string) => {
    try {
      if (!session?.user?.is_anonymous) {
        return { success: false, error: 'Not an anonymous account' };
      }

      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Unexpected error occurred' };
    }
  };

  const value = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session?.user && !session.user.is_anonymous,
    isAnonymous: !!session?.user?.is_anonymous,
    loading,
    signInAnonymously,
    signOut,
    upgradeAnonymousAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
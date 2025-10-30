import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = { id: string; email?: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (tokenOrUser: string | User) => Promise<void>;
  signOut: () => Promise<void>;
};

// Creates context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'session_user'; // store token or serialized user

// Provider for the context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) {
          // You can store a token string OR a JSON stringified user. Handle both:
          setUser(raw.startsWith('{') ? JSON.parse(raw) : { id: 'token', email: undefined });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (tokenOrUser: string | User) => {
    if (typeof tokenOrUser === 'string') {
      await SecureStore.setItemAsync(SESSION_KEY, tokenOrUser);
      setUser({ id: 'token' });
    } else if (tokenOrUser) {
      const json = JSON.stringify(tokenOrUser);
      await SecureStore.setItemAsync(SESSION_KEY, json);
      setUser(tokenOrUser);
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;  // returns whatever is passed to AuthContext.Provider value={value}
}

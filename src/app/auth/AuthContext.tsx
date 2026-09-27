'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type SessionUser = { id: string; name: string; role: string };

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  login: (user: SessionUser) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login: setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

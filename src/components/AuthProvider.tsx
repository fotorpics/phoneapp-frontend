import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext, type User } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('callflow:user');
    const storedToken = localStorage.getItem('callflow:authToken');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('callflow:user', JSON.stringify(newUser));
    localStorage.setItem('callflow:authToken', newToken);
    localStorage.setItem('callflow:userId', newUser.id);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('callflow:user');
    localStorage.removeItem('callflow:authToken');
    localStorage.removeItem('callflow:userId');
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    isLoading,
  }), [user, token, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface User {
  id: string;
  email: string;
  fullName?: string;
  creditBalance: number;
  timezone?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  missedCallAlerts?: boolean;
  smsNotifications?: boolean;
  billingAlerts?: boolean;
  weeklyReports?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('callflow:user');
    const storedToken = localStorage.getItem('callflow:authToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

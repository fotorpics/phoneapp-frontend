import { createContext, useContext } from 'react';

export interface User {
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

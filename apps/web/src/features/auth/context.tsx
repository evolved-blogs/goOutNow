import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const STORAGE_KEY = 'gooutnow_session';

export interface AuthUser {
  id: string;
  phoneNumber: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        window.userId = parsed.id;
        window.nickname = parsed.phoneNumber;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (phoneNumber: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? 'Login failed');
    }

    const userData = (await response.json()) as AuthUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    window.userId = userData.id;
    window.nickname = userData.phoneNumber;
    setUser(userData);
  };

  const logout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    // Clear legacy keys too
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    window.userId = '';
    window.nickname = '';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

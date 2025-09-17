"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

// Define a simpler user object for our local auth
export interface SimpleUser {
  uid: string;
  username: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  login: (user: SimpleUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

const USER_STORAGE_KEY = 'simple_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = useCallback((newUser: SimpleUser) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    const userId = user?.uid;
    if(userId) {
        localStorage.removeItem(`apiKeys_${userId}`);
        localStorage.removeItem(`chatHistory_${userId}`);
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

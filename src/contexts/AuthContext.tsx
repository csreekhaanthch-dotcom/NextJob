import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  authAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authAvailable, setAuthAvailable] = useState(false);

  useEffect(() => {
    // Check if auth is available
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        setAuthAvailable(false); // Auth is always disabled in deployed version
      })
      .catch(() => {
        setAuthAvailable(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    throw new Error('Authentication not available in deployed version');
  };

  const register = async (email: string, password: string, name: string) => {
    throw new Error('Authentication not available in deployed version');
  };

  const logout = () => {
    // Nothing to do since auth is disabled
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: false,
    authAvailable: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
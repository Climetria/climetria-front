'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type UserData = {
  username?: string;
  email: string;
};

type UserContextType = {
  user: UserData | null;
  setUser: (user: UserData) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Se guarda en localStorage para que el nombre no se pierda al recargar la página
const STORAGE_KEY = 'user';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUserState(JSON.parse(stored));
    } catch {
      // localStorage no disponible: se queda sin usuario guardado
    }
  }, []);

  const setUser = (next: UserData) => {
    setUserState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage no disponible
    }
  };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

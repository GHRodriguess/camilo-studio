'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, User, getStoredUser, setStoredUser, setToken } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/esqueci-senha', '/redefinir-senha'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    // Recupera do storage de forma assíncrona após a hidratação inicial
    Promise.resolve().then(() => {
      if (isMounted) {
        const stored = getStoredUser();
        if (stored) {
          setUser(stored);
        }
      }
    });

    api.getMe()
      .then((fresh) => {
        if (isMounted) {
          setUser(fresh);
          setStoredUser(fresh);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setToken(null);
          setStoredUser(null);
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && user.deve_redefinir_senha && pathname !== '/primeiro-acesso') {
      router.push('/primeiro-acesso');
    } else if (user && !user.deve_redefinir_senha && isPublic) {
      router.push('/agenda');
    }
  }, [user, loading, pathname, router]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
    if (res.user.deve_redefinir_senha) {
      router.push('/primeiro-acesso');
    } else {
      router.push('/agenda');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const fresh = await api.getMe();
      setUser(fresh);
      setStoredUser(fresh);
    } catch {
      // Ignorar falha de refresh
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
}

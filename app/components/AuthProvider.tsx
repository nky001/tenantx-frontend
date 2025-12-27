'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../lib/auth-store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadFromCookies, verifyAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await loadFromCookies();
      if (isAuthenticated) {
        await verifyAuth();
      }
    };
    initAuth();
  }, [loadFromCookies, verifyAuth, isAuthenticated]);

  return <>{children}</>;
}
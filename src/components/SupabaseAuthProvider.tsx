'use client';

import { ReactNode, useEffect } from 'react';
import { DEV_BYPASS_AUTH, supabase } from '@/lib/supabase';
import { clearAllAuthData, setAccessTokenCookie } from '@/utils/setAuthCookie';

// Supabase renueva el access token cada hora; aquí se copia a la cookie y a
// localStorage, que es de donde lo leen api.ts y el resto de la app.
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        localStorage.setItem('accessToken', session.access_token);
        setAccessTokenCookie(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        clearAllAuthData();
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

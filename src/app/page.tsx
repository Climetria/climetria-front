'use client';

import { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { setAccessTokenCookie } from '@/utils/setAuthCookie';
import { useUser } from '@/context/UserContext';

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function UserInfo() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { setUser } = useUser();
  const [, setIdToken] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !isRedirecting) {
      setIsRedirecting(true);

      fetchAuthSession()
        .then(async (session) => {
          const token = session.tokens?.accessToken?.toString() ?? null;
          if (token) {
            setIdToken(token);
            const decoded = decodeJWT(token);
            const groups: string[] = decoded?.['cognito:groups'] || [];

            const role = groups.includes('admin')
              ? 'admin'
              : groups.includes('mentor')
                ? 'mentor'
                : null;

            setUser({
              username: user?.username || 'no-username',
              email: user?.signInDetails?.loginId || 'no-email',
            });

            // Guardar token
            document.cookie = `accessToken=${token}; path=/; secure; sameSite=Lax`;
            localStorage.setItem('accessToken', token);
            setAccessTokenCookie(token);

            console.log('Access token set in cookie:', token);
            console.log('User role detected:', role);

            // Redirigir según el rol
            if (role === 'admin') {
              router.push('/dashboard');
            } else if (role === 'mentor') {
              router.push('/dashboard/mentors/tracking');
            } else {
              console.warn('No role matched, redirecting to dashboard as fallback.');
              router.push('/dashboard');
            }
          }
        })
        .catch((error) => {
          console.error('Error getting session:', error);
          setIsRedirecting(false);
        });
    }
  }, [user, router, isRedirecting, setUser]);

  return null;
}

export default function LoginPage() {
  return (
    <Authenticator initialState="signIn" hideSignUp>
      <UserInfo />
    </Authenticator>
  );
}

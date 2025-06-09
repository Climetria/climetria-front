'use client';

import { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { setAccessTokenCookie } from '@/utils/setAuthCookie';
import { useUser } from '@/context/UserContext';

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
            console.log(user);
            setUser({
              username: user?.username || 'no-username',
              email: user?.signInDetails?.loginId || 'no-email',
            });

            // Configurar el token en todas las ubicaciones
            document.cookie = `accessToken=${token}; path=/; secure; sameSite=Lax`;
            localStorage.setItem('accessToken', token);
            setAccessTokenCookie(token);

            console.log('Access token set in cookie:', token);
            console.log('User info:', user);

            // Redirigir al dashboard
            router.push('/dashboard');
          }
        })
        .catch((error) => {
          console.error('Error getting session:', error);
          setIsRedirecting(false);
        });
    }
  }, [user, router, isRedirecting, setUser]);
  if (!user) return null;
}

export default function LoginPage() {
  return (
    <Authenticator initialState="signIn" hideSignUp>
      <UserInfo />
    </Authenticator>
  );
}

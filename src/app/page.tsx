'use client';

import { useEffect, useState } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';

function UserInfo() {
  const { user, signOut } = useAuthenticator((context) => [
    context.user,
    context.signOut,
  ]);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAuthSession()
        .then((session) => {
          const token = session.tokens?.accessToken?.toString() ?? null;
          console.log('ID Token:', token);
          setIdToken(token);
        })
        .catch((error) => {
          console.error('Error getting session:', error);
        });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ marginTop: '1rem' }}>
      <p>Signed in as: {user.username}</p>
      <button onClick={signOut}>Sign Out</button>
      {idToken && (
        <pre style={{ whiteSpace: 'break-spaces', maxWidth: '600px' }}>
          ID Token: {idToken}
        </pre>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Authenticator initialState="signIn" hideSignUp>
      <UserInfo />
    </Authenticator>
  );
}

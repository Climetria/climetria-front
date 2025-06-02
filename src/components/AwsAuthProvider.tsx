'use client';

import { Amplify } from 'aws-amplify';
import { COGNITO_CONFIG } from '@/config/amplify-config';
import { ReactNode, useEffect} from 'react';

Amplify.configure(COGNITO_CONFIG);
console.log("POOL", process.env.NEXT_PUBLIC_COGNITO_POOL_ID);

export function AwsAuthProvider({ children }: { children: ReactNode }) {
  // Optional: useEffect to log config or auth state
  useEffect(() => {
    console.log('Amplify configured');
  }, []);

  return <>{children}</>;
}
import { ResourcesConfig } from 'aws-amplify';

export const COGNITO_CONFIG: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_POOL_ID as string,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID as string,
      loginWith: {
        oauth: {
          domain: 'climetria-app-dev-ach561.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['http://localhost:3000/'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code',
        },
      },
    },
  },
};

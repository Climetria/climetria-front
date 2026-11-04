export type UserRole = 'admin' | 'mentor';

type TokenClaims = {
  sub: string;
  email?: string;
  app_metadata?: { roles?: string[] };
};

export function decodeJWT(token: string): TokenClaims | null {
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

// Los roles los asigna el backend en app_metadata.roles (ver AuthService en climetria-back)
export function getRoleFromToken(token: string | null | undefined): UserRole | null {
  if (!token) return null;
  const roles = decodeJWT(token)?.app_metadata?.roles ?? [];
  if (roles.includes('mentor')) return 'mentor';
  if (roles.includes('admin')) return 'admin';
  return null;
}

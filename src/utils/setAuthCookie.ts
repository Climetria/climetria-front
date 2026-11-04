// Avisa a CourseContext al instante, sin esperar a su revisión periódica
export const TOKEN_CHANGED_EVENT = 'access-token-changed';

export function setAccessTokenCookie(token: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${token}; path=/; secure; sameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
    window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
  }
}

export function removeAccessTokenCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function getAccessTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )accessToken=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function clearAllAuthData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('activeCourse');
    localStorage.removeItem('user');
    removeAccessTokenCookie();
    console.log('All auth data cleared');
  }
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'CUSTOMER' | 'DELIVERY_AGENT';
  status: 'ACTIVE' | 'INACTIVE';
};

export function saveAuth(accessToken: string, user: AuthUser) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('authUser', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authUser');
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('authUser');
  return raw ? JSON.parse(raw) : null;
}

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'No se pudo iniciar sesión con Google.');
  }

  return res.json();
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem('patitas_token', auth.token);
  localStorage.setItem('patitas_user', JSON.stringify(auth.user));
}

export function getSession(): AuthResponse | null {
  const token = localStorage.getItem('patitas_token');
  const userRaw = localStorage.getItem('patitas_user');
  if (!token || !userRaw) return null;
  return { token, user: JSON.parse(userRaw) };
}

export function clearSession() {
  localStorage.removeItem('patitas_token');
  localStorage.removeItem('patitas_user');
}
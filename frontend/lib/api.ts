export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  must_change_password: boolean;
};

export type AuthCompany = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
  company?: AuthCompany | null;
  two_factor_required?: boolean;
  two_factor_setup_required?: boolean;
  message?: string;
  error?: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  company: AuthCompany | null;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010").replace(/\/$/, "");
const SESSION_KEY = "multempresas.session";
const SESSION_ONLY_KEY = "multempresas.session-only";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível concluir a requisição.");
  }

  return data;
}

export async function login(email: string, password: string, totpCode?: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, ...(totpCode ? { totp_code: totpCode } : {}) }),
  });
}

export async function logout(accessToken: string) {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function saveSession(session: Session, persistent = true) {
  const serializedSession = JSON.stringify(session);
  clearSession();

  if (persistent) {
    window.localStorage.setItem(SESSION_KEY, serializedSession);
    return;
  }

  window.sessionStorage.setItem(SESSION_ONLY_KEY, serializedSession);
}

export function getSession(): Session | null {
  const stored = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_ONLY_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_ONLY_KEY);
}

// =============================================================================
// MultEmpresas — camada de API
// Gerado a partir do openapi.json do backend (swagger/openapi.json)
// Última sync: Auth + Users completos | TODO: Companies, Plans, Audit
// =============================================================================

// ---------------------------------------------------------------------------
// Tipos compartilhados
// ---------------------------------------------------------------------------

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "MASTER" | "ADMIN" | "OPERATOR";
  must_change_password: boolean;
  two_factor_enabled?: boolean;
  active?: boolean;
  company_id?: number | null;
};

export type AuthCompany = {
  id: number;
  name: string;
  logo_url: string | null;
};

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
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

export type TwoFactorSetupResponse = {
  secret?: string;
  qr_code_url?: string;
  message?: string;
  error?: string;
};

export type User = {
  id: number;
  company_id: number | null;
  name: string;
  email: string;
  role: "MASTER" | "ADMIN" | "OPERATOR";
  active: boolean;
  two_factor_enabled: boolean;
  must_change_password: boolean;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: "MASTER" | "ADMIN" | "OPERATOR";
  company_id?: number | null;
  must_change_password?: boolean;
};

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { password?: string }
>;

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010").replace(/\/$/, "");
const SESSION_KEY = "multempresas.session";
const SESSION_ONLY_KEY = "multempresas.session-only";

// ---------------------------------------------------------------------------
// Helper de requisição
// ---------------------------------------------------------------------------

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

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

// ---------------------------------------------------------------------------
// Sessão local
// ---------------------------------------------------------------------------

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
  const stored =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_ONLY_KEY);
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

// ===========================================================================
// AUTENTICAÇÃO  (/auth/*)
// ===========================================================================

/** POST /auth/login — Login com email, senha e TOTP opcional */
export async function login(email: string, password: string, totpCode?: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, ...(totpCode ? { totp_code: totpCode } : {}) }),
  });
}

/** POST /auth/logout — Revoga refresh tokens do usuário autenticado */
export async function logout(accessToken: string) {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

/** POST /auth/refresh — Renova o access token a partir do refresh token */
export async function refreshToken(refreshTokenValue: string) {
  return request<LoginResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });
}

// ---------------------------------------------------------------------------
// 2FA  (/auth/2fa/*)
// ---------------------------------------------------------------------------

/** POST /auth/2fa/setup — Gera segredo TOTP e QR Code URL para o usuário */
export async function setup2FA(accessToken: string) {
  return request<TwoFactorSetupResponse>("/auth/2fa/setup", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

/** POST /auth/2fa/verify — Valida o código TOTP informado pelo usuário */
export async function verify2FA(accessToken: string, totpCode: string) {
  return request<{ message: string }>("/auth/2fa/verify", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ totp_code: totpCode }),
  });
}

/** POST /auth/2fa/enable — Habilita 2FA após verificação bem-sucedida do código */
export async function enable2FA(accessToken: string, totpCode: string) {
  return request<{ message: string }>("/auth/2fa/enable", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ totp_code: totpCode }),
  });
}

/** POST /auth/2fa/disable — Desabilita 2FA para usuários com permissão */
export async function disable2FA(accessToken: string) {
  return request<{ message: string }>("/auth/2fa/disable", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

// ===========================================================================
// USUÁRIOS  (/users/*)
// ===========================================================================

/** GET /users — Lista todos os usuários (respeita tenant) */
export async function listUsers(accessToken: string) {
  return request<unknown>("/users", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** GET /users/:id — Detalha um usuário */
export async function getUser(accessToken: string, id: number) {
  return request<User>(`/users/${id}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** POST /users — Cria um novo usuário */
export async function createUser(accessToken: string, payload: CreateUserPayload) {
  return request<{ id: number }>("/users", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** PUT /users/:id — Atualiza dados de um usuário */
export async function updateUser(accessToken: string, id: number, payload: UpdateUserPayload) {
  return request<{ message: string }>(`/users/${id}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** DELETE /users/:id — Remove um usuário */
export async function deleteUser(accessToken: string, id: number) {
  return request<{ message: string }>(`/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

// ===========================================================================
// TODO — Endpoints ainda sem implementação no frontend
// Adicionar conforme os módulos forem construídos:
//
// COMPANIES (/companies/*)
//   [ ] GET    /companies              → listCompanies()
//   [ ] POST   /companies              → createCompany()
//   [ ] GET    /companies/:id          → getCompany()
//   [ ] PUT    /companies/:id          → updateCompany()
//   [ ] DELETE /companies/:id          → deleteCompany()
//   [ ] GET    /companies/cnpj/:cnpj   → lookupCNPJ()
//   [ ] POST   /companies/:id/logo     → uploadCompanyLogo()
//
// PLANS (/plans/*)
//   [ ] GET    /plans                  → listPlans()
//   [ ] POST   /plans                  → createPlan()
//   [ ] GET    /plans/:id              → getPlan()
//   [ ] PUT    /plans/:id              → updatePlan()
//   [ ] DELETE /plans/:id              → deletePlan()
//
// AUDIT (/audit-logs)
//   [ ] GET    /audit-logs             → listAuditLogs()
// ===========================================================================

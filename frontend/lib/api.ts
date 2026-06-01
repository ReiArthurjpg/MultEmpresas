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
  company_name?: string | null;
  phone?: string | null;
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
  phone?: string | null;
  must_change_password?: boolean;
};

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { password?: string }
>;

// ---------------------------------------------------------------------------
// Configurações
// ---------------------------------------------------------------------------

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8010").replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Session-expiry handler (SweetAlert2 countdown + auto-logout)
// ---------------------------------------------------------------------------

export let _sessionExpiryShowing = false;

export async function handleSessionExpiry(): Promise<void> {
  if (_sessionExpiryShowing) return;
  _sessionExpiryShowing = true;

  if (typeof window === "undefined") return;

  // Dynamic import so we don't ship swal to SSR bundles
  const Swal = (await import("sweetalert2")).default;

  const COUNTDOWN = 8;
  let remaining = COUNTDOWN;

  const dialog = Swal.fire({
    icon: "warning",
    title: "Sessão expirada",
    html: `Sua sessão expirou. Você será redirecionado para o login em <strong>${remaining}</strong> segundo(s).`,
    timerProgressBar: true,
    timer: COUNTDOWN * 1000,
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonText: "Sair agora",
    confirmButtonColor: "#2563eb",
    background: "#ffffff",
    customClass: {
      popup: "swal2-multempresas",
    },
    didOpen: () => {
      const interval = setInterval(() => {
        remaining -= 1;
        const htmlEl = Swal.getHtmlContainer();
        if (htmlEl) {
          htmlEl.innerHTML = `Sua sessão expirou. Você será redirecionado para o login em <strong>${remaining}</strong> segundo(s).`;
        }
        if (remaining <= 0) clearInterval(interval);
      }, 1000);
    },
  });

  await dialog;

  clearSession();
  window.location.replace("/");
}

export function getJwtExpiry(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

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
    const errorMsg = data.error ?? "Não foi possível concluir a requisição.";

    // Detect JWT expiry / unauthorised — trigger sweet-alert logout flow
    const isAuthError =
      response.status === 401 ||
      /token.*expirado|jwt.*invalid|token.*inválido|token.*bearer/i.test(errorMsg);

    if (isAuthError) {
      handleSessionExpiry();
      throw new Error("Sessão expirada.");
    }

    throw new Error(errorMsg);
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

/** POST /auth/change-password — Altera a senha do usuário autenticado */
export async function changePassword(accessToken: string, currentPassword: string, newPassword: string) {
  return request<{ message: string }>("/auth/change-password", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
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
  return request<{ valid: boolean }>("/auth/2fa/verify", {
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
// DEFINIÇÕES DE TIPOS E CHAMADAS DE API — COMPANIES, PLANS, AUDIT
// ===========================================================================

export type Plan = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  max_installments?: number;
  credits?: number;
  active: boolean;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
};

export type Company = {
  id: number;
  company_id: number | null;
  company_name: string;
  trade_name: string | null;
  cnpj: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  logo_url: string | null;
  plan_id: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AuditLog = {
  id: number;
  company_id: number | null;
  user_id: number | null;
  action: string;
  entity: string;
  entity_id: number | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  company_name: string | null;
};

export type CreateCompanyPayload = {
  company_name: string;
  trade_name?: string | null;
  cnpj: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  plan_id?: number | null;
  active?: boolean;
};

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export type CreatePlanPayload = {
  name: string;
  description?: string | null;
  price: number;
  max_installments?: number | null;
  credits?: number | null;
  active?: boolean;
  permissions?: string[];
};

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

// ---------------------------------------------------------------------------
// COMPANIES (/companies/*)
// ---------------------------------------------------------------------------

/** GET /companies — Lista todas as empresas (MASTER vê tudo, ADMIN vê apenas a própria) */
export async function listCompanies(accessToken: string) {
  return request<{ data: Company[] }>("/companies", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** POST /companies — Cria uma nova empresa (Apenas MASTER) */
export async function createCompany(accessToken: string, payload: CreateCompanyPayload) {
  return request<{ id: number }>("/companies", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** GET /companies/:id — Detalha uma empresa (MASTER vê qualquer uma, ADMIN vê apenas a sua) */
export async function getCompany(accessToken: string, id: number) {
  return request<{ data: Company }>(`/companies/${id}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** PUT /companies/:id — Atualiza os dados de uma empresa (MASTER ou ADMIN) */
export async function updateCompany(accessToken: string, id: number, payload: UpdateCompanyPayload) {
  return request<{ message: string }>(`/companies/${id}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** DELETE /companies/:id — Remove uma empresa (Apenas MASTER) */
export async function deleteCompany(accessToken: string, id: number) {
  return request<{ message: string }>(`/companies/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

/** GET /companies/cnpj/:cnpj — Consulta CNPJ em API externa (Apenas MASTER) */
export async function lookupCNPJ(accessToken: string, cnpj: string) {
  const cleanCnpj = cnpj.replace(/\D/g, "");
  return request<{ data: any }>(`/companies/cnpj/${cleanCnpj}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** POST /companies/:id/logo — Envia e atualiza o logotipo de uma empresa (MASTER ou ADMIN) */
export async function uploadCompanyLogo(accessToken: string, id: number, logoFile: File) {
  const formData = new FormData();
  formData.append("logo", logoFile);

  const response = await fetch(`${API_URL}/companies/${id}/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível enviar o logotipo.");
  }
  return data as { logo_url: string };
}

// ---------------------------------------------------------------------------
// PLANS (/plans/*)
// ---------------------------------------------------------------------------

/** GET /plans — Lista todos os planos (MASTER) */
export async function listPlans(accessToken: string) {
  return request<{ data: Plan[] }>("/plans", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** POST /plans — Cria um novo plano com permissões (MASTER) */
export async function createPlan(accessToken: string, payload: CreatePlanPayload) {
  return request<{ id: number }>("/plans", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** GET /plans/:id — Detalha um plano (MASTER) */
export async function getPlan(accessToken: string, id: number) {
  return request<{ data: Plan }>(`/plans/${id}`, {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

/** PUT /plans/:id — Atualiza dados e permissões do plano (MASTER) */
export async function updatePlan(accessToken: string, id: number, payload: UpdatePlanPayload) {
  return request<{ message: string }>(`/plans/${id}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

/** DELETE /plans/:id — Remove um plano (MASTER) */
export async function deletePlan(accessToken: string, id: number) {
  return request<{ message: string }>(`/plans/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

// ---------------------------------------------------------------------------
// AUDIT (/audit-logs)
// ---------------------------------------------------------------------------

/** GET /audit-logs — Lista logs de auditoria (MASTER e ADMIN) */
export async function listAuditLogs(accessToken: string) {
  return request<{ data: AuditLog[] }>("/audit-logs", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

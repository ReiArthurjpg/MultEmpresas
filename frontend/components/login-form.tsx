"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { login, saveSession } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormErrors = {
  email?: string;
  password?: string;
  totpCode?: string;
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const realtimeErrors = useMemo<FormErrors>(() => validate(email, password, requiresTotp ? totpCode : undefined), [email, password, requiresTotp, totpCode]);

  function updateEmail(value: string) {
    setEmail(value);
    setErrors((current) => ({ ...current, email: validateEmail(value), form: undefined }));
  }

  function updatePassword(value: string) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: validatePassword(value), form: undefined }));
  }

  function updateTotp(value: string) {
    const normalizedValue = value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(normalizedValue);
    setErrors((current) => ({ ...current, totpCode: requiresTotp ? validateTotp(normalizedValue) : undefined, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, password, requiresTotp ? totpCode : undefined);

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await login(email, password, requiresTotp ? totpCode : undefined);

      if (response.two_factor_required) {
        setRequiresTotp(true);
        setErrors({ form: response.message ?? "Informe o código TOTP para concluir o login." });
        return;
      }

      if (!response.access_token || !response.refresh_token || !response.user) {
        setErrors({ form: response.error ?? "A API não retornou uma sessão válida." });
        return;
      }

      saveSession({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user: response.user,
        company: response.company ?? null,
      }, rememberMe);

      router.push("/dashboard");
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Não foi possível fazer login." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleEmailError = errors.email ?? realtimeErrors.email;
  const visiblePasswordError = errors.password ?? realtimeErrors.password;
  const visibleTotpError = errors.totpCode ?? realtimeErrors.totpCode;

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {!requiresTotp ? (
          <>
            <div className="field-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-shell">
                <Mail aria-hidden="true" className="input-icon" size={18} />
                <input
                  aria-describedby={visibleEmailError ? "email-error" : undefined}
                  aria-invalid={Boolean(visibleEmailError)}
                  autoComplete="email"
                  className={cn("form-input", visibleEmailError && "input-error")}
                  id="email"
                  inputMode="email"
                  onChange={(event) => updateEmail(event.target.value)}
                  placeholder="seu@email.com"
                  type="email"
                  value={email}
                />
              </div>
              {visibleEmailError ? <p id="email-error" role="alert">{visibleEmailError}</p> : null}
            </div>

            <div className="field-group">
              <label htmlFor="password">Senha</label>
              <div className="input-shell">
                <Lock aria-hidden="true" className="input-icon" size={18} />
                <input
                  aria-describedby={visiblePasswordError ? "password-error" : undefined}
                  aria-invalid={Boolean(visiblePasswordError)}
                  autoComplete="current-password"
                  className={cn("form-input password-input", visiblePasswordError && "input-error")}
                  id="password"
                  onChange={(event) => updatePassword(event.target.value)}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
              {visiblePasswordError ? <p id="password-error" role="alert">{visiblePasswordError}</p> : null}
            </div>

            <div className="form-options">
              <label className="checkbox-label" htmlFor="rememberMe">
                <input
                  checked={rememberMe}
                  id="rememberMe"
                  onChange={(event) => setRememberMe(event.target.checked)}
                  type="checkbox"
                />
                <span>Lembrar de mim</span>
              </label>
            </div>
          </>
        ) : (
          <div className="field-group">
            <div className="twofa-verification-header" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "50%", background: "oklch(0.75 0.18 210 / 0.1)", color: "var(--primary)", marginBottom: "0.75rem" }}>
                <Lock aria-hidden="true" size={24} />
              </div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem" }}>Verificação de 2 Fatores</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
              </p>
            </div>

            <label htmlFor="totpCode">Código 2FA</label>
            <input
              aria-describedby={visibleTotpError ? "totp-error" : undefined}
              aria-invalid={Boolean(visibleTotpError)}
              autoComplete="one-time-code"
              className={cn("form-input totp-input", visibleTotpError && "input-error")}
              id="totpCode"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => updateTotp(event.target.value)}
              placeholder="000000"
              value={totpCode}
              style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.25em", fontWeight: "bold" }}
            />
            {visibleTotpError ? <p id="totp-error" role="alert">{visibleTotpError}</p> : null}
          </div>
        )}

        {errors.form ? <p className="form-alert" role="alert">{errors.form}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit" style={{ marginTop: "1rem" }}>
          {isSubmitting ? <Loader2 aria-hidden="true" className="spinner" size={16} /> : <ArrowRight aria-hidden="true" size={16} />}
          {isSubmitting ? "Entrando…" : requiresTotp ? "Confirmar Código" : "Entrar"}
        </button>

        {requiresTotp && (
          <button
            type="button"
            className="secondary-button"
            style={{ width: "100%", marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => {
              setRequiresTotp(false);
              setTotpCode("");
              setErrors({});
            }}
          >
            Voltar para o Login
          </button>
        )}

        {!requiresTotp && (
          <p className="signup-text">
            Ainda não tem uma conta? <a href="mailto:contato@multempresas.local">Solicitar cadastro</a>
          </p>
        )}
      </form>

      {!requiresTotp && (
        <>
          <div className="divider" aria-hidden="true">
            <span />
            <small>ou continue com</small>
            <span />
          </div>

          <button aria-label="Entrar com Google" className="google-button" type="button">
            <GoogleIcon />
            Google
          </button>
        </>
      )}

      <footer className="auth-footer">
        Ao continuar, você concorda com os <a href="#termos">Termos</a> e a <a href="#privacidade">Privacidade</a>.
      </footer>
    </>
  );
}

function validate(email: string, password: string, totpCode?: string): FormErrors {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    totpCode: totpCode === undefined ? undefined : validateTotp(totpCode),
  };
}

function validateEmail(value: string) {
  if (!value.trim()) return "O e-mail é obrigatório.";
  if (!emailPattern.test(value)) return "Informe um e-mail válido.";
  return undefined;
}

function validatePassword(value: string) {
  if (!value) return "A senha é obrigatória.";
  if (value.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  return undefined;
}

function validateTotp(value: string) {
  if (!value) return "Informe o código de autenticação.";
  if (value.length !== 6) return "O código precisa ter 6 dígitos.";
  return undefined;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.63-.06-1.24-.16-1.82H9v3.44h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.6Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.96v2.33A9 9 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.96 10.68A5.42 5.42 0 0 1 3.68 9c0-.58.1-1.14.28-1.68V4.99H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.01l3-2.33Z" fill="#FBBC05" />
      <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.99l3 2.33C4.67 5.18 6.66 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  );
}

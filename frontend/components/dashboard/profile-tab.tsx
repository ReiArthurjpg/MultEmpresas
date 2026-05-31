"use client";

import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, User } from "lucide-react";
import { useState } from "react";
import { changePassword, saveSession, getSession, type Session } from "@/lib/api";
import { cn } from "@/lib/utils";

type ProfileTabProps = {
  session: Session;
  onPasswordChanged: () => void;
};

export function ProfileTab({ session, onPasswordChanged }: ProfileTabProps) {
  const { user } = session;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 8) return "fraca";
    const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const passed = checks.filter((r) => r.test(pwd)).length;
    if (passed <= 1) return "fraca";
    if (passed === 2) return "média";
    if (passed === 3) return "boa";
    return "forte";
  };

  const strength = passwordStrength(newPassword);

  const strengthColor: Record<string, string> = {
    fraca: "#ef4444",
    média: "#f59e0b",
    boa: "#3b82f6",
    forte: "#10b981",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(session.accessToken, currentPassword, newPassword);
      setSuccess(res.message ?? "Senha alterada com sucesso!");

      // Clear must_change_password flag in local session
      const stored = getSession();
      if (stored) {
        const updated: Session = {
          ...stored,
          user: { ...stored.user, must_change_password: false },
        };
        const isPersistent = window.localStorage.getItem("multempresas.session") !== null;
        saveSession(updated, isPersistent);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onPasswordChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    MASTER: "Master",
    ADMIN: "Administrador",
    OPERATOR: "Operador",
  };

  return (
    <section className="tab-section" aria-labelledby="profile-tab-title">
      <div className="tab-header">
        <div>
          <h2 id="profile-tab-title" className="tab-title">
            Meu Perfil
          </h2>
          <p className="tab-subtitle">
            Gerencie suas informações pessoais e atualize sua senha de acesso.
          </p>
        </div>
      </div>

      {/* User info card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
          boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0f172a, #334155)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: 800,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <strong
            style={{
              display: "block",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </strong>
          <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>
            {user.email}
          </span>
          <span
            style={{
              display: "inline-block",
              marginTop: "0.35rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: "rgba(37,99,235,0.1)",
              color: "#2563eb",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <User size={10} style={{ display: "inline", marginRight: "0.3rem" }} aria-hidden="true" />
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </div>

        {user.must_change_password && (
          <div
            style={{
              marginLeft: "auto",
              padding: "0.5rem 0.9rem",
              borderRadius: "12px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#b45309",
              fontSize: "0.78rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              flexShrink: 0,
            }}
          >
            <KeyRound size={14} aria-hidden="true" />
            Troca de senha pendente
          </div>
        )}
      </div>

      {/* Change password form */}
      <div
        style={{
          padding: "1.5rem",
          borderRadius: "20px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
        }}
      >
        <h3
          style={{
            margin: "0 0 1.25rem",
            fontSize: "1rem",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          Alterar senha
        </h3>

        {error && (
          <p className="form-alert" role="alert" style={{ marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {success && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.85rem 1rem",
              marginBottom: "1rem",
              borderRadius: "12px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "#047857",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            <CheckCircle2 size={18} aria-hidden="true" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {/* Current password */}
          <div className="field-group">
            <label htmlFor="current-password">Senha atual</label>
            <div className="input-shell">
              <KeyRound aria-hidden="true" className="input-icon" size={18} />
              <input
                id="current-password"
                className="form-input password-input"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
                placeholder="Sua senha atual"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showCurrent ? "Ocultar senha atual" : "Mostrar senha atual"}
                onClick={() => setShowCurrent((v) => !v)}
              >
                {showCurrent ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="field-group">
            <label htmlFor="new-password">Nova senha</label>
            <div className="input-shell">
              <KeyRound aria-hidden="true" className="input-icon" size={18} />
              <input
                id="new-password"
                className="form-input password-input"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showNew ? "Ocultar nova senha" : "Mostrar nova senha"}
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>

            {/* Password strength */}
            {strength && (
              <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: "4px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "999px",
                      background: strengthColor[strength],
                      width: strength === "fraca" ? "25%" : strength === "média" ? "50%" : strength === "boa" ? "75%" : "100%",
                      transition: "width 0.3s ease, background 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: strengthColor[strength], textTransform: "capitalize" }}>
                  {strength}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="field-group">
            <label htmlFor="confirm-password">Confirmar nova senha</label>
            <div className="input-shell">
              <KeyRound aria-hidden="true" className="input-icon" size={18} />
              <input
                id="confirm-password"
                className={cn("form-input", confirmPassword && confirmPassword !== newPassword && "input-error")}
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                required
              />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p role="alert" style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.25rem" }}>
                As senhas não coincidem.
              </p>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button
              type="submit"
              className="primary-button"
              id="btn-change-password"
              disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              style={{ minWidth: "160px" }}
            >
              {loading ? (
                <><Loader2 size={14} className="spinner" aria-hidden="true" /> Salvando…</>
              ) : (
                <><KeyRound size={14} aria-hidden="true" /> Alterar senha</>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

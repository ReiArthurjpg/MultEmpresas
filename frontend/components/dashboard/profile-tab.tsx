"use client";

import type { CSSProperties } from "react";
import { useState, useEffect, useRef } from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Camera,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  changePassword,
  saveSession,
  getSession,
  setup2FA,
  verify2FA,
  enable2FA,
  disable2FA,
  type Session,
  type TwoFactorSetupResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DashboardTab } from "@/components/dashboard/sidebar";

type ProfileTabProps = {
  session: Session;
  twoFactorEnabled: boolean;
  onPasswordChanged: () => void;
  onNavigate: (tab: DashboardTab) => void;
  on2FAStatusChange: (enabled: boolean) => void;
};

const ROLE_LABELS: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
};

const TONE_STYLES: Record<string, { bg: string; color: string }> = {
  blue: { bg: "rgba(37, 99, 235, 0.1)", color: "#2563eb" },
  purple: { bg: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" },
  green: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
  yellow: { bg: "rgba(245, 158, 11, 0.14)", color: "#b45309" },
  red: { bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" },
};

const styles = {
  dashboard: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    width: "100%",
  },
  hero: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 300px)",
    gap: "1.5rem",
    overflow: "hidden",
    padding: "2rem",
    border: "1px solid rgba(37, 99, 235, 0.16)",
    borderRadius: "28px",
    background:
      "radial-gradient(circle at 8% 20%, rgba(59, 130, 246, 0.18), transparent 32%), radial-gradient(circle at 92% 12%, rgba(124, 58, 237, 0.14), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f8fbff 52%, #f7f5ff 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.75rem",
    minHeight: "190px",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "fit-content",
    padding: "0.4rem 0.7rem",
    border: "1px solid rgba(37, 99, 235, 0.12)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.72)",
    color: "#2563eb",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "clamp(2.15rem, 4vw, 3.65rem)",
    fontWeight: 850,
    letterSpacing: "-0.06em",
    lineHeight: 0.95,
  },
  subtitle: {
    maxWidth: "680px",
    margin: "0.9rem 0 0",
    color: "#475569",
    fontSize: "1rem",
    lineHeight: 1.65,
  },
  heroAside: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.875rem",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  accountCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    height: "100%",
    padding: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.78)",
    borderRadius: "22px",
    background: "rgba(255, 255, 255, 0.72)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.8), 0 18px 48px rgba(15,23,42,0.08)",
    backdropFilter: "blur(16px)",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    width: "fit-content",
    padding: "0.42rem 0.68rem",
    borderRadius: "999px",
    background: "rgba(16, 185, 129, 0.12)",
    color: "#047857",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  identity: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  avatar: {
    width: "46px",
    height: "46px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0f172a, #334155)",
    color: "#ffffff",
    fontWeight: 850,
  },
  identityName: {
    display: "block",
    maxWidth: "190px",
    overflow: "hidden",
    color: "#0f172a",
    fontSize: "0.95rem",
    fontWeight: 800,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  identityMeta: {
    display: "block",
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: 700,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.25rem",
  },
  panel: {
    padding: "1.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.045)",
  },
  sectionKicker: {
    display: "block",
    color: "#2563eb",
    fontSize: "0.7rem",
    fontWeight: 850,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0.2rem 0 1.25rem",
    color: "#0f172a",
    fontSize: "1.1rem",
    fontWeight: 850,
    letterSpacing: "-0.025em",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    padding: "1rem",
    border: "1px solid #eef2f7",
    borderRadius: "18px",
    background: "#fbfdff",
  },
  iconBox: {
    width: "42px",
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
  },
  infoContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "0.7rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#0f172a",
    fontSize: "0.98rem",
    fontWeight: 850,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginTop: "0.15rem",
  },
  actionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    width: "100%",
    padding: "0.65rem 0.9rem",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "0.8125rem",
    fontWeight: 800,
    transition: "all 150ms ease",
    marginTop: "0.5rem",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
  },
} satisfies Record<string, CSSProperties>;

export function ProfileTab({
  session,
  twoFactorEnabled,
  onPasswordChanged,
  onNavigate,
  on2FAStatusChange,
}: ProfileTabProps) {
  const { user, company } = session;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile Modal & Picture states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 2FA Modal & Setup states
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twofaPhase, setTwofaPhase] = useState<"idle" | "setup" | "done">("idle");
  const [twofaSetupData, setTwofaSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaCodeError, setTwofaCodeError] = useState<string | null>(null);
  const [twofaLoading, setTwofaLoading] = useState(false);
  const [twofaApiError, setTwofaApiError] = useState<string | null>(null);
  const [twofaSuccessMsg, setTwofaSuccessMsg] = useState<string | null>(null);
  const twofaCodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (twofaPhase === "setup") {
      setTimeout(() => twofaCodeInputRef.current?.focus(), 50);
    }
  }, [twofaPhase]);

  const reset2FAState = () => {
    setTwofaPhase("idle");
    setTwofaSetupData(null);
    setTwofaCode("");
    setTwofaCodeError(null);
    setTwofaApiError(null);
    setTwofaSuccessMsg(null);
  };

  const handleClose2FAModal = () => {
    setIs2FAModalOpen(false);
    reset2FAState();
  };

  async function handleSetup2FA() {
    setTwofaLoading(true);
    setTwofaApiError(null);
    try {
      const data = await setup2FA(session.accessToken);
      setTwofaSetupData(data);
      setTwofaPhase("setup");
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Erro ao iniciar configuração 2FA.");
    } finally {
      setTwofaLoading(false);
    }
  }

  async function handleVerify2FA() {
    if (twofaCode.length !== 6) {
      setTwofaCodeError("Informe os 6 dígitos do código.");
      return;
    }
    setTwofaLoading(true);
    setTwofaCodeError(null);
    setTwofaApiError(null);
    try {
      const verifyResult = await verify2FA(session.accessToken, twofaCode);
      if (!verifyResult.valid) {
        setTwofaApiError("Código TOTP inválido. Tente novamente.");
        return;
      }
      await enable2FA(session.accessToken, twofaCode);
      setTwofaSuccessMsg("2FA habilitado com sucesso!");
      setTwofaPhase("done");
      on2FAStatusChange(true);
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setTwofaLoading(false);
    }
  }

  async function handleDisable2FA() {
    setTwofaLoading(true);
    setTwofaApiError(null);
    try {
      await disable2FA(session.accessToken);
      setTwofaSuccessMsg("2FA desabilitado com sucesso.");
      on2FAStatusChange(false);
      setTimeout(() => {
        handleClose2FAModal();
      }, 1200);
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Erro ao desabilitar 2FA.");
    } finally {
      setTwofaLoading(false);
    }
  }

  function update2FACode(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setTwofaCode(clean);
    setTwofaCodeError(null);
    setTwofaApiError(null);
  }

  // Sync profile photo
  useEffect(() => {
    const stored = localStorage.getItem(`multempresas.profile_image_${user.email}`);
    if (stored) {
      setProfileImage(stored);
    }

    function handleCustomEvent() {
      const storedVal = localStorage.getItem(`multempresas.profile_image_${user.email}`);
      setProfileImage(storedVal);
    }

    window.addEventListener("profile-image-updated", handleCustomEvent);
    return () => {
      window.removeEventListener("profile-image-updated", handleCustomEvent);
    };
  }, [user.email]);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileImage(base64);
      localStorage.setItem(`multempresas.profile_image_${user.email}`, base64);
      window.dispatchEvent(new Event("profile-image-updated"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    localStorage.removeItem(`multempresas.profile_image_${user.email}`);
    window.dispatchEvent(new Event("profile-image-updated"));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isChangingPassword = currentPassword || newPassword || confirmPassword;

    if (isChangingPassword) {
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
        setLoading(false);
        return;
      }
    }

    setSuccess("Perfil atualizado com sucesso!");
    setLoading(false);

    setTimeout(() => {
      handleCloseModal();
    }, 1200);
  }

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const accountStatus = user.active !== false ? "Ativa" : "Inativa";
  const userFirstName = user.name.split(" ")[0];

  const profileDetails = [
    {
      icon: User,
      label: "Nome Completo",
      value: user.name,
      tone: "blue",
    },
    {
      icon: Mail,
      label: "Endereço de Email",
      value: user.email,
      tone: "purple",
    },
    {
      icon: Activity,
      label: "Nível de Acesso",
      value: roleLabel,
      tone: "blue",
    },
    {
      icon: Shield,
      label: "Autenticação 2FA",
      value: user.two_factor_enabled ? "Habilitado" : "Pendente de Ativação",
      tone: user.two_factor_enabled ? "green" : "yellow",
    },
    {
      icon: Building2,
      label: "Organização / Empresa",
      value: company?.name ?? "Administração Global",
      tone: "green",
    },
  ];

  return (
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="profile-tab-title"
    >
      {/* Redesigned Premium Hero Card */}
      <div className="overview-hero-card" style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>
            <Sparkles size={16} aria-hidden="true" />
            Configurações da conta
          </div>
          <div>
            <h2 id="profile-tab-title" style={styles.title}>
              Olá, {userFirstName}.
            </h2>
            <p style={styles.subtitle}>
              Gerencie suas informações de perfil, nível de permissões de acesso e mantenha suas credenciais de segurança atualizadas.
            </p>
          </div>
        </div>

        <aside className="overview-hero-aside" style={styles.heroAside}>
          <div style={styles.accountCard}>
            <span
              style={{
                ...styles.statusBadge,
                ...(user.active === false
                  ? {
                      background: "rgba(239, 68, 68, 0.12)",
                      color: "#dc2626",
                    }
                  : null),
              }}
            >
              <CheckCircle2 size={15} aria-hidden="true" />
              Conta {accountStatus}
            </span>
            <div style={styles.identity} aria-label="Usuário logado">
              <div style={{ ...styles.avatar, overflow: "hidden" }} aria-hidden="true">
                {profileImage ? (
                  <img src={profileImage} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  userFirstName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <strong style={styles.identityName}>{user.name}</strong>
                <span style={styles.identityMeta}>{roleLabel}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>


      {/* Main content split grid */}
      <div className="overview-content-grid" style={styles.contentGrid}>
        {/* Left Column: Security Info Card (Plan Card Style) */}
        <section
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.5rem",
            border: "1px solid #eef2f6",
            borderRadius: "22px",
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
            transition: "all 0.2s ease",
          }}
          className="table-row-hover"
          aria-labelledby="security-info-title"
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h4 id="security-info-title" style={{ margin: 0, fontWeight: 800, color: "#0f172a", fontSize: "1.25rem" }}>
                Segurança
              </h4>
              <strong
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 850,
                  color: user.must_change_password ? "#dc2626" : "#7c3aed",
                  letterSpacing: "-0.04em",
                  marginTop: "0.5rem",
                  display: "block",
                }}
              >
                {user.must_change_password ? "Alerta" : "Forte"}
              </strong>
            </div>
            <div>
              {user.must_change_password ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.32rem 0.65rem",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 850,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.18)",
                    color: "#dc2626",
                  }}
                >
                  Atenção
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.32rem 0.65rem",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 850,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.18)",
                    color: "#059669",
                  }}
                >
                  Seguro
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", lineHeight: "1.4" }}>
              {user.must_change_password
                ? "Sua conta está usando uma senha provisória e necessita de alteração imediata."
                : "Sua senha atende a todas as diretrizes de segurança da plataforma."}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.15rem",
                }}
              >
                Diretrizes de Segurança:
              </span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                <span style={{ color: "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                <span>Mínimo 8 caracteres</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                <span style={{ color: "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                <span>Letras maiúsculas & minúsculas</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                <span style={{ color: "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                <span>Números & caracteres especiais</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                <span style={{ color: "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                <span>Autenticação 2FA ativada</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                <span style={{ color: "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                <span>Foto de perfil para auditoria</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "1rem",
              marginTop: "auto",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
              Dados de Acesso
            </span>
            <button
              type="button"
              className="secondary-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <Edit2 size={13} aria-hidden="true" />
              Editar Cadastro
            </button>
          </div>
        </section>

        {/* Right Column: User Details Panel */}
        <aside style={styles.panel} aria-labelledby="profile-details-title">
          <span style={styles.sectionKicker}>Sessão</span>
          <h3 id="profile-details-title" style={styles.sectionTitle}>
            Detalhes do perfil
          </h3>

          <div style={styles.infoList} role="list">
            {profileDetails.map(({ icon: Icon, label, value, tone }) => {
              const toneStyle = TONE_STYLES[tone];
              return (
                <article key={label} style={styles.infoItem} role="listitem">
                  <div
                    style={{
                      ...styles.iconBox,
                      background: toneStyle.bg,
                      color: toneStyle.color,
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>{label}</span>
                    <strong style={styles.infoValue} title={value}>
                      {value}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>

        </aside>

        {/* Right Column: 2FA Card (Plan Card Style) */}
        <section
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.5rem",
            border: "1px solid #eef2f6",
            borderRadius: "22px",
            background: "#ffffff",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
            transition: "all 0.2s ease",
          }}
          className="table-row-hover"
          aria-labelledby="twofa-card-title"
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h4 id="twofa-card-title" style={{ margin: 0, fontWeight: 800, color: "#0f172a", fontSize: "1.25rem" }}>
                2FA
              </h4>
              <strong
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 850,
                  color: twoFactorEnabled ? "#059669" : "#f59e0b",
                  letterSpacing: "-0.04em",
                  marginTop: "0.5rem",
                  display: "block",
                }}
              >
                {twoFactorEnabled ? "Ativo" : "Inativo"}
              </strong>
            </div>
            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.32rem 0.65rem",
                  borderRadius: "999px",
                  fontSize: "0.72rem",
                  fontWeight: 850,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  background: twoFactorEnabled ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.1)",
                  border: twoFactorEnabled ? "1px solid rgba(16, 185, 129, 0.18)" : "1px solid rgba(245, 158, 11, 0.25)",
                  color: twoFactorEnabled ? "#059669" : "#b45309",
                }}
              >
                {twoFactorEnabled ? "Habilitado" : "Pendente"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", lineHeight: "1.4" }}>
              {twoFactorEnabled
                ? "Sua conta está protegida com autenticação em dois fatores (TOTP)."
                : "Recomendamos ativar o 2FA para proteger sua conta com uma camada extra."}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                marginTop: "0.75rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.15rem",
                }}
              >
                Aplicativos Suportados:
              </span>
              {["Google Authenticator", "Microsoft Authenticator", "Authy", "1Password", "Qualquer app TOTP"].map((app) => (
                <div key={app} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "#334155", fontWeight: 650 }}>
                  <span style={{ color: twoFactorEnabled ? "#059669" : "#7c3aed", fontSize: "0.85rem", fontWeight: "bold" }}>✓</span>
                  <span>{app}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f1f5f9",
              paddingTop: "1rem",
              marginTop: "auto",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>
              Autenticação 2FA
            </span>
            <button
              type="button"
              className="secondary-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                borderRadius: "10px",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
              onClick={() => { reset2FAState(); setIs2FAModalOpen(true); }}
            >
              <Shield size={13} aria-hidden="true" />
              {twoFactorEnabled ? "Gerenciar" : "Configurar"}
            </button>
          </div>
        </section>
      </div>

      {/* Modern Dialog/Modal Overlay */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal} style={{ zIndex: 100 }}>
          <div
            className="modal"
            style={{ width: "min(100%, 500px)", padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h4 className="modal__title">Editar Cadastro & Senha</h4>
              <button
                type="button"
                className="icon-button"
                onClick={handleCloseModal}
                aria-label="Fechar"
                style={{ border: "none", background: "transparent" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div
                className="modal__body"
                style={{
                  maxHeight: "calc(80vh - 140px)",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  padding: "1.5rem",
                }}
              >
                {/* Error/Success alerts inside the modal */}
                {error && (
                  <div className="form-alert" role="alert" style={{ margin: 0 }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.85rem 1rem",
                      borderRadius: "12px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      color: "#047857",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {success}
                  </div>
                )}

                {/* Profile Photo Uploader */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Foto do perfil
                  </span>
                  
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        width: "90px",
                        height: "90px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0f172a, #334155)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "2.25rem",
                        fontWeight: 850,
                        overflow: "hidden",
                        border: "3px solid #f1f5f9",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.15)",
                      }}
                    >
                      {profileImage ? (
                        <img src={profileImage} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        userFirstName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <label
                      htmlFor="photo-upload-dialog"
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.4)",
                        border: "2px solid #fff",
                        transition: "transform 150ms ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      title="Upload de foto"
                    >
                      <Camera size={13} />
                    </label>
                    <input
                      id="photo-upload-dialog"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                    />
                  </div>

                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      <Trash2 size={12} />
                      Remover foto
                    </button>
                  )}
                </div>

                <hr style={{ border: "0", borderTop: "1px solid #eef2f6", margin: "0.25rem 0" }} />

                {/* Password Fields Title Banner */}
                <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "-0.25rem" }}>
                  Alterar senha de acesso (Opcional)
                </span>

                {/* Current password */}
                <div className="field-group">
                  <label htmlFor="current-password-dialog">Senha atual</label>
                  <div className="input-shell">
                    <KeyRound aria-hidden="true" className="input-icon" size={18} />
                    <input
                      id="current-password-dialog"
                      className="form-input password-input"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
                      placeholder="Sua senha atual"
                      autoComplete="current-password"
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
                  <label htmlFor="new-password-dialog">Nova senha</label>
                  <div className="input-shell">
                    <KeyRound aria-hidden="true" className="input-icon" size={18} />
                    <input
                      id="new-password-dialog"
                      className="form-input password-input"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      minLength={8}
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
                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ flex: 1, height: "5px", borderRadius: "999px", background: "#e5e7eb", overflow: "hidden" }}>
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
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: strengthColor[strength], textTransform: "capitalize" }}>
                        Senha {strength}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="field-group">
                  <label htmlFor="confirm-password-dialog">Confirmar nova senha</label>
                  <div className="input-shell">
                    <KeyRound aria-hidden="true" className="input-icon" size={18} />
                    <input
                      id="confirm-password-dialog"
                      className={cn("form-input", confirmPassword && confirmPassword !== newPassword && "input-error")}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p role="alert" style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: "0.3rem" }}>
                      As senhas não coincidem.
                    </p>
                  )}
                </div>
              </div>

              <div className="modal__footer" style={{ background: "#f8fafc" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  style={{ minWidth: "140px" }}
                  disabled={
                    loading ||
                    // Disable if they typed in password fields but validation failed
                    ( !!(currentPassword || newPassword || confirmPassword) &&
                      (!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8) )
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="spinner" aria-hidden="true" />
                      Salvando…
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Dialog/Modal Overlay for 2FA */}
      {is2FAModalOpen && (
        <div className="modal-backdrop" onClick={handleClose2FAModal} style={{ zIndex: 100 }}>
          <div
            className="modal"
            style={{ width: "min(100%, 500px)", padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__header">
              <h4 className="modal__title">
                {twoFactorEnabled ? "Desabilitar Autenticação 2FA" : "Configurar Autenticação 2FA"}
              </h4>
              <button
                type="button"
                className="icon-button"
                onClick={handleClose2FAModal}
                aria-label="Fechar"
                style={{ border: "none", background: "transparent" }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="modal__body"
              style={{
                maxHeight: "calc(80vh - 140px)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                padding: "1.5rem",
              }}
            >
              {twofaApiError && (
                <div className="form-alert" role="alert" style={{ margin: 0 }}>
                  {twofaApiError}
                </div>
              )}

              {twofaSuccessMsg && (
                <div
                  role="status"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.85rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    color: "#047857",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {twofaSuccessMsg}
                </div>
              )}

              {/* Habilitado: Confirmar desativação */}
              {twoFactorEnabled && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center", alignItems: "center" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <ShieldOff size={28} />
                  </div>
                  <p style={{ margin: 0, color: "#334155", fontSize: "0.95rem", lineHeight: "1.5" }}>
                    Tem certeza de que deseja desabilitar a Autenticação em Duas Etapas?
                  </p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", lineHeight: "1.4" }}>
                    Sua conta ficará protegida apenas por senha. Isso reduz significativamente a segurança do seu acesso.
                  </p>
                </div>
              )}

              {/* Desabilitado e fase idle */}
              {!twoFactorEnabled && twofaPhase === "idle" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center", alignItems: "center" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(37, 99, 235, 0.1)",
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <QrCode size={28} />
                  </div>
                  <p style={{ margin: 0, color: "#334155", fontSize: "0.95rem", lineHeight: "1.5" }}>
                    Adicione uma camada extra de proteção à sua conta usando um aplicativo autenticador (Google Authenticator, Authy, Microsoft Authenticator, etc.).
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ width: "100%", marginTop: "0.5rem" }}
                    onClick={handleSetup2FA}
                    disabled={twofaLoading}
                  >
                    {twofaLoading ? (
                      <>
                        <Loader2 size={14} className="spinner" aria-hidden="true" />
                        Iniciando…
                      </>
                    ) : (
                      <>
                        <Shield size={14} aria-hidden="true" style={{ marginRight: "0.4rem" }} />
                        Iniciar Configuração
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Desabilitado e fase setup */}
              {!twoFactorEnabled && twofaPhase === "setup" && twofaSetupData && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </span>
                    <div style={{ fontSize: "0.875rem", color: "#334155" }}>
                      <strong>Abra o seu aplicativo autenticador</strong>
                      <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                        Abra o Google Authenticator, Authy ou similar no seu celular.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </span>
                    <div style={{ fontSize: "0.875rem", color: "#334155", width: "100%" }}>
                      <strong>Escaneie o QR Code</strong>
                      <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                        Aponte a câmera do aplicativo para o QR Code abaixo ou insira a chave secreta manualmente.
                      </p>

                      {twofaSetupData.qr_code_url ? (
                        <div style={{ display: "flex", justifyContent: "center", margin: "1rem 0", background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={twofaSetupData.qr_code_url}
                            alt="QR Code"
                            width={160}
                            height={160}
                          />
                        </div>
                      ) : (
                        <div style={{ background: "#f1f5f9", padding: "0.75rem", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all", marginTop: "0.5rem" }}>
                          {twofaSetupData.secret}
                        </div>
                      )}

                      {twofaSetupData.secret && (
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
                          Chave secreta: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>{twofaSetupData.secret}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      3
                    </span>
                    <div style={{ fontSize: "0.875rem", color: "#334155", width: "100%" }}>
                      <strong>Confirme o código gerado</strong>
                      <div className="field-group" style={{ marginTop: "0.5rem" }}>
                        <label htmlFor="totp-verify-profile" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Código de 6 dígitos</label>
                        <input
                          ref={twofaCodeInputRef}
                          id="totp-verify-profile"
                          className={cn("form-input totp-input", twofaCodeError && "input-error")}
                          style={{ maxWidth: "160px", textAlign: "center", fontSize: "1.2rem", letterSpacing: "0.15em", padding: "0.5rem" }}
                          value={twofaCode}
                          onChange={(e) => update2FACode(e.target.value)}
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          autoComplete="one-time-code"
                        />
                        {twofaCodeError && (
                          <p role="alert" style={{ color: "var(--destructive)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                            {twofaCodeError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desabilitado e fase done */}
              {!twoFactorEnabled && twofaPhase === "done" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center", alignItems: "center", padding: "1rem 0" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ margin: 0, fontWeight: 800, color: "#0f172a", fontSize: "1.25rem" }}>
                    2FA Habilitado!
                  </h4>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    Sua conta agora está protegida com autenticação em dois fatores. Cada login exigirá o código do seu aplicativo autenticador.
                  </p>
                </div>
              )}
            </div>

            <div className="modal__footer" style={{ background: "#f8fafc" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={handleClose2FAModal}
                disabled={twofaLoading}
              >
                {twofaPhase === "done" ? "Fechar" : "Cancelar"}
              </button>

              {twoFactorEnabled && (
                <button
                  type="button"
                  className="danger-button"
                  style={{ minWidth: "140px" }}
                  onClick={handleDisable2FA}
                  disabled={twofaLoading}
                >
                  {twofaLoading ? (
                    <>
                      <Loader2 size={14} className="spinner" aria-hidden="true" />
                      Desabilitando…
                    </>
                  ) : (
                    "Desabilitar 2FA"
                  )}
                </button>
              )}

              {!twoFactorEnabled && twofaPhase === "setup" && (
                <button
                  type="button"
                  className="primary-button"
                  style={{ minWidth: "140px" }}
                  onClick={handleVerify2FA}
                  disabled={twofaLoading || twofaCode.length < 6}
                >
                  {twofaLoading ? (
                    <>
                      <Loader2 size={14} className="spinner" aria-hidden="true" />
                      Verificando…
                    </>
                  ) : (
                    "Habilitar"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

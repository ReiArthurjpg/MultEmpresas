"use client";

import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { Session } from "@/lib/api";

type OverviewTabProps = {
  session: Session;
};

const ROLE_LABELS: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
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
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "1rem",
  },
  kpiCard: {
    position: "relative",
    display: "flex",
    minHeight: "158px",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    padding: "1.25rem",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.06)",
  },
  iconBox: {
    width: "54px",
    height: "54px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "17px",
  },
  cardLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  cardValue: {
    display: "block",
    marginTop: "0.25rem",
    overflow: "hidden",
    color: "#0f172a",
    fontSize: "1.35rem",
    fontWeight: 850,
    letterSpacing: "-0.04em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  helper: {
    display: "block",
    marginTop: "0.2rem",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: 600,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.65fr) minmax(280px, 0.75fr)",
    gap: "1rem",
  },
  panel: {
    padding: "1.25rem",
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
    margin: "0.2rem 0 1rem",
    color: "#0f172a",
    fontSize: "1.05rem",
    fontWeight: 850,
    letterSpacing: "-0.025em",
  },
  infoCard: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    gap: "0.85rem",
    padding: "1rem",
    border: "1px solid #eef2f7",
    borderRadius: "18px",
    background: "#fbfdff",
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.7rem",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    paddingBottom: "0.7rem",
    borderBottom: "1px solid #eef2f7",
  },
  alertsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
  },
  alertCard: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    gap: "0.9rem",
    alignItems: "start",
    padding: "1rem",
    borderRadius: "20px",
    boxShadow: "0 16px 42px rgba(15, 23, 42, 0.055)",
  },
  actionButton: {
    gridColumn: "1 / -1",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    width: "fit-content",
    padding: "0.58rem 0.82rem",
    border: "1px solid currentColor",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.68)",
    color: "inherit",
    fontSize: "0.78rem",
    fontWeight: 850,
  },
} satisfies Record<string, CSSProperties>;

const TONE_STYLES: Record<string, { bg: string; color: string }> = {
  blue: { bg: "rgba(37, 99, 235, 0.1)", color: "#2563eb" },
  purple: { bg: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" },
  green: { bg: "rgba(16, 185, 129, 0.12)", color: "#059669" },
  yellow: { bg: "rgba(245, 158, 11, 0.14)", color: "#b45309" },
  red: { bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" },
};

const PILL_STYLES: Record<string, CSSProperties> = {
  master: {
    background: "rgba(124, 58, 237, 0.1)",
    borderColor: "rgba(124, 58, 237, 0.2)",
    color: "#6d28d9",
  },
  admin: {
    background: "rgba(37, 99, 235, 0.1)",
    borderColor: "rgba(37, 99, 235, 0.2)",
    color: "#2563eb",
  },
  operator: {
    background: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.22)",
    color: "#047857",
  },
  info: {
    background: "rgba(14, 165, 233, 0.1)",
    borderColor: "rgba(14, 165, 233, 0.2)",
    color: "#0284c7",
  },
  success: {
    background: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.22)",
    color: "#047857",
  },
  warning: {
    background: "rgba(245, 158, 11, 0.14)",
    borderColor: "rgba(245, 158, 11, 0.28)",
    color: "#b45309",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.24)",
    color: "#dc2626",
  },
};

export function OverviewTab({ session }: OverviewTabProps) {
  const { user, company } = session;

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Bom dia"
      : now.getHours() < 18
        ? "Boa tarde"
        : "Boa noite";

  const userFirstName = user.name.split(" ")[0];
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const accountStatus = user.active !== false ? "Ativa" : "Inativa";
  const companyName = company?.name ?? "Conta Master";
  const localTime = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const stats = [
    {
      icon: Users,
      label: "Perfil de acesso",
      value: roleLabel,
      helper: "Permissões e escopo operacional",
      tone: "blue",
    },
    {
      icon: Building2,
      label: "Empresa",
      value: companyName,
      helper: company ? "Workspace vinculado" : "Administração global",
      tone: "purple",
    },
    {
      icon: Shield,
      label: "Autenticação 2FA",
      value: user.two_factor_enabled ? "Habilitado" : "Desabilitado",
      helper: user.two_factor_enabled
        ? "Camada extra ativa"
        : "Recomendado ativar",
      tone: user.two_factor_enabled ? "green" : "yellow",
    },
    {
      icon: BarChart3,
      label: "Status da conta",
      value: accountStatus,
      helper: user.active !== false ? "Acesso liberado" : "Acesso restrito",
      tone: user.active !== false ? "green" : "red",
    },
  ];

  const sessionInfo = [
    { icon: Mail, label: "Email", value: user.email, tone: "blue" },
    {
      icon: Building2,
      label: "Empresa",
      value: company?.name ?? "Conta Global",
      tone: "purple",
    },
    { icon: Clock, label: "Horário local", value: localTime, tone: "green" },
    {
      icon: KeyRound,
      label: "Troca de senha",
      value: user.must_change_password ? "Pendente" : "OK",
      tone: user.must_change_password ? "yellow" : "green",
    },
  ];

  const quickSummary = [
    { label: "Perfil", value: roleLabel, variant: user.role.toLowerCase() },
    { label: "Empresa", value: company?.name ?? "Global", variant: "info" },
    {
      label: "2FA",
      value: user.two_factor_enabled ? "Ativo" : "Pendente",
      variant: user.two_factor_enabled ? "success" : "warning",
    },
    {
      label: "Status da conta",
      value: accountStatus,
      variant: user.active !== false ? "success" : "danger",
    },
  ];

  const sessionInfo = [
    {
      icon: Mail,
      label: "Email",
      value: user.email,
      tone: "blue",
    },
    {
      icon: Building2,
      label: "Empresa",
      value: company?.name ?? "Conta Global",
      tone: "purple",
    },
    {
      icon: Clock,
      label: "Horário local",
      value: localTime,
      tone: "green",
    },
    {
      icon: KeyRound,
      label: "Troca de senha",
      value: user.must_change_password ? "Pendente" : "OK",
      tone: user.must_change_password ? "yellow" : "green",
    },
  ];

  const quickSummary = [
    { label: "Perfil", value: roleLabel, variant: user.role.toLowerCase() },
    { label: "Empresa", value: company?.name ?? "Global", variant: "info" },
    {
      label: "2FA",
      value: user.two_factor_enabled ? "Ativo" : "Pendente",
      variant: user.two_factor_enabled ? "success" : "warning",
    },
    {
      label: "Status da conta",
      value: accountStatus,
      variant: user.active !== false ? "success" : "danger",
    },
  ];

  return (
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="overview-tab-title"
    >
      <div className="overview-hero-card" style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>
            <Sparkles size={16} aria-hidden="true" />
            Painel executivo
          </div>
          <div>
            <h2 id="overview-tab-title" style={styles.title}>
              {greeting}, {userFirstName}.
            </h2>
            <p style={styles.subtitle}>
              Bem-vindo ao MultEmpresas. Uma visão clara dos sinais essenciais
              da sua conta, segurança e operação em tempo real.
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
              <div style={styles.avatar} aria-hidden="true">
                {userFirstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={styles.identityName}>{user.name}</strong>
                <span style={styles.identityMeta}>{roleLabel}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div style={styles.grid4} role="list" aria-label="Indicadores principais">
        {stats.map(({ icon: Icon, label, value, helper, tone }) => {
          const toneStyle = TONE_STYLES[tone];
          return (
            <article
              key={label}
              className="overview-kpi-card"
              style={styles.kpiCard}
              role="listitem"
            >
              <div
                style={{
                  ...styles.iconBox,
                  background: toneStyle.bg,
                  color: toneStyle.color,
                }}
                aria-hidden="true"
              >
                <Icon size={28} />
              </div>
              <div>
                <span style={styles.cardLabel}>{label}</span>
                <strong style={styles.cardValue}>{value}</strong>
                <span style={styles.helper}>{helper}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="overview-content-grid" style={styles.contentGrid}>
        <section style={styles.panel} aria-labelledby="overview-session-title">
          <span style={styles.sectionKicker}>Sessão</span>
          <h3 id="overview-session-title" style={styles.sectionTitle}>
            Informações da conta
          </h3>
          <div style={styles.grid4} role="list">
            {sessionInfo.map(({ icon: Icon, label, value, tone }) => {
              const toneStyle = TONE_STYLES[tone];
              return (
                <article key={label} style={styles.infoCard} role="listitem">
                  <div
                    style={{
                      ...styles.iconBox,
                      width: "42px",
                      height: "42px",
                      borderRadius: "14px",
                      background: toneStyle.bg,
                      color: toneStyle.color,
                    }}
                    aria-hidden="true"
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={styles.cardLabel}>{label}</span>
                    <strong
                      style={{ ...styles.cardValue, fontSize: "0.98rem" }}
                    >
                      {value}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside style={styles.panel} aria-labelledby="overview-summary-title">
          <span style={styles.sectionKicker}>Snapshot</span>
          <h3 id="overview-summary-title" style={styles.sectionTitle}>
            Resumo rápido
          </h3>
          <div style={styles.summaryList}>
            {quickSummary.map(({ label, value, variant }, index) => (
              <div
                key={label}
                style={{
                  ...styles.summaryRow,
                  ...(index === quickSummary.length - 1
                    ? { paddingBottom: 0, borderBottom: 0 }
                    : null),
                }}
              >
                <span style={{ color: "#64748b", fontWeight: 700 }}>
                  {label}
                </span>
                <strong
                  style={{
                    display: "inline-flex",
                    maxWidth: "170px",
                    overflow: "hidden",
                    padding: "0.28rem 0.62rem",
                    border: "1px solid transparent",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 850,
                    letterSpacing: "0.04em",
                    textOverflow: "ellipsis",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    ...(PILL_STYLES[variant] ?? PILL_STYLES.info),
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {(user.must_change_password || !user.two_factor_enabled) && (
        <section aria-labelledby="overview-alerts-title">
          <span style={styles.sectionKicker}>Atenção</span>
          <h3 id="overview-alerts-title" style={styles.sectionTitle}>
            Avisos importantes
          </h3>
          <div style={styles.alertsGrid}>
            {user.must_change_password && (
              <article
                className="overview-alert-card"
                style={{
                  ...styles.alertCard,
                  border: "1px solid rgba(245, 158, 11, 0.28)",
                  background: "linear-gradient(135deg, #fffbeb, #ffffff)",
                  color: "#92400e",
                }}
              >
                <div
                  style={{
                    ...styles.iconBox,
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "rgba(245, 158, 11, 0.14)",
                  }}
                  aria-hidden="true"
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <strong style={{ display: "block", color: "#0f172a" }}>
                    Atualização de senha necessária
                  </strong>
                  <span style={{ display: "block", marginTop: "0.25rem" }}>
                    Altere sua senha para manter o acesso em conformidade com a
                    política de segurança.
                  </span>
                </div>
                <button style={styles.actionButton} type="button">
                  Atualizar senha
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </article>
            )}
            {!user.two_factor_enabled && (
              <article
                className="overview-alert-card"
                style={{
                  ...styles.alertCard,
                  border: "1px solid rgba(14, 165, 233, 0.24)",
                  background: "linear-gradient(135deg, #f0f9ff, #ffffff)",
                  color: "#0369a1",
                }}
              >
                <div
                  style={{
                    ...styles.iconBox,
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "rgba(14, 165, 233, 0.12)",
                  }}
                  aria-hidden="true"
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <strong style={{ display: "block", color: "#0f172a" }}>
                    Autenticação em dois fatores recomendada
                  </strong>
                  <span style={{ display: "block", marginTop: "0.25rem" }}>
                    Habilite o 2FA para adicionar uma camada de proteção à sua
                    conta e reduzir riscos de acesso indevido.
                  </span>
                </div>
                <button style={styles.actionButton} type="button">
                  Ver segurança
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </article>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

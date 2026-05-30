"use client";

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
      color: "stat-card--blue",
    },
    {
      icon: Building2,
      label: "Empresa",
      value: companyName,
      helper: company ? "Workspace vinculado" : "Administração global",
      color: "stat-card--purple",
    },
    {
      icon: Shield,
      label: "Autenticação 2FA",
      value: user.two_factor_enabled ? "Habilitado" : "Desabilitado",
      helper: user.two_factor_enabled
        ? "Camada extra ativa"
        : "Recomendado ativar",
      color: user.two_factor_enabled ? "stat-card--green" : "stat-card--yellow",
    },
    {
      icon: BarChart3,
      label: "Status da conta",
      value: accountStatus,
      helper: user.active !== false ? "Acesso liberado" : "Acesso restrito",
      color: user.active !== false ? "stat-card--green" : "stat-card--red",
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
      aria-labelledby="overview-tab-title"
    >
      <div className="overview-hero-card">
        <div className="overview-hero-card__content">
          <div className="overview-hero-card__eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Painel executivo
          </div>
          <div>
            <h2 id="overview-tab-title" className="overview-hero-card__title">
              {greeting}, {userFirstName}.
            </h2>
            <p className="overview-hero-card__subtitle">
              Bem-vindo ao MultEmpresas. Acompanhe os principais sinais da sua
              conta e mantenha sua operação segura em um só lugar.
            </p>
          </div>
        </div>
        <div className="overview-hero-card__aside">
          <span
            className={`overview-status-badge ${
              user.active !== false
                ? "overview-status-badge--success"
                : "overview-status-badge--danger"
            }`}
          >
            <CheckCircle2 size={15} aria-hidden="true" />
            Conta {accountStatus}
          </span>
          <div
            className="overview-hero-card__identity"
            aria-label="Usuário logado"
          >
            <div className="overview-hero-card__avatar" aria-hidden="true">
              {userFirstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="stat-grid"
        role="list"
        aria-label="Indicadores principais"
      >
        {stats.map(({ icon: Icon, label, value, helper, color }) => (
          <div key={label} className={`stat-card ${color}`} role="listitem">
            <div className="stat-card__icon" aria-hidden="true">
              <Icon size={28} />
            </div>
            <div className="stat-card__body">
              <span className="stat-card__label">{label}</span>
              <span className="stat-card__value">{value}</span>
              <span className="stat-card__helper">{helper}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-content-grid">
        <div className="overview-panel overview-panel--wide">
          <div className="overview-section-header">
            <div>
              <span className="overview-section-kicker">Sessão</span>
              <h3 className="overview-section__title">Informações da conta</h3>
            </div>
          </div>
          <div className="overview-info-grid" role="list">
            {sessionInfo.map(({ icon: Icon, label, value, tone }) => (
              <article
                key={label}
                className={`overview-info-card overview-info-card--${tone}`}
                role="listitem"
              >
                <div className="overview-info-card__icon" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <div>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="overview-panel overview-quick-summary">
          <div className="overview-section-header">
            <div>
              <span className="overview-section-kicker">Snapshot</span>
              <h3 className="overview-section__title">Resumo rápido</h3>
            </div>
          </div>
          <div className="overview-summary-list">
            {quickSummary.map(({ label, value, variant }) => (
              <div key={label} className="overview-summary-row">
                <span>{label}</span>
                <strong className={`overview-pill overview-pill--${variant}`}>
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {(user.must_change_password || !user.two_factor_enabled) && (
        <div className="overview-alerts">
          <div className="overview-section-header">
            <div>
              <span className="overview-section-kicker">Atenção</span>
              <h3 className="overview-section__title">Avisos importantes</h3>
            </div>
          </div>
          <div className="alerts-list">
            {user.must_change_password && (
              <div className="alert-item alert-item--warning">
                <div className="alert-item__icon" aria-hidden="true">
                  <KeyRound size={20} />
                </div>
                <div className="alert-item__content">
                  <strong>Atualização de senha necessária</strong>
                  <span>
                    Você precisa alterar sua senha para manter o acesso em
                    conformidade com a política de segurança.
                  </span>
                </div>
                <button className="alert-item__action" type="button">
                  Atualizar senha
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </div>
            )}
            {!user.two_factor_enabled && (
              <div className="alert-item alert-item--info">
                <div className="alert-item__icon" aria-hidden="true">
                  <AlertTriangle size={20} />
                </div>
                <div className="alert-item__content">
                  <strong>Autenticação em dois fatores recomendada</strong>
                  <span>
                    Habilite o 2FA para adicionar uma camada de proteção à sua
                    conta e reduzir riscos de acesso indevido.
                  </span>
                </div>
                <button className="alert-item__action" type="button">
                  Ver segurança
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

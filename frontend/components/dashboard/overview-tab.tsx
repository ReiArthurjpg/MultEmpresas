"use client";

import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
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

  const stats = [
    {
      icon: Users,
      label: "Perfil de acesso",
      value: ROLE_LABELS[user.role] ?? user.role,
      color: "stat-card--blue",
    },
    {
      icon: Building2,
      label: "Empresa",
      value: company?.name ?? "Conta Master",
      color: "stat-card--purple",
    },
    {
      icon: Shield,
      label: "2FA",
      value: user.two_factor_enabled ? "Habilitado" : "Desabilitado",
      color: user.two_factor_enabled ? "stat-card--green" : "stat-card--yellow",
    },
    {
      icon: BarChart3,
      label: "Status da conta",
      value: user.active !== false ? "Ativa" : "Inativa",
      color: user.active !== false ? "stat-card--green" : "stat-card--red",
    },
  ];

  return (
    <section className="tab-section" aria-labelledby="overview-tab-title">
      {/* Welcome */}
      <div className="overview-welcome">
        <div className="overview-welcome__icon" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 id="overview-tab-title" className="tab-title">
            {greeting}, {user.name.split(" ")[0]}!
          </h2>
          <p className="tab-subtitle">
            Bem-vindo ao painel MultEmpresas. Tudo parece estar em ordem.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" role="list">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`stat-card ${color}`} role="listitem">
            <div className="stat-card__icon" aria-hidden="true">
              <Icon size={22} />
            </div>
            <div className="stat-card__body">
              <span className="stat-card__label">{label}</span>
              <span className="stat-card__value">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Session info */}
      <div className="overview-section">
        <h3 className="overview-section__title">Dados da sessão</h3>
        <dl className="overview-dl">
          <div className="overview-dl__row">
            <dt><Clock size={14} aria-hidden="true" /> Horário local</dt>
            <dd>
              {now.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </dd>
          </div>
          <div className="overview-dl__row">
            <dt><Users size={14} aria-hidden="true" /> E-mail</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="overview-dl__row">
            <dt><Building2 size={14} aria-hidden="true" /> Empresa</dt>
            <dd>{company?.name ?? "Conta Global"}</dd>
          </div>
          <div className="overview-dl__row">
            <dt><CheckCircle2 size={14} aria-hidden="true" /> Troca de senha</dt>
            <dd>{user.must_change_password ? "Pendente" : "OK"}</dd>
          </div>
        </dl>
      </div>

      {/* Alerts */}
      {(user.must_change_password || !user.two_factor_enabled) && (
        <div className="overview-alerts">
          <h3 className="overview-section__title">Avisos</h3>
          <div className="alerts-list">
            {user.must_change_password && (
              <div className="alert-item alert-item--warning">
                🔑 Você precisa alterar sua senha. Acesse as configurações de conta.
              </div>
            )}
            {!user.two_factor_enabled && (
              <div className="alert-item alert-item--info">
                🛡️ Recomendamos habilitar a autenticação em dois fatores para maior segurança.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

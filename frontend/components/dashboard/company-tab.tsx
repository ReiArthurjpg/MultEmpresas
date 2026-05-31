"use client";

import { Building2, Globe, Hash, Mail, MapPin, Phone } from "lucide-react";
import type { Session } from "@/lib/api";

type CompanyTabProps = {
  session: Session;
};

export function CompanyTab({ session }: CompanyTabProps) {
  const { company } = session;

  if (!company) {
    return (
      <section className="tab-section" aria-labelledby="company-tab-title">
        <div className="tab-header">
          <div>
            <h2 id="company-tab-title" className="tab-title">Empresa</h2>
            <p className="tab-subtitle">Detalhes da empresa vinculada à sua conta.</p>
          </div>
        </div>
        <div className="empty-state">
          <Building2 size={40} aria-hidden="true" />
          <p>Conta master — sem empresa vinculada.</p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
            Contas MASTER têm acesso global ao sistema sem vínculo com empresa específica.
          </p>
        </div>
      </section>
    );
  }

  const infoRows = [
    { icon: Building2, label: "Nome da empresa", value: company.name },
    { icon: Hash, label: "ID interno", value: String(company.id) },
    { icon: Globe, label: "Logo", value: company.logo_url ?? "Nenhuma logo cadastrada" },
  ];

  return (
    <section className="tab-section" aria-labelledby="company-tab-title">
      <div className="tab-header">
        <div>
          <h2 id="company-tab-title" className="tab-title">Empresa</h2>
          <p className="tab-subtitle">Dados da empresa vinculada à sua sessão.</p>
        </div>
      </div>

      <div className="company-profile">
        {/* Logo / avatar */}
        <div className="company-profile__logo" aria-hidden="true">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={`Logo de ${company.name}`}
              className="company-profile__logo-img"
            />
          ) : (
            <Building2 size={36} />
          )}
        </div>
        <div className="company-profile__info">
          <h3 className="company-profile__name">{company.name}</h3>
          <span className="badge badge--admin">ID #{company.id}</span>
        </div>
      </div>

      <dl className="overview-dl">
        {infoRows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="overview-dl__row">
            <dt><Icon size={14} aria-hidden="true" /> {label}</dt>
            <dd className={value === "Nenhuma logo cadastrada" ? "td-muted" : ""}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="info-banner">
        <Mail size={16} aria-hidden="true" />
        <span>
          Para editar dados da empresa (CNPJ, endereço, plano, logo), acesse o módulo <strong>Empresas</strong> no menu administrativo — em breve disponível.
        </span>
      </div>
    </section>
  );
}

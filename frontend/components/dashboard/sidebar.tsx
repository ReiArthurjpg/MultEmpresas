"use client";

import {
  Activity,
  Award,
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/api";

export type DashboardTab =
  | "overview"
  | "users"
  | "2fa"
  | "company"
  | "companies"
  | "plans"
  | "audit";

type SidebarProps = {
  session: Session;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  collapsed: boolean;
  onToggle: () => void;
};

const NAV_ITEMS: { tab: DashboardTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { tab: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { tab: "users", label: "Usuários", icon: Users, roles: ["MASTER", "ADMIN"] },
  { tab: "company", label: "Minha Empresa", icon: Building2, roles: ["ADMIN", "OPERATOR"] },
  { tab: "companies", label: "Empresas", icon: Building2, roles: ["MASTER"] },
  { tab: "plans", label: "Planos", icon: Award, roles: ["MASTER"] },
  { tab: "audit", label: "Auditoria", icon: Activity, roles: ["MASTER", "ADMIN"] },
  { tab: "2fa", label: "Segurança 2FA", icon: Shield },
];

export function Sidebar({
  session,
  activeTab,
  onTabChange,
  onLogout,
  isLoggingOut,
  collapsed,
  onToggle,
}: SidebarProps) {
  const role = session.user.role;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const initials = session.user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className={cn("db-sidebar", collapsed && "db-sidebar--collapsed")}>
      {/* Logo / toggle */}
      <div className="db-sidebar__header">
        {!collapsed && (
          <span className="db-sidebar__brand">MultEmpresas</span>
        )}
        <button
          className="db-sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          type="button"
        >
          <span className="db-sidebar__toggle-icon">{collapsed ? "→" : "←"}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="db-sidebar__nav" aria-label="Menu principal">
        {visibleItems.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            className={cn("db-sidebar__item", activeTab === tab && "db-sidebar__item--active")}
            onClick={() => onTabChange(tab)}
            type="button"
            title={collapsed ? label : undefined}
            aria-current={activeTab === tab ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div className="db-sidebar__footer">
        <div className="db-sidebar__user">
          <div className="db-sidebar__avatar" aria-hidden="true">
            {initials}
          </div>
          {!collapsed && (
            <div className="db-sidebar__user-info">
              <span className="db-sidebar__user-name">{session.user.name}</span>
              <span className="db-sidebar__user-role">{role}</span>
            </div>
          )}
        </div>

        <button
          className="db-sidebar__logout"
          onClick={onLogout}
          disabled={isLoggingOut}
          type="button"
          title="Sair"
          aria-label="Sair da conta"
        >
          <LogOut size={18} aria-hidden="true" />
          {!collapsed && <span>{isLoggingOut ? "Saindo…" : "Sair"}</span>}
        </button>
      </div>
    </aside>
  );
}

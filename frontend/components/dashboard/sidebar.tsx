"use client";

import { useState, useRef } from "react";
import {
  Activity,
  Award,
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/api";
import { ShinyText } from "@/components/ui/shiny-text";

export type DashboardTab =
  | "overview"
  | "users"
  | "2fa"
  | "company"
  | "companies"
  | "plans"
  | "audit"
  | "profile";

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
  { tab: "profile", label: "Meu Perfil", icon: UserCircle },
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
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [spotlightOpacity, setSpotlightOpacity] = useState(0);
  const asideRef = useRef<HTMLElement>(null);

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

  const isVisualCollapsed = collapsed && !isHovered;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!asideRef.current) return;
    const rect = asideRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <aside 
      ref={asideRef}
      className={cn("db-sidebar", isVisualCollapsed && "db-sidebar--collapsed")}
      onMouseEnter={() => {
        setIsHovered(true);
        setSpotlightOpacity(1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setSpotlightOpacity(0);
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight overlay background */}
      <div
        className="pointer-events-none absolute z-0 transition-opacity duration-300"
        style={{
          inset: 0,
          opacity: spotlightOpacity,
          background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, oklch(0.55 0.18 210 / 0.08), transparent 80%)`,
        }}
      />

      {/* Logo / toggle */}
      <div className="db-sidebar__header" style={{ position: "relative", zIndex: 10 }}>
        {!isVisualCollapsed && (
          <span className="db-sidebar__brand">
            <ShinyText text="MultEmpresas" speed={4} />
          </span>
        )}
        <button
          className="db-sidebar__toggle"
          onClick={onToggle}
          aria-label={isVisualCollapsed ? "Expandir menu" : "Recolher menu"}
          type="button"
        >
          <span className="db-sidebar__toggle-icon">{isVisualCollapsed ? "→" : "←"}</span>
        </button>
      </div>

      {/* Navigation */}
      <nav 
        className="db-sidebar__nav" 
        aria-label="Menu principal" 
        style={{ position: "relative", zIndex: 10 }}
      >
        {visibleItems.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            className={cn("db-sidebar__item", activeTab === tab && "db-sidebar__item--active")}
            onClick={() => onTabChange(tab)}
            type="button"
            title={isVisualCollapsed ? label : undefined}
            aria-current={activeTab === tab ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            {!isVisualCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div className="db-sidebar__footer" style={{ position: "relative", zIndex: 10 }}>
        <div className="db-sidebar__user">
          <div className="db-sidebar__avatar" aria-hidden="true">
            {initials}
          </div>
          {!isVisualCollapsed && (
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
          {!isVisualCollapsed && <span>{isLoggingOut ? "Saindo…" : "Sair"}</span>}
        </button>
      </div>
    </aside>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  Award,
  Building2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LayoutDashboard,
  LogOut,
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

// Top-level nav items (non-grouped)
const TOP_NAV_ITEMS: { tab: DashboardTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { tab: "overview", label: "Visão Geral", icon: LayoutDashboard },
];

// Items grouped under "Cadastro" dropdown
const CADASTRO_ITEMS: { tab: DashboardTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { tab: "users",     label: "Usuários", icon: Users,     roles: ["MASTER", "ADMIN"] },
  { tab: "companies", label: "Empresas", icon: Building2, roles: ["MASTER"] },
  { tab: "company",   label: "Minha Empresa", icon: Building2, roles: ["ADMIN", "OPERATOR"] },
  { tab: "plans",     label: "Planos",   icon: Award,     roles: ["MASTER"] },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`multempresas.profile_image_${session.user.email}`);
    if (stored) {
      setProfileImage(stored);
    }

    function handleCustomEvent() {
      const storedVal = localStorage.getItem(`multempresas.profile_image_${session.user.email}`);
      setProfileImage(storedVal);
    }

    window.addEventListener("profile-image-updated", handleCustomEvent);
    return () => {
      window.removeEventListener("profile-image-updated", handleCustomEvent);
    };
  }, [session.user.email]);

  const role = session.user.role;

  const visibleTopItems = TOP_NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const visibleCadastroItems = CADASTRO_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const isCadastroActive = visibleCadastroItems.some((item) => item.tab === activeTab);

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

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const ROLE_LABELS: Record<string, string> = {
    MASTER: "Master",
    ADMIN: "Administrador",
    OPERATOR: "Operador",
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
        {/* Top-level items */}
        {visibleTopItems.map(({ tab, label, icon: Icon }) => (
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

        {/* Cadastro dropdown (only render if user has access to any child) */}
        {visibleCadastroItems.length > 0 && (
          <div>
            {/* Dropdown trigger */}
            <button
              type="button"
              title={isVisualCollapsed ? "Cadastro" : undefined}
              className={cn(
                "db-sidebar__item",
                isCadastroActive && "db-sidebar__item--active"
              )}
              style={{ justifyContent: "space-between" }}
              onClick={() => setCadastroOpen((v) => !v)}
              aria-expanded={cadastroOpen}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <ClipboardList size={20} aria-hidden="true" />
                {!isVisualCollapsed && <span>Cadastro</span>}
              </span>
              {!isVisualCollapsed && (
                <ChevronDown
                  size={15}
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    color: "#64748b",
                    transition: "transform 0.22s ease",
                    transform: cadastroOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              )}
            </button>

            {/* Sub-items */}
            {cadastroOpen && !isVisualCollapsed && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  marginLeft: "1.25rem",
                  paddingLeft: "0.85rem",
                  marginTop: "0.25rem",
                  marginBottom: "0.5rem",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                  animation: "dropdownFadeIn 0.18s ease",
                }}
              >
                {visibleCadastroItems.map(({ tab, label, icon: Icon }) => (
                  <button
                    key={tab}
                    type="button"
                    className={cn(
                      "db-sidebar__item",
                      activeTab === tab && "db-sidebar__item--active"
                    )}
                    style={{ 
                      fontSize: "0.825rem", 
                      paddingTop: "0.45rem", 
                      paddingBottom: "0.45rem",
                      paddingLeft: "0.75rem",
                      height: "34px",
                      borderRadius: "6px",
                      opacity: activeTab === tab ? 1 : 0.8,
                    }}
                    onClick={() => {
                      onTabChange(tab);
                      setCadastroOpen(true);
                    }}
                    aria-current={activeTab === tab ? "page" : undefined}
                  >
                    <Icon size={15} aria-hidden="true" style={{ opacity: 0.9 }} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer: user dropdown */}
      <div
        className="db-sidebar__footer"
        style={{ position: "relative", zIndex: 20 }}
        ref={dropdownRef}
      >
        {/* Dropdown menu — opens upward */}
        {dropdownOpen && (
          <div
            role="menu"
            aria-label="Opções do usuário"
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: 0,
              right: 0,
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
              animation: "dropdownFadeIn 0.18s ease",
            }}
          >
            {/* User info header inside dropdown */}
            {!isVisualCollapsed && (
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#f1f5f9",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.user.name}
                </span>
                <span
                  style={{
                    display: "block",
                    color: "#94a3b8",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    marginTop: "0.1rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.user.email}
                </span>
              </div>
            )}

            {/* Meu Perfil */}
            <button
              type="button"
              role="menuitem"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                width: "100%",
                padding: "0.75rem 1rem",
                background: "transparent",
                border: "none",
                color: "#e2e8f0",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                onTabChange("profile");
                setDropdownOpen(false);
              }}
            >
              <UserCircle size={16} aria-hidden="true" />
              Meu Perfil
            </button>

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0.25rem 0" }} />

            {/* Sair */}
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                width: "100%",
                padding: "0.75rem 1rem",
                background: "transparent",
                border: "none",
                color: "#f87171",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: isLoggingOut ? "not-allowed" : "pointer",
                opacity: isLoggingOut ? 0.6 : 1,
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              {isLoggingOut ? "Saindo…" : "Sair"}
            </button>
          </div>
        )}

        {/* Trigger: user card */}
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-label="Abrir menu do usuário"
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            width: "100%",
            padding: "0.6rem 0.75rem",
            background: dropdownOpen
              ? "rgba(255,255,255,0.08)"
              : "transparent",
            border: "1px solid",
            borderColor: dropdownOpen
              ? "rgba(255,255,255,0.12)"
              : "transparent",
            borderRadius: "14px",
            cursor: "pointer",
            transition: "background 0.18s, border-color 0.18s",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }
          }}
        >
          <div className="db-sidebar__avatar" aria-hidden="true" style={{ flexShrink: 0, overflow: "hidden" }}>
            {profileImage ? (
              <img src={profileImage} alt={session.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>

          {!isVisualCollapsed && (
            <>
              <div className="db-sidebar__user-info" style={{ flex: 1, minWidth: 0 }}>
                <span className="db-sidebar__user-name">{session.user.name}</span>
                <span className="db-sidebar__user-role">{ROLE_LABELS[role] ?? role}</span>
              </div>
              <ChevronUp
                size={15}
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  color: "#64748b",
                  transition: "transform 0.2s ease",
                  transform: dropdownOpen ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </aside>
  );
}


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

const TOP_NAV_ITEMS: { tab: DashboardTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { tab: "overview", label: "Visão Geral", icon: LayoutDashboard },
];

const CADASTRO_ITEMS: { tab: DashboardTab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { tab: "users", label: "Usuários", icon: Users, roles: ["MASTER", "ADMIN"] },
  { tab: "companies", label: "Empresas", icon: Building2, roles: ["MASTER"] },
  { tab: "company", label: "Minha Empresa", icon: Building2, roles: ["ADMIN", "OPERATOR"] },
  { tab: "plans", label: "Planos", icon: Award, roles: ["MASTER"] },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cadastroOpen, setCadastroOpen] = useState(false);
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

  const navButtonClass = (active: boolean) =>
    cn(
      "group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50",
      isVisualCollapsed && "justify-center px-3",
      active
        ? "border-l-4 border-[#D4AF37] bg-white/[0.04] text-white shadow-[inset_0_0_0_1px_rgba(212,175,55,0.08)]"
        : "border-l-4 border-transparent text-slate-400 hover:bg-white/[0.025] hover:text-white"
    );

  return (
    <aside
      className={cn(
        "sticky top-0 z-50 flex h-screen shrink-0 flex-col justify-between overflow-visible border-r border-white/5 bg-[#05070B] text-white shadow-[4px_0_40px_rgba(0,0,0,0.45)] transition-[width] duration-300",
        isVisualCollapsed ? "w-20" : "w-72"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.018] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#D4AF37]/5 blur-[90px]" />

      <div className="relative z-10 min-w-0">
        <div className={cn("flex min-h-20 items-center gap-3 border-b border-white/5 bg-[#040609] p-5", isVisualCollapsed ? "justify-center" : "justify-between")}>
          {!isVisualCollapsed && (
            <span className="truncate text-xl font-black uppercase italic tracking-tight text-white">
              Mult<span className="text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">Empresas</span>
            </span>
          )}
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-[#D4AF37]/40 hover:text-[#D4AF37] active:scale-95"
            onClick={onToggle}
            aria-label={isVisualCollapsed ? "Expandir menu" : "Recolher menu"}
            type="button"
          >
            <span className="text-sm font-black">{isVisualCollapsed ? "→" : "←"}</span>
          </button>
        </div>

        <nav className="space-y-1.5 p-4" aria-label="Menu principal">
          {visibleTopItems.map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              className={navButtonClass(activeTab === tab)}
              onClick={() => onTabChange(tab)}
              type="button"
              title={isVisualCollapsed ? label : undefined}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              <Icon size={18} className={activeTab === tab ? "text-[#D4AF37]" : "text-slate-500 group-hover:text-[#D4AF37]"} aria-hidden="true" />
              {!isVisualCollapsed && <span>{label}</span>}
            </button>
          ))}

          {visibleCadastroItems.length > 0 && (
            <div className="space-y-1">
              <button
                type="button"
                title={isVisualCollapsed ? "Cadastro" : undefined}
                className={navButtonClass(isCadastroActive)}
                onClick={() => setCadastroOpen((v) => !v)}
                aria-expanded={cadastroOpen}
              >
                <ClipboardList size={18} className={isCadastroActive ? "text-[#D4AF37]" : "text-slate-500 group-hover:text-[#D4AF37]"} aria-hidden="true" />
                {!isVisualCollapsed && <span className="flex-1">Cadastro</span>}
                {!isVisualCollapsed && <ChevronDown size={15} className={cn("text-slate-500 transition-transform duration-300", cadastroOpen && "rotate-180")} aria-hidden="true" />}
              </button>

              {cadastroOpen && !isVisualCollapsed && (
                <div className="ml-6 space-y-1 border-l border-white/5 py-1 pl-4">
                  {visibleCadastroItems.map(({ tab, label, icon: Icon }) => (
                    <button
                      key={tab}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/40",
                        activeTab === tab ? "bg-white/[0.04] text-[#D4AF37]" : "text-slate-500 hover:bg-white/[0.02] hover:text-slate-300"
                      )}
                      onClick={() => {
                        onTabChange(tab);
                        setCadastroOpen(true);
                      }}
                      aria-current={activeTab === tab ? "page" : undefined}
                    >
                      <Icon size={14} aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      <div className="relative z-20 border-t border-white/5 bg-[#040609]/70 p-4" ref={dropdownRef}>
        {dropdownOpen && !isVisualCollapsed && (
          <div
            role="menu"
            aria-label="Opções do usuário"
            className="absolute bottom-[86px] left-4 right-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0E1A] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-1 border-b border-white/5 px-3 py-2">
              <span className="block truncate text-sm font-black text-white">{session.user.name}</span>
              <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-500">{session.user.email}</span>
            </div>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.03] hover:text-white"
              onClick={() => {
                onTabChange("profile");
                setDropdownOpen(false);
              }}
            >
              <UserCircle size={14} className="text-[#D4AF37]" aria-hidden="true" />
              Meu Perfil
            </button>
            <div className="my-1 h-px bg-white/5" />
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-500 transition-all hover:bg-rose-950/25 hover:text-rose-400 disabled:opacity-60"
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
            >
              <LogOut size={14} aria-hidden="true" />
              {isLoggingOut ? "Saindo…" : "Sair"}
            </button>
          </div>
        )}

        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-label="Abrir menu do usuário"
          onClick={() => setDropdownOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
            dropdownOpen ? "border-[#D4AF37]/50 bg-[#080B12] ring-2 ring-[#D4AF37]/10" : "border-white/5 bg-[#080B12]/80 hover:border-white/10",
            isVisualCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#0A101D] p-0.5 text-xs font-black text-white shadow-[0_0_10px_rgba(212,175,55,0.15)]">
              {profileImage ? <img src={profileImage} alt={session.user.name} className="h-full w-full rounded-full object-cover" /> : initials}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#05070B] bg-emerald-500" />
          </div>
          {!isVisualCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold leading-tight tracking-wide text-white">{session.user.name}</span>
                <span className="mt-0.5 block truncate text-[10px] font-black uppercase tracking-wider text-slate-500">{ROLE_LABELS[role] ?? role}</span>
              </div>
              <ChevronUp size={14} className={cn("shrink-0 text-slate-500 transition-transform duration-300", dropdownOpen && "rotate-180")} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

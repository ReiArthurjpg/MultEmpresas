"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearSession,
  getSession,
  logout,
  getJwtExpiry,
  handleSessionExpiry,
  type Session,
} from "@/lib/api";
import { Sidebar, type DashboardTab } from "@/components/dashboard/sidebar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { UsersTab } from "@/components/dashboard/users-tab";
import { TwoFATab } from "@/components/dashboard/twofa-tab";
import { CompanyTab } from "@/components/dashboard/company-tab";
import { CompaniesTab } from "@/components/dashboard/companies-tab";
import { PlansTab } from "@/components/dashboard/plans-tab";
import { AuditTab } from "@/components/dashboard/audit-tab";
import { ProfileTab } from "@/components/dashboard/profile-tab";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mirror 2FA status locally so TwoFATab can toggle it without a full reload
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      router.replace("/");
      return;
    }
    setSession(currentSession);
    setTwoFactorEnabled(currentSession.user.two_factor_enabled ?? false);

    // no-op

    // Setup background token expiration check
    const expiry = getJwtExpiry(currentSession.accessToken);
    if (expiry) {
      const remaining = expiry - Date.now();
      if (remaining <= 0) {
        handleSessionExpiry();
      } else {
        const timer = setTimeout(() => {
          handleSessionExpiry();
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [router]);

  async function handleLogout() {
    if (!session) return;
    setIsLoggingOut(true);
    try {
      await logout(session.accessToken);
    } finally {
      clearSession();
      router.replace("/");
      router.refresh();
    }
  }

  function handle2FAStatusChange(enabled: boolean) {
    setTwoFactorEnabled(enabled);
    // Update persisted session so a page refresh reflects the new state
    if (session) {
      const updated: Session = {
        ...session,
        user: { ...session.user, two_factor_enabled: enabled },
      };
      setSession(updated);
      // Re-persist
      import("@/lib/api").then(({ saveSession }) => {
        const stored =
          window.localStorage.getItem("multempresas.session") !== null
            ? "persistent"
            : "session-only";
        saveSession(updated, stored === "persistent");
      });
    }
  }

  function handlePasswordChanged() {
    if (session) {
      const updated: Session = {
        ...session,
        user: { ...session.user, must_change_password: false },
      };
      setSession(updated);
      import("@/lib/api").then(({ saveSession }) => {
        const isPersistent = window.localStorage.getItem("multempresas.session") !== null;
        saveSession(updated, isPersistent);
      });
    }
  }

  // Loading state
  if (!session) {
    return (
      <div className="db-loader" aria-live="polite" aria-busy="true">
        <div className="db-loader__spinner" aria-hidden="true" />
        <p>Carregando dashboard…</p>
      </div>
    );
  }

  const canManageUsers = ["MASTER", "ADMIN"].includes(session.user.role);
  const canManageCompanies = session.user.role === "MASTER";
  const canManagePlans = session.user.role === "MASTER";
  const canViewAudit = ["MASTER", "ADMIN"].includes(session.user.role);
  

  return (
    <div className="db-layout">
      <Sidebar
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <main
        className={`db-main ${activeTab === "profile" ? "db-main--profile" : ""}`}
        id="main-content"
        aria-label="Conteúdo principal"
      >
        <div className={`db-main__inner ${activeTab === "profile" ? "db-main__inner--profile" : ""}`}>
          {activeTab === "overview" && <OverviewTab session={session} onNavigate={setActiveTab} />}

          {activeTab === "users" && canManageUsers && (
            <UsersTab accessToken={session.accessToken} />
          )}

          {activeTab === "users" && !canManageUsers && (
            <div className="empty-state">
              <p>Você não tem permissão para acessar esta seção.</p>
            </div>
          )}

          {activeTab === "2fa" && (
            <TwoFATab
              accessToken={session.accessToken}
              twoFactorEnabled={twoFactorEnabled}
              onStatusChange={handle2FAStatusChange}
            />
          )}

          {activeTab === "company" && <CompanyTab session={session} />}

          {activeTab === "companies" && canManageCompanies && (
            <CompaniesTab accessToken={session.accessToken} />
          )}

          {activeTab === "companies" && !canManageCompanies && (
            <div className="empty-state">
              <p>Apenas administradores globais podem gerenciar empresas.</p>
            </div>
          )}

          {activeTab === "plans" && canManagePlans && (
            <PlansTab accessToken={session.accessToken} />
          )}

          {activeTab === "plans" && !canManagePlans && (
            <div className="empty-state">
              <p>Apenas administradores globais podem gerenciar planos.</p>
            </div>
          )}

          {activeTab === "audit" && canViewAudit && (
            <AuditTab accessToken={session.accessToken} />
          )}

          {activeTab === "audit" && !canViewAudit && (
            <div className="empty-state">
              <p>Você não tem permissão para acessar o log de auditoria.</p>
            </div>
          )}

          {activeTab === "profile" && (
            <ProfileTab
              session={session}
              twoFactorEnabled={twoFactorEnabled}
              onPasswordChanged={handlePasswordChanged}
              onNavigate={setActiveTab}
              on2FAStatusChange={handle2FAStatusChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

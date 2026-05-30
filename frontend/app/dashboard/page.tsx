"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, getSession, logout, type Session } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      router.replace("/");
      return;
    }

    setSession(currentSession);
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

  if (!session) {
    return (
      <main className="dashboard-shell dashboard-loading">
        <p>Carregando dashboard…</p>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <div className="dashboard-icon" aria-hidden="true">
          <ShieldCheck size={28} />
        </div>

        <div className="dashboard-copy">
          <p className="auth-kicker">Dashboard</p>
          <h1 id="dashboard-title">Olá, {session.user.name}</h1>
          <p>
            Login realizado com sucesso. Este é o painel inicial da {session.company?.name ?? "MultEmpresas"}.
          </p>
        </div>

        <dl className="dashboard-details">
          <div>
            <dt>E-mail</dt>
            <dd>{session.user.email}</dd>
          </div>
          <div>
            <dt>Perfil</dt>
            <dd>{session.user.role}</dd>
          </div>
          <div>
            <dt>Empresa</dt>
            <dd>{session.company?.name ?? "Conta master"}</dd>
          </div>
        </dl>

        <button className="logout-button" onClick={handleLogout} disabled={isLoggingOut} type="button">
          <LogOut size={16} />
          {isLoggingOut ? "Saindo…" : "Sair"}
        </button>
      </section>
    </main>
  );
}

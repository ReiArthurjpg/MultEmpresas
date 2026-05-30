import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-glow" aria-hidden="true" />

      <section className="auth-card" aria-labelledby="login-title">
        <header className="auth-header">
          <p className="auth-kicker">MultEmpresas</p>
          <h1 id="login-title">Bem-vindo</h1>
          <p>Entre na sua conta para acessar o dashboard da sua empresa.</p>
        </header>

        <LoginForm />
      </section>
    </main>
  );
}

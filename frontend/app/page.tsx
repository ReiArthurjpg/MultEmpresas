import { LoginForm } from "@/components/login-form";
import { Aurora } from "@/components/ui/aurora";
import { BlurText } from "@/components/ui/blur-text";

export default function LoginPage() {
  return (
    <Aurora className="auth-shell">
      <section className="auth-card animate-fade-in-up" aria-labelledby="login-title">
        <header className="auth-header">
          <span className="auth-kicker">
          </span>
          <h1 id="login-title" className="flex justify-center">
            <BlurText text="Bem-vindo" delay={0.3} />
          </h1>
          <p style={{ marginTop: "0.5rem" }}>
            Entre na sua conta para acessar o dashboard da sua empresa.
          </p>
        </header>

        <LoginForm />
      </section>
    </Aurora>
  );
}

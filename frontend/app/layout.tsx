import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultEmpresas | Login",
  description: "Acesse o painel inicial do SaaS multiempresa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

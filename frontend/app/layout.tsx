import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MultEmpresas",
  description: "Acesse o painel inicial do SaaS multiempresa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

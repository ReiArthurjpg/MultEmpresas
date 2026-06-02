"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Camera,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  changePassword,
  disable2FA,
  enable2FA,
  getSession,
  saveSession,
  setup2FA,
  verify2FA,
  type Session,
  type TwoFactorSetupResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DashboardTab } from "@/components/dashboard/sidebar";

type ProfileTabProps = {
  session: Session;
  twoFactorEnabled: boolean;
  onPasswordChanged: () => void;
  onNavigate: (tab: DashboardTab) => void;
  on2FAStatusChange: (enabled: boolean) => void;
};

const ROLE_LABELS: Record<string, string> = {
  MASTER: "Master",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
};

function PremiumCardHeader({
  kicker,
  title,
  badge,
  badgeTone = "gold",
}: {
  kicker: string;
  title: string;
  badge?: string;
  badgeTone?: "gold" | "green" | "amber" | "rose" | "blue";
}) {
  const badgeClasses = {
    gold: "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37]",
    green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    rose: "border-rose-500/25 bg-rose-500/10 text-rose-400",
    blue: "border-blue-500/25 bg-blue-500/10 text-blue-400",
  }[badgeTone];

  return (
    <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/5 pb-4">
      <div>
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#D4AF37]">{kicker}</span>
        <h3 className="mt-1 text-lg font-black uppercase tracking-tight text-white">{title}</h3>
      </div>
      {badge ? (
        <span className={cn("rounded border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider", badgeClasses)}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function ProfileTab({
  session,
  twoFactorEnabled,
  onPasswordChanged,
  onNavigate,
  on2FAStatusChange,
}: ProfileTabProps) {
  const { user, company } = session;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twofaPhase, setTwofaPhase] = useState<"idle" | "setup" | "done">("idle");
  const [twofaSetupData, setTwofaSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaCodeError, setTwofaCodeError] = useState<string | null>(null);
  const [twofaLoading, setTwofaLoading] = useState(false);
  const [twofaApiError, setTwofaApiError] = useState<string | null>(null);
  const [twofaSuccessMsg, setTwofaSuccessMsg] = useState<string | null>(null);
  const twofaCodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (twofaPhase === "setup") {
      setTimeout(() => twofaCodeInputRef.current?.focus(), 50);
    }
  }, [twofaPhase]);

  const reset2FAState = () => {
    setTwofaPhase("idle");
    setTwofaSetupData(null);
    setTwofaCode("");
    setTwofaCodeError(null);
    setTwofaApiError(null);
    setTwofaSuccessMsg(null);
  };

  const handleClose2FAModal = () => {
    setIs2FAModalOpen(false);
    reset2FAState();
  };

  async function handleSetup2FA() {
    setTwofaLoading(true);
    setTwofaApiError(null);
    try {
      const data = await setup2FA(session.accessToken);
      setTwofaSetupData(data);
      setTwofaPhase("setup");
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Erro ao iniciar configuração 2FA.");
    } finally {
      setTwofaLoading(false);
    }
  }

  function copySecretToClipboard() {
    if (!twofaSetupData?.secret || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(twofaSetupData.secret).then(() => {
      setTwofaSuccessMsg("Chave copiada para a área de transferência.");
      setTimeout(() => setTwofaSuccessMsg(null), 2200);
    }).catch(() => {
      setTwofaApiError("Não foi possível copiar a chave para a área de transferência.");
    });
  }

  async function handleVerify2FA() {
    if (twofaCode.length !== 6) {
      setTwofaCodeError("Informe os 6 dígitos do código.");
      return;
    }
    setTwofaLoading(true);
    setTwofaCodeError(null);
    setTwofaApiError(null);
    try {
      const verifyResult = await verify2FA(session.accessToken, twofaCode);
      if (!verifyResult.valid) {
        setTwofaApiError("Código TOTP inválido. Verifique se o relógio do seu celular está sincronizado.");
        setTwofaCode("");
        return;
      }
      await enable2FA(session.accessToken, twofaCode);
      setTwofaSuccessMsg("2FA habilitado com sucesso!");
      setTwofaPhase("done");
      on2FAStatusChange(true);
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setTwofaLoading(false);
    }
  }

  async function handleRetry2FA() {
    reset2FAState();
    await handleSetup2FA();
  }

  async function handleDisable2FA() {
    setTwofaLoading(true);
    setTwofaApiError(null);
    try {
      await disable2FA(session.accessToken);
      setTwofaSuccessMsg("2FA desabilitado com sucesso.");
      on2FAStatusChange(false);
      setTimeout(() => {
        handleClose2FAModal();
      }, 1200);
    } catch (err) {
      setTwofaApiError(err instanceof Error ? err.message : "Erro ao desabilitar 2FA.");
    } finally {
      setTwofaLoading(false);
    }
  }

  function update2FACode(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setTwofaCode(clean);
    setTwofaCodeError(null);
    setTwofaApiError(null);
  }

  useEffect(() => {
    const stored = localStorage.getItem(`multempresas.profile_image_${user.email}`);
    if (stored) {
      setProfileImage(stored);
    }

    function handleCustomEvent() {
      const storedVal = localStorage.getItem(`multempresas.profile_image_${user.email}`);
      setProfileImage(storedVal);
    }

    window.addEventListener("profile-image-updated", handleCustomEvent);
    return () => {
      window.removeEventListener("profile-image-updated", handleCustomEvent);
    };
  }, [user.email]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileImage(base64);
      localStorage.setItem(`multempresas.profile_image_${user.email}`, base64);
      window.dispatchEvent(new Event("profile-image-updated"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfileImage(null);
    localStorage.removeItem(`multempresas.profile_image_${user.email}`);
    window.dispatchEvent(new Event("profile-image-updated"));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isChangingPassword = currentPassword || newPassword || confirmPassword;

    if (isChangingPassword) {
      if (newPassword.length < 8) {
        setError("A nova senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      setLoading(true);
      try {
        await changePassword(session.accessToken, currentPassword, newPassword);
        const stored = getSession();
        if (stored) {
          const updated: Session = {
            ...stored,
            user: { ...stored.user, must_change_password: false },
          };
          const isPersistent = window.localStorage.getItem("multempresas.session") !== null;
          saveSession(updated, isPersistent);
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onPasswordChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao alterar senha.");
        setLoading(false);
        return;
      }
    }

    setSuccess("Perfil atualizado com sucesso!");
    setLoading(false);

    setTimeout(() => {
      handleCloseModal();
    }, 1200);
  }

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const accountStatus = user.active !== false ? "Ativa" : "Inativa";
  const userFirstName = user.name.split(" ")[0];
  const hasMinLength = newPassword.length >= 8;
  const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumberSpecial = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const profileDetails = [
    { icon: User, label: "Nome Completo", value: user.name },
    { icon: Mail, label: "Endereço de Email", value: user.email },
    { icon: Activity, label: "Nível de Acesso", value: roleLabel },
    { icon: Shield, label: "Autenticação 2FA", value: twoFactorEnabled ? "Habilitado" : "Pendente de Ativação" },
    { icon: Building2, label: "Organização / Empresa", value: company?.name ?? "Administração Global" },
  ];

  const renderAvatar = (sizeClass = "h-12 w-12") => (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/30 bg-[#0A101D] p-0.5 shadow-[0_0_18px_rgba(212,175,55,0.14)]", sizeClass)}>
      {profileImage ? (
        <img src={profileImage} alt={user.name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-slate-900 text-sm font-black text-white">
          {userFirstName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <section className="relative isolate flex w-full flex-col gap-6 text-white" aria-labelledby="profile-tab-title">
      <div className="pointer-events-none absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/[0.04] blur-[120px]" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0A0E17]/95 via-[#05070B] to-[#D4AF37]/10 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
        <div className="absolute inset-0 opacity-[0.025] [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-stretch">
          <div className="flex min-h-[190px] flex-col justify-between gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
              <Sparkles size={14} aria-hidden="true" />
              Configurações da conta
            </div>
            <div>
              <h2 id="profile-tab-title" className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white md:text-5xl">
                Olá, <span className="bg-gradient-to-r from-white via-white to-[#D4AF37] bg-clip-text text-transparent">{userFirstName}.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-slate-400">
                Gerencie suas informações de perfil, permissões de acesso e credenciais corporativas com a mesma camada visual premium do login.
              </p>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <span className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider", user.active === false ? "border-rose-500/25 bg-rose-500/10 text-rose-400" : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400")}>
              <CheckCircle2 size={14} aria-hidden="true" />
              Conta {accountStatus}
            </span>
            <div className="mt-7 flex items-center gap-4">
              {renderAvatar("h-14 w-14")}
              <div className="min-w-0">
                <strong className="block truncate text-sm font-black uppercase tracking-wide text-white">{user.name}</strong>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{roleLabel}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <aside className="premium-profile-card" aria-labelledby="profile-details-title">
          <PremiumCardHeader kicker="Sessão" title="Detalhes do perfil" />
          <div className="space-y-3.5" role="list">
            {profileDetails.map(({ icon: Icon, label, value }) => (
              <article key={label} className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-white/[0.015] p-3" role="listitem">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 text-[#D4AF37]">
                  <Icon size={17} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                  <strong className="mt-1 block truncate text-xs font-bold text-white" title={value}>{value}</strong>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Sessão segura ativa</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
          </div>
        </aside>

        <section className="premium-profile-card" aria-labelledby="security-info-title">
          <PremiumCardHeader kicker="Segurança" title={user.must_change_password ? "Alerta" : "Forte"} badge={user.must_change_password ? "Atenção" : "Seguro"} badgeTone={user.must_change_password ? "amber" : "green"} />
          <p className="text-xs font-bold leading-relaxed text-slate-400">
            {user.must_change_password ? "Sua conta está usando uma senha provisória e necessita de alteração imediata." : "Sua senha atende às diretrizes de segurança da plataforma."}
          </p>
          <div className="mt-6 space-y-3">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Diretrizes de Segurança:</span>
            {["Mínimo 8 caracteres", "Letras maiúsculas & minúsculas", "Números & caracteres especiais", "Autenticação 2FA ativada", "Foto de perfil para auditoria"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={14} className="shrink-0 text-[#D4AF37]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Dados de Acesso</span>
            <button type="button" className="premium-action-button" onClick={() => setIsModalOpen(true)}>
              <Edit2 size={13} aria-hidden="true" />
              Editar Cadastro
            </button>
          </div>
        </section>

        <section className="premium-profile-card" aria-labelledby="twofa-card-title">
          <PremiumCardHeader kicker="2FA" title={twoFactorEnabled ? "Ativo" : "Inativo"} badge={twoFactorEnabled ? "Habilitado" : "Pendente"} badgeTone={twoFactorEnabled ? "green" : "amber"} />
          <p className="text-xs font-bold leading-relaxed text-slate-400">
            {twoFactorEnabled ? "Sua conta está protegida com autenticação em dois fatores (TOTP)." : "Recomendamos ativar o 2FA para proteger sua conta com uma camada extra."}
          </p>
          <div className="mt-6 space-y-3">
            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Aplicativos Suportados:</span>
            {["Google Authenticator", "Microsoft Authenticator", "Authy", "1Password", "Qualquer app TOTP"].map((app) => (
              <div key={app} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" aria-hidden="true" />
                <span>{app}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Autenticação 2FA</span>
            <button type="button" className="premium-action-button" onClick={() => { reset2FAState(); setIs2FAModalOpen(true); }}>
              <Shield size={13} aria-hidden="true" />
              {twoFactorEnabled ? "Gerenciar" : "Configurar"}
            </button>
          </div>
        </section>
      </div>

      {["MASTER", "ADMIN"].includes(user.role) && (
        <section className="premium-profile-card" aria-labelledby="audit-card-title">
          <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 md:flex-row md:items-start">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-400">Auditoria</span>
              <h3 id="audit-card-title" className="mt-1 text-3xl font-black uppercase italic tracking-tight text-white">Logs</h3>
              <p className="mt-3 max-w-3xl text-xs font-bold leading-relaxed text-slate-400">
                Acompanhe o histórico de acessos, alterações e ações executadas por todos os usuários do sistema em tempo real.
              </p>
            </div>
            <span className="w-fit rounded border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-400">Rastreabilidade</span>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Recursos Monitorados:</span>
              {["Tentativas e logs de Login", "Criação e edição de usuários", "Alterações em planos e empresas"].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-300">
                  <CheckCircle2 size={14} className="shrink-0 text-[#D4AF37]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.015] p-4">
              <div className="flex items-center justify-between gap-4 text-xs"><span className="font-bold text-slate-500">Monitorando porta:</span><span className="font-mono font-bold text-slate-300">TLS 1.3 / Port 443</span></div>
              <div className="flex items-center justify-between gap-4 text-xs"><span className="font-bold text-slate-500">Assinatura Digital:</span><span className="font-mono font-black text-[#D4AF37]">VERYTAS-SHA256</span></div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Logs do Sistema</span>
            <button type="button" className="premium-action-button" onClick={() => onNavigate("audit")}>
              <ArrowUpRight size={13} aria-hidden="true" />
              Visualizar Logs
            </button>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010204]/90 p-4 backdrop-blur-md" onClick={handleCloseModal}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#080C14] shadow-[0_0_50px_rgba(212,175,55,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 bg-gradient-to-r from-[#AA841C] via-[#D4AF37] to-[#AA841C]" />
            <div className="flex items-center justify-between border-b border-white/5 bg-[#05080F] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37]"><KeyRound size={16} aria-hidden="true" /></div>
                <div><h4 className="text-sm font-black uppercase tracking-wider text-white">Editar Cadastro & Senha</h4><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Cofre de segurança Verytas</p></div>
              </div>
              <button type="button" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:text-white" onClick={handleCloseModal} aria-label="Fechar"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="max-h-[calc(92vh-145px)] space-y-5 overflow-y-auto p-6">
                {error && <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs font-bold text-rose-400" role="alert">{error}</div>}
                {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-400" role="status"><CheckCircle2 size={16} />{success}</div>}

                <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-[#030508] p-5">
                  {renderAvatar("h-24 w-24")}
                  <div className="flex flex-wrap justify-center gap-2">
                    <label className="premium-action-button cursor-pointer">
                      <Camera size={13} aria-hidden="true" />
                      Alterar Foto
                      <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                    </label>
                    {profileImage && (
                      <button type="button" className="premium-danger-button" onClick={handleRemovePhoto}>
                        <Trash2 size={13} aria-hidden="true" />
                        Remover
                      </button>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">JPG/PNG até 2MB</p>
                </div>

                <div className="grid gap-4">
                  <div className="field-group dark-field"><label htmlFor="current-password-dialog">Senha atual</label><div className="input-shell"><KeyRound aria-hidden="true" className="input-icon" size={18} /><input id="current-password-dialog" className="form-input password-input" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }} placeholder="Sua senha atual" autoComplete="current-password" /><button type="button" className="password-toggle" aria-label={showCurrent ? "Ocultar senha atual" : "Mostrar senha atual"} onClick={() => setShowCurrent((v) => !v)}>{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="field-group dark-field"><label htmlFor="new-password-dialog">Nova senha</label><div className="input-shell"><KeyRound aria-hidden="true" className="input-icon" size={18} /><input id="new-password-dialog" className="form-input password-input" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(null); }} placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} /><button type="button" className="password-toggle" aria-label={showNew ? "Ocultar nova senha" : "Mostrar nova senha"} onClick={() => setShowNew((v) => !v)}>{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="field-group dark-field"><label htmlFor="confirm-password-dialog">Confirmar nova senha</label><div className="input-shell"><KeyRound aria-hidden="true" className="input-icon" size={18} /><input id="confirm-password-dialog" className={cn("form-input", confirmPassword && confirmPassword !== newPassword && "input-error")} type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }} placeholder="Repita a nova senha" autoComplete="new-password" /></div></div>
                </div>

                <div className="space-y-2 rounded-xl border border-white/5 bg-[#030508] p-3.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Status de criptografia:</span>
                  {[
                    { ok: hasMinLength, text: "Mínimo de 8 caracteres" },
                    { ok: hasUpperLower, text: "Letras maiúsculas & minúsculas" },
                    { ok: hasNumberSpecial, text: "Pelo menos um número ou caractere especial" },
                    { ok: passwordsMatch, text: "Confirmação correspondente" },
                  ].map(({ ok, text }) => (
                    <div key={text} className="flex items-center gap-2 text-[11px] font-semibold">
                      <CheckCircle2 size={14} className={ok ? "text-emerald-400" : "text-slate-700"} />
                      <span className={ok ? "text-slate-300" : "text-slate-500"}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-white/5 bg-[#05080F] p-6 sm:flex-row">
                <button type="button" className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white/10" onClick={handleCloseModal} disabled={loading}>Cancelar</button>
                <button type="submit" className="flex-1 rounded-xl bg-[#D4AF37] py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-60" disabled={loading || (!!(currentPassword || newPassword || confirmPassword) && (!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8))}>{loading ? <><Loader2 size={14} className="spinner inline" /> Salvando…</> : "Salvar Alterações"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {is2FAModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010204]/90 p-4 backdrop-blur-md" onClick={handleClose2FAModal}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#080C14] shadow-[0_0_50px_rgba(212,175,55,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 bg-gradient-to-r from-[#AA841C] via-[#D4AF37] to-[#AA841C]" />
            <div className="flex items-center justify-between border-b border-white/5 bg-[#05080F] px-6 py-5">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37]"><Shield size={16} aria-hidden="true" /></div><div><h4 className="text-sm font-black uppercase tracking-wider text-white">{twoFactorEnabled ? "Desabilitar Autenticação 2FA" : "Configurar Autenticação 2FA"}</h4><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Conexão redundante TOTP</p></div></div>
              <button type="button" className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-colors hover:text-white" onClick={handleClose2FAModal} aria-label="Fechar"><X size={16} /></button>
            </div>
            <div className="space-y-5 p-6">
              {twofaApiError && twofaPhase !== "setup" && <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs font-bold text-rose-400" role="alert">{twofaApiError}</div>}
              {twofaSuccessMsg && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs font-bold text-emerald-400" role="status"><CheckCircle2 size={16} />{twofaSuccessMsg}</div>}

              {twoFactorEnabled && (
                <div className="space-y-5 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><ShieldCheck size={30} aria-hidden="true" /></div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-300">A autenticação em dois fatores está ativa. Desabilitar reduz a segurança do seu acesso.</p>
                  <button type="button" className="premium-danger-button w-full justify-center py-3" onClick={handleDisable2FA} disabled={twofaLoading}>{twofaLoading ? <Loader2 size={14} className="spinner" /> : <ShieldOff size={14} />} Desabilitar 2FA</button>
                </div>
              )}

              {!twoFactorEnabled && twofaPhase === "idle" && (
                <div className="space-y-5 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 text-[#D4AF37]"><QrCode size={30} aria-hidden="true" /></div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-300">Adicione uma camada extra de proteção usando Google Authenticator, Authy, Microsoft Authenticator ou outro app TOTP.</p>
                  <button type="button" className="w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-60" onClick={handleSetup2FA} disabled={twofaLoading || Boolean(twofaSetupData)}>{twofaLoading ? <><Loader2 size={14} className="spinner inline" /> Iniciando…</> : "Iniciar Configuração"}</button>
                </div>
              )}

              {twofaPhase === "setup" && twofaApiError && <div className="flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-xs font-bold text-rose-400" role="alert"><span>{twofaApiError}</span><button type="button" className="premium-action-button justify-center" onClick={handleRetry2FA} disabled={twofaLoading}>Tentar Novamente</button></div>}

              {!twoFactorEnabled && twofaPhase === "setup" && twofaSetupData && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs font-semibold leading-relaxed text-blue-300"><strong>Dica:</strong> se o código não funcionar, verifique se a hora/data do celular estão sincronizadas automaticamente.</div>
                  {twofaSetupData.qr_code_url ? <img src={twofaSetupData.qr_code_url} alt="QR Code para configurar 2FA" className="mx-auto h-44 w-44 rounded-2xl border-4 border-white bg-white p-2 shadow-xl" /> : null}
                  <div className="rounded-xl border border-white/5 bg-[#030508] p-3">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Chave secreta</span>
                    <div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 truncate text-xs font-black text-slate-300">{twofaSetupData.secret}</code><button type="button" className="premium-action-button" onClick={copySecretToClipboard}>Copiar</button></div>
                  </div>
                  <div className="field-group dark-field"><label htmlFor="twofa-code-dialog">Código de 6 dígitos</label><input ref={twofaCodeInputRef} id="twofa-code-dialog" className={cn("form-input totp-input", twofaCodeError && "input-error")} inputMode="numeric" maxLength={6} value={twofaCode} onChange={(e) => update2FACode(e.target.value)} placeholder="000000" /></div>
                  {twofaCodeError && <p className="text-xs font-bold text-rose-400" role="alert">{twofaCodeError}</p>}
                  <button type="button" className="w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-white disabled:opacity-60" onClick={handleVerify2FA} disabled={twofaLoading || twofaCode.length !== 6}>{twofaLoading ? <><Loader2 size={14} className="spinner inline" /> Verificando…</> : "Ativar Autenticação"}</button>
                </div>
              )}

              {twofaPhase === "done" && <div className="space-y-4 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><ShieldCheck size={30} aria-hidden="true" /></div><p className="text-sm font-semibold text-slate-300">2FA configurado com sucesso.</p><button type="button" className="premium-action-button w-full justify-center py-3" onClick={handleClose2FAModal}>Concluir</button></div>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

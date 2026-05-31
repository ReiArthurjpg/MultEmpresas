"use client";

import { CheckCircle2, Loader2, QrCode, Shield, ShieldOff, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  disable2FA,
  enable2FA,
  setup2FA,
  verify2FA,
  type TwoFactorSetupResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type TwoFATabProps = {
  accessToken: string;
  twoFactorEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
};

type Phase = "idle" | "setup" | "verify" | "done";

export function TwoFATab({ accessToken, twoFactorEnabled, onStatusChange }: TwoFATabProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "verify") {
      setTimeout(() => codeInputRef.current?.focus(), 50);
    }
  }, [phase]);

  const resetState = useCallback(() => {
    setPhase("idle");
    setSetupData(null);
    setCode("");
    setCodeError(null);
    setApiError(null);
    setSuccessMsg(null);
  }, []);

  async function handleSetup() {
    setLoading(true);
    setApiError(null);
    try {
      const data = await setup2FA(accessToken);
      setSetupData(data);
      setPhase("setup");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao iniciar configuração 2FA.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (code.length !== 6) {
      setCodeError("Informe os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    setCodeError(null);
    setApiError(null);
    try {
      const verifyResult = await verify2FA(accessToken, code);
      if (!verifyResult.valid) {
        setApiError("Código TOTP inválido. Tente novamente.");
        return;
      }
      // Code is valid — now persist 2FA activation
      await enable2FA(accessToken, code);
      setSuccessMsg("2FA habilitado com sucesso!");
      setPhase("done");
      onStatusChange(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setLoading(true);
    setApiError(null);
    try {
      await disable2FA(accessToken);
      setSuccessMsg("2FA desabilitado com sucesso.");
      onStatusChange(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao desabilitar 2FA.");
    } finally {
      setLoading(false);
    }
  }

  function updateCode(value: string) {
    const clean = value.replace(/\D/g, "").slice(0, 6);
    setCode(clean);
    setCodeError(null);
    setApiError(null);
  }

  return (
    <section className="tab-section" aria-labelledby="twofa-tab-title">
      <div className="tab-header">
        <div>
          <h2 id="twofa-tab-title" className="tab-title">Segurança — Autenticação em 2 Fatores</h2>
          <p className="tab-subtitle">
            Adicione uma camada extra de segurança à sua conta com TOTP (Google Authenticator, Authy, etc).
          </p>
        </div>
      </div>

      {/* Current status banner */}
      <div className={cn("twofa-status-banner", twoFactorEnabled ? "twofa-status-banner--on" : "twofa-status-banner--off")}>
        {twoFactorEnabled ? (
          <><CheckCircle2 size={20} aria-hidden="true" /> 2FA está <strong>habilitado</strong> na sua conta.</>
        ) : (
          <><XCircle size={20} aria-hidden="true" /> 2FA está <strong>desabilitado</strong>. Recomendamos ativar.</>
        )}
      </div>

      {apiError && <p className="form-alert" role="alert">{apiError}</p>}
      {successMsg && (
        <p className="form-success" role="status">{successMsg}</p>
      )}

      {/* Phases */}
      {!twoFactorEnabled && phase === "idle" && (
        <div className="twofa-card">
          <div className="twofa-card__icon" aria-hidden="true"><QrCode size={32} /></div>
          <h3 className="twofa-card__title">Configurar 2FA</h3>
          <p className="twofa-card__desc">
            Clique em "Iniciar configuração" para gerar o QR Code que você irá escanear com o seu aplicativo autenticador.
          </p>
          <button
            className="primary-button"
            onClick={handleSetup}
            disabled={loading}
            type="button"
            id="btn-setup-2fa"
          >
            {loading
              ? <><Loader2 size={14} className="spinner" aria-hidden="true" /> Gerando…</>
              : <><Shield size={14} aria-hidden="true" /> Iniciar configuração</>}
          </button>
        </div>
      )}

      {phase === "setup" && setupData && (
        <div className="twofa-setup">
          <div className="twofa-steps">
            <div className="twofa-step">
              <span className="twofa-step__number">1</span>
              <div>
                <strong>Abra o seu autenticador</strong>
                <p>Use Google Authenticator, Authy ou similar para escanear o QR Code.</p>
              </div>
            </div>
            <div className="twofa-step">
              <span className="twofa-step__number">2</span>
              <div>
                <strong>Escaneie o QR Code</strong>
                {setupData.qr_code_url ? (
                  <div className="twofa-qr">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qr_code_url}
                      alt="QR Code para configurar o autenticador"
                      width={180}
                      height={180}
                    />
                  </div>
                ) : (
                  <p className="twofa-secret">
                    Chave manual: <code>{setupData.secret}</code>
                  </p>
                )}
                {setupData.secret && (
                  <p className="twofa-secret-label">
                    Chave secreta: <code>{setupData.secret}</code>
                  </p>
                )}
              </div>
            </div>
            <div className="twofa-step">
              <span className="twofa-step__number">3</span>
              <div>
                <strong>Confirme o código gerado</strong>
                <div className="field-group" style={{ marginTop: "0.75rem" }}>
                  <label htmlFor="totp-verify">Código de 6 dígitos</label>
                  <input
                    ref={codeInputRef}
                    id="totp-verify"
                    className={cn("form-input totp-input", codeError && "input-error")}
                    style={{ maxWidth: "180px", paddingLeft: "1rem" }}
                    value={code}
                    onChange={(e) => updateCode(e.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                  />
                  {codeError && <p role="alert" style={{ color: "var(--destructive)", fontSize: "0.75rem" }}>{codeError}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="twofa-setup__actions">
            <button className="secondary-button" onClick={resetState} type="button">
              Cancelar
            </button>
            <button
              className="primary-button"
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              type="button"
              id="btn-enable-2fa"
            >
              {loading
                ? <><Loader2 size={14} className="spinner" aria-hidden="true" /> Verificando…</>
                : <><CheckCircle2 size={14} aria-hidden="true" /> Verificar e habilitar</>}
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="twofa-card twofa-card--success">
          <CheckCircle2 size={40} aria-hidden="true" />
          <h3 className="twofa-card__title">2FA habilitado!</h3>
          <p className="twofa-card__desc">
            Sua conta agora está protegida com autenticação em dois fatores. Cada login exigirá o código do seu aplicativo autenticador.
          </p>
        </div>
      )}

      {twoFactorEnabled && (
        <div className="twofa-card twofa-card--danger">
          <ShieldOff size={32} aria-hidden="true" />
          <h3 className="twofa-card__title">Desabilitar 2FA</h3>
          <p className="twofa-card__desc">
            Ao desabilitar, sua conta ficará protegida apenas por senha. Isso reduz a segurança da sua conta.
          </p>
          <button
            className="danger-button"
            onClick={handleDisable}
            disabled={loading}
            type="button"
            id="btn-disable-2fa"
          >
            {loading
              ? <><Loader2 size={14} className="spinner" aria-hidden="true" /> Desabilitando…</>
              : <><ShieldOff size={14} aria-hidden="true" /> Desabilitar 2FA</>}
          </button>
        </div>
      )}
    </section>
  );
}

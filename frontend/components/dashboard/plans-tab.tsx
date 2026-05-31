"use client";

import {
  Award,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlan,
  type CreatePlanPayload,
  type Plan,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type PlansTabProps = {
  accessToken: string;
};

type PermissionItem = {
  id: string;
  label: string;
};

type PermissionGroup = {
  title: string;
  permissions?: PermissionItem[];
  subgroups?: Array<{
    title: string;
    permissions: PermissionItem[];
  }>;
};

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "DASHBOARD",
    permissions: [
      { id: "DASHBOARD_GERAL", label: "Dashboard Geral" },
      { id: "DASHBOARD_INDICADORES", label: "Indicadores" },
      { id: "DASHBOARD_METAS", label: "Metas" },
      { id: "DASHBOARD_RANKING_OPERADORES", label: "Ranking de Operadores" },
    ],
  },
  {
    title: "OPERAÇÕES",
    permissions: [
      { id: "OPERACOES_CONSULTAS_CORBAN", label: "Consultas Corban" },
      { id: "OPERACOES_CONSULTAS_INSS", label: "Consultas INSS" },
      { id: "OPERACOES_CONSULTAS_SIAPE", label: "Consultas SIAPE" },
      { id: "OPERACOES_CONSULTAS_GOV", label: "Consultas GOV" },
      { id: "OPERACOES_CONSULTAS_PREFEITURAS", label: "Consultas Prefeituras" },
      { id: "OPERACOES_CONSULTAS_CLT", label: "Consultas CLT" },
      { id: "OPERACOES_CONSULTAS_FGTS", label: "Consultas FGTS" },
    ],
  },
  {
    title: "EXTRATO BANCÁRIO",
    permissions: [{ id: "EXTRATO_BANCARIO_DADOS_CONSIGNACAO", label: "Dados de Consignação" }],
  },
  {
    title: "OFERTAS DE CRÉDITO",
    permissions: [{ id: "OFERTAS_CREDITO_NOVOS_CONTRATOS", label: "Novos Contratos" }],
  },
  {
    title: "MAILING",
    permissions: [
      { id: "MAILING_GERAR_LISTAS", label: "Gerar Listas" },
      { id: "MAILING_HIGIENIZACAO", label: "Higienização" },
      { id: "MAILING_EXPORTACAO", label: "Exportação" },
      { id: "MAILING_IMPORTACAO", label: "Importação" },
    ],
  },
  {
    title: "DIGITAÇÃO DE CONTRATOS",
    permissions: [{ id: "DIGITACAO_CONTRATOS", label: "Digitação de Contratos" }],
  },
  {
    title: "CAMPANHAS",
    permissions: [
      { id: "CAMPANHAS_IMPORTAR", label: "Importar Campanha" },
      { id: "CAMPANHAS_EDITAR", label: "Editar Campanha" },
      { id: "CAMPANHAS_DISPARAR", label: "Disparar Campanha" },
      { id: "CAMPANHAS_MONITORAR", label: "Monitorar Campanha" },
    ],
  },
  {
    title: "AGENDA",
    permissions: [
      { id: "AGENDA_AGENDAMENTOS", label: "Agendamentos" },
      { id: "AGENDA_RETORNOS", label: "Retornos" },
      { id: "AGENDA_CALENDARIO", label: "Calendário" },
    ],
  },
  {
    title: "NEXABOT",
    permissions: [{ id: "NEXABOT_DISPARO_WHATSAPP", label: "Disparo WhatsApp" }],
  },
  {
    title: "HOT PHONE",
    permissions: [{ id: "HOT_PHONE_CONSULTA_TELEFONES", label: "Consulta Telefones" }],
  },
  {
    title: "ANÁLISE DE CRÉDITO",
    permissions: [
      { id: "ANALISE_CREDITO_SPC", label: "SPC" },
      { id: "ANALISE_CREDITO_SERASA", label: "Serasa" },
      { id: "ANALISE_CREDITO_BOA_VISTA", label: "Boa Vista" },
    ],
  },
  {
    title: "INTEGRAÇÕES",
    permissions: [
      { id: "INTEGRACOES_APIS", label: "APIs" },
      { id: "INTEGRACOES_WEBHOOKS", label: "Webhooks" },
      { id: "INTEGRACOES_PARCEIROS", label: "Parceiros" },
    ],
  },
  {
    title: "RELATÓRIOS",
    permissions: [
      { id: "RELATORIOS_OPERACIONAL", label: "Operacional" },
      { id: "RELATORIOS_COMERCIAL", label: "Comercial" },
      { id: "RELATORIOS_FINANCEIRO", label: "Financeiro" },
      { id: "RELATORIOS_LOGS", label: "Logs" },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    permissions: [
      { id: "CONFIGURACOES_SISTEMA", label: "Sistema" },
      { id: "CONFIGURACOES_APIS", label: "APIs" },
      { id: "CONFIGURACOES_LOGS", label: "Logs" },
      { id: "CONFIGURACOES_SEGURANCA", label: "Segurança" },
    ],
  },
  {
    title: "CRÉDITOS",
    permissions: [
      { id: "CREDITOS_EMPRESAS", label: "Empresas" },
      { id: "CREDITOS_SALDO", label: "Saldo de Créditos" },
      { id: "CREDITOS_COMPRA", label: "Compra de Créditos" },
      { id: "CREDITOS_HISTORICO", label: "Histórico" },
      { id: "CREDITOS_USUARIOS", label: "Usuários" },
      { id: "CREDITOS_DISTRIBUICAO", label: "Distribuição de Créditos" },
      { id: "CREDITOS_LIMITE_OPERADOR", label: "Limite por Operador" },
      { id: "CREDITOS_CONSUMO", label: "Consumo" },
    ],
  },
  {
    title: "CADASTROS",
    subgroups: [
      {
        title: "Usuários",
        permissions: [
          { id: "CADASTROS_USUARIOS_INCLUIR", label: "Incluir" },
          { id: "CADASTROS_USUARIOS_ALTERAR", label: "Alterar" },
          { id: "CADASTROS_USUARIOS_EXCLUIR", label: "Excluir" },
          { id: "CADASTROS_USUARIOS_BLOQUEAR", label: "Bloquear" },
        ],
      },
      {
        title: "Empresas",
        permissions: [
          { id: "CADASTROS_EMPRESAS_INCLUIR", label: "Incluir" },
          { id: "CADASTROS_EMPRESAS_ALTERAR", label: "Alterar" },
          { id: "CADASTROS_EMPRESAS_EXCLUIR", label: "Excluir" },
        ],
      },
      {
        title: "Planos",
        permissions: [
          { id: "CADASTROS_PLANOS_BRONZE", label: "Bronze" },
          { id: "CADASTROS_PLANOS_PRATA", label: "Prata" },
          { id: "CADASTROS_PLANOS_OURO", label: "Ouro" },
          { id: "CADASTROS_PLANOS_PERSONALIZADO", label: "Personalizado" },
        ],
      },
    ],
  },
];

const PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => [
  ...(group.permissions ?? []),
  ...(group.subgroups?.flatMap((subgroup) => subgroup.permissions) ?? []),
]);

type ModalMode = "create" | "edit";

type PlanForm = {
  name: string;
  description: string;
  price: string;
  active: boolean;
  permissions: string[];
};

const EMPTY_FORM: PlanForm = {
  name: "",
  description: "",
  price: "0",
  active: true,
  permissions: [],
};

const styles = {
  dashboard: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    width: "100%",
  },
  hero: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 320px)",
    gap: "1.5rem",
    overflow: "hidden",
    padding: "2rem",
    border: "1px solid rgba(124, 58, 237, 0.16)",
    borderRadius: "28px",
    background:
      "radial-gradient(circle at 8% 20%, rgba(124, 58, 237, 0.15), transparent 35%), radial-gradient(circle at 92% 12%, rgba(59, 130, 246, 0.14), transparent 30%), linear-gradient(135deg, #ffffff 0%, #faf8ff 52%, #f5f8ff 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.06)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1.25rem",
    minHeight: "160px",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "fit-content",
    padding: "0.4rem 0.7rem",
    border: "1px solid rgba(124, 58, 237, 0.16)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#7c3aed",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "clamp(2.15rem, 4vw, 3.2rem)",
    fontWeight: 850,
    letterSpacing: "-0.05em",
    lineHeight: 0.95,
  },
  subtitle: {
    maxWidth: "600px",
    margin: "0.5rem 0 0",
    color: "#475569",
    fontSize: "0.95rem",
    lineHeight: 1.6,
  },
  heroAside: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    justifyContent: "center",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  statCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0.85rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.65)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
    backdropFilter: "blur(12px)",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#0f172a",
    fontSize: "1.4rem",
    fontWeight: 850,
    lineHeight: 1.1,
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  // Table Styling
  tableContainer: {
    overflow: "hidden",
    border: "1px solid #eef2f6",
    borderRadius: "24px",
    background: "#ffffff",
    boxShadow: "0 16px 48px rgba(15, 23, 42, 0.04)",
    marginTop: "0.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "1.1rem 1.5rem",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
  },
  td: {
    padding: "1rem 1.5rem",
    verticalAlign: "middle",
    color: "#334155",
    fontSize: "0.9rem",
  },
  planName: {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  planDescText: {
    display: "block",
    marginTop: "0.15rem",
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: 500,
  },
  // Grid/Cards styling
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.25rem",
    marginTop: "0.5rem",
  },
  planCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "260px",
    padding: "1.5rem",
    border: "1px solid #eef2f6",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
    transition: "all 0.2s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  planPriceTag: {
    fontSize: "1.65rem",
    fontWeight: 850,
    color: "#7c3aed",
    letterSpacing: "-0.04em",
    marginTop: "0.5rem",
    display: "block",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  cardName: {
    margin: 0,
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "1.15rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardDescription: {
    color: "#64748b",
    fontSize: "0.85rem",
    lineHeight: "1.4",
  },
  cardPermissionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    marginTop: "0.5rem",
    paddingTop: "0.5rem",
    borderTop: "1px solid #f1f5f9",
  },
  permissionLine: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.78rem",
    color: "#334155",
    fontWeight: 650,
  },
  permissionGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    padding: "0.85rem",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
  },
  permissionGroupTitle: {
    margin: 0,
    color: "#7c3aed",
    fontSize: "0.75rem",
    fontWeight: 850,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  permissionSubgroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.55rem",
    paddingLeft: "0.5rem",
    borderLeft: "2px solid #ede9fe",
  },
  permissionSubgroupTitle: {
    color: "#334155",
    fontSize: "0.82rem",
    fontWeight: 850,
  },
  permissionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.6rem",
  },
  permissionOption: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    cursor: "pointer",
    userSelect: "none",
  },
  permissionCheckbox: {
    width: "18px",
    height: "18px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
  },
  permissionOptionLabel: {
    color: "#0f172a",
    fontSize: "0.84rem",
    fontWeight: 750,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "1rem",
    marginTop: "auto",
  },
  // Modal Styling
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(8px)",
  },
  modal: {
    width: "100%",
    maxWidth: "760px",
    maxHeight: "calc(100vh - 3rem)",
    overflow: "hidden",
    borderRadius: "28px",
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 32px 80px rgba(15, 23, 42, 0.18)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem 1.75rem",
    borderBottom: "1px solid #f1f5f9",
    background: "linear-gradient(to right, #ffffff, #fcfdfe)",
  },
  modalTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "1.25rem",
    fontWeight: 850,
    letterSpacing: "-0.02em",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    maxHeight: "calc(100vh - 15.5rem)",
    overflowY: "auto",
    padding: "1.75rem",
  },
  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.75rem",
    padding: "1.5rem 1.75rem",
    borderTop: "1px solid #f1f5f9",
    background: "#fafbfe",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    color: "#334155",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "0.92rem",
    fontWeight: 500,
    outline: "none",
    transition: "all 0.15s ease",
  },
} satisfies Record<string, CSSProperties>;

const PILL_STYLES: Record<string, CSSProperties> = {
  active: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    color: "#059669",
  },
  inactive: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.18)",
    color: "#dc2626",
  },
  permission: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.18)",
    color: "#6d28d9",
  },
};

const badgeBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.35rem",
  padding: "0.32rem 0.65rem",
  borderRadius: "999px",
  fontSize: "0.72rem",
  fontWeight: 850,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const actionBtnStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#475569",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const actionBtnDangerStyle: CSSProperties = {
  ...actionBtnStyle,
  color: "#ef4444",
  borderColor: "rgba(239, 68, 68, 0.15)",
  background: "rgba(239, 68, 68, 0.02)",
};

export function PlansTab({ accessToken }: PlansTabProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listPlans(accessToken);
      setPlans(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (modalMode) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [modalMode]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingPlan(null);
    setModalMode("create");
  }

  function openEdit(plan: Plan) {
    setForm({
      name: plan.name,
      description: plan.description || "",
      price: String(plan.price),
      active: plan.active,
      permissions: plan.permissions || [],
    });
    setFormError(null);
    setEditingPlan(plan);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingPlan(null);
    setFormError(null);
  }

  function updateField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  function handlePermissionToggle(permId: string) {
    setForm((prev) => {
      const current = prev.permissions;
      const next = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      return { ...prev, permissions: next };
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("O nome do plano é obrigatório.");
      return;
    }
    const parsedPrice = parseFloat(form.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Informe um preço válido maior ou igual a zero.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: CreatePlanPayload = {
      name: form.name,
      description: form.description || null,
      price: parsedPrice,
      active: form.active,
      permissions: form.permissions,
    };

    try {
      if (modalMode === "create") {
        await createPlan(accessToken, payload);
      } else if (modalMode === "edit" && editingPlan) {
        await updatePlan(accessToken, editingPlan.id, payload);
      }
      await fetchPlans();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar plano.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePlan(accessToken, id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover plano.");
    }
  }

  return (
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="plans-tab-title"
    >
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="overview-hero-card" style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>
            <Award size={14} aria-hidden="true" />
            Precificação & Licenciamento
          </div>
          <div>
            <h2 id="plans-tab-title" style={styles.title}>
              Planos
            </h2>
            <p style={styles.subtitle}>
              Configure os pacotes do sistema, ajuste limites de precificação mensal e defina quais permissões operacionais estarão vinculadas.
            </p>
          </div>
        </div>

        <aside className="overview-hero-aside" style={styles.heroAside}>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total</span>
              <strong style={styles.statValue}>{plans.length}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Ativos</span>
              <strong style={styles.statValue}>
                {plans.filter((p) => p.active).length}
              </strong>
            </div>
          </div>

          <div style={styles.actionsRow}>
            {/* View Mode Toggle Segmented Control */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#f1f5f9",
                borderRadius: "12px",
                padding: "0.25rem",
                border: "1px solid #e2e8f0",
                flex: 1,
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  flex: 1,
                  padding: "0.45rem 0.65rem",
                  borderRadius: "9px",
                  border: "none",
                  background: viewMode === "list" ? "#ffffff" : "transparent",
                  color: viewMode === "list" ? "#0f172a" : "#64748b",
                  boxShadow: viewMode === "list" ? "0 2px 8px rgba(15, 23, 42, 0.05)" : "none",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <List size={14} />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  flex: 1,
                  padding: "0.45rem 0.65rem",
                  borderRadius: "9px",
                  border: "none",
                  background: viewMode === "grid" ? "#ffffff" : "transparent",
                  color: viewMode === "grid" ? "#0f172a" : "#64748b",
                  boxShadow: viewMode === "grid" ? "0 2px 8px rgba(15, 23, 42, 0.05)" : "none",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <LayoutGrid size={14} />
                Cards
              </button>
            </div>

            <button
              className="secondary-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.58rem 0.65rem",
                borderRadius: "12px",
                fontSize: "0.78rem",
                fontWeight: 850,
                cursor: "pointer",
                justifyContent: "center",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
              }}
              onClick={fetchPlans}
              disabled={loading}
              type="button"
              aria-label="Atualizar planos"
            >
              <RefreshCw size={14} className={cn(loading && "spinner")} aria-hidden="true" />
            </button>
            <button
              className="primary-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.58rem 0.9rem",
                borderRadius: "12px",
                fontSize: "0.78rem",
                fontWeight: 850,
                cursor: "pointer",
                justifyContent: "center",
                background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
              }}
              onClick={openCreate}
              type="button"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            borderRadius: "16px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.18)",
            color: "#dc2626",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
          role="alert"
        >
          <X size={16} />
          {error}
        </div>
      )}

      {/* Content Area */}
      {loading && plans.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "4rem 2rem",
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "24px",
            color: "#64748b",
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 size={32} className="spinner" aria-hidden="true" style={{ color: "#7c3aed" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Carregando planos…</span>
        </div>
      ) : plans.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.25rem",
            padding: "4rem 2rem",
            background: "#ffffff",
            border: "1px solid #eef2f6",
            borderRadius: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
              background: "rgba(100, 116, 139, 0.08)",
              color: "#64748b",
            }}
          >
            <Award size={32} aria-hidden="true" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              Nenhum plano cadastrado
            </h4>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              Cadastre planos para permitir a vinculação e ativação de empresas.
            </p>
          </div>
          <button
            className="primary-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.6rem 1.2rem",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
              color: "#ffffff",
              border: "none",
            }}
            onClick={openCreate}
            type="button"
          >
            <Plus size={14} aria-hidden="true" /> Criar Primeiro Plano
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div style={styles.gridContainer} role="region" aria-label="Lista de planos em cards">
          {plans.map((plan) => (
            <article key={plan.id} style={styles.planCard} className="table-row-hover">
              <div style={styles.cardTop}>
                <div>
                  <h4 style={styles.cardName} title={plan.name}>
                    {plan.name}
                  </h4>
                  <strong style={styles.planPriceTag}>
                    {plan.price === 0
                      ? "Grátis"
                      : plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </strong>
                </div>
                <div>
                  {plan.active ? (
                    <span style={{ ...badgeBaseStyle, ...PILL_STYLES.active, padding: "0.2rem 0.5rem", fontSize: "0.68rem" }}>
                      Ativo
                    </span>
                  ) : (
                    <span style={{ ...badgeBaseStyle, ...PILL_STYLES.inactive, padding: "0.2rem 0.5rem", fontSize: "0.68rem" }}>
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.cardBody}>
                {plan.description && (
                  <p style={styles.cardDescription}>
                    {plan.description}
                  </p>
                )}

                <div style={styles.cardPermissionsList}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.15rem" }}>
                    Recursos Inclusos:
                  </span>
                  {plan.permissions && plan.permissions.length > 0 ? (
                    plan.permissions.map((perm) => {
                      const pInfo = PERMISSIONS.find((p) => p.id === perm);
                      return (
                        <div key={perm} style={styles.permissionLine} title={pInfo?.label}>
                          <span style={{ color: "#7c3aed", fontSize: "0.85rem" }}>✓</span>
                          <span>{pInfo?.label || perm}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
                      Nenhum recurso específico
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div />

                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <button
                    className="icon-button"
                    style={{ ...actionBtnStyle, width: "30px", height: "30px", borderRadius: "8px" }}
                    onClick={() => openEdit(plan)}
                    type="button"
                    aria-label={`Editar ${plan.name}`}
                  >
                    <Edit2 size={13} aria-hidden="true" />
                  </button>
                  {confirmDeleteId === plan.id ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        background: "#fef2f2",
                        border: "1px solid #fee2e2",
                        padding: "0.2rem 0.4rem",
                        borderRadius: "8px",
                        animation: "fadeIn 0.15s ease",
                      }}
                    >
                      <button
                        className="icon-button"
                        style={{
                          ...actionBtnDangerStyle,
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#ef4444",
                          color: "#ffffff",
                        }}
                        onClick={() => handleDelete(plan.id)}
                        type="button"
                        aria-label="Confirmar exclusão"
                      >
                        <Trash2 size={10} />
                      </button>
                      <button
                        className="icon-button"
                        style={{
                          ...actionBtnStyle,
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#e2e8f0",
                          color: "#475569",
                        }}
                        onClick={() => setConfirmDeleteId(null)}
                        type="button"
                        aria-label="Cancelar exclusão"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="icon-button"
                      style={{ ...actionBtnDangerStyle, width: "30px", height: "30px", borderRadius: "8px" }}
                      onClick={() => setConfirmDeleteId(plan.id)}
                      type="button"
                      aria-label={`Excluir ${plan.name}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={styles.tableContainer} role="region" aria-label="Lista de planos" tabIndex={0}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th scope="col" style={styles.th}>Plano</th>
                <th scope="col" style={styles.th}>Preço</th>
                <th scope="col" style={styles.th}>Status</th>
                <th scope="col" style={styles.th}>Permissões Ativas</th>
                <th scope="col" style={{ ...styles.th, textAlign: "right" }}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} style={styles.tr} className="table-row-hover">
                  <td style={styles.td}>
                    <div>
                      <div style={styles.planName}>{plan.name}</div>
                      {plan.description && (
                        <span style={styles.planDescText}>
                          {plan.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>
                      {plan.price === 0
                        ? "Grátis"
                        : plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    {plan.active ? (
                      <span style={{ ...badgeBaseStyle, ...PILL_STYLES.active }}>
                        Ativo
                      </span>
                    ) : (
                      <span style={{ ...badgeBaseStyle, ...PILL_STYLES.inactive }}>
                        Inativo
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {plan.permissions && plan.permissions.length > 0 ? (
                        plan.permissions.map((perm) => (
                          <span
                            key={perm}
                            style={{
                              ...badgeBaseStyle,
                              ...PILL_STYLES.permission,
                              fontSize: "0.68rem",
                              padding: "0.125rem 0.375rem",
                            }}
                            title={PERMISSIONS.find((p) => p.id === perm)?.label}
                          >
                            {PERMISSIONS.find((p) => p.id === perm)?.label || perm}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>
                          Nenhuma
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        className="icon-button"
                        style={actionBtnStyle}
                        onClick={() => openEdit(plan)}
                        title="Editar plano"
                        type="button"
                      >
                        <Edit2 size={14} />
                      </button>
                      {confirmDeleteId === plan.id ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            background: "#fef2f2",
                            border: "1px solid #fee2e2",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "10px",
                            animation: "fadeIn 0.15s ease",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", paddingRight: "0.15rem" }}>
                            Excluir?
                          </span>
                          <button
                            className="icon-button"
                            style={{
                              ...actionBtnDangerStyle,
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#ef4444",
                              color: "#ffffff",
                            }}
                            onClick={() => handleDelete(plan.id)}
                            type="button"
                            aria-label="Confirmar exclusão"
                          >
                            <Trash2 size={12} />
                          </button>
                          <button
                            className="icon-button"
                            style={{
                              ...actionBtnStyle,
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              border: "none",
                              background: "#e2e8f0",
                              color: "#475569",
                            }}
                            onClick={() => setConfirmDeleteId(null)}
                            type="button"
                            aria-label="Cancelar exclusão"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="icon-button"
                          style={actionBtnDangerStyle}
                          onClick={() => setConfirmDeleteId(plan.id)}
                          title="Remover plano"
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div
          style={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 id="modal-title" style={styles.modalTitle}>
                {modalMode === "create" ? "Novo Plano" : "Editar Plano"}
              </h3>
              <button
                className="icon-button"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                onClick={closeModal}
                type="button"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.fieldGroup}>
                <label htmlFor="plan-name" style={styles.label}>Nome do plano</label>
                <input
                  ref={firstInputRef}
                  id="plan-name"
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex: Pro, Enterprise, Free"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="plan-description" style={styles.label}>Descrição (opcional)</label>
                <textarea
                  id="plan-description"
                  style={{ ...styles.input, minHeight: "60px", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Ex: Ideal para empresas em crescimento rápido..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="plan-price" style={styles.label}>Preço mensal (BRL)</label>
                  <input
                    id="plan-price"
                    type="number"
                    min="0"
                    step="0.01"
                    style={styles.input}
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="plan-active" style={styles.label}>Status</label>
                  <select
                    id="plan-active"
                    style={{
                      ...styles.input,
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.2rem",
                      paddingRight: "2.5rem",
                    }}
                    value={form.active ? "true" : "false"}
                    onChange={(e) => updateField("active", e.target.value === "true")}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Permissões Checklist */}
              <div style={{ ...styles.fieldGroup, marginTop: "1rem" }}>
                <label style={{ ...styles.label, marginBottom: "0.5rem", display: "block" }}>
                  Permissões incluídas neste plano
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    background: "#f8fafc",
                    padding: "1.25rem",
                    borderRadius: "18px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {PERMISSION_GROUPS.map((group) => (
                    <section key={group.title} style={styles.permissionGroup}>
                      <h4 style={styles.permissionGroupTitle}>{group.title}</h4>

                      {group.permissions && (
                        <div style={styles.permissionGrid}>
                          {group.permissions.map((perm) => {
                            const isChecked = form.permissions.includes(perm.id);
                            return (
                              <label 
                                key={perm.id} 
                                style={{
                                  ...styles.permissionOption,
                                  background: isChecked ? "rgba(124, 58, 237, 0.04)" : "#ffffff",
                                  border: isChecked ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid #e2e8f0",
                                  padding: "0.6rem 0.8rem",
                                  borderRadius: "10px",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(perm.id)}
                                    style={{
                                      ...styles.permissionCheckbox,
                                      accentColor: "#7c3aed",
                                      width: "16px",
                                      height: "16px",
                                    }}
                                  />
                                </div>
                                <span style={{
                                  ...styles.permissionOptionLabel,
                                  color: isChecked ? "#7c3aed" : "#334155",
                                  fontSize: "0.8rem",
                                  fontWeight: isChecked ? 800 : 600,
                                }}>
                                  {perm.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {group.subgroups?.map((subgroup) => (
                        <div key={subgroup.title} style={styles.permissionSubgroup}>
                          <strong style={styles.permissionSubgroupTitle}>{subgroup.title}</strong>
                          <div style={styles.permissionGrid}>
                            {subgroup.permissions.map((perm) => {
                              const isChecked = form.permissions.includes(perm.id);
                              return (
                                <label 
                                  key={perm.id} 
                                  style={{
                                    ...styles.permissionOption,
                                    background: isChecked ? "rgba(124, 58, 237, 0.04)" : "#ffffff",
                                    border: isChecked ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid #e2e8f0",
                                    padding: "0.6rem 0.8rem",
                                    borderRadius: "10px",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handlePermissionToggle(perm.id)}
                                      style={{
                                        ...styles.permissionCheckbox,
                                        accentColor: "#7c3aed",
                                        width: "16px",
                                        height: "16px",
                                      }}
                                    />
                                  </div>
                                  <span style={{
                                    ...styles.permissionOptionLabel,
                                    color: isChecked ? "#7c3aed" : "#334155",
                                    fontSize: "0.8rem",
                                    fontWeight: isChecked ? 800 : 600,
                                  }}>
                                    {perm.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              </div>

              {formError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    background: "rgba(239, 68, 68, 0.06)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    color: "#dc2626",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    marginTop: "0.5rem",
                  }}
                  role="alert"
                >
                  <X size={14} />
                  {formError}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                className="secondary-button"
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                }}
                onClick={closeModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-button"
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                onClick={handleSave}
                disabled={saving}
                type="button"
                id="btn-save-plan"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="spinner" aria-hidden="true" />
                    Salvando…
                  </>
                ) : modalMode === "create" ? (
                  "Criar plano"
                ) : (
                  "Salvar alterações"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import {
  Building2,
  Edit2,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
  LayoutGrid,
  List,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  createCompany,
  deleteCompany,
  listCompanies,
  listPlans,
  lookupCNPJ,
  updateCompany,
  uploadCompanyLogo,
  type Company,
  type Plan,
  type CreateCompanyPayload,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type CompaniesTabProps = {
  accessToken: string;
};

type ModalMode = "create" | "edit";

type CompanyForm = {
  company_name: string;
  trade_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  plan_id: string;
  active: boolean;
};

const EMPTY_FORM: CompanyForm = {
  company_name: "",
  trade_name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  plan_id: "",
  active: true,
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
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflow: "hidden",
    padding: "1.5rem",
    border: "1px solid rgba(212, 175, 55, 0.16)",
    borderRadius: "28px",
    background:
      "radial-gradient(circle at 8% 20%, rgba(212, 175, 55, 0.15), transparent 35%), radial-gradient(circle at 92% 12%, rgba(124, 58, 237, 0.14), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f7fbfd 52%, #fcfaff 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.06)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "1rem",
    minHeight: "0",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    width: "fit-content",
    padding: "0.4rem 0.7rem",
    border: "1px solid rgba(14, 165, 233, 0.16)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#0284c7",
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
  filterPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
    marginBottom: "0",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  filterLabel: {
    color: "#475569",
    fontSize: "0.72rem",
    fontWeight: 700,
  },
  filterInput: {
    width: "100%",
    padding: "0.75rem 0.95rem",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  filterSelect: {
    width: "100%",
    padding: "0.75rem 0.95rem",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  toolbarRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "0",
  },
  toolbarActions: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.75rem",
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
  companyCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  companyLogo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "rgba(212, 175, 55, 0.08)",
    border: "1px solid rgba(212, 175, 55, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  companyName: {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  cnpjText: {
    display: "inline-block",
    marginTop: "0.15rem",
    color: "#0284c7",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    padding: "1rem 1.25rem",
    border: "1px solid #eef2f6",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
    transition: "all 0.18s ease",
  },
  listLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    minWidth: 0,
    flex: 1,
  },
  listMain: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    minWidth: 0,
  },
  rowMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    color: "#64748b",
    fontSize: "0.8rem",
  },
  listRight: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    flexShrink: 0,
  },
  // Grid/Cards styling
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.25rem",
    marginTop: "0.5rem",
  },
  companyCard: {
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
    fontSize: "1.05rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardTradeName: {
    color: "#64748b",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  cardInfoRow: {
    fontSize: "0.85rem",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
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
    maxWidth: "680px",
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
    padding: "1.75rem",
  },
  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.75rem",
    padding: "1.25rem 1.75rem",
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
  plan: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.18)",
    color: "#6d28d9",
  },
  stateBadge: {
    background: "rgba(212, 175, 55, 0.08)",
    border: "1px solid rgba(212, 175, 55, 0.18)",
    color: "#D4AF37",
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

export function CompaniesTab({ accessToken }: CompaniesTabProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checkingCnpj, setCheckingCnpj] = useState(false);

  // File Upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const cnpjInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, plansRes] = await Promise.all([
        listCompanies(accessToken),
        listPlans(accessToken).catch(() => ({ data: [] })),
      ]);
      setCompanies(companiesRes.data || []);
      setPlans(plansRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (modalMode === "create") {
      setTimeout(() => cnpjInputRef.current?.focus(), 50);
    }
  }, [modalMode]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingCompany(null);
    setLogoFile(null);
    setLogoPreview(null);
    setModalMode("create");
  }

  function openEdit(company: Company) {
    setForm({
      company_name: company.company_name,
      trade_name: company.trade_name || "",
      cnpj: company.cnpj,
      email: company.email,
      phone: company.phone || "",
      address: company.address || "",
      city: company.city || "",
      state: company.state || "",
      zip_code: company.zip_code || "",
      plan_id: company.plan_id ? String(company.plan_id) : "",
      active: company.active,
    });
    setFormError(null);
    setEditingCompany(company);
    setLogoFile(null);
    setLogoPreview(company.logo_url ? `http://localhost:8010${company.logo_url}` : null);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingCompany(null);
    setFormError(null);
    setLogoFile(null);
    setLogoPreview(null);
  }

  function updateField<K extends keyof CompanyForm>(key: K, value: CompanyForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function handleCNPJLookup() {
    const rawCnpj = form.cnpj.replace(/\D/g, "");
    if (rawCnpj.length !== 14) {
      setFormError("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    setCheckingCnpj(true);
    setFormError(null);

    try {
      const res = await lookupCNPJ(accessToken, rawCnpj);
      const data = res.data;
      if (data) {
        setForm((prev) => ({
          ...prev,
          company_name: data.razao_social || data.nome || "",
          trade_name: data.nome_fantasia || data.fantasia || "",
          email: data.email || "",
          phone: data.telefone || "",
          address: data.logradouro ? `${data.logradouro}, ${data.numero || "S/N"}` : "",
          city: data.municipio || data.cidade || "",
          state: data.uf || "",
          zip_code: data.cep || "",
        }));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "CNPJ não encontrado ou inativo.");
    } finally {
      setCheckingCnpj(false);
    }
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Formato de imagem inválido. Escolha JPG, PNG ou WebP.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.company_name.trim()) {
      setFormError("A Razão Social é obrigatória.");
      return;
    }
    if (!form.cnpj.replace(/\D/g, "").trim()) {
      setFormError("O CNPJ é obrigatório.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("O e-mail de contato é obrigatório.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: CreateCompanyPayload = {
      company_name: form.company_name,
      trade_name: form.trade_name || null,
      cnpj: form.cnpj.replace(/\D/g, ""),
      email: form.email,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip_code: form.zip_code || null,
      plan_id: form.plan_id ? parseInt(form.plan_id) : null,
      active: form.active,
    };

    try {
      let companyId = editingCompany?.id || 0;

      if (modalMode === "create") {
        const createRes = await createCompany(accessToken, payload);
        companyId = createRes.id;
      } else if (modalMode === "edit" && editingCompany) {
        await updateCompany(accessToken, editingCompany.id, payload);
      }

      if (logoFile && companyId > 0) {
        setUploadingLogo(true);
        try {
          await uploadCompanyLogo(accessToken, companyId, logoFile);
        } catch (logoErr) {
          console.error("Erro ao enviar logotipo:", logoErr);
          alert("Empresa cadastrada com sucesso, porém ocorreu um erro ao enviar o logotipo.");
        } finally {
          setUploadingLogo(false);
        }
      }

      await loadData();
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar empresa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCompany(accessToken, id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover empresa.");
    }
  }

  const filteredCompanies = companies.filter((c) => {
    const search = searchTerm.toLowerCase();
    const searchMatch =
      !search ||
      c.company_name.toLowerCase().includes(search) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(search)) ||
      c.cnpj.includes(search) ||
      c.email.toLowerCase().includes(search);
    
    const planMatch = !planFilter || String(c.plan_id) === planFilter;
    const statusMatch = statusFilter === "all" || (statusFilter === "active" ? c.active : !c.active);
    
    return searchMatch && planMatch && statusMatch;
  });

  return (
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="companies-tab-title"
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
          <h2 id="companies-tab-title" className="sr-only">
            Empresas
          </h2>
        </div>

        <div style={styles.filterPanel}>
          <div style={styles.filterField}>
            <label htmlFor="company-search" style={styles.filterLabel}>
              Buscar
            </label>
            <input
              id="company-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, CNPJ, email"
              style={styles.filterInput}
            />
          </div>
          <div style={styles.filterField}>
            <label htmlFor="company-plan" style={styles.filterLabel}>
              Plano
            </label>
            <select
              id="company-plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Todos os planos</option>
              {plans.map((plan) => (
                <option key={plan.id} value={String(plan.id)}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterField}>
            <label htmlFor="company-status" style={styles.filterLabel}>
              Status
            </label>
            <select
              id="company-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              style={styles.filterSelect}
            >
              <option value="all">Todos</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>
        </div>

        <div style={styles.toolbarRow}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#f1f5f9",
              borderRadius: "12px",
              padding: "0.25rem",
              border: "1px solid #e2e8f0",
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

          <div style={styles.toolbarActions}>
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
              onClick={loadData}
              disabled={loading}
              type="button"
              aria-label="Atualizar empresas"
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
                background: "linear-gradient(135deg, #0284c7, #D4AF37)",
                      color: "#ffffff",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
              }}
              onClick={openCreate}
              type="button"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
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
      {loading && companies.length === 0 ? (
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
          <Loader2 size={32} className="spinner" aria-hidden="true" style={{ color: "#0284c7" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Carregando empresas…</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
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
            <Building2 size={32} aria-hidden="true" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              Nenhuma empresa encontrada
            </h4>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              {searchTerm ? "Refine os filtros de busca para encontrar o registro." : "Comece cadastrando a primeira empresa do sistema."}
            </p>
          </div>
          {!searchTerm && (
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
                background: "linear-gradient(135deg, #0284c7, #D4AF37)",
                color: "#ffffff",
                border: "none",
              }}
              onClick={openCreate}
              type="button"
            >
              <Plus size={14} aria-hidden="true" /> Cadastrar Empresa
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div style={styles.gridContainer} role="region" aria-label="Lista de empresas em cards">
          {filteredCompanies.map((company) => {
            const planName = plans.find((p) => p.id === company.plan_id)?.name || "Nenhum Plano";
            return (
              <article key={company.id} style={styles.companyCard} className="table-row-hover">
                <div style={styles.cardTop}>
                  <div style={styles.companyLogo}>
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`http://localhost:8010${company.logo_url}`}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 size={18} style={{ color: "#0284c7" }} />
                    )}
                  </div>
                  <div>
                    {company.active ? (
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
                  <h4 style={styles.cardName} title={company.company_name}>
                    {company.company_name}
                  </h4>
                  {company.trade_name && (
                    <span style={styles.cardTradeName} title={company.trade_name}>
                      {company.trade_name}
                    </span>
                  )}
                  <span style={styles.cnpjText}>
                    CNPJ: {company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                  </span>

                  <hr style={{ border: 0, borderTop: "1px solid #f1f5f9", margin: "0.4rem 0" }} />

                  <div style={styles.cardInfoRow}>
                    <span style={{ fontWeight: 700, color: "#64748b" }}>Contato:</span>
                    <span style={{ fontWeight: 500 }} title={company.email}>{company.email}</span>
                  </div>
                  {company.phone && (
                    <div style={styles.cardInfoRow}>
                      <span style={{ fontWeight: 700, color: "#64748b" }}>Tel:</span>
                      <span style={{ fontWeight: 500 }}>{company.phone}</span>
                    </div>
                  )}
                  <div style={styles.cardInfoRow}>
                    <span style={{ fontWeight: 700, color: "#64748b" }}>Localidade:</span>
                    <span style={{ fontWeight: 500 }}>
                      {company.city || "—"}{company.state ? `, ${company.state}` : ""}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                    <span
                      style={{
                        ...badgeBaseStyle,
                        ...PILL_STYLES.plan,
                        fontSize: "0.65rem",
                        padding: "0.15rem 0.45rem",
                      }}
                    >
                      Plano: {planName}
                    </span>
                    {company.state && (
                      <span
                        style={{
                          ...badgeBaseStyle,
                          ...PILL_STYLES.stateBadge,
                          fontSize: "0.65rem",
                          padding: "0.15rem 0.45rem",
                        }}
                      >
                        UF: {company.state}
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
                      onClick={() => openEdit(company)}
                      type="button"
                      aria-label={`Editar ${company.company_name}`}
                    >
                      <Edit2 size={13} aria-hidden="true" />
                    </button>
                    <button
                      className="icon-button"
                      style={{ ...actionBtnDangerStyle, width: "30px", height: "30px", borderRadius: "8px" }}
                      onClick={() => setConfirmDeleteId(company.id)}
                      type="button"
                      aria-label={`Excluir ${company.company_name}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={styles.listContainer} role="region" aria-label="Lista de empresas">
          {filteredCompanies.map((company) => {
            const planName = plans.find((p) => p.id === company.plan_id)?.name || "Nenhum Plano";
            return (
              <div key={company.id} style={styles.listRow} className="table-row-hover">
                <div style={styles.listLeft}>
                  <div style={styles.companyLogo}>
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`http://localhost:8010${company.logo_url}`}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Building2 size={16} style={{ color: "#64748b" }} />
                    )}
                  </div>

                  <div style={styles.listMain}>
                    <div style={styles.companyName}>{company.company_name}</div>
                    {company.trade_name && (
                      <div style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600 }}>
                        {company.trade_name}
                      </div>
                    )}
                    <span style={styles.cnpjText}>
                      CNPJ: {company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                    </span>
                  </div>
                </div>

                <div style={{ ...styles.listMain, flex: 1, minWidth: 0 }}>
                  <div style={styles.rowMeta}>
                    <span>{company.email}</span>
                    {company.phone && <span>{company.phone}</span>}
                  </div>
                  <div style={styles.rowMeta}>
                    <span>{company.city || "—"}{company.state ? `, ${company.state}` : ""}</span>
                    <span style={{ ...badgeBaseStyle, ...PILL_STYLES.plan, fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}>
                      {planName}
                    </span>
                    {company.active ? (
                      <span style={{ ...badgeBaseStyle, ...PILL_STYLES.active, fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}>
                        Ativo
                      </span>
                    ) : (
                      <span style={{ ...badgeBaseStyle, ...PILL_STYLES.inactive, fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}>
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.listRight}>
                  <button
                    className="icon-button"
                    style={actionBtnStyle}
                    onClick={() => openEdit(company)}
                    title="Editar empresa"
                    type="button"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="icon-button"
                    style={actionBtnDangerStyle}
                    onClick={() => setConfirmDeleteId(company.id)}
                    title="Remover empresa"
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          style={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDeleteId(null);
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 id="delete-dialog-title" style={styles.modalTitle}>
                Confirmar exclusão
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
                onClick={() => setConfirmDeleteId(null)}
                type="button"
                aria-label="Fechar diálogo de exclusão"
              >
                <X size={16} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ margin: 0, color: "#334155", fontSize: "0.95rem", lineHeight: 1.7 }}>
                Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
              </p>
              <p style={{ margin: "0.75rem 0 0", color: "#64748b", fontSize: "0.88rem" }}>
                {companies.find((company) => company.id === confirmDeleteId)?.company_name ?? "Empresa"}
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                className="secondary-button"
                onClick={() => setConfirmDeleteId(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-button"
                onClick={() => handleDelete(confirmDeleteId)}
                type="button"
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  minWidth: "120px",
                }}
              >
                Excluir empresa
              </button>
            </div>
          </div>
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
                {modalMode === "create" ? " Nova Empresa" : " Editar Empresa"}
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

            <div style={{ ...styles.modalBody, maxHeight: "75vh", overflowY: "auto" }}>
              {/* Logo Upload Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  padding: "1rem",
                  background: "#fafbfe",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "2px dashed #cbd5e1",
                    position: "relative",
                  }}
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Preview do logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Building2 size={28} style={{ color: "#94a3b8" }} />
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                    Logotipo da Empresa
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Formatos suportados: PNG, JPG ou WebP. Limite 2MB.
                  </p>
                  <button
                    className="secondary-button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={14} /> Selecionar imagem
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* CNPJ / Auto Lookup */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "0.75rem",
                  alignItems: "flex-end",
                }}
              >
                <div style={{ ...styles.fieldGroup, flex: 1 }}>
                  <label htmlFor="comp-cnpj" style={styles.label}>CNPJ (apenas números)</label>
                  <input
                    ref={cnpjInputRef}
                    id="comp-cnpj"
                    style={styles.input}
                    value={form.cnpj}
                    onChange={(e) => updateField("cnpj", e.target.value.replace(/\D/g, "").slice(0, 14))}
                    placeholder="00.000.000/0000-00"
                    disabled={modalMode === "edit"}
                  />
                </div>
                {modalMode === "create" && (
                  <button
                    className="primary-button"
                    style={{
                      padding: "0.75rem 1.25rem",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #0284c7, #D4AF37)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                    }}
                    onClick={handleCNPJLookup}
                    disabled={checkingCnpj || form.cnpj.length < 14}
                    type="button"
                  >
                    {checkingCnpj ? (
                      <>
                        <Loader2 size={14} className="spinner" aria-hidden="true" /> Buscando…
                      </>
                    ) : (
                      "Buscar CNPJ"
                    )}
                  </button>
                )}
              </div>

              <hr style={{ border: 0, borderTop: "1px solid #f1f5f9", margin: "0.5rem 0" }} />

              {/* Basic Fields */}
              <div style={styles.fieldGroup}>
                <label htmlFor="comp-name" style={styles.label}>Razão Social</label>
                <input
                  id="comp-name"
                  style={styles.input}
                  value={form.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  placeholder="Ex: Minha Empresa LTDA"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="comp-fantasia" style={styles.label}>Nome Fantasia (opcional)</label>
                <input
                  id="comp-fantasia"
                  style={styles.input}
                  value={form.trade_name}
                  onChange={(e) => updateField("trade_name", e.target.value)}
                  placeholder="Ex: Minha Loja"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-email" style={styles.label}>E-mail de contato</label>
                  <input
                    id="comp-email"
                    type="email"
                    style={styles.input}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-phone" style={styles.label}>Telefone (opcional)</label>
                  <input
                    id="comp-phone"
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div style={styles.fieldGroup}>
                <label htmlFor="comp-address" style={styles.label}>Endereço (opcional)</label>
                <input
                  id="comp-address"
                  style={styles.input}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-city" style={styles.label}>Cidade (opcional)</label>
                  <input
                    id="comp-city"
                    style={styles.input}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-state" style={styles.label}>UF (opcional)</label>
                  <input
                    id="comp-state"
                    style={styles.input}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="Ex: SP"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-zip" style={styles.label}>CEP (opcional)</label>
                  <input
                    id="comp-zip"
                    style={styles.input}
                    value={form.zip_code}
                    onChange={(e) => updateField("zip_code", e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Plans / Active */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-plan" style={styles.label}>Plano do Sistema</label>
                  <select
                    id="comp-plan"
                    style={{
                      ...styles.input,
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.2rem",
                      paddingRight: "2.5rem",
                    }}
                    value={form.plan_id}
                    onChange={(e) => updateField("plan_id", e.target.value)}
                  >
                    <option value="">Nenhum Plano (Grátis/Inativo)</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.price === 0 ? "Grátis" : `${p.price} BRL`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.fieldGroup}>
                  <label htmlFor="comp-active" style={styles.label}>Status da Conta</label>
                  <select
                    id="comp-active"
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
                    <option value="true">Ativa</option>
                    <option value="false">Bloqueada / Inativa</option>
                  </select>
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
                  background: "linear-gradient(135deg, #0284c7, #D4AF37)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                onClick={handleSave}
                disabled={saving || uploadingLogo}
                type="button"
                id="btn-save-company"
              >
                {saving || uploadingLogo ? (
                  <>
                    <Loader2 size={14} className="spinner" aria-hidden="true" />
                    Salvando…
                  </>
                ) : modalMode === "create" ? (
                  "Criar empresa"
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

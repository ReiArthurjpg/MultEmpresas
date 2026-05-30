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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

export function CompaniesTab({ accessToken }: CompaniesTabProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");

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
        listPlans(accessToken).catch(() => ({ data: [] })), // If fails, gracefully continue with empty plans list
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
    setLogoPreview(company.logo_url ? `http://localhost:8010${company.logo_url}` : null); // Adjust with correct base url
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

      // If there is a logo selected and we have a valid companyId, upload it!
      if (logoFile && companyId > 0) {
        setUploadingLogo(true);
        try {
          await uploadCompanyLogo(accessToken, companyId, logoFile);
        } catch (logoErr) {
          console.error("Erro ao enviar logotipo:", logoErr);
          // Let the user know the company was saved but logo failed
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
    return (
      c.company_name.toLowerCase().includes(search) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(search)) ||
      c.cnpj.includes(search) ||
      c.email.toLowerCase().includes(search)
    );
  });

  return (
    <section className="tab-section" aria-labelledby="companies-tab-title">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h2 id="companies-tab-title" className="tab-title">Empresas Cadastradas</h2>
          <p className="tab-subtitle">
            Gerencie todos os inquilinos (tenants) no ecossistema MultEmpresas, definindo planos, acessos e logos.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="secondary-button"
            onClick={loadData}
            aria-label="Atualizar empresas"
            type="button"
            disabled={loading}
          >
            <RefreshCw size={16} className={cn(loading && "spinner")} />
          </button>
          <button className="primary-button" onClick={openCreate} type="button">
            <Plus size={16} /> Nova Empresa
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar" style={{ marginBottom: "1rem" }}>
        <div className="search-shell" style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search
            className="search-icon"
            size={18}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-foreground)",
            }}
          />
          <input
            className="form-input search-input"
            style={{ paddingLeft: "2.75rem", width: "100%" }}
            placeholder="Buscar por razão social, CNPJ ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert-item alert-item--warning" style={{ marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {loading && companies.length === 0 ? (
        <div className="db-loader" aria-busy="true">
          <Loader2 className="db-loader__spinner" />
          <p>Carregando empresas…</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="empty-state">
          <Building2 size={40} aria-hidden="true" />
          <p>Nenhuma empresa encontrada.</p>
          {searchTerm && <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Refine sua busca.</p>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="db-table">
            <thead>
              <tr>
                <th>Empresa / CNPJ</th>
                <th>Contato</th>
                <th>Localidade</th>
                <th>Plano</th>
                <th>Status</th>
                <th style={{ width: "120px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          background: "var(--secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {company.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`http://localhost:8010${company.logo_url}`}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Building2 size={16} style={{ color: "var(--muted-foreground)" }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--foreground)" }}>
                          {company.company_name}
                        </div>
                        {company.trade_name && (
                          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                            {company.trade_name}
                          </div>
                        )}
                        <div style={{ fontSize: "0.7rem", color: "var(--primary)", marginTop: "0.125rem" }}>
                          CNPJ: {company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>{company.email}</div>
                    {company.phone && <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{company.phone}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                      {company.city || "—"}
                    </div>
                    {company.state && <span className="badge badge--operator" style={{ fontSize: "0.6875rem", padding: "0.0625rem 0.25rem" }}>{company.state}</span>}
                  </td>
                  <td>
                    <span className="badge badge--master" style={{ textTransform: "none" }}>
                      {plans.find((p) => p.id === company.plan_id)?.name || "Nenhum Plano"}
                    </span>
                  </td>
                  <td>
                    <span className={cn("badge", company.active ? "badge--green" : "badge--red")}>
                      {company.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                      {confirmDeleteId === company.id ? (
                        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--destructive)" }}>Excluir?</span>
                          <button
                            className="danger-button"
                            onClick={() => handleDelete(company.id)}
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                            type="button"
                          >
                            Sim
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => setConfirmDeleteId(null)}
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
                            type="button"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="icon-button"
                            onClick={() => openEdit(company)}
                            title="Editar empresa"
                            type="button"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="icon-button text-destructive"
                            onClick={() => setConfirmDeleteId(company.id)}
                            title="Remover empresa"
                            type="button"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
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
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal" style={{ maxWidth: "700px" }}>
            <div className="modal__header">
              <h3 id="modal-title" className="modal__title">
                {modalMode === "create" ? "Nova Empresa" : "Editar Empresa"}
              </h3>
              <button
                className="icon-button"
                onClick={closeModal}
                type="button"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal__body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Logo Upload Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "var(--secondary)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    background: "var(--card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "2px dashed var(--border)",
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
                    <Building2 size={28} style={{ color: "var(--muted-foreground)" }} />
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem" }}>
                    Logotipo da Empresa
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>
                    Formatos suportados: PNG, JPG ou WebP. Limite 2MB.
                  </p>
                  <button
                    className="secondary-button"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
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
                  gap: "0.5rem",
                  alignItems: "flex-end",
                }}
              >
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="comp-cnpj">CNPJ (apenas números)</label>
                  <input
                    ref={cnpjInputRef}
                    id="comp-cnpj"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.cnpj}
                    onChange={(e) => updateField("cnpj", e.target.value.replace(/\D/g, "").slice(0, 14))}
                    placeholder="00.000.000/0000-00"
                    disabled={modalMode === "edit"}
                  />
                </div>
                {modalMode === "create" && (
                  <button
                    className="primary-button"
                    style={{ padding: "0.625rem 1rem" }}
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

              <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "1.5rem 0" }} />

              {/* Basic Fields */}
              <div className="field-group">
                <label htmlFor="comp-name">Razão Social</label>
                <input
                  id="comp-name"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  value={form.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  placeholder="Ex: Minha Empresa LTDA"
                />
              </div>

              <div className="field-group">
                <label htmlFor="comp-fantasia">Nome Fantasia (opcional)</label>
                <input
                  id="comp-fantasia"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  value={form.trade_name}
                  onChange={(e) => updateField("trade_name", e.target.value)}
                  placeholder="Ex: Minha Loja"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field-group">
                  <label htmlFor="comp-email">E-mail de contato</label>
                  <input
                    id="comp-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="comp-phone">Telefone (opcional)</label>
                  <input
                    id="comp-phone"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="field-group">
                <label htmlFor="comp-address">Endereço (opcional)</label>
                <input
                  id="comp-address"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
                <div className="field-group">
                  <label htmlFor="comp-city">Cidade (opcional)</label>
                  <input
                    id="comp-city"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Ex: São Paulo"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="comp-state">UF (opcional)</label>
                  <input
                    id="comp-state"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="Ex: SP"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="comp-zip">CEP (opcional)</label>
                  <input
                    id="comp-zip"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.zip_code}
                    onChange={(e) => updateField("zip_code", e.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Plans / Active */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field-group">
                  <label htmlFor="comp-plan">Plano do Sistema</label>
                  <select
                    id="comp-plan"
                    className="form-input form-select"
                    style={{ paddingLeft: "1rem" }}
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

                <div className="field-group">
                  <label htmlFor="comp-active">Status da Conta</label>
                  <select
                    id="comp-active"
                    className="form-input form-select"
                    style={{ paddingLeft: "1rem" }}
                    value={form.active ? "true" : "false"}
                    onChange={(e) => updateField("active", e.target.value === "true")}
                  >
                    <option value="true">Ativa</option>
                    <option value="false">Bloqueada / Inativa</option>
                  </select>
                </div>
              </div>

              {formError && <p className="form-alert" role="alert">{formError}</p>}
            </div>

            <div className="modal__footer">
              <button className="secondary-button" onClick={closeModal} type="button">
                Cancelar
              </button>
              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving || uploadingLogo}
                type="button"
                id="btn-save-company"
              >
                {saving || uploadingLogo ? (
                  <>
                    <Loader2 size={14} className="spinner" aria-hidden="true" /> Salvando…
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

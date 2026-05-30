"use client";

import {
  Award,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const PERMISSIONS = [
  { id: "CREATE_USERS", label: "Gerenciar Usuários", desc: "Criar, editar e remover usuários da empresa" },
  { id: "CREATE_CLIENTS", label: "Gerenciar Clientes", desc: "Cadastrar e gerenciar clientes no sistema" },
  { id: "CREATE_ORDERS", label: "Gerenciar Pedidos", desc: "Lançar e gerenciar vendas ou pedidos" },
  { id: "VIEW_REPORTS", label: "Visualizar Relatórios", desc: "Acessar relatórios e analytics da empresa" },
  { id: "EXPORT_DATA", label: "Exportar Dados", desc: "Exportar dados da empresa em planilhas/PDF" },
];

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

export function PlansTab({ accessToken }: PlansTabProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <section className="tab-section" aria-labelledby="plans-tab-title">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h2 id="plans-tab-title" className="tab-title">Planos do Sistema</h2>
          <p className="tab-subtitle">
            Gerencie as ofertas de planos do sistema e as permissões de acesso associadas a cada um.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="secondary-button"
            onClick={fetchPlans}
            aria-label="Atualizar planos"
            type="button"
            disabled={loading}
          >
            <RefreshCw size={16} className={cn(loading && "spinner")} />
          </button>
          <button className="primary-button" onClick={openCreate} type="button">
            <Plus size={16} /> Novo Plano
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert-item alert-item--warning" style={{ marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabela de Planos */}
      {loading && plans.length === 0 ? (
        <div className="db-loader" aria-busy="true">
          <Loader2 className="db-loader__spinner" />
          <p>Carregando planos…</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <Award size={40} aria-hidden="true" />
          <p>Nenhum plano cadastrado no momento.</p>
          <button
            className="secondary-button"
            onClick={openCreate}
            style={{ marginTop: "1rem" }}
            type="button"
          >
            Criar primeiro plano
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="db-table">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Permissões Ativas</th>
                <th style={{ width: "120px", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{plan.name}</div>
                    {plan.description && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.125rem" }}>
                        {plan.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>
                      {plan.price === 0
                        ? "Grátis"
                        : plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </strong>
                  </td>
                  <td>
                    <span className={cn("badge", plan.active ? "badge--green" : "badge--red")}>
                      {plan.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                      {plan.permissions && plan.permissions.length > 0 ? (
                        plan.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="badge badge--operator"
                            style={{ fontSize: "0.6875rem", padding: "0.125rem 0.375rem" }}
                            title={PERMISSIONS.find((p) => p.id === perm)?.desc}
                          >
                            {PERMISSIONS.find((p) => p.id === perm)?.label || perm}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                          Nenhuma
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                      {confirmDeleteId === plan.id ? (
                        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--destructive)" }}>Excluir?</span>
                          <button
                            className="danger-button"
                            onClick={() => handleDelete(plan.id)}
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
                            onClick={() => openEdit(plan)}
                            title="Editar plano"
                            type="button"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="icon-button text-destructive"
                            onClick={() => setConfirmDeleteId(plan.id)}
                            title="Remover plano"
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
          <div className="modal" style={{ maxWidth: "600px" }}>
            <div className="modal__header">
              <h3 id="modal-title" className="modal__title">
                {modalMode === "create" ? "Novo Plano" : "Editar Plano"}
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
              <div className="field-group">
                <label htmlFor="plan-name">Nome do plano</label>
                <input
                  ref={firstInputRef}
                  id="plan-name"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex: Pro, Enterprise, Free"
                />
              </div>

              <div className="field-group">
                <label htmlFor="plan-description">Descrição (opcional)</label>
                <textarea
                  id="plan-description"
                  className="form-input"
                  style={{ padding: "0.5rem 1rem", minHeight: "60px", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Ex: Ideal para empresas em crescimento rápido..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field-group">
                  <label htmlFor="plan-price">Preço mensal (BRL)</label>
                  <input
                    id="plan-price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    style={{ paddingLeft: "1rem" }}
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="plan-active">Status</label>
                  <select
                    id="plan-active"
                    className="form-input form-select"
                    style={{ paddingLeft: "1rem" }}
                    value={form.active ? "true" : "false"}
                    onChange={(e) => updateField("active", e.target.value === "true")}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Permissões Checklist */}
              <div className="field-group" style={{ marginTop: "1rem" }}>
                <label style={{ fontWeight: 600, marginBottom: "0.5rem", display: "block" }}>
                  Permissões incluídas neste plano
                </label>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    background: "var(--secondary)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  {PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        style={{ marginTop: "0.25rem" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                          {perm.label}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                          {perm.desc}
                        </div>
                      </div>
                    </label>
                  ))}
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
                disabled={saving}
                type="button"
                id="btn-save-plan"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="spinner" aria-hidden="true" /> Salvando…
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

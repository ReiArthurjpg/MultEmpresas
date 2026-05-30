"use client";

import {
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type CreateUserPayload,
  type User,
} from "@/lib/api";
import { cn } from "@/lib/utils";

type UsersTabProps = {
  accessToken: string;
};

const ROLE_LABELS: Record<User["role"], string> = {
  MASTER: "Master",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
};

const ROLE_COLORS: Record<User["role"], string> = {
  MASTER: "badge--master",
  ADMIN: "badge--admin",
  OPERATOR: "badge--operator",
};

type ModalMode = "create" | "edit";

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: User["role"];
  must_change_password: boolean;
};

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "OPERATOR",
  must_change_password: true,
};

/**
 * Normaliza qualquer shape de resposta da API para um array de User.
 * O backend pode retornar:
 *   - User[]                      (array direto)
 *   - { data: User[] }            (envelope Laravel-style)
 *   - { users: User[] }           (envelope custom)
 *   - { items: User[] }           (envelope alternativo)
 */
function normalizeUsersResponse(raw: unknown): User[] {
  if (Array.isArray(raw)) return raw as User[];

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["data", "users", "items", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as User[];
    }
  }

  console.warn("[UsersTab] Resposta inesperada da API /users:", raw);
  return [];
}

export function UsersTab({ accessToken }: UsersTabProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await listUsers(accessToken);
      setUsers(normalizeUsersResponse(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (modalMode) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [modalMode]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingUser(null);
    setModalMode("create");
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      must_change_password: user.must_change_password,
    });
    setFormError(null);
    setEditingUser(user);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingUser(null);
    setFormError(null);
  }

  function updateField<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError("Nome é obrigatório."); return; }
    if (!form.email.trim()) { setFormError("E-mail é obrigatório."); return; }
    if (modalMode === "create" && !form.password) { setFormError("Senha é obrigatória."); return; }

    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === "create") {
        const payload: CreateUserPayload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          must_change_password: form.must_change_password,
        };
        await createUser(accessToken, payload);
      } else if (editingUser) {
        const payload: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          must_change_password: form.must_change_password,
        };
        if (form.password) payload.password = form.password;
        await updateUser(accessToken, editingUser.id, payload);
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteUser(accessToken, id);
      setConfirmDeleteId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover usuário.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="tab-section" aria-labelledby="users-tab-title">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h2 id="users-tab-title" className="tab-title">Usuários</h2>
          <p className="tab-subtitle">Gerencie os usuários da plataforma.</p>
        </div>
        <div className="tab-header__actions">
          <button
            className="icon-button"
            onClick={fetchUsers}
            disabled={loading}
            type="button"
            aria-label="Recarregar lista"
          >
            <RefreshCw size={16} className={cn(loading && "spinner")} aria-hidden="true" />
          </button>
          <button
            className="primary-button tab-cta"
            onClick={openCreate}
            type="button"
            id="btn-create-user"
          >
            <Plus size={16} aria-hidden="true" /> Novo usuário
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <p className="form-alert" role="alert">{error}</p>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading-state" aria-live="polite" aria-busy="true">
          <Loader2 size={24} className="spinner" aria-hidden="true" />
          <span>Carregando usuários…</span>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <UserX size={40} aria-hidden="true" />
          <p>Nenhum usuário encontrado.</p>
          <button className="primary-button" onClick={openCreate} type="button">
            <Plus size={14} aria-hidden="true" /> Criar primeiro usuário
          </button>
        </div>
      ) : (
        <div className="table-wrapper" role="region" aria-label="Lista de usuários" tabIndex={0}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfil</th>
                <th scope="col">Status</th>
                <th scope="col">2FA</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar" aria-hidden="true">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-cell__name">{user.name}</div>
                        {user.must_change_password && (
                          <div className="user-cell__warn">Troca de senha pendente</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="td-email">{user.email}</td>
                  <td>
                    <span className={cn("badge", ROLE_COLORS[user.role])}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td>
                    {user.active ? (
                      <span className="status-chip status-chip--active">
                        <UserCheck size={12} aria-hidden="true" /> Ativo
                      </span>
                    ) : (
                      <span className="status-chip status-chip--inactive">
                        <UserX size={12} aria-hidden="true" /> Inativo
                      </span>
                    )}
                  </td>
                  <td>
                    {user.two_factor_enabled ? (
                      <span className="status-chip status-chip--2fa">ON</span>
                    ) : (
                      <span className="status-chip status-chip--off">OFF</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => openEdit(user)}
                        type="button"
                        aria-label={`Editar ${user.name}`}
                      >
                        <Edit2 size={15} aria-hidden="true" />
                      </button>
                      {confirmDeleteId === user.id ? (
                        <div className="confirm-delete">
                          <span>Excluir?</span>
                          <button
                            className="icon-button icon-button--danger"
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            type="button"
                            aria-label="Confirmar exclusão"
                          >
                            {deletingId === user.id
                              ? <Loader2 size={14} className="spinner" />
                              : <Trash2 size={14} />}
                          </button>
                          <button
                            className="icon-button"
                            onClick={() => setConfirmDeleteId(null)}
                            type="button"
                            aria-label="Cancelar exclusão"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="icon-button icon-button--danger"
                          onClick={() => setConfirmDeleteId(user.id)}
                          type="button"
                          aria-label={`Excluir ${user.name}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
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
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal">
            <div className="modal__header">
              <h3 id="modal-title" className="modal__title">
                {modalMode === "create" ? "Novo Usuário" : "Editar Usuário"}
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

            <div className="modal__body">
              <div className="field-group">
                <label htmlFor="user-name">Nome completo</label>
                <input
                  ref={firstInputRef}
                  id="user-name"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex: João Silva"
                  autoComplete="name"
                />
              </div>

              <div className="field-group">
                <label htmlFor="user-email">E-mail</label>
                <input
                  id="user-email"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="joao@empresa.com"
                  autoComplete="email"
                />
              </div>

              <div className="field-group">
                <label htmlFor="user-password">
                  {modalMode === "edit" ? "Nova senha (deixe em branco para manter)" : "Senha"}
                </label>
                <input
                  id="user-password"
                  className="form-input"
                  style={{ paddingLeft: "1rem" }}
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={modalMode === "create" ? "new-password" : "off"}
                />
              </div>

              <div className="field-group">
                <label htmlFor="user-role">Perfil de acesso</label>
                <select
                  id="user-role"
                  className="form-input form-select"
                  style={{ paddingLeft: "1rem" }}
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value as User["role"])}
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="MASTER">Master</option>
                </select>
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.must_change_password}
                  onChange={(e) => updateField("must_change_password", e.target.checked)}
                />
                <span>Exigir troca de senha no próximo login</span>
              </label>

              {formError && (
                <p className="form-alert" role="alert">{formError}</p>
              )}
            </div>

            <div className="modal__footer">
              <button
                className="secondary-button"
                onClick={closeModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving}
                type="button"
                id="btn-save-user"
              >
                {saving
                  ? <><Loader2 size={14} className="spinner" aria-hidden="true" /> Salvando…</>
                  : modalMode === "create" ? "Criar usuário" : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

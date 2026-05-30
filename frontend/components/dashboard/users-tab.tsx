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
  LayoutGrid,
  List,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
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
    border: "1px solid rgba(16, 185, 129, 0.16)",
    borderRadius: "28px",
    background:
      "radial-gradient(circle at 8% 20%, rgba(16, 185, 129, 0.15), transparent 35%), radial-gradient(circle at 92% 12%, rgba(59, 130, 246, 0.14), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f9fbf9 52%, #f5f8ff 100%)",
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
    border: "1px solid rgba(16, 185, 129, 0.16)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#059669",
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
  avatar: {
    width: "40px",
    height: "40px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    fontWeight: 850,
    fontSize: "0.95rem",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
  },
  userName: {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "0.95rem",
  },
  warnLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    marginTop: "0.15rem",
    color: "#d97706",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  // Grid/Cards styling
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.25rem",
    marginTop: "0.5rem",
  },
  userCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "240px",
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
  cardAvatar: {
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    fontWeight: 850,
    fontSize: "1.05rem",
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
  cardEmail: {
    color: "#64748b",
    fontSize: "0.85rem",
    fontWeight: 500,
    wordBreak: "break-all",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginTop: "0.25rem",
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
    maxWidth: "520px",
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
  master: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.18)",
    color: "#6d28d9",
  },
  admin: {
    background: "rgba(37, 99, 235, 0.08)",
    border: "1px solid rgba(37, 99, 235, 0.18)",
    color: "#2563eb",
  },
  operator: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    color: "#059669",
  },
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
  "2fa-on": {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    color: "#059669",
  },
  "2fa-off": {
    background: "rgba(100, 116, 139, 0.08)",
    border: "1px solid rgba(100, 116, 139, 0.18)",
    color: "#475569",
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

const AVATAR_THEMES: Record<string, { bg: string; color: string }> = {
  MASTER: { bg: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#ffffff" },
  ADMIN: { bg: "linear-gradient(135deg, #2563eb, #60a5fa)", color: "#ffffff" },
  OPERATOR: { bg: "linear-gradient(135deg, #0f172a, #334155)", color: "#ffffff" },
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    if (!form.name.trim()) {
      setFormError("Nome é obrigatório.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("E-mail é obrigatório.");
      return;
    }
    if (modalMode === "create" && !form.password) {
      setFormError("Senha é obrigatória.");
      return;
    }

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
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="users-tab-title"
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
            <UserCheck size={14} aria-hidden="true" />
            Controle de acesso
          </div>
          <div>
            <h2 id="users-tab-title" style={styles.title}>
              Usuários
            </h2>
            <p style={styles.subtitle}>
              Gerencie a equipe, atribua perfis de acesso, audite segurança e monitore status de ativação em tempo real.
            </p>
          </div>
        </div>

        <aside className="overview-hero-aside" style={styles.heroAside}>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total</span>
              <strong style={styles.statValue}>{users.length}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Ativos</span>
              <strong style={styles.statValue}>
                {users.filter((u) => u.active).length}
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
              onClick={fetchUsers}
              disabled={loading}
              type="button"
              aria-label="Recarregar lista"
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
                background: "linear-gradient(135deg, #059669, #10b981)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              }}
              onClick={openCreate}
              type="button"
              id="btn-create-user"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      {/* Error banner */}
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
      {loading ? (
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
          <Loader2 size={32} className="spinner" aria-hidden="true" style={{ color: "#059669" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Carregando usuários…</span>
        </div>
      ) : users.length === 0 ? (
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
            <UserX size={32} aria-hidden="true" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              Nenhum usuário encontrado
            </h4>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              Comece criando o primeiro usuário da sua plataforma.
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
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#ffffff",
              border: "none",
            }}
            onClick={openCreate}
            type="button"
          >
            <Plus size={14} aria-hidden="true" /> Criar primeiro usuário
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div style={styles.gridContainer} role="region" aria-label="Lista de usuários em cards">
          {users.map((user) => {
            const avatarTheme = AVATAR_THEMES[user.role] ?? AVATAR_THEMES.OPERATOR;
            return (
              <article key={user.id} style={styles.userCard} className="table-row-hover">
                <div style={styles.cardTop}>
                  <div
                    style={{
                      ...styles.cardAvatar,
                      background: avatarTheme.bg,
                      color: avatarTheme.color,
                    }}
                    aria-hidden="true"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {user.active ? (
                      <span
                        style={{
                          ...badgeBaseStyle,
                          ...PILL_STYLES.active,
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.68rem",
                        }}
                      >
                        Ativo
                      </span>
                    ) : (
                      <span
                        style={{
                          ...badgeBaseStyle,
                          ...PILL_STYLES.inactive,
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.68rem",
                        }}
                      >
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <h4 style={styles.cardName} title={user.name}>
                    {user.name}
                  </h4>
                  <span style={styles.cardEmail} title={user.email}>
                    {user.email}
                  </span>

                  <div style={styles.cardBadges}>
                    <span
                      style={{
                        ...badgeBaseStyle,
                        ...(PILL_STYLES[user.role.toLowerCase()] ?? PILL_STYLES.operator),
                        fontSize: "0.65rem",
                        padding: "0.15rem 0.45rem",
                      }}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                    <span
                      style={{
                        ...badgeBaseStyle,
                        ...(user.two_factor_enabled ? PILL_STYLES["2fa-on"] : PILL_STYLES["2fa-off"]),
                        fontSize: "0.65rem",
                        padding: "0.15rem 0.45rem",
                      }}
                    >
                      2FA: {user.two_factor_enabled ? "ON" : "OFF"}
                    </span>
                  </div>

                  {user.must_change_password && (
                    <div style={{ ...styles.warnLabel, marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "0.8rem" }}>🔑</span> Troca de senha pendente
                    </div>
                  )}
                </div>

                <div style={styles.cardFooter}>
                  <div />

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <button
                      className="icon-button"
                      style={{ ...actionBtnStyle, width: "30px", height: "30px", borderRadius: "8px" }}
                      onClick={() => openEdit(user)}
                      type="button"
                      aria-label={`Editar ${user.name}`}
                    >
                      <Edit2 size={13} aria-hidden="true" />
                    </button>
                    {confirmDeleteId === user.id ? (
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
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          type="button"
                          aria-label="Confirmar exclusão"
                        >
                          {deletingId === user.id ? (
                            <Loader2 size={10} className="spinner" />
                          ) : (
                            <Trash2 size={10} />
                          )}
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
                        onClick={() => setConfirmDeleteId(user.id)}
                        type="button"
                        aria-label={`Excluir ${user.name}`}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={styles.tableContainer} role="region" aria-label="Lista de usuários" tabIndex={0}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th scope="col" style={styles.th}>Nome</th>
                <th scope="col" style={styles.th}>E-mail</th>
                <th scope="col" style={styles.th}>Perfil</th>
                <th scope="col" style={styles.th}>Status</th>
                <th scope="col" style={styles.th}>2FA</th>
                <th scope="col" style={{ ...styles.th, textAlign: "right" }}><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const avatarTheme = AVATAR_THEMES[user.role] ?? AVATAR_THEMES.OPERATOR;
                return (
                  <tr key={user.id} style={styles.tr} className="table-row-hover">
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div
                          style={{
                            ...styles.avatar,
                            background: avatarTheme.bg,
                            color: avatarTheme.color,
                          }}
                          aria-hidden="true"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.userName}>{user.name}</div>
                          {user.must_change_password && (
                            <div style={styles.warnLabel}>
                              <span style={{ fontSize: "0.8rem" }}>🔑</span> Troca de senha pendente
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: "#64748b", fontWeight: 500 }}>{user.email}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...badgeBaseStyle,
                          ...(PILL_STYLES[user.role.toLowerCase()] ?? PILL_STYLES.operator),
                        }}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.active ? (
                        <span
                          style={{
                            ...badgeBaseStyle,
                            ...PILL_STYLES.active,
                          }}
                        >
                          <UserCheck size={12} aria-hidden="true" /> Ativo
                        </span>
                      ) : (
                        <span
                          style={{
                            ...badgeBaseStyle,
                            ...PILL_STYLES.inactive,
                          }}
                        >
                          <UserX size={12} aria-hidden="true" /> Inativo
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {user.two_factor_enabled ? (
                        <span
                          style={{
                            ...badgeBaseStyle,
                            ...PILL_STYLES["2fa-on"],
                          }}
                        >
                          ON
                        </span>
                      ) : (
                        <span
                          style={{
                            ...badgeBaseStyle,
                            ...PILL_STYLES["2fa-off"],
                          }}
                        >
                          OFF
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="icon-button"
                          style={actionBtnStyle}
                          onClick={() => openEdit(user)}
                          type="button"
                          aria-label={`Editar ${user.name}`}
                        >
                          <Edit2 size={14} aria-hidden="true" />
                        </button>
                        {confirmDeleteId === user.id ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
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
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingId === user.id}
                              type="button"
                              aria-label="Confirmar exclusão"
                            >
                              {deletingId === user.id ? (
                                <Loader2 size={12} className="spinner" />
                              ) : (
                                <Trash2 size={12} />
                              )}
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
                            onClick={() => setConfirmDeleteId(user.id)}
                            type="button"
                            aria-label={`Excluir ${user.name}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                {modalMode === "create" ? "✨ Novo Usuário" : "✍️ Editar Usuário"}
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
                <label htmlFor="user-name" style={styles.label}>Nome completo</label>
                <input
                  ref={firstInputRef}
                  id="user-name"
                  style={styles.input}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex: João Silva"
                  autoComplete="name"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="user-email" style={styles.label}>E-mail</label>
                <input
                  id="user-email"
                  style={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="joao@empresa.com"
                  autoComplete="email"
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="user-password" style={styles.label}>
                  {modalMode === "edit" ? "Nova senha (deixe em branco para manter)" : "Senha"}
                </label>
                <input
                  id="user-password"
                  style={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={modalMode === "create" ? "new-password" : "off"}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label htmlFor="user-role" style={styles.label}>Perfil de acesso</label>
                <select
                  id="user-role"
                  style={{
                    ...styles.input,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    backgroundSize: "1.2rem",
                    paddingRight: "2.5rem",
                  }}
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value as User["role"])}
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="MASTER">Master</option>
                </select>
              </div>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                  checked={form.must_change_password}
                  onChange={(e) => updateField("must_change_password", e.target.checked)}
                />
                <span style={{ fontSize: "0.9rem", color: "#334155", fontWeight: 600 }}>
                  Exigir troca de senha no próximo login
                </span>
              </label>

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
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                onClick={handleSave}
                disabled={saving}
                type="button"
                id="btn-save-user"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="spinner" aria-hidden="true" />
                    Salvando…
                  </>
                ) : modalMode === "create" ? (
                  "Criar usuário"
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

"use client";

import {
  Activity,
  Calendar,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  User,
  LayoutGrid,
  List,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { listAuditLogs, type AuditLog } from "@/lib/api";
import { cn } from "@/lib/utils";

type AuditTabProps = {
  accessToken: string;
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
    border: "1px solid rgba(100, 116, 139, 0.16)",
    borderRadius: "28px",
    background:
      "radial-gradient(circle at 8% 20%, rgba(100, 116, 139, 0.15), transparent 35%), radial-gradient(circle at 92% 12%, rgba(59, 130, 246, 0.12), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f8fafc 52%, #f1f5f9 100%)",
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
    border: "1px solid rgba(100, 116, 139, 0.16)",
    borderRadius: "999px",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#475569",
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
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
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
  actorCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  actorAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "rgba(100, 116, 139, 0.08)",
    border: "1px solid rgba(100, 116, 139, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
  },
  // Grid/Cards styling
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.25rem",
    marginTop: "0.5rem",
  },
  logCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "220px",
    padding: "1.5rem",
    border: "1px solid #eef2f6",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
    transition: "all 0.2s ease",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginTop: "0.85rem",
    marginBottom: "0.85rem",
  },
  cardTitle: {
    margin: 0,
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "1.05rem",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "0.85rem",
    marginTop: "auto",
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
  login: {
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.18)",
    color: "#059669",
  },
  logout: {
    background: "rgba(100, 116, 139, 0.08)",
    border: "1px solid rgba(100, 116, 139, 0.18)",
    color: "#475569",
  },
  create: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.18)",
    color: "#6d28d9",
  },
  update: {
    background: "rgba(37, 99, 235, 0.08)",
    border: "1px solid rgba(37, 99, 235, 0.18)",
    color: "#2563eb",
  },
  delete: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.18)",
    color: "#dc2626",
  },
  generic: {
    background: "rgba(14, 165, 233, 0.08)",
    border: "1px solid rgba(14, 165, 233, 0.18)",
    color: "#0284c7",
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

const getActionPillStyle = (action: string): CSSProperties => {
  const lower = action.toLowerCase();
  if (lower.includes("login")) return PILL_STYLES.login;
  if (lower.includes("logout")) return PILL_STYLES.logout;
  if (lower.includes("create")) return PILL_STYLES.create;
  if (lower.includes("update")) return PILL_STYLES.update;
  if (lower.includes("delete")) return PILL_STYLES.delete;
  return PILL_STYLES.generic;
};

export function AuditTab({ accessToken }: AuditTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAuditLogs(accessToken);
      setLogs(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar logs de auditoria.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (log.user_email && log.user_email.toLowerCase().includes(search)) ||
      (log.user_name && log.user_name.toLowerCase().includes(search)) ||
      (log.company_name && log.company_name.toLowerCase().includes(search)) ||
      log.entity.toLowerCase().includes(search) ||
      (log.ip && log.ip.includes(search));

    const matchesAction = actionFilter === "" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <section
      className="tab-section overview-dashboard"
      style={styles.dashboard}
      aria-labelledby="audit-tab-title"
    >
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
        }
      `}</style>

      {/* Header */}
      <div className="overview-hero-card" style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.eyebrow}>
            <Activity size={14} aria-hidden="true" />
            Segurança & Rastreabilidade
          </div>
          <div>
            <h2 id="audit-tab-title" style={styles.title}>
              Logs
            </h2>
            <p style={styles.subtitle}>
              Acompanhe o rastreamento em tempo real de acessos, modificações e modificações de recursos no sistema (limite de 500 registros).
            </p>
          </div>
        </div>

        <aside className="overview-hero-aside" style={styles.heroAside}>
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Registros</span>
              <strong style={styles.statValue}>{logs.length}</strong>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Filtrados</span>
              <strong style={styles.statValue}>{filteredLogs.length}</strong>
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
                padding: "0.58rem 0.85rem",
                borderRadius: "12px",
                fontSize: "0.78rem",
                fontWeight: 850,
                cursor: "pointer",
                justifyContent: "center",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#334155",
              }}
              onClick={fetchLogs}
              disabled={loading}
              type="button"
              aria-label="Atualizar logs"
            >
              <RefreshCw size={14} className={cn(loading && "spinner")} aria-hidden="true" />
            </button>
          </div>
        </aside>
      </div>

      {/* Filter / Search Bar */}
      <div style={styles.filterBar}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: "280px", maxWidth: "420px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            style={{
              ...styles.input,
              paddingLeft: "2.75rem",
              width: "100%",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.015)",
            }}
            placeholder="Filtrar por usuário, empresa, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action Select Filter */}
        <div style={{ minWidth: "200px" }}>
          <select
            style={{
              ...styles.input,
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.2rem",
              paddingRight: "2.5rem",
            }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filtrar por tipo de ação"
          >
            <option value="">Todas as Ações</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
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
      {loading && logs.length === 0 ? (
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
          <Loader2 size={32} className="spinner" aria-hidden="true" style={{ color: "#475569" }} />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Carregando logs de auditoria…</span>
        </div>
      ) : filteredLogs.length === 0 ? (
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
            <Activity size={32} aria-hidden="true" />
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
              Nenhum log encontrado
            </h4>
            <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
              Nenhum registro de auditoria corresponde aos filtros ativos.
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div style={styles.gridContainer} role="region" aria-label="Lista de logs em cards">
          {filteredLogs.map((log) => {
            const actionStyle = getActionPillStyle(log.action);
            return (
              <article key={log.id} style={styles.logCard} className="table-row-hover">
                <div style={styles.cardTop}>
                  <span style={{ ...badgeBaseStyle, ...actionStyle }}>
                    {log.action}
                  </span>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem",
                      color: "#64748b",
                      fontWeight: 600,
                    }}
                    title={log.user_agent || "N/A"}
                  >
                    <Globe size={13} />
                    {log.ip || "—"}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={styles.actorAvatar}>
                      <User size={14} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ ...styles.cardTitle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={log.user_name ?? undefined}>
                        {log.user_name || "Sistema"}
                      </h4>
                      {log.user_email && (
                        <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={log.user_email ?? undefined}>
                          {log.user_email}
                        </span>
                      )}
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: "1px solid #f1f5f9", margin: "0.4rem 0" }} />

                  <div style={{ fontSize: "0.85rem", color: "#475569", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ fontWeight: 700, color: "#64748b" }}>Recurso:</span>
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{log.entity.toUpperCase()}</span>
                    {log.entity_id && (
                      <span style={{ ...badgeBaseStyle, ...PILL_STYLES.logout, fontSize: "0.65rem", padding: "0.15rem 0.45rem" }}>
                        ID #{log.entity_id}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.15rem" }}>
                    <span style={{ fontWeight: 700, color: "#64748b" }}>Empresa:</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{log.company_name || "Global / Master"}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#64748b", fontSize: "0.75rem", fontWeight: 600 }}>
                    <Calendar size={13} />
                    {new Date(log.created_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={styles.tableContainer} role="region" aria-label="Lista de logs de auditoria" tabIndex={0}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th scope="col" style={{ ...styles.th, width: "180px" }}>Data / Hora</th>
                <th scope="col" style={styles.th}>Ação</th>
                <th scope="col" style={styles.th}>Usuário / Ator</th>
                <th scope="col" style={styles.th}>Empresa</th>
                <th scope="col" style={styles.th}>Recurso Alvo</th>
                <th scope="col" style={styles.th}>Endereço IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const actionStyle = getActionPillStyle(log.action);
                return (
                  <tr key={log.id} style={styles.tr} className="table-row-hover">
                    <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          color: "#64748b",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                        }}
                      >
                        <Calendar size={13} />
                        {new Date(log.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...badgeBaseStyle, ...actionStyle, fontSize: "0.68rem" }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actorCell}>
                        <div style={styles.actorAvatar}>
                          <User size={13} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a" }}>{log.user_name || "Sistema"}</div>
                          {log.user_email && (
                            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                              {log.user_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>
                        {log.company_name || "Global / Master"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        {log.entity.toUpperCase()}
                        {log.entity_id && (
                          <span
                            style={{
                              ...badgeBaseStyle,
                              ...PILL_STYLES.logout,
                              fontSize: "0.65rem",
                              padding: "0.05rem 0.3rem",
                            }}
                          >
                            ID #{log.entity_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          fontSize: "0.78rem",
                          color: "#64748b",
                          fontWeight: 650,
                        }}
                        title={log.user_agent || "N/A"}
                      >
                        <Globe size={13} />
                        {log.ip || "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

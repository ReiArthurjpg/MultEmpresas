"use client";

import {
  Activity,
  Calendar,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { listAuditLogs, type AuditLog } from "@/lib/api";
import { cn } from "@/lib/utils";

type AuditTabProps = {
  accessToken: string;
};

const ACTION_COLORS: Record<string, string> = {
  LOGIN: "badge--green",
  LOGOUT: "badge--operator",
  CREATE: "badge--master",
  UPDATE: "badge--admin",
  DELETE: "badge--red",
};

export function AuditTab({ accessToken }: AuditTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <section className="tab-section" aria-labelledby="audit-tab-title">
      {/* Header */}
      <div className="tab-header">
        <div>
          <h2 id="audit-tab-title" className="tab-title">Logs de Auditoria</h2>
          <p className="tab-subtitle">
            Rastreamento completo de atividades, acessos e modificações de recursos no sistema (limite de 500 registros).
          </p>
        </div>
        <div>
          <button
            className="secondary-button"
            onClick={fetchLogs}
            aria-label="Atualizar logs"
            type="button"
            disabled={loading}
          >
            <RefreshCw size={16} className={cn(loading && "spinner")} />
          </button>
        </div>
      </div>

      {/* Action Bar / Filters */}
      <div className="action-bar" style={{ gap: "1rem", marginBottom: "1rem" }}>
        {/* Search */}
        <div className="search-shell" style={{ position: "relative", flex: 1, maxWidth: "350px" }}>
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
            placeholder="Filtrar por usuário, empresa, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action Select Filter */}
        <div style={{ minWidth: "180px" }}>
          <select
            className="form-input form-select"
            style={{ paddingLeft: "1rem" }}
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
        <div className="alert-item alert-item--warning" style={{ marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabela de logs */}
      {loading && logs.length === 0 ? (
        <div className="db-loader" aria-busy="true">
          <Loader2 className="db-loader__spinner" />
          <p>Carregando logs de auditoria…</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <Activity size={40} aria-hidden="true" />
          <p>Nenhum log de auditoria encontrado.</p>
          {searchTerm || actionFilter ? (
            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
              Nenhum registro corresponde aos filtros selecionados.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="db-table" style={{ fontSize: "0.875rem" }}>
            <thead>
              <tr>
                <th style={{ width: "170px" }}>Data / Hora</th>
                <th>Ação</th>
                <th>Usuário / Ator</th>
                <th>Empresa</th>
                <th>Recurso Alvo</th>
                <th>Endereço IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
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
                  <td>
                    <span className={cn("badge", ACTION_COLORS[log.action] || "badge--operator")} style={{ fontSize: "0.6875rem" }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "var(--secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                        }}
                      >
                        <User size={12} style={{ color: "var(--muted-foreground)" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{log.user_name || "Sistema"}</div>
                        {log.user_email && (
                          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{log.user_email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                      {log.company_name || "Global / Master"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: "var(--foreground)" }}>
                      {log.entity.toUpperCase()}
                      {log.entity_id && (
                        <span className="badge badge--operator" style={{ marginLeft: "0.375rem", fontSize: "0.65rem", padding: "0.0625rem 0.25rem" }}>
                          ID #{log.entity_id}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.75rem",
                        color: "var(--muted-foreground)",
                      }}
                      title={log.user_agent || "N/A"}
                    >
                      <Globe size={13} />
                      {log.ip || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

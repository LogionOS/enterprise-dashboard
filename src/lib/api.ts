import type {
  HealthResponse,
  RulesListResponse,
  RuleDetail,
  AuditListResponse,
  AnalyticsResponse,
  PolicyListResponse,
  PolicyResponse,
  WebhookListResponse,
  WebhookResponse,
  CheckResponse,
  ComplianceReportResponse,
  PolicyPacksResponse,
  PolicyPackDetail,
  TrendEntry,
  DriftAlert,
  TraceSummary,
  TraceEntry,
  ReportTemplate,
} from "./types";

const DEFAULT_BASE_URL = "https://logionos-api.onrender.com";

function getConfig() {
  if (typeof window === "undefined") return { baseUrl: DEFAULT_BASE_URL, apiKey: "" };
  const baseUrl = localStorage.getItem("logionos_api_url") || DEFAULT_BASE_URL;
  const apiKey = localStorage.getItem("logionos_api_key") || "";
  return { baseUrl, apiKey };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { baseUrl, apiKey } = getConfig();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      const { forceLogoutOnAuthError } = await import("./auth");
      forceLogoutOnAuthError();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(`Request failed (${res.status}). Please try again.`);
  }
  return res.json();
}

export const api = {
  health: () => request<HealthResponse>("/v1/health"),

  rules: (jurisdiction?: string) => {
    const params = jurisdiction ? `?jurisdiction=${jurisdiction}` : "";
    return request<RulesListResponse>(`/v1/rules${params}`);
  },

  ruleDetail: (id: string) => request<RuleDetail>(`/v1/rules/${id}`),

  audit: (limit = 50) => request<AuditListResponse>(`/v1/audit?limit=${limit}`),

  analytics: () => request<AnalyticsResponse>("/v1/analytics"),

  policies: () => request<PolicyListResponse>("/v1/policies"),

  createPolicy: (data: Record<string, unknown>) =>
    request<PolicyResponse>("/v1/policies", { method: "POST", body: JSON.stringify(data) }),

  updatePolicy: (id: string, data: Record<string, unknown>) =>
    request<PolicyResponse>(`/v1/policies/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePolicy: (id: string) =>
    request<void>(`/v1/policies/${id}`, { method: "DELETE" }),

  webhooks: () => request<WebhookListResponse>("/v1/webhooks"),

  createWebhook: (data: { url: string; events?: string[]; description?: string }) =>
    request<WebhookResponse>("/v1/webhooks", { method: "POST", body: JSON.stringify(data) }),

  deleteWebhook: (id: string) =>
    request<void>(`/v1/webhooks/${id}`, { method: "DELETE" }),

  check: (query: string, jurisdiction = "US", responseText?: string) =>
    request<CheckResponse>("/v1/check", {
      method: "POST",
      body: JSON.stringify({ query, jurisdiction, response_text: responseText }),
    }),

  generateReport: (period = "last_24h", limit = 100) =>
    request<ComplianceReportResponse>("/v1/reports/generate", {
      method: "POST",
      body: JSON.stringify({ period, limit }),
    }),

  incidents: (params?: { status?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return request<{ total: number; incidents: Record<string, unknown>[] }>(`/v1/incidents${q ? `?${q}` : ""}`);
  },

  getIncident: (id: string) =>
    request<Record<string, unknown>>(`/v1/incidents/${id}`),

  updateIncident: (id: string, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/v1/incidents/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  overrideIncident: (id: string, data: { reason: string; status?: string }) =>
    request<Record<string, unknown>>(`/v1/incidents/${id}/override`, { method: "POST", body: JSON.stringify(data) }),

  submitFeedback: (data: { request_id: string; feedback: string; comment?: string }) =>
    request<{ status: string }>("/v1/feedback", { method: "POST", body: JSON.stringify(data) }),

  feedbackStats: () => request<{ total: number; breakdown: Record<string, number>; false_positive_rate: number }>("/v1/feedback/stats"),

  auditVerify: () => request<{ valid: boolean; total: number; verified: number; errors: unknown[] }>("/v1/audit/verify"),

  auditExport: async (format: "json" | "csv", limit = 500, dateFrom?: string, dateTo?: string): Promise<Blob> => {
    const { baseUrl, apiKey } = getConfig();
    const params = new URLSearchParams({ format, limit: String(limit) });
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    const headers: Record<string, string> = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await fetch(`${baseUrl}/v1/audit/export?${params}`, { headers });
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.blob();
  },

  setKillSwitch: (mode: string) =>
    request<{ status: string; current_mode: string }>("/v1/admin/kill-switch", { method: "PUT", body: JSON.stringify({ mode }) }),

  getKillSwitch: () => request<{ mode: string }>("/v1/admin/kill-switch"),

  createApiKey: (role: string, label: string) =>
    request<{ status: string; api_key: string; key_prefix: string; role: string; label: string }>("/v1/admin/api-keys", {
      method: "POST",
      body: JSON.stringify({ role, label }),
    }),

  listApiKeys: () =>
    request<{ total: number; keys: Array<{ id: number; key_prefix: string; role: string; label: string; is_active: number; created_at: string; revoked_at: string | null }> }>("/v1/admin/api-keys"),

  revokeApiKey: (keyId: number) =>
    request<{ status: string; key_id: number }>(`/v1/admin/api-keys/${keyId}`, { method: "DELETE" }),

  // ── Policy Packs ───────────────────────────────────────────
  packs: () => request<PolicyPacksResponse>("/v1/policy-packs"),

  packDetail: (id: string) => request<PolicyPackDetail>(`/v1/policy-packs/${id}`),

  // ── Compliance Trend / Drift ───────────────────────────────
  complianceTrend: (days = 30) =>
    request<{ days: number; trend: TrendEntry[] }>(`/v1/analytics/trend?days=${days}`),

  complianceDrift: () => request<DriftAlert>("/v1/analytics/drift"),

  // ── Agent Traces ───────────────────────────────────────────
  traces: (limit = 20) =>
    request<{ total: number; traces: TraceSummary[] }>(`/v1/traces?limit=${limit}`),

  traceDetail: (traceId: string) =>
    request<{ trace_id: string; span_count: number; entries: TraceEntry[] }>(`/v1/traces/${traceId}`),

  // ── HITL Review Queue ──────────────────────────────────────
  reviewQueue: (limit = 50) =>
    request<{ total: number; queue: Record<string, unknown>[] }>(`/v1/incidents/queue?limit=${limit}`),

  approveIncident: (id: string) =>
    request<Record<string, unknown>>(`/v1/incidents/${id}/approve`, { method: "POST" }),

  rejectIncident: (id: string, reason = "") =>
    request<Record<string, unknown>>(`/v1/incidents/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: "POST" }),

  escalateIncident: (id: string, reason = "") =>
    request<Record<string, unknown>>(`/v1/incidents/${id}/escalate?reason=${encodeURIComponent(reason)}`, { method: "POST" }),

  // ── Report Templates ───────────────────────────────────────
  reportTemplates: () =>
    request<{ total: number; templates: ReportTemplate[] }>("/v1/reports/templates"),
};

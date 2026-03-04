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
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
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
};

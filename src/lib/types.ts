export interface RuleSummary {
  id: string;
  jurisdiction: string;
  regulation: string;
  article: string;
  title: string;
  risk_category: string;
  action: string;
  severity: number;
}

export interface RuleDetail extends RuleSummary {
  triggers: string[];
  conditions: string;
  obligation: string;
  full_text: string;
}

export interface RulesListResponse {
  total: number;
  jurisdiction_filter: string | null;
  rules: RuleSummary[];
}

export interface PIIItem {
  type: string;
  masked_value: string;
  position: number[];
}

export interface MatchedRule {
  id: string;
  jurisdiction: string;
  regulation: string;
  article: string;
  title: string;
  risk_category: string;
  action: string;
  severity: number;
  relevance_score: number;
  matched_triggers: string[];
}

export interface LayerTiming {
  layer1_ms: number;
  layer2_ms: number;
  layer3_ms: number;
  total_ms: number;
}

export interface AIJudgeResponse {
  intent: string;
  score: number;
  action: string;
  reasoning: string;
  matched_regulations: string[];
  model: string;
  latency_ms: number;
  is_mock: boolean;
}

export interface OutputScanResult {
  action: string;
  risk_level: string;
  risk_score: number;
  pii_detected: boolean;
  pii_items: PIIItem[];
  rules_matched: number;
  matched_rules: MatchedRule[];
  recommendations: string[];
  timing_ms: number;
}

export interface CheckResponse {
  request_id: string;
  timestamp: string;
  action: string;
  risk_level: string;
  risk_score: number;
  jurisdiction: string;
  pii_detected: boolean;
  pii_items: PIIItem[];
  rules_matched: number;
  matched_rules: MatchedRule[];
  recommendations: string[];
  cited_regulations: string[];
  timing: LayerTiming;
  audit_id: string;
  path: string;
  intent: string;
  retrieval_method: string;
  ai_judge: AIJudgeResponse | null;
  output_scan: OutputScanResult | null;
}

export interface AuditEntry {
  timestamp: string;
  request_id: string;
  query_hash: string;
  jurisdiction: string;
  action: string;
  risk_level: string;
  rules_triggered: number;
  pii_types: string[];
  latency_ms: number;
}

export interface AuditListResponse {
  total: number;
  entries: AuditEntry[];
}

export interface ActionDistribution {
  PASS: number;
  FLAG: number;
  BLOCK: number;
  WARN: number;
}

export interface AnalyticsResponse {
  total_checks: number;
  action_distribution: ActionDistribution;
  risk_distribution: Record<string, number>;
  top_triggered_rules: { rule_id: string; count: number }[];
  pii_type_distribution: Record<string, number>;
  daily_volume: { date: string; count: number }[];
}

export interface PolicyResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  triggers: string[];
  conditions: string;
  action: string;
  severity: number;
  response_message: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  denied_resource_tags: string[];
  allowed_agent_roles: string[];
  scope_type: string;
  scope_values: string[];
}

export interface PolicyListResponse {
  total: number;
  policies: PolicyResponse[];
}

export interface WebhookResponse {
  id: string;
  url: string;
  events: string[];
  description: string;
  active: boolean;
  created_at: string;
}

export interface WebhookListResponse {
  total: number;
  webhooks: WebhookResponse[];
}

export interface ComplianceReportResponse {
  report_id: string;
  generated_at: string;
  period: string;
  total_checks: number;
  action_summary: ActionDistribution;
  risk_summary: Record<string, number>;
  violations: Record<string, unknown>[];
  pii_summary: Record<string, number>;
  recommendations: string[];
  compliance_score: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  engine: {
    total_rules: number;
    rules_by_jurisdiction: Record<string, number>;
    custom_policies: number;
    custom_policies_active: number;
    pii_patterns: number;
    blocklist_rules: number;
    audit_entries: number;
    ai_judge_available: boolean;
    retrieval_method: string;
    cache_size: number;
  };
}

// ── Policy Packs ─────────────────────────────────────────────
export interface PolicyPack {
  id: string;
  name: string;
  description: string;
  jurisdiction: string;
  regulations: string[];
  industries: string[];
  rule_count: number;
}

export interface PolicyPacksResponse {
  total: number;
  packs: PolicyPack[];
}

export interface PolicyPackDetail extends PolicyPack {
  rule_prefixes: string[];
  rule_ids: string[];
  rule_ids_truncated: boolean;
  total_rule_ids: number;
}

// ── Compliance Trend / Drift ─────────────────────────────────
export interface TrendEntry {
  date: string;
  total: number;
  pass_count: number;
  flag_count: number;
  block_count: number;
  warn_count: number;
  compliance_rate: number;
  pii_detected_count: number;
}

export interface DriftAlert {
  is_drifting: boolean;
  baseline_compliance_rate: number;
  recent_compliance_rate: number;
  drift_percentage: number;
  direction: "improving" | "degrading" | "stable";
  baseline_period_days: number;
  recent_period_days: number;
  baseline_checks: number;
  recent_checks: number;
  threshold: number;
}

// ── Agent Traces ─────────────────────────────────────────────
export interface TraceSummary {
  trace_id: string;
  span_count: number;
  started_at: string;
  ended_at: string;
  worst_action: string;
  actions: string;
}

export interface TraceEntry {
  request_id: string;
  timestamp: string;
  trace_id: string;
  span_name: string;
  parent_span_id: string;
  action: string;
  risk_level: string;
  latency_ms: number;
  jurisdiction: string;
}

// ── Report Templates ─────────────────────────────────────────
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  required_pack: string;
}

// ── Usage & Quota ─────────────────────────────────────────────
export interface UsageInfo {
  tier: string;
  monthly_limit: number;
  daily_limit: number;
  llm_monthly_limit: number;
  monthly_used: number;
  daily_used: number;
  llm_monthly_used: number;
  monthly_remaining: number;
  daily_remaining: number;
  period: string;
  policies_used?: number;
  policies_limit?: number;
  webhooks_used?: number;
  webhooks_limit?: number;
}

export interface UsageHistoryEntry {
  date: string;
  calls: number;
  llm_calls: number;
}

// ── BYOK ─────────────────────────────────────────────────────
export interface LLMKeyInfo {
  provider: string;
  model_override: string;
  created_at: string;
  updated_at: string;
}

// ── Notifications ─────────────────────────────────────────────
export interface Notification {
  id: string;
  api_key_hash: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

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
export interface ProgramContext {
  name: string;
  tier: string;
  expires_at?: string;
  days_remaining?: number;
  months_remaining?: number;
  features?: string[];
}

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
  program?: ProgramContext;
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

// ── Founder Program Applicants ─────────────────────────────────
export interface Applicant {
  id: number;
  tally_response_id: string;
  company: string;
  website: string;
  founder_name: string;
  email: string;
  country: string;
  product_description: string;
  ai_is_core: number;
  team_size: string;
  funding: string;
  revenue_status: string;
  vertical: string;
  target_market: string;
  accelerator: string;
  use_case_type: string;
  status: string;
  admin_notes: string;
  priority_tier: string;
  issued_key_prefix: string;
  issued_key_hash: string;
  issued_at: string | null;
  activated_at: string | null;
  first_usage_at: string | null;
  last_active_at: string | null;
  usage_total: number;
  created_at: string;
  updated_at: string;
}

export interface ApplicantListResponse {
  total: number;
  applicants: Applicant[];
}

export interface CohortAnalytics {
  total_applicants: number;
  by_status: Record<string, number>;
  accepted: number;
  activated: number;
  active_7d: number;
  dormant_30d: number;
  top_usage: Array<{
    id: number;
    company: string;
    founder_name: string;
    email: string;
    usage_total: number;
    last_active_at: string | null;
  }>;
  by_country: Record<string, number>;
  by_vertical: Record<string, number>;
  expiring_soon: Array<{
    id: number;
    company: string;
    founder_name: string;
    email: string;
    issued_at: string;
  }>;
  funnel: {
    applied: number;
    accepted: number;
    activated: number;
    active_7d: number;
  };
}

export interface AcceptResponse {
  status: string;
  id: number;
  api_key: string;
  key_prefix: string;
  expires_at: string;
  email_sent: boolean;
  warning: string;
}

// ── Testimonials ──────────────────────────────────────────────
export interface Testimonial {
  id: number;
  api_key_hash: string;
  company: string;
  founder_name: string;
  email: string;
  what_helped: string;
  use_case: string;
  would_recommend: number;
  allow_case_study: number;
  allow_logo_use: number;
  nps_score: number;
  additional_comments: string;
  created_at: string;
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

// ── System Status ─────────────────────────────────────────────
export interface SystemStatus {
  status: string;
  version: string;
  uptime_seconds: number;
  components: Record<string, string>;
  timestamp: string;
}

// ── IP Allowlist ──────────────────────────────────────────────
export interface IPAllowlistEntry {
  id: number;
  key_hash: string;
  cidr: string;
  label: string;
  created_at: string;
}

// ── Webhook Delivery Log ──────────────────────────────────────
export interface WebhookDelivery {
  id: number;
  webhook_id: string;
  event: string;
  status_code: number | null;
  attempt: number;
  success: number;
  error: string;
  response_ms: number;
  created_at: string;
}

// ── Organization / Team ───────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_email: string;
  created_at: string;
  member_count: number;
}

export interface OrgMember {
  id: number;
  org_id: string;
  email: string;
  role: string;
  invited_by: string;
  joined_at: string | null;
  status: string;
}

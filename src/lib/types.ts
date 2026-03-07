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

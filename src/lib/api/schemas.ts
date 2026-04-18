import { z } from "zod";

// Runtime-validated, TS-inferred mirror of the API contract. Keep this file
// small: mirror ONLY the fields the Dashboard actually consumes. Adding a new
// field must be an explicit, reviewed change — copying the entire API Pydantic
// surface defeats the point of this module.

export const PlanSchema = z.enum(["trial", "basic", "team", "enterprise"]);
export type Plan = z.infer<typeof PlanSchema>;

export const SubscriptionStatusSchema = z.enum([
  "active",
  "trial",
  "trial_expired",
  "past_due",
  "canceled",
  "incomplete",
  "unpaid",
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

export const FeatureKeySchema = z.enum([
  "creator_mode",
  "receipt_export",
  "receipt_export_pdf",
  "team_receipt_library",
  "advanced_checks",
  "seat_extra",
]);
export type FeatureKey = z.infer<typeof FeatureKeySchema>;

export const CapStatusSchema = z.object({
  reached: z.boolean(),
  plan: z.string(),
  cap: z.number().int(),
  usage: z.number().int(),
});
export type CapStatus = z.infer<typeof CapStatusSchema>;

export const EntitlementSchema = z.object({
  plan: PlanSchema,
  status: SubscriptionStatusSchema,
  request_cap_monthly: z.number().int(),
  usage_this_month: z.number().int().default(0),
  seats_total: z.number().int().default(1),
  seats_used: z.number().int().default(1),
  features: z.array(z.string()),
  cap_status: CapStatusSchema,
  upgrade_url: z.string().url().nullable().optional(),
  retention_days: z.number().int().default(30),
  team_id: z.string().optional().nullable(),
});
export type Entitlement = z.infer<typeof EntitlementSchema>;

export const SafetyStatusSchema = z.enum(["clear", "warn", "block"]);
export type SafetyStatus = z.infer<typeof SafetyStatusSchema>;

export const ReceiptSummarySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  safety_status: SafetyStatusSchema,
  action_type: z.string(),
  target_venues: z.array(z.string()).default([]),
  user_id: z.string().optional().nullable(),
  team_id: z.string().optional().nullable(),
  summary: z
    .object({
      j1_flags: z.number().int().default(0),
      j2_flags: z.number().int().default(0),
      j3_flags: z.number().int().default(0),
    })
    .optional(),
});
export type ReceiptSummary = z.infer<typeof ReceiptSummarySchema>;

export const ReceiptListSchema = z.object({
  items: z.array(ReceiptSummarySchema),
  next_cursor: z.string().nullable().optional(),
  total: z.number().int().optional(),
});
export type ReceiptList = z.infer<typeof ReceiptListSchema>;

export const ReceiptEventSchema = z.object({
  seq: z.number().int(),
  kind: z.string(),
  ts: z.string(),
  prev_hash: z.string().nullable().optional(),
  this_hash: z.string(),
  payload: z.unknown().optional(),
});
export type ReceiptEvent = z.infer<typeof ReceiptEventSchema>;

export const ReceiptDetailSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
  safety_status: SafetyStatusSchema,
  action_type: z.string(),
  target_venues: z.array(z.string()).default([]),
  jurisdictions: z.array(z.string()).default([]),
  user_id: z.string().optional().nullable(),
  team_id: z.string().optional().nullable(),
  chain_head: z.string(),
  chain_verified: z.boolean().default(false),
  events: z.array(ReceiptEventSchema),
  summary: z.object({
    j1_flags: z.number().int().default(0),
    j2_flags: z.number().int().default(0),
    j3_flags: z.number().int().default(0),
    j1: z.array(z.unknown()).default([]),
    j2: z.array(z.unknown()).default([]),
    j3: z.array(z.unknown()).default([]),
  }),
  disclaimer: z.string(),
});
export type ReceiptDetail = z.infer<typeof ReceiptDetailSchema>;

export const BillingPortalResponseSchema = z.object({
  url: z.string().url(),
});
export type BillingPortalResponse = z.infer<typeof BillingPortalResponseSchema>;

export const ApiKeyRotateResponseSchema = z.object({
  api_key: z.string(),
  key_prefix: z.string().optional(),
  created_at: z.string().optional(),
});
export type ApiKeyRotateResponse = z.infer<typeof ApiKeyRotateResponseSchema>;

export const TeamAdminRowSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  plan: PlanSchema,
  status: SubscriptionStatusSchema,
  seats_total: z.number().int(),
  seats_used: z.number().int(),
  mrr_usd: z.number().optional().nullable(),
  created_at: z.string().optional().nullable(),
});
export type TeamAdminRow = z.infer<typeof TeamAdminRowSchema>;

export const TeamMemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["owner", "admin", "member"]),
  status: z.enum(["active", "invited", "suspended"]).default("active"),
  invited_at: z.string().optional().nullable(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const ApiErrorShapeSchema = z.object({
  detail: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  code: z.string().optional(),
  message: z.string().optional(),
  upgrade_url: z.string().optional(),
  feature: z.string().optional(),
});
export type ApiErrorShape = z.infer<typeof ApiErrorShapeSchema>;

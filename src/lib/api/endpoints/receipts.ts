import { apiFetch, fetchJson, type ApiClientContext } from "../client";
import {
  ReceiptDetailSchema,
  ReceiptListSchema,
  type ReceiptDetail,
  type ReceiptList,
} from "../schemas";

export type ReceiptListQuery = {
  teamId?: string;
  status?: "clear" | "warn" | "block";
  from?: string;
  to?: string;
  targetVenues?: string[];
  actionType?: string;
  limit?: number;
  cursor?: string;
};

export function buildReceiptQueryString(q: ReceiptListQuery = {}): string {
  const params = new URLSearchParams();
  if (q.teamId) params.set("team_id", q.teamId);
  if (q.status) params.set("status", q.status);
  if (q.from) params.set("from", q.from);
  if (q.to) params.set("to", q.to);
  if (q.actionType) params.set("action_type", q.actionType);
  if (q.limit) params.set("limit", String(q.limit));
  if (q.cursor) params.set("cursor", q.cursor);
  if (q.targetVenues && q.targetVenues.length > 0) {
    for (const v of q.targetVenues) params.append("target_venues", v);
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function listReceipts(
  q: ReceiptListQuery = {},
  ctx: ApiClientContext = {},
): Promise<ReceiptList> {
  const path = `/v1/creator-check/receipts${buildReceiptQueryString(q)}`;
  return fetchJson(path, ReceiptListSchema, { method: "GET" }, ctx);
}

export async function getReceipt(
  id: string,
  ctx: ApiClientContext = {},
): Promise<ReceiptDetail> {
  return fetchJson(
    `/v1/creator-check/receipts/${encodeURIComponent(id)}`,
    ReceiptDetailSchema,
    { method: "GET" },
    ctx,
  );
}

// Export endpoint. Returns the raw Response so server routes can stream bytes
// through to the browser (PDFs, signed JSON bundles) without buffering.
export async function exportReceipt(
  id: string,
  fmt: "json" | "pdf",
  ctx: ApiClientContext = {},
): Promise<Response> {
  const path = `/v1/creator-check/receipts/${encodeURIComponent(id)}/export?fmt=${fmt}`;
  return apiFetch(path, { method: "GET" }, ctx);
}

import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  buildReceiptQueryString,
  getReceipt,
  listReceipts,
} from "./receipts";
import type { ReceiptDetail, ReceiptList } from "../schemas";
import { NotFoundError } from "../errors";

const listSample: ReceiptList = {
  items: [
    {
      id: "rcpt_1",
      created_at: "2026-04-18T12:00:00Z",
      safety_status: "warn",
      action_type: "publish",
      target_venues: ["youtube"],
    },
  ],
  next_cursor: "next-1",
};

const detailSample: ReceiptDetail = {
  id: "rcpt_1",
  created_at: "2026-04-18T12:00:00Z",
  safety_status: "warn",
  action_type: "publish",
  target_venues: ["youtube"],
  jurisdictions: ["US"],
  chain_head: "h0",
  chain_verified: true,
  events: [
    { seq: 1, kind: "check", ts: "2026-04-18T12:00:00Z", this_hash: "h1" },
  ],
  summary: { j1_flags: 0, j2_flags: 0, j3_flags: 0, j1: [], j2: [], j3: [] },
  disclaimer: "Not legal advice.",
};

const server = setupServer(
  http.get("http://api.test/v1/creator-check/receipts", ({ request }) => {
    const url = new URL(request.url);
    expect(url.searchParams.get("status")).toBe("warn");
    return HttpResponse.json(listSample);
  }),
  http.get("http://api.test/v1/creator-check/receipts/rcpt_1", () =>
    HttpResponse.json(detailSample),
  ),
  http.get("http://api.test/v1/creator-check/receipts/missing", () =>
    HttpResponse.json({ detail: "not found" }, { status: 404 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("receipts endpoints", () => {
  it("buildReceiptQueryString encodes filters", () => {
    const qs = buildReceiptQueryString({
      status: "warn",
      teamId: "team_1",
      targetVenues: ["youtube", "linkedin"],
      limit: 25,
    });
    expect(qs).toContain("status=warn");
    expect(qs).toContain("team_id=team_1");
    expect(qs).toContain("target_venues=youtube");
    expect(qs).toContain("target_venues=linkedin");
    expect(qs).toContain("limit=25");
  });

  it("listReceipts parses a list", async () => {
    const res = await listReceipts(
      { status: "warn" },
      { baseUrl: "http://api.test", getToken: async () => "jwt" },
    );
    expect(res.items).toHaveLength(1);
    expect(res.next_cursor).toBe("next-1");
  });

  it("getReceipt parses detail", async () => {
    const r = await getReceipt("rcpt_1", {
      baseUrl: "http://api.test",
      getToken: async () => "jwt",
    });
    expect(r.chain_verified).toBe(true);
    expect(r.events).toHaveLength(1);
  });

  it("getReceipt(missing) surfaces NotFoundError", async () => {
    await expect(
      getReceipt("missing", {
        baseUrl: "http://api.test",
        getToken: async () => "jwt",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

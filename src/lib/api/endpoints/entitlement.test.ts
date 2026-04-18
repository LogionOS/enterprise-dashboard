import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { getEntitlement } from "./entitlement";
import type { Entitlement } from "../schemas";
import { ApiError } from "../errors";

const sample: Entitlement = {
  plan: "basic",
  status: "active",
  request_cap_monthly: 2000,
  usage_this_month: 123,
  seats_total: 1,
  seats_used: 1,
  features: ["creator_mode", "receipt_export"],
  cap_status: { reached: false, plan: "basic", cap: 2000, usage: 123 },
  upgrade_url: "https://billing.test/portal",
  retention_days: 30,
};

const server = setupServer(
  http.get("http://api.test/v1/entitlement", ({ request }) => {
    if (request.headers.get("authorization") !== "Bearer jwt-abc") {
      return HttpResponse.json({ detail: "unauth" }, { status: 401 });
    }
    return HttpResponse.json(sample);
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("getEntitlement", () => {
  it("returns parsed entitlement when authorized", async () => {
    const ent = await getEntitlement({
      baseUrl: "http://api.test",
      getToken: async () => "jwt-abc",
    });
    expect(ent.plan).toBe("basic");
    expect(ent.features).toContain("creator_mode");
  });

  it("rejects a malformed shape as ApiError", async () => {
    server.use(
      http.get("http://api.test/v1/entitlement", () =>
        HttpResponse.json({ plan: "nonsense" }),
      ),
    );
    await expect(
      getEntitlement({
        baseUrl: "http://api.test",
        getToken: async () => "jwt-abc",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { __setServerAuthImplForTests } from "@/lib/auth/server";
import { POST } from "./route";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  process.env.NEXT_PUBLIC_LOGIONOS_API_BASE = "http://api.test";
  process.env.NEXT_PUBLIC_DASHBOARD_BASE = "http://dashboard.test";
});

function makeReq(body: unknown) {
  return new Request("http://dashboard.test/api/billing/portal-link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/billing/portal-link", () => {
  it("returns 401 when the caller is signed out", async () => {
    __setServerAuthImplForTests({ getServerAuth: async () => null });
    const res = await POST(makeReq({}));
    expect(res.status).toBe(401);
    __setServerAuthImplForTests(null);
  });

  it("proxies to /v1/billing/portal and returns the url", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => ({
        userId: "u_1",
        getToken: async () => "jwt-abc",
      }),
    });
    server.use(
      http.post("http://api.test/v1/billing/portal", async ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer jwt-abc");
        const payload = (await request.json()) as { return_url: string; team_id?: string };
        expect(payload.return_url).toBe("http://dashboard.test/me/billing");
        return HttpResponse.json({ url: "https://stripe.test/session/abc" });
      }),
    );
    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string };
    expect(body.url).toBe("https://stripe.test/session/abc");
    __setServerAuthImplForTests(null);
  });

  it("forwards API errors cleanly", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => ({
        userId: "u_1",
        getToken: async () => "jwt-abc",
      }),
    });
    server.use(
      http.post("http://api.test/v1/billing/portal", () =>
        HttpResponse.json({ detail: "no active subscription" }, { status: 403 }),
      ),
    );
    const res = await POST(makeReq({ teamId: "team_1" }));
    expect(res.status).toBe(403);
    const body = (await res.json()) as { detail: string };
    expect(body.detail).toContain("no active subscription");
    __setServerAuthImplForTests(null);
  });
});

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { __setServerAuthImplForTests } from "@/lib/auth/server";
import { GET } from "./route";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  process.env.NEXT_PUBLIC_LOGIONOS_API_BASE = "http://api.test";
});

function makeReq(id: string, fmt?: string) {
  const q = fmt ? `?fmt=${fmt}` : "";
  return new Request(`http://dashboard.test/api/receipts/${id}/export${q}`);
}
function paramsOf(id: string) {
  return { params: Promise.resolve({ id }) };
}

const signedIn = {
  getServerAuth: async () => ({
    userId: "u_1",
    getToken: async () => "jwt-t",
  }),
};

describe("GET /api/receipts/:id/export", () => {
  it("returns 401 when signed out", async () => {
    __setServerAuthImplForTests({ getServerAuth: async () => null });
    const res = await GET(makeReq("r1", "pdf"), paramsOf("r1"));
    expect(res.status).toBe(401);
    __setServerAuthImplForTests(null);
  });

  it("streams the PDF bytes back to the caller", async () => {
    __setServerAuthImplForTests(signedIn);
    server.use(
      http.get(
        "http://api.test/v1/creator-check/receipts/r_abc/export",
        ({ request }) => {
          expect(new URL(request.url).searchParams.get("fmt")).toBe("pdf");
          expect(request.headers.get("authorization")).toBe("Bearer jwt-t");
          return new HttpResponse(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52]), {
            status: 200,
            headers: {
              "content-type": "application/pdf",
              "content-disposition": 'attachment; filename="receipt-r_abc.pdf"',
            },
          });
        },
      ),
    );
    const res = await GET(makeReq("r_abc", "pdf"), paramsOf("r_abc"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("receipt-r_abc.pdf");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(bytes.slice(0, 4)).toEqual(new Uint8Array([37, 80, 68, 70]));
    __setServerAuthImplForTests(null);
  });

  it("forwards a 402 feature-gated error with the upgrade payload", async () => {
    __setServerAuthImplForTests(signedIn);
    server.use(
      http.get(
        "http://api.test/v1/creator-check/receipts/r_x/export",
        () =>
          HttpResponse.json(
            {
              detail: "PDF export requires the Team plan",
              feature: "receipt_export_pdf",
              upgrade_url: "https://billing.test/upgrade",
            },
            { status: 402 },
          ),
      ),
    );
    const res = await GET(makeReq("r_x", "pdf"), paramsOf("r_x"));
    expect(res.status).toBe(402);
    const body = (await res.json()) as { feature?: string; upgrade_url?: string };
    expect(body.feature).toBe("receipt_export_pdf");
    expect(body.upgrade_url).toContain("billing.test");
    __setServerAuthImplForTests(null);
  });

  it("forwards a 403 RBAC error cleanly", async () => {
    __setServerAuthImplForTests(signedIn);
    server.use(
      http.get(
        "http://api.test/v1/creator-check/receipts/r_y/export",
        () => HttpResponse.json({ detail: "not your receipt" }, { status: 403 }),
      ),
    );
    const res = await GET(makeReq("r_y", "pdf"), paramsOf("r_y"));
    expect(res.status).toBe(403);
    __setServerAuthImplForTests(null);
  });
});

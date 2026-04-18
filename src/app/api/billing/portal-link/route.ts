import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerAuth } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/api/endpoints/billing";
import { serverApiCtx } from "@/lib/api/server";
import { AuthError, ApiError } from "@/lib/api/errors";

const BodySchema = z.object({
  teamId: z.string().optional(),
  returnUrl: z.string().url().optional(),
});

// Proxy to POST /v1/billing/portal. The Dashboard is the ONLY client that
// knows how to talk to Stripe Billing Portal (via the API); feature pages
// just open the URL returned here in a new tab.
export async function POST(req: Request) {
  try {
    await requireServerAuth();
    const body = (await req.json().catch(() => ({}))) as unknown;
    const parsed = BodySchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { detail: "Invalid portal request" },
        { status: 400 },
      );
    }
    const base =
      process.env.NEXT_PUBLIC_DASHBOARD_BASE ||
      new URL(req.url).origin;
    const returnUrl =
      parsed.data.returnUrl || `${base.replace(/\/$/, "")}/me/billing`;
    const out = await createBillingPortalSession(
      { returnUrl, teamId: parsed.data.teamId },
      serverApiCtx(),
    );
    return NextResponse.json({ url: out.url });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ detail: err.message }, { status: 401 });
    }
    if (err instanceof ApiError) {
      return NextResponse.json(
        { detail: err.message, code: err.code },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Portal failed" },
      { status: 500 },
    );
  }
}

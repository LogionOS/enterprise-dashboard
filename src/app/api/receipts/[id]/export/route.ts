import { NextResponse } from "next/server";
import { requireServerAuth } from "@/lib/auth";
import { exportReceipt } from "@/lib/api/endpoints/receipts";
import { serverApiCtx } from "@/lib/api/server";
import {
  AuthError,
  ApiError,
  FeatureGatedError,
} from "@/lib/api/errors";

// Streams the exported receipt (PDF or JSON bundle) from LogionOS-API to
// the caller. This is the only place in the Dashboard that knows how to
// talk to `/v1/creator-check/receipts/:id/export` -- feature pages just
// hit this route. Plan gating is enforced upstream (API returns 402); we
// simply forward the status so the UI disables the button.

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireServerAuth();
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const fmt = url.searchParams.get("fmt") === "json" ? "json" : "pdf";

    const upstream = await exportReceipt(id, fmt, serverApiCtx());
    const contentType =
      upstream.headers.get("content-type") ??
      (fmt === "pdf" ? "application/pdf" : "application/json");
    const disposition =
      upstream.headers.get("content-disposition") ??
      `attachment; filename="receipt-${id}.${fmt}"`;

    const body = upstream.body;
    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        "content-disposition": disposition,
        "cache-control": "private, no-store",
      },
    });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ detail: err.message }, { status: 401 });
    }
    if (err instanceof FeatureGatedError) {
      return NextResponse.json(
        {
          detail: err.message,
          code: err.code ?? "feature_gated",
          feature: err.feature,
          upgrade_url: err.upgradeUrl,
        },
        { status: 402 },
      );
    }
    if (err instanceof ApiError) {
      return NextResponse.json(
        { detail: err.message, code: err.code },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}

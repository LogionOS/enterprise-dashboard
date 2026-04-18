import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireServerAuth } from "@/lib/auth";
import { rotateMyApiKey } from "@/lib/api/endpoints/apiKeys";
import { serverApiCtx } from "@/lib/api/server";
import { ApiError, AuthError } from "@/lib/api/errors";

export const PROVISIONED_COOKIE = "logionos_apikey_provisioned";

// Dashboard-side proxy for POST /v1/me/api-keys/rotate. Keeps the LogionOS-API
// JWT server-side and drops a best-effort "provisioned" cookie so /me/extension
// can distinguish a first visit (auto-reveal) from a return visit (rotate to
// view again). The source of truth for whether a key exists is LogionOS-API --
// the cookie only controls UI affordances.

export async function POST() {
  try {
    await requireServerAuth();
    const result = await rotateMyApiKey(serverApiCtx());

    const jar = await cookies();
    jar.set(PROVISIONED_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json(
      {
        api_key: result.api_key,
        key_prefix: result.key_prefix,
        created_at: result.created_at,
      },
      {
        status: 200,
        headers: { "cache-control": "private, no-store" },
      },
    );
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
      { detail: err instanceof Error ? err.message : "Rotate failed" },
      { status: 500 },
    );
  }
}

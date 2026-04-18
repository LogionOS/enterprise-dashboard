import { NextResponse } from "next/server";
import { requireServerAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api/client";
import { serverApiCtx, withExtraHeaders } from "@/lib/api/server";
import { AuthError, ApiError } from "@/lib/api/errors";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    await requireServerAuth();
    const { id: teamId, memberId } = await ctx.params;
    const adminKey = process.env.LOGIONOS_ADMIN_KEY;
    if (!adminKey) {
      return NextResponse.json(
        { detail: "LOGIONOS_ADMIN_KEY is not configured" },
        { status: 501 },
      );
    }
    await apiFetch(
      `/v1/admin/team-members/${encodeURIComponent(memberId)}?team_id=${encodeURIComponent(teamId)}`,
      { method: "DELETE" },
      withExtraHeaders(serverApiCtx(), { "X-Admin-Key": adminKey }),
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof AuthError) {
      return NextResponse.json({ detail: err.message }, { status: 401 });
    }
    if (err instanceof ApiError) {
      return NextResponse.json(
        { detail: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Remove failed" },
      { status: 500 },
    );
  }
}

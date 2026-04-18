import { NextResponse } from "next/server";
import { z } from "zod";
import { requireServerAuth, getServerToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api/client";
import { AuthError, ApiError } from "@/lib/api/errors";

const BodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "admin"]).default("member"),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireServerAuth();
    const { id: teamId } = await ctx.params;
    const json = (await req.json().catch(() => null)) as unknown;
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { detail: "Invalid invite payload" },
        { status: 400 },
      );
    }
    const { email, role } = parsed.data;

    // (a) Ask Clerk to send a magic-link invite to this email.
    await sendClerkInvite(email);

    // (b) Mirror the invite in the LogionOS-API. The admin key makes this a
    // server-to-server call; the Clerk JWT identifies the inviter.
    const adminKey = process.env.LOGIONOS_ADMIN_KEY;
    if (!adminKey) {
      return NextResponse.json(
        {
          detail:
            "LOGIONOS_ADMIN_KEY is not configured; the invite was created in Clerk only.",
        },
        { status: 202 },
      );
    }
    await apiFetch(
      "/v1/admin/team-members",
      {
        method: "POST",
        body: JSON.stringify({ team_id: teamId, email, role }),
      },
      {
        getToken: () => getServerToken(),
        extraHeaders: { "X-Admin-Key": adminKey },
      },
    );

    return NextResponse.json({ ok: true });
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
      { detail: err instanceof Error ? err.message : "Invite failed" },
      { status: 500 },
    );
  }
}

async function sendClerkInvite(email: string): Promise<void> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error("CLERK_SECRET_KEY missing");
  const res = await fetch("https://api.clerk.com/v1/invitations", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email_address: email }),
  });
  if (!res.ok && res.status !== 422) {
    // 422 = already invited; treat as soft-success so the API-side mirror
    // still runs.
    const body = await res.text().catch(() => "");
    throw new Error(`Clerk invite failed: ${res.status} ${body}`);
  }
}

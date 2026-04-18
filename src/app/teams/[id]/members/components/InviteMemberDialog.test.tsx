import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InviteMemberDialog } from "./InviteMemberDialog";

describe("InviteMemberDialog", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ) as typeof fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects an invalid email before calling the API", async () => {
    const onClose = vi.fn();
    render(
      <InviteMemberDialog open onClose={onClose} teamId="team_1" />,
    );
    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /send invite/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("POSTs a well-formed invite to /api/teams/:id/invites", async () => {
    const onClose = vi.fn();
    const onInvited = vi.fn();
    render(
      <InviteMemberDialog
        open
        onClose={onClose}
        teamId="team_1"
        onInvited={onInvited}
      />,
    );
    await userEvent.type(
      screen.getByLabelText(/email/i),
      "teammate@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: /send invite/i }));
    const fetchSpy = global.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/teams/team_1/invites");
    const payload = JSON.parse(String(init.body)) as { email: string; role: string };
    expect(payload.email).toBe("teammate@example.com");
    expect(payload.role).toBe("member");
    expect(onInvited).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("surfaces API errors in an alert", async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ detail: "already invited" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    ) as typeof fetch;
    const onClose = vi.fn();
    render(
      <InviteMemberDialog open onClose={onClose} teamId="team_1" />,
    );
    await userEvent.type(
      screen.getByLabelText(/email/i),
      "dup@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: /send invite/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/already invited/);
    expect(onClose).not.toHaveBeenCalled();
  });
});

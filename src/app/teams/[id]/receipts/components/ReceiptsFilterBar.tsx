"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui";

// Client-side filter bar for the receipt library. State is serialized into
// the URL search params so every filter change is a real navigation and the
// server component re-fetches the receipts page. We do NOT build a client-
// side fetch here; that keeps receipts on one data path (server -> API).

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Any result" },
  { value: "clear", label: "Clear" },
  { value: "warn", label: "Warn" },
  { value: "block", label: "Block" },
];

export function ReceiptsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const [status, setStatus] = React.useState(search.get("status") ?? "");
  const [from, setFrom] = React.useState(search.get("from") ?? "");
  const [to, setTo] = React.useState(search.get("to") ?? "");
  const [action, setAction] = React.useState(search.get("action_type") ?? "");
  const [venues, setVenues] = React.useState(
    (search.getAll("target_venues") ?? []).join(","),
  );

  function apply(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (action) params.set("action_type", action);
    const venueList = venues
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const v of venueList) params.append("target_venues", v);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function reset() {
    setStatus("");
    setFrom("");
    setTo("");
    setAction("");
    setVenues("");
    router.push(pathname);
  }

  return (
    <form
      onSubmit={apply}
      className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 md:grid-cols-5"
      aria-label="Receipt filters"
    >
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Result
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        From
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        To
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Action
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="e.g. post"
          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Venues (comma-separated)
        <input
          type="text"
          value={venues}
          onChange={(e) => setVenues(e.target.value)}
          placeholder="twitter, youtube"
          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
        />
      </label>
      <div className="flex items-end gap-2 md:col-span-5">
        <Button type="submit">Apply</Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  );
}

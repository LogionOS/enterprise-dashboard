"use client";

import * as React from "react";
import { Button } from "@/components/ui";

const VENUES = ["youtube", "linkedin", "tiktok", "instagram", "x", "blog"];
const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo"];

export function SettingsForm({ teamId }: { teamId: string }) {
  const [name, setName] = React.useState("");
  const [venues, setVenues] = React.useState<string[]>(["youtube"]);
  const [timezone, setTimezone] = React.useState("UTC");
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO(api-teams-settings): POST to the settings endpoint once the API
    // exposes it. Today this is local-only; we reflect a success toast so
    // owners can preview their chosen values.
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 space-y-3"
      data-team-id={teamId}
    >
      <label className="block">
        <span className="text-xs font-medium text-zinc-400">Team name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Creators"
          className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
        />
      </label>
      <fieldset>
        <legend className="text-xs font-medium text-zinc-400">Default target venues</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {VENUES.map((v) => {
            const checked = venues.includes(v);
            return (
              <label
                key={v}
                className={[
                  "cursor-pointer rounded-md border px-2.5 py-1 text-xs",
                  checked
                    ? "border-indigo-700 bg-indigo-950/40 text-indigo-200"
                    : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={(e) =>
                    setVenues((prev) =>
                      e.target.checked ? [...prev, v] : prev.filter((x) => x !== v),
                    )
                  }
                />
                {v}
              </label>
            );
          })}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-xs font-medium text-zinc-400">Timezone</span>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
        >
          {TIMEZONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-zinc-500">
          {submitted ? "Preview saved locally (not yet persisted)" : " "}
        </div>
        <Button type="submit">Save (preview)</Button>
      </div>
    </form>
  );
}

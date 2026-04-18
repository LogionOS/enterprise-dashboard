import * as React from "react";
import Link from "next/link";

export type Breadcrumb = {
  label: React.ReactNode;
  href?: string;
};

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  children: React.ReactNode;
};

// A consistent page frame used by every feature folder under /teams and /me.
// Pages render `<DashboardShell title=... breadcrumbs=...>{body}</DashboardShell>`
// instead of each page inventing its own heading layout.

export function DashboardShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((b, idx) => {
              const last = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="flex items-center gap-1.5">
                  {b.href && !last ? (
                    <Link
                      href={b.href}
                      className="hover:text-zinc-200"
                    >
                      {b.label}
                    </Link>
                  ) : (
                    <span className={last ? "text-zinc-200" : ""}>{b.label}</span>
                  )}
                  {!last ? <span aria-hidden>/</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </header>
      <div>{children}</div>
    </div>
  );
}

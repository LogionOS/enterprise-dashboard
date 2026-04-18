import * as React from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-12 text-center">
      {icon ? <div className="text-zinc-500">{icon}</div> : null}
      <div>
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        {description ? (
          <div className="mt-1 text-xs text-zinc-400">{description}</div>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

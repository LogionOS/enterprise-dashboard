import * as React from "react";

type Variant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

const variantClass: Record<Variant, string> = {
  neutral: "bg-zinc-800 text-zinc-200 border-zinc-700",
  info: "bg-sky-900/40 text-sky-200 border-sky-800",
  success: "bg-emerald-900/40 text-emerald-200 border-emerald-800",
  warning: "bg-amber-900/40 text-amber-200 border-amber-800",
  danger: "bg-red-900/40 text-red-200 border-red-800",
  accent: "bg-indigo-900/40 text-indigo-200 border-indigo-800",
};

export function Pill({
  children,
  variant = "neutral",
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        variantClass[variant],
        className,
      ].join(" ")}
      data-variant={variant}
      {...rest}
    >
      {children}
    </span>
  );
}

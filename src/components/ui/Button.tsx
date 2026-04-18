import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-indigo-900 disabled:text-zinc-400",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-500",
  ghost:
    "bg-transparent hover:bg-zinc-800 text-zinc-200 disabled:text-zinc-500",
  danger:
    "bg-red-600 hover:bg-red-500 text-white disabled:bg-red-900 disabled:text-zinc-400",
};

const sizeClass: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs rounded",
  md: "px-3.5 py-1.5 text-sm rounded-md",
  lg: "px-5 py-2.5 text-sm rounded-md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className = "",
      disabled,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "inline-flex items-center justify-center gap-2 font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0",
          "disabled:cursor-not-allowed",
          variantClass[variant],
          sizeClass[size],
          className,
        ].join(" ")}
        data-loading={isLoading ? "true" : undefined}
        {...rest}
      >
        {isLoading ? (
          <span
            aria-hidden
            className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-transparent"
          />
        ) : null}
        {children}
      </button>
    );
  },
);

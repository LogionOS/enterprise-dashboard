interface BadgeProps {
  variant: "pass" | "flag" | "block" | "warn" | "low" | "medium" | "high" | "critical" | "default";
  children: React.ReactNode;
  size?: "sm" | "md";
}

const STYLES: Record<string, string> = {
  pass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  flag: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  block: "bg-red-500/15 text-red-400 border-red-500/30",
  warn: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function Badge({ variant, children, size = "sm" }: BadgeProps) {
  const style = STYLES[variant] || STYLES.default;
  return (
    <span
      className={`inline-flex items-center border rounded-md font-mono font-medium ${style} ${
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
      }`}
    >
      {children}
    </span>
  );
}

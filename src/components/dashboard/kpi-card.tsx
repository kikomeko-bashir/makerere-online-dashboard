import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
}

export function KpiCard({ icon: Icon, value, label, delta }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-primary" />
        {delta && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

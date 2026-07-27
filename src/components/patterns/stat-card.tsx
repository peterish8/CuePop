import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<{ className?: string }>;
  value: React.ReactNode;
  label: React.ReactNode;
  tone?: "primary" | "accent";
}

export function StatCard({ icon: Icon, value, label, tone = "primary", className, ...props }: StatCardProps) {
  return (
    <Card className={cn("flex items-center gap-4 p-4", className)} {...props}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--color-border)] bg-white/[.04]">
        <Icon className={cn("size-4", tone === "primary" ? "text-[var(--color-primary-hover)]" : "text-[var(--color-accent-hover)]")} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xl font-semibold tracking-[-.03em]">{value}</div>
        <div className="cue-body-sm mt-0.5 truncate">{label}</div>
      </div>
    </Card>
  );
}

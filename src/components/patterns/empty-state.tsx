import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("cue-panel grid min-h-64 place-items-center p-8 text-center", className)} {...props}>
      <div>
        {Icon && (
          <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[var(--color-border)] bg-white/[.04]">
            <Icon className="size-5 text-[var(--color-primary-hover)]" />
          </div>
        )}
        <h3 className={cn("font-semibold", Icon && "mt-4")}>{title}</h3>
        {description && <p className="cue-body-sm mt-2">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

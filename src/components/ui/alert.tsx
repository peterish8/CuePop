import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-[var(--radius-md)] border p-4 text-sm", {
  variants: {
    variant: {
      info: "border-[var(--color-border)] bg-white/[.03] text-[var(--color-foreground-muted)]",
      success: "border-[rgba(110,215,178,.22)] bg-[rgba(110,215,178,.06)] text-[var(--color-foreground)]",
      warning: "border-[rgba(244,192,106,.24)] bg-[rgba(244,192,106,.06)] text-[var(--color-foreground)]",
      destructive: "border-[rgba(255,127,135,.22)] bg-[rgba(255,127,135,.06)] text-[var(--color-foreground)]",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, destructive: CircleAlert };
const iconColor = { info: "text-[var(--color-foreground-subtle)]", success: "text-[var(--color-success)]", warning: "text-[var(--color-warning)]", destructive: "text-[var(--color-danger)]" };

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant = "info", children, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div role={variant === "destructive" ? "alert" : "status"} className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor[variant ?? "info"])} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 leading-6 text-[var(--color-foreground-muted)]", className)} {...props} />;
}

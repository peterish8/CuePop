import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", {
  variants: {
    variant: {
      default: "border-[var(--color-border)] bg-white/[.045] text-[var(--color-foreground-muted)]",
      primary: "border-transparent bg-[var(--color-primary)] text-white",
      success: "border-[rgba(110,215,178,.22)] bg-[rgba(110,215,178,.1)] text-[var(--color-success)]",
      warning: "border-[rgba(244,192,106,.24)] bg-[rgba(244,192,106,.1)] text-[var(--color-warning)]",
      danger: "border-[rgba(255,127,135,.22)] bg-[rgba(255,127,135,.1)] text-[var(--color-danger)]",
      outline: "border-[var(--color-border-strong)] bg-transparent text-[var(--color-foreground)]",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

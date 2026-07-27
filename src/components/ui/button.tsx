import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

/*
 * Variant names follow the design-system spec: primary/secondary/outline/ghost/destructive/link.
 * `inverse` is an intentional, documented exception — the high-contrast off-white pill used for
 * marketing-page CTAs against dark hero backgrounds (kept distinct from `primary`'s brand blue).
 * `accent`/`default`/`danger` are deprecated aliases kept only until every call site migrates.
 */
const buttonVariants = cva(
  "cue-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[var(--color-focus-ring)]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow-primary)]",
        inverse: "bg-[var(--color-foreground)] text-[var(--color-foreground-inverse)] hover:bg-white hover:shadow-[var(--shadow-glow-primary)]",
        secondary: "bg-[var(--color-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-secondary-hover)] hover:border-[var(--color-border-strong)] active:bg-white/[.09]",
        outline: "bg-transparent text-[var(--color-foreground)] border border-[var(--color-border-strong)] hover:bg-[var(--color-secondary-hover)]",
        ghost: "text-[var(--color-foreground-muted)] hover:text-white hover:bg-[var(--color-secondary-hover)] active:bg-white/[.08]",
        destructive: "bg-[rgba(255,127,135,.1)] text-[#ff9aa1] border border-[rgba(255,127,135,.16)] hover:bg-[rgba(255,127,135,.16)] active:bg-[rgba(255,127,135,.22)]",
        link: "h-auto rounded-none p-0 text-[var(--color-primary-hover)] underline-offset-4 hover:underline",
        /* deprecated aliases — remove once every call site migrates (see DESIGN_SYSTEM.md) */
        default: "bg-[var(--color-foreground)] text-[var(--color-foreground-inverse)] hover:bg-white hover:shadow-[var(--shadow-glow-primary)]",
        accent: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow-primary)]",
        danger: "bg-[rgba(255,127,135,.1)] text-[#ff9aa1] border border-[rgba(255,127,135,.16)] hover:bg-[rgba(255,127,135,.16)] active:bg-[rgba(255,127,135,.22)]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-10 px-5",
        lg: "h-11 px-6 text-[15px]",
        icon: "size-10 p-0",
        default: "h-10 px-5",
      },
    },
    /* `inverse` (white pill) stays the implicit default — it's what every unstyled <Button/> across
       the app already renders as (hero CTAs, auth submit, error/not-found actions). */
    defaultVariants: { variant: "inverse", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {!asChild && loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

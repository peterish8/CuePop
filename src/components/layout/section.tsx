import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("relative", {
  variants: {
    /* sm/md/lg: 48/64/80px — app-internal section rhythm. marketing: the existing
       96-190px clamp already used across the landing page (kept as `cue-section`). */
    spacing: {
      sm: "py-12",
      md: "py-16",
      lg: "py-20",
      marketing: "cue-section",
    },
  },
  defaultVariants: { spacing: "md" },
});

export interface SectionProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  as?: "section" | "div";
}

export function Section({ className, spacing, as = "section", ...props }: SectionProps) {
  const Tag = as;
  return <Tag className={cn(sectionVariants({ spacing }), className)} {...props} />;
}

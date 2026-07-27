import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex", {
  variants: {
    direction: { vertical: "flex-col", horizontal: "flex-row" },
    gap: { xs: "gap-2", sm: "gap-3", md: "gap-4", lg: "gap-6", xl: "gap-8" },
    align: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" },
    wrap: { wrap: "flex-wrap", nowrap: "flex-nowrap" },
  },
  defaultVariants: { direction: "vertical", gap: "md", wrap: "nowrap" },
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {}

export function Stack({ className, direction, gap, align, wrap, ...props }: StackProps) {
  return <div className={cn(stackVariants({ direction, gap, align, wrap }), className)} {...props} />;
}

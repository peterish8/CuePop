import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gridVariants = cva("grid", {
  variants: {
    cols: {
      two: "grid-cols-1 sm:grid-cols-2",
      three: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      four: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
    gap: { xs: "gap-2", sm: "gap-3", md: "gap-4", lg: "gap-6", xl: "gap-8" },
  },
  defaultVariants: { cols: "three", gap: "md" },
});

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap }), className)} {...props} />;
}

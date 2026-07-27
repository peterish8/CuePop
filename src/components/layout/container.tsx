import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const containerVariants = cva("", {
  variants: {
    size: {
      narrow: "cue-container-narrow",
      default: "cue-container",
      wide: "cue-container-wide",
      full: "cue-container-full",
    },
  },
  defaultVariants: { size: "default" },
});

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof containerVariants> {}

export function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}

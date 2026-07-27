import * as React from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerProps } from "@/components/layout/container";

export interface PageShellProps extends React.HTMLAttributes<HTMLElement> {
  containerSize?: ContainerProps["size"];
  /** Centers content both axes — for simple utility pages (error, not-found, join-by-code). */
  center?: boolean;
}

export function PageShell({ className, containerSize = "default", center = false, children, ...props }: PageShellProps) {
  return (
    <main
      className={cn(
        "min-h-svh bg-[var(--color-background)] text-[var(--color-foreground)]",
        center && "grid place-items-center p-5 text-center",
        className,
      )}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </main>
  );
}

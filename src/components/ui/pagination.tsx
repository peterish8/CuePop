import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange, className, ...props }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-3", className)} {...props}>
      <IconButton aria-label="Previous page" variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </IconButton>
      <span className="cue-body-sm text-[var(--color-foreground-muted)]">
        Page {page} of {pageCount}
      </span>
      <IconButton aria-label="Next page" variant="ghost" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="size-4" />
      </IconButton>
    </nav>
  );
}

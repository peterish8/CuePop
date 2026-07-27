import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col justify-between gap-6 lg:flex-row lg:items-end", className)} {...props}>
      <div>
        {eyebrow && <p className="cue-eyebrow">{eyebrow}</p>}
        <h1 className={cn("cue-h1", eyebrow && "mt-3")}>{title}</h1>
        {description && <p className="cue-body-lg mt-4 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

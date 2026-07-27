import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormField({ label, htmlFor, error, hint, required, className, children, ...props }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="cue-body-sm text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="cue-body-sm text-[var(--color-foreground-subtle)]">{hint}</p>
      ) : null}
    </div>
  );
}

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  /** Required — an icon-only control must always have an accessible name. */
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", ...props }, ref) => <Button ref={ref} variant={variant} size="icon" {...props} />,
);
IconButton.displayName = "IconButton";

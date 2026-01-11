import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Extended Badge variants with status-specific colors using CSS variables
const statusPillVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        draft: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        submitted: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300",
        in_progress: "border-transparent bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300",
        approved: "border-transparent bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300",
        rejected: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        pending: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
        completed: "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusPillVariants> {}

export const StatusPill = React.forwardRef<HTMLDivElement, StatusPillProps>(
  ({ variant, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusPillVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

StatusPill.displayName = "StatusPill";

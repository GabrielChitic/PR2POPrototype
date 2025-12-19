import * as React from "react";
import { cn } from "../../lib/utils";

type StatusVariant =
  | "draft"
  | "submitted"
  | "in_progress"
  | "approved"
  | "rejected"
  | "pending"
  | "completed";

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ variant, children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

StatusPill.displayName = "StatusPill";

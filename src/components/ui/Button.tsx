import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-[0.98] active:shadow-sm",
        secondary: "bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 active:scale-[0.98]",
        outline:
          "border-2 border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]",
        ghost: "text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200",
        danger: "bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.98]",
        link: "underline-offset-4 hover:underline text-blue-600",
      },
      size: {
        default: "h-10 py-2 px-4 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Convenience components for common button types
const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  ({ ...props }, ref) => {
    return <Button variant="default" ref={ref} {...props} />;
  }
);
PrimaryButton.displayName = "PrimaryButton";

const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  ({ ...props }, ref) => {
    return <Button variant="secondary" ref={ref} {...props} />;
  }
);
SecondaryButton.displayName = "SecondaryButton";

export { Button, PrimaryButton, SecondaryButton, buttonVariants };

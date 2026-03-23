import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[transform,box-shadow,background-color,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transform-gpu",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18),_inset_-1px_-1px_2px_rgba(255,255,255,0.10)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.25),_inset_-6px_-6px_12px_rgba(255,255,255,0.08)] active:translate-x-px active:translate-y-px active:shadow-[inset_8px_8px_14px_rgba(0,0,0,0.30),_inset_-8px_-8px_14px_rgba(255,255,255,0.06)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18),_inset_-1px_-1px_2px_rgba(255,255,255,0.10)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.25),_inset_-6px_-6px_12px_rgba(255,255,255,0.08)] active:translate-x-px active:translate-y-px active:shadow-[inset_8px_8px_14px_rgba(0,0,0,0.30),_inset_-8px_-8px_14px_rgba(255,255,255,0.06)]",
        outline:
          "border border-input bg-background text-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04),_inset_0_1px_0_rgba(255,255,255,0.65)] hover:bg-accent hover:text-accent-foreground hover:translate-x-px hover:translate-y-px hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.14),_inset_-6px_-6px_12px_rgba(255,255,255,0.06)] active:translate-x-px active:translate-y-px",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18),_inset_-1px_-1px_2px_rgba(255,255,255,0.10)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.25),_inset_-6px_-6px_12px_rgba(255,255,255,0.08)] active:translate-x-px active:translate-y-px active:shadow-[inset_8px_8px_14px_rgba(0,0,0,0.30),_inset_-8px_-8px_14px_rgba(255,255,255,0.06)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] hover:translate-x-px hover:translate-y-px hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.14),_inset_-4px_-4px_8px_rgba(255,255,255,0.05)] active:translate-x-px active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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

export { Button, buttonVariants };

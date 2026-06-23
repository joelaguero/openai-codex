import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        success:
          "border-transparent bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-success",
        warning:
          "border-transparent bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-warning",
        info: "border-transparent bg-[color-mix(in_srgb,var(--info)_18%,transparent)] text-info",
        destructive:
          "border-transparent bg-[color-mix(in_srgb,var(--destructive)_18%,transparent)] text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

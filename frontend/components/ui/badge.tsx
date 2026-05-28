import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "crm-badge",
  {
    variants: {
      variant: {
        neutral: "",
        brand: "crm-badge-brand",
        success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
        warning: "border-amber-400/25 bg-amber-400/10 text-amber-100",
        danger: "border-rose-400/25 bg-rose-400/10 text-rose-100"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

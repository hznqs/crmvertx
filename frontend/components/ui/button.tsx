import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-crm px-4 text-sm font-bold outline-none transition duration-premium ease-premium focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_0_28px_rgba(234,89,220,.18)] hover:-translate-y-0.5 hover:brightness-110",
        secondary: "border border-line bg-white/[0.045] text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] hover:border-brand-400/35 hover:bg-brand-500/15 hover:text-white",
        ghost: "text-zinc-300 hover:bg-brand-500/15 hover:text-white",
        danger: "border border-rose-400/25 bg-rose-500/10 text-rose-100 hover:border-rose-300/40 hover:bg-rose-500/15 hover:text-white focus-visible:shadow-[0_0_0_4px_rgba(251,113,133,.16)]"
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-11 px-5"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-crm-shimmer rounded-crm bg-[linear-gradient(90deg,rgba(255,255,255,.045),rgba(234,89,220,.14),rgba(255,255,255,.045))] bg-[length:220%_100%]",
        className
      )}
      {...props}
    />
  );
}

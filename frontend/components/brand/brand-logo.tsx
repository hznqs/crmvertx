"use client";

import Image from "next/image";
import { useState } from "react";
import { brandAssets } from "@/lib/brand/assets";
import { cn } from "@/lib/utils";

type BrandLogoProps = Readonly<{
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg" | "hero";
  priority?: boolean;
  className?: string;
  labelClassName?: string;
}>;

const sizeClassName = {
  full: {
    sm: "h-9 w-32",
    md: "h-12 w-44",
    lg: "h-16 w-64",
    hero: "h-24 w-72"
  },
  mark: {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
    hero: "h-20 w-20"
  }
};

export function BrandLogo({
  variant = "full",
  size = "md",
  priority = false,
  className,
  labelClassName
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  const asset = variant === "full" ? brandAssets.logo : brandAssets.mark;

  if (failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-sm font-black tracking-tight text-white",
          sizeClassName[variant][size],
          className,
          labelClassName
        )}
        aria-label={asset.alt}
      >
        VX
      </span>
    );
  }

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes={variant === "full" ? "260px" : "80px"}
      unoptimized
      className={cn("shrink-0 object-contain", sizeClassName[variant][size], className)}
      onError={() => setFailed(true)}
    />
  );
}

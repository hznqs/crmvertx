"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChartFrameProps = {
  className: string;
  children: (dimensions: ChartDimensions) => ReactNode;
};

type ChartDimensions = {
  width: number;
  height: number;
};

export function ChartFrame({ className, children }: ChartFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSize = () => {
      const rect = frame.getBoundingClientRect();
      const styles = window.getComputedStyle(frame);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const verticalPadding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
      const width = Math.max(0, Math.floor(rect.width - horizontalPadding));
      const height = Math.max(0, Math.floor(rect.height - verticalPadding));

      setDimensions((current) => {
        if (current.width === width && current.height === height) return current;
        return { width, height };
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div ref={frameRef} className={className}>
      {dimensions.width > 1 && dimensions.height > 1 ? children(dimensions) : null}
    </div>
  );
}

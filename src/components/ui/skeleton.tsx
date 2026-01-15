'use client';

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted text-transparent",
        className
      )}
    >
      .
    </div>
  );
}

export { Skeleton };

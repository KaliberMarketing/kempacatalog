"use client";

import { LazySpinner } from "@/components/shared/lazy-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <LazySpinner delay={300} text="Loading…" />
    </div>
  );
}

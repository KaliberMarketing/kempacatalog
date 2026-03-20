"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const SAFE_MESSAGES = new Set([
  "You must be signed in to perform this action.",
  "You don't have permission to perform this action.",
  "A record with this information already exists.",
  "This action references data that no longer exists.",
  "The requested record was not found.",
  "Something went wrong. Please try again.",
  "Invalid input. Please check your data.",
]);

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = SAFE_MESSAGES.has(error.message)
    ? error.message
    : "An unexpected error occurred. Please try again.";

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      <Button onClick={reset} variant="outline" size="sm" className="mt-4">
        Try again
      </Button>
    </div>
  );
}

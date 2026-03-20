import { createClient } from "@/lib/supabase/server";
import { ZodError } from "zod";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("You must be signed in to perform this action.");
  }
  return { supabase, user };
}

const AUTH_MESSAGE = "You must be signed in to perform this action.";

export function sanitizeError(error: unknown): string {
  if (error instanceof Error && error.message === AUTH_MESSAGE) {
    return AUTH_MESSAGE;
  }

  if (error instanceof ZodError) {
    return error.errors[0]?.message ?? "Invalid input. Please check your data.";
  }

  const pgError = error as Record<string, unknown> | null;
  const code = pgError?.code as string | undefined;
  const message = pgError?.message as string | undefined;

  if (code === "42501" || message?.includes("row-level security")) {
    return "You don't have permission to perform this action.";
  }
  if (code === "23505") {
    return "A record with this information already exists.";
  }
  if (code === "23503") {
    return "This action references data that no longer exists.";
  }
  if (code === "PGRST116") {
    return "The requested record was not found.";
  }

  return "Something went wrong. Please try again.";
}

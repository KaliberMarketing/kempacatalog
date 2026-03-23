"use server";

import { requireAuth, sanitizeError } from "./helpers";
import type { IntegrationConnection, IntegrationProvider } from "@/types/database";

export async function getIntegrationConnection(
  organizationId: string,
  provider: IntegrationProvider
): Promise<IntegrationConnection | null> {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("integration_connections")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("provider", provider)
      .maybeSingle();

    if (error) throw error;
    return data as IntegrationConnection | null;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getIntegrationConnectionsByOrganization(
  organizationId: string
): Promise<IntegrationConnection[]> {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("integration_connections")
      .select("*")
      .eq("organization_id", organizationId);

    if (error) throw error;
    return (data ?? []) as IntegrationConnection[];
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}


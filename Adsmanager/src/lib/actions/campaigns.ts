"use server";

import { campaignSchema, type CampaignFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getCampaigns(filters?: {
  organizationId?: string;
  adAccountId?: string;
}) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("campaigns")
      .select(
        "*, ad_account:ad_accounts(id, name, channel:channels(id, name)), organization:organizations(id, name), business_unit:business_units(id, name), department:departments(id, name)"
      )
      .order("created_at", { ascending: false });

    if (filters?.organizationId)
      query = query.eq("organization_id", filters.organizationId);
    if (filters?.adAccountId)
      query = query.eq("ad_account_id", filters.adAccountId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getCampaign(id: string) {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("campaigns")
      .select(
        "*, ad_account:ad_accounts(id, name, channel:channels(id, name)), organization:organizations(id, name)"
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createCampaign(formData: CampaignFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = campaignSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      external_campaign_id: parsed.external_campaign_id || null,
      objective: parsed.objective || null,
      daily_budget_amount: parsed.daily_budget_amount ?? null,
      start_date: parsed.start_date || null,
      end_date: parsed.end_date || null,
    };
    const { error } = await supabase.from("campaigns").insert(payload);
    if (error) throw error;
    revalidatePath("/app/campaigns");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateCampaign(id: string, formData: CampaignFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = campaignSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      external_campaign_id: parsed.external_campaign_id || null,
      objective: parsed.objective || null,
      daily_budget_amount: parsed.daily_budget_amount ?? null,
      start_date: parsed.start_date || null,
      end_date: parsed.end_date || null,
    };
    const { error } = await supabase
      .from("campaigns")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/campaigns");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

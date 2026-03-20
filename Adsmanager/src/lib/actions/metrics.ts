"use server";

import {
  campaignMetricSchema,
  type CampaignMetricFormData,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { calcCPA, calcROAS } from "@/lib/utils";
import { requireAuth, sanitizeError } from "./helpers";

export async function getMetrics(campaignId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("campaign_metrics")
      .select("*, campaign:campaigns(id, name, ad_account:ad_accounts(id, name))")
      .order("date", { ascending: false });
    if (campaignId) query = query.eq("campaign_id", campaignId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getDashboardMetrics() {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("campaign_metrics")
      .select(
        "*, campaign:campaigns(id, name, organization_id, business_unit_id, department_id, ad_account:ad_accounts(id, name, channel_id, channel:channels(id, name)))"
      )
      .order("date", { ascending: true });
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createMetric(formData: CampaignMetricFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = campaignMetricSchema.parse(formData);
    const cpa = calcCPA(parsed.spend, parsed.conversions);
    const roas = calcROAS(parsed.revenue ?? null, parsed.spend);
    const payload = {
      ...parsed,
      revenue: parsed.revenue ?? null,
      cpa,
      roas,
    };
    const { error } = await supabase.from("campaign_metrics").insert(payload);
    if (error) throw error;
    revalidatePath("/app/metrics");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

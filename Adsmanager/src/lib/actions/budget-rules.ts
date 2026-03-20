"use server";

import { budgetRuleSchema, type BudgetRuleFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getBudgetRules(organizationId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("budget_rules")
      .select(
        "*, organization:organizations(id, name), business_unit:business_units(id, name), department:departments(id, name), channel:channels(id, name), ad_account:ad_accounts(id, name), campaign:campaigns(id, name)"
      )
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createBudgetRule(formData: BudgetRuleFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = budgetRuleSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      channel_id: parsed.channel_id || null,
      ad_account_id: parsed.ad_account_id || null,
      campaign_id: parsed.campaign_id || null,
      description: parsed.description || null,
      action_value: parsed.action_value || null,
      max_daily_change_pct: parsed.max_daily_change_pct ?? null,
    };
    const { error } = await supabase.from("budget_rules").insert(payload);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateBudgetRule(
  id: string,
  formData: BudgetRuleFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = budgetRuleSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      channel_id: parsed.channel_id || null,
      ad_account_id: parsed.ad_account_id || null,
      campaign_id: parsed.campaign_id || null,
      description: parsed.description || null,
      action_value: parsed.action_value || null,
      max_daily_change_pct: parsed.max_daily_change_pct ?? null,
    };
    const { error } = await supabase
      .from("budget_rules")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function toggleBudgetRule(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAuth();
    const { error } = await supabase
      .from("budget_rules")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

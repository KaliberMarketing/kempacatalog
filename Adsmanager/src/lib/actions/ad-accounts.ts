"use server";

import { adAccountSchema, type AdAccountFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getAdAccounts(organizationId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("ad_accounts")
      .select(
        "*, organization:organizations(id, name), channel:channels(id, name), business_unit:business_units(id, name), department:departments(id, name)"
      )
      .order("name");
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createAdAccount(formData: AdAccountFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = adAccountSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      external_account_id: parsed.external_account_id || null,
    };
    const { error } = await supabase.from("ad_accounts").insert(payload);
    if (error) throw error;
    revalidatePath("/app/ad-accounts");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateAdAccount(
  id: string,
  formData: AdAccountFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = adAccountSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      external_account_id: parsed.external_account_id || null,
    };
    const { error } = await supabase
      .from("ad_accounts")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/ad-accounts");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function deleteAdAccount(id: string) {
  try {
    const { supabase } = await requireAuth();
    const { error } = await supabase.from("ad_accounts").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/app/ad-accounts");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

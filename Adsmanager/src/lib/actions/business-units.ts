"use server";

import {
  businessUnitSchema,
  type BusinessUnitFormData,
} from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getBusinessUnits(organizationId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("business_units")
      .select("*, organization:organizations(id, name)")
      .order("name");
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createBusinessUnit(formData: BusinessUnitFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = businessUnitSchema.parse(formData);
    const { error } = await supabase.from("business_units").insert(parsed);
    if (error) throw error;
    revalidatePath("/app/business-units");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateBusinessUnit(
  id: string,
  formData: BusinessUnitFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = businessUnitSchema.parse(formData);
    const { error } = await supabase
      .from("business_units")
      .update(parsed)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/business-units");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function deleteBusinessUnit(id: string) {
  try {
    const { supabase } = await requireAuth();
    const { error } = await supabase
      .from("business_units")
      .delete()
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/app/business-units");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

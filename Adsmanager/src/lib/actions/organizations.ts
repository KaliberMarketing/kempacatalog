"use server";

import { organizationSchema, type OrganizationFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getOrganizations() {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getOrganization(id: string) {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createOrganization(formData: OrganizationFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = organizationSchema.parse(formData);
    const { error } = await supabase.from("organizations").insert(parsed);
    if (error) throw error;
    revalidatePath("/app/organizations");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateOrganization(
  id: string,
  formData: OrganizationFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = organizationSchema.parse(formData);
    const { error } = await supabase
      .from("organizations")
      .update(parsed)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/organizations");
    revalidatePath(`/app/organizations/${id}`);
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function deleteOrganization(id: string) {
  try {
    const { supabase } = await requireAuth();
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/app/organizations");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

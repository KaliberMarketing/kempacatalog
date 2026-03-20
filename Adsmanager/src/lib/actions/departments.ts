"use server";

import { departmentSchema, type DepartmentFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getDepartments(organizationId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("departments")
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

export async function createDepartment(formData: DepartmentFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = departmentSchema.parse(formData);
    const { error } = await supabase.from("departments").insert(parsed);
    if (error) throw error;
    revalidatePath("/app/departments");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateDepartment(
  id: string,
  formData: DepartmentFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = departmentSchema.parse(formData);
    const { error } = await supabase
      .from("departments")
      .update(parsed)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/departments");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

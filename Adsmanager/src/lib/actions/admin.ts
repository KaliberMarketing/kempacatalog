"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, sanitizeError } from "./helpers";
import { getSession } from "./auth";
import type { UserRole } from "@/types/database";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || !session.isSuperAdmin) {
    throw new Error("Only super admins can access the admin panel.");
  }
  const { supabase, user } = await requireAuth();
  return { supabase, user, session };
}

export async function getAllProfiles() {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getAllMemberships() {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("memberships")
      .select("*, profiles(full_name, email), organizations(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function getAllOrganizations() {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organizations")
      .select("id, name, slug")
      .order("name");
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateProfileRole(profileId: string, role: UserRole) {
  try {
    const { session } = await requireSuperAdmin();
    if (profileId === session.profile.id && role !== "super_admin") {
      throw new Error("You cannot demote yourself.");
    }
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ role })
      .eq("id", profileId);
    if (error) throw error;
    revalidatePath("/app/admin");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const { session } = await requireSuperAdmin();
    if (profileId === session.profile.id) {
      throw new Error("You cannot delete your own account.");
    }
    const admin = createAdminClient();

    const { data: profile, error: fetchErr } = await admin
      .from("profiles")
      .select("auth_user_id")
      .eq("id", profileId)
      .single();
    if (fetchErr) throw fetchErr;

    const { error: authErr } = await admin.auth.admin.deleteUser(
      profile.auth_user_id
    );
    if (authErr) throw authErr;

    revalidatePath("/app/admin");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createMembership(
  profileId: string,
  organizationId: string,
  role: "org_admin" | "analyst"
) {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("memberships").insert({
      profile_id: profileId,
      organization_id: organizationId,
      role,
    });
    if (error) throw error;
    revalidatePath("/app/admin");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateMembershipRole(
  membershipId: string,
  role: "org_admin" | "analyst"
) {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("memberships")
      .update({ role })
      .eq("id", membershipId);
    if (error) throw error;
    revalidatePath("/app/admin");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function deleteMembership(membershipId: string) {
  try {
    await requireSuperAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("memberships")
      .delete()
      .eq("id", membershipId);
    if (error) throw error;
    revalidatePath("/app/admin");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

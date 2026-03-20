"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile, Membership } from "@/types/database";

export interface UserSession {
  profile: Profile;
  memberships: Membership[];
  canManage: boolean;
  isSuperAdmin: boolean;
}

export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return null;

  const { data: memberships } = await supabase
    .from("memberships")
    .select("*")
    .eq("profile_id", profile.id);

  const isSuperAdmin = profile.role === "super_admin";
  const isOrgAdmin =
    isSuperAdmin ||
    profile.role === "org_admin" ||
    (memberships ?? []).some((m) => m.role === "org_admin");

  return {
    profile: profile as Profile,
    memberships: (memberships ?? []) as Membership[],
    canManage: isOrgAdmin,
    isSuperAdmin,
  };
}

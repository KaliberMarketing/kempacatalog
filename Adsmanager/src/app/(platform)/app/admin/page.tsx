import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import {
  getAllProfiles,
  getAllMemberships,
  getAllOrganizations,
} from "@/lib/actions/admin";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isSuperAdmin) redirect("/app/dashboard");

  const [profiles, memberships, organizations] = await Promise.all([
    getAllProfiles(),
    getAllMemberships(),
    getAllOrganizations(),
  ]);

  return (
    <AdminClient
      profiles={profiles}
      memberships={memberships}
      organizations={organizations}
      currentProfileId={session.profile.id}
    />
  );
}

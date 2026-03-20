import { getDepartments } from "@/lib/actions/departments";
import { getOrganizations } from "@/lib/actions/organizations";
import type { Department, Organization } from "@/types/database";
import { DepartmentsClient } from "./departments-client";

export default async function DepartmentsPage() {
  try {
    const [departmentsRaw, organizationsRaw] = await Promise.all([
      getDepartments(),
      getOrganizations(),
    ]);

    const departments = (departmentsRaw ?? []) as Department[];
    const organizations = (organizationsRaw ?? []) as Organization[];

    return (
      <DepartmentsClient
        departments={departments}
        organizations={organizations}
      />
    );
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load departments. Please try again later.
      </div>
    );
  }
}

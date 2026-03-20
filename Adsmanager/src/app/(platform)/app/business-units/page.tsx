import { getBusinessUnits } from "@/lib/actions/business-units";
import { getOrganizations } from "@/lib/actions/organizations";
import type { BusinessUnit, Organization } from "@/types/database";
import { BusinessUnitsClient } from "./business-units-client";

export default async function BusinessUnitsPage() {
  try {
    const [businessUnitsRaw, organizationsRaw] = await Promise.all([
      getBusinessUnits(),
      getOrganizations(),
    ]);

    const businessUnits = (businessUnitsRaw ?? []) as BusinessUnit[];
    const organizations = (organizationsRaw ?? []) as Organization[];

    return (
      <BusinessUnitsClient
        businessUnits={businessUnits}
        organizations={organizations}
      />
    );
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load business units. Please try again later.
      </div>
    );
  }
}

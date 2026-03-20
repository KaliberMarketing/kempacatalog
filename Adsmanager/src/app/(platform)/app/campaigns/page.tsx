import { CampaignsClient } from "./campaigns-client";
import { getCampaigns } from "@/lib/actions/campaigns";
import { getOrganizations } from "@/lib/actions/organizations";
import { getAdAccounts } from "@/lib/actions/ad-accounts";
import { getBusinessUnits } from "@/lib/actions/business-units";
import { getDepartments } from "@/lib/actions/departments";
import type { Campaign, Organization, AdAccount, BusinessUnit, Department } from "@/types/database";

export default async function CampaignsPage() {
  try {
    const [campaignsRaw, organizationsRaw, adAccountsRaw, businessUnitsRaw, departmentsRaw] =
      await Promise.all([
        getCampaigns(),
        getOrganizations(),
        getAdAccounts(),
        getBusinessUnits(),
        getDepartments(),
      ]);

    return (
      <CampaignsClient
        campaigns={(campaignsRaw ?? []) as Campaign[]}
        organizations={(organizationsRaw ?? []) as Organization[]}
        adAccounts={(adAccountsRaw ?? []) as AdAccount[]}
        businessUnits={(businessUnitsRaw ?? []) as BusinessUnit[]}
        departments={(departmentsRaw ?? []) as Department[]}
      />
    );
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load campaigns. Please try again later.
      </div>
    );
  }
}

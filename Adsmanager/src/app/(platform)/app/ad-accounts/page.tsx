import { AdAccountsClient } from "./ad-accounts-client";
import { getAdAccounts } from "@/lib/actions/ad-accounts";
import { getOrganizations } from "@/lib/actions/organizations";
import { getBusinessUnits } from "@/lib/actions/business-units";
import { getDepartments } from "@/lib/actions/departments";
import { getChannels } from "@/lib/actions/channels";
import type { AdAccount, Organization, BusinessUnit, Department, Channel } from "@/types/database";

export default async function AdAccountsPage() {
  try {
    const [adAccountsRaw, organizationsRaw, businessUnitsRaw, departmentsRaw, channelsRaw] =
      await Promise.all([
        getAdAccounts(),
        getOrganizations(),
        getBusinessUnits(),
        getDepartments(),
        getChannels(),
      ]);

    return (
      <AdAccountsClient
        adAccounts={(adAccountsRaw ?? []) as AdAccount[]}
        organizations={(organizationsRaw ?? []) as Organization[]}
        businessUnits={(businessUnitsRaw ?? []) as BusinessUnit[]}
        departments={(departmentsRaw ?? []) as Department[]}
        channels={(channelsRaw ?? []) as Channel[]}
      />
    );
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load ad accounts. Please try again later.
      </div>
    );
  }
}

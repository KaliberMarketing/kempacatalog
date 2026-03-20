import { getAdAccounts } from "@/lib/actions/ad-accounts";
import { getBudgetRules } from "@/lib/actions/budget-rules";
import { getBusinessUnits } from "@/lib/actions/business-units";
import { getCampaigns } from "@/lib/actions/campaigns";
import { getChannels } from "@/lib/actions/channels";
import { getDepartments } from "@/lib/actions/departments";
import { getOrganizations } from "@/lib/actions/organizations";
import type {
  AdAccount,
  BudgetRule,
  BusinessUnit,
  Campaign,
  Channel,
  Department,
  Organization,
} from "@/types/database";
import { RulesClient } from "./rules-client";

export default async function RulesPage() {
  try {
    const [
      rulesRaw,
      organizationsRaw,
      businessUnitsRaw,
      departmentsRaw,
      channelsRaw,
      adAccountsRaw,
      campaignsRaw,
    ] = await Promise.all([
      getBudgetRules(),
      getOrganizations(),
      getBusinessUnits(),
      getDepartments(),
      getChannels(),
      getAdAccounts(),
      getCampaigns(),
    ]);

    const rules = (rulesRaw ?? []) as BudgetRule[];
    const organizations = (organizationsRaw ?? []) as Organization[];
    const businessUnits = (businessUnitsRaw ?? []) as BusinessUnit[];
    const departments = (departmentsRaw ?? []) as Department[];
    const channels = (channelsRaw ?? []) as Channel[];
    const adAccounts = (adAccountsRaw ?? []) as AdAccount[];
    const campaigns = (campaignsRaw ?? []) as Campaign[];

    return (
      <RulesClient
        rules={rules}
        organizations={organizations}
        businessUnits={businessUnits}
        departments={departments}
        channels={channels}
        adAccounts={adAccounts}
        campaigns={campaigns}
      />
    );
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load budget rules. Please try again later.
      </div>
    );
  }
}

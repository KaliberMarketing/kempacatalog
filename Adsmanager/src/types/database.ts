export type UserRole = "super_admin" | "org_admin" | "analyst";
export type OrgMemberRole = "org_admin" | "analyst";
export type EntityStatus = "active" | "inactive" | "archived";
export type AdAccountStatus = "active" | "paused" | "disabled" | "archived";
export type CampaignStatus = "active" | "paused" | "completed" | "archived" | "draft";
export type ChannelStatus = "active" | "inactive";
export type MetricType = "spend" | "cpa" | "roas" | "clicks" | "conversions" | "impressions" | "leads" | "revenue";
export type RuleOperator = ">" | "<" | ">=" | "<=" | "=";
export type ActionType = "alert" | "pause" | "increase_budget" | "decrease_budget" | "notify";

export interface Profile {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  profile_id: string;
  organization_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface BusinessUnit {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  type: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: ChannelStatus;
  created_at: string;
  updated_at: string;
}

export interface AdAccount {
  id: string;
  organization_id: string;
  business_unit_id: string | null;
  department_id: string | null;
  channel_id: string;
  name: string;
  external_account_id: string | null;
  currency: string;
  timezone: string;
  status: AdAccountStatus;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  business_unit?: BusinessUnit | null;
  department?: Department | null;
  channel?: Channel;
}

export interface Campaign {
  id: string;
  ad_account_id: string;
  organization_id: string;
  business_unit_id: string | null;
  department_id: string | null;
  name: string;
  external_campaign_id: string | null;
  objective: string | null;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  ad_account?: AdAccount;
  organization?: Organization;
  business_unit?: BusinessUnit | null;
  department?: Department | null;
}

export interface CampaignMetric {
  id: string;
  campaign_id: string;
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number | null;
  cpa: number | null;
  roas: number | null;
  created_at: string;
  campaign?: Campaign;
}

export interface BudgetRule {
  id: string;
  organization_id: string;
  business_unit_id: string | null;
  department_id: string | null;
  channel_id: string | null;
  ad_account_id: string | null;
  campaign_id: string | null;
  name: string;
  description: string | null;
  metric_type: MetricType;
  operator: RuleOperator;
  threshold_value: number;
  action_type: ActionType;
  action_value: string | null;
  max_daily_change_pct: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization?: Organization;
  business_unit?: BusinessUnit | null;
  department?: Department | null;
  channel?: Channel | null;
  ad_account?: AdAccount | null;
  campaign?: Campaign | null;
}

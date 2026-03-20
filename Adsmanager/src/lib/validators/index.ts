import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const businessUnitSchema = z.object({
  organization_id: z.string().uuid("Select an organization"),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Lowercase with hyphens only"),
  type: z.string().max(50).nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const departmentSchema = z.object({
  organization_id: z.string().uuid("Select an organization"),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Lowercase with hyphens only"),
  description: z.string().max(500).nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export const channelSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Lowercase with hyphens only"),
  type: z.string().min(1, "Type is required").max(50),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const adAccountSchema = z.object({
  organization_id: z.string().uuid("Select an organization"),
  business_unit_id: z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  channel_id: z.string().uuid("Select a channel"),
  name: z.string().min(1, "Name is required").max(200),
  external_account_id: z.string().max(100).nullable().optional(),
  currency: z.string().min(1).max(10).default("EUR"),
  timezone: z.string().min(1).max(50).default("Europe/Brussels"),
  status: z.enum(["active", "paused", "disabled", "archived"]).default("active"),
});

export const campaignSchema = z.object({
  ad_account_id: z.string().uuid("Select an ad account"),
  organization_id: z.string().uuid("Select an organization"),
  business_unit_id: z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required").max(200),
  external_campaign_id: z.string().max(100).nullable().optional(),
  objective: z.string().max(100).nullable().optional(),
  status: z.enum(["active", "paused", "completed", "archived", "draft"]).default("active"),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});

export const campaignMetricSchema = z.object({
  campaign_id: z.string().uuid("Select a campaign"),
  date: z.string().min(1, "Date is required"),
  spend: z.coerce.number().min(0).default(0),
  impressions: z.coerce.number().int().min(0).default(0),
  clicks: z.coerce.number().int().min(0).default(0),
  leads: z.coerce.number().int().min(0).default(0),
  conversions: z.coerce.number().int().min(0).default(0),
  revenue: z.coerce.number().min(0).nullable().optional(),
});

export const budgetRuleSchema = z.object({
  organization_id: z.string().uuid("Select an organization"),
  business_unit_id: z.string().uuid().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  channel_id: z.string().uuid().nullable().optional(),
  ad_account_id: z.string().uuid().nullable().optional(),
  campaign_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).nullable().optional(),
  metric_type: z.enum(["spend", "cpa", "roas", "clicks", "conversions", "impressions", "leads", "revenue"]),
  operator: z.enum([">", "<", ">=", "<=", "="]),
  threshold_value: z.coerce.number(),
  action_type: z.enum(["alert", "pause", "increase_budget", "decrease_budget", "notify"]),
  action_value: z.string().max(200).nullable().optional(),
  max_daily_change_pct: z.coerce.number().min(0).max(100).nullable().optional(),
  is_active: z.boolean().default(true),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type BusinessUnitFormData = z.infer<typeof businessUnitSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type ChannelFormData = z.infer<typeof channelSchema>;
export type AdAccountFormData = z.infer<typeof adAccountSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>;
export type CampaignMetricFormData = z.infer<typeof campaignMetricSchema>;
export type BudgetRuleFormData = z.infer<typeof budgetRuleSchema>;

"use server";

import { budgetRuleSchema, type BudgetRuleFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getBudgetRules(organizationId?: string) {
  try {
    const { supabase } = await requireAuth();
    let query = supabase
      .from("budget_rules")
      .select(
        "*, organization:organizations(id, name), business_unit:business_units(id, name), department:departments(id, name), channel:channels(id, name), ad_account:ad_accounts(id, name), campaign:campaigns(id, name)"
      )
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createBudgetRule(formData: BudgetRuleFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = budgetRuleSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      channel_id: parsed.channel_id || null,
      ad_account_id: parsed.ad_account_id || null,
      campaign_id: parsed.campaign_id || null,
      description: parsed.description || null,
      action_value: parsed.action_value || null,
      max_daily_change_pct: parsed.max_daily_change_pct ?? null,
    };
    const { error } = await supabase.from("budget_rules").insert(payload);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateBudgetRule(
  id: string,
  formData: BudgetRuleFormData
) {
  try {
    const { supabase } = await requireAuth();
    const parsed = budgetRuleSchema.parse(formData);
    const payload = {
      ...parsed,
      business_unit_id: parsed.business_unit_id || null,
      department_id: parsed.department_id || null,
      channel_id: parsed.channel_id || null,
      ad_account_id: parsed.ad_account_id || null,
      campaign_id: parsed.campaign_id || null,
      description: parsed.description || null,
      action_value: parsed.action_value || null,
      max_daily_change_pct: parsed.max_daily_change_pct ?? null,
    };
    const { error } = await supabase
      .from("budget_rules")
      .update(payload)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function toggleBudgetRule(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAuth();
    const { error } = await supabase
      .from("budget_rules")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

type RunBudgetRulesResult = {
  processedRules: number;
  triggeredRules: number;
  budgetCampaignsUpdated: number;
  pausedCampaignsUpdated: number;
  skippedRules: number;
  errors: string[];
};

function compare(operator: string, left: number, right: number): boolean {
  switch (operator) {
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case "=":
      return Math.abs(left - right) < 1e-9;
    default:
      return false;
  }
}

export async function runBudgetRules(): Promise<RunBudgetRulesResult> {
  const errors: string[] = [];
  let processedRules = 0;
  let triggeredRules = 0;
  let budgetCampaignsUpdated = 0;
  let pausedCampaignsUpdated = 0;
  let skippedRules = 0;

  try {
    const { supabase } = await requireAuth();

    const { data: rulesRaw, error: rulesError } = await supabase
      .from("budget_rules")
      .select("*")
      .eq("is_active", true);

    if (rulesError) throw rulesError;
    const rules = (rulesRaw ?? []) as Array<{
      id: string;
      organization_id: string;
      metric_type: BudgetRuleFormData["metric_type"];
      operator: BudgetRuleFormData["operator"];
      threshold_value: number | string;
      action_type: BudgetRuleFormData["action_type"];
      action_value: string | null;
      max_daily_change_pct: number | null;
      campaign_id: string | null;
      ad_account_id: string | null;
    }>;

    for (const rule of rules) {
      processedRules += 1;
      try {
        const evaluatedDateFallback = new Date().toISOString().slice(0, 10);
        // MVP scope: campaign_id and ad_account_id only.
        let campaignIds: string[] = [];
        if (rule.campaign_id) {
          campaignIds = [rule.campaign_id];
        } else if (rule.ad_account_id) {
          const { data: campaignRows, error: cErr } = await supabase
            .from("campaigns")
            .select("id")
            .eq("ad_account_id", rule.ad_account_id);
          if (cErr) throw cErr;
          campaignIds = (campaignRows ?? []).map((r) => r.id as string);
        }

        if (campaignIds.length === 0) {
          skippedRules += 1;
          const { data: existingUnsupportedRows } = await supabase
            .from("budget_rule_executions")
            .select("id")
            .eq("budget_rule_id", rule.id)
            .eq("evaluated_date", evaluatedDateFallback)
            .limit(1);
          if ((existingUnsupportedRows ?? []).length === 0) {
            await supabase.from("budget_rule_executions").insert({
              budget_rule_id: rule.id,
              organization_id: rule.organization_id,
              evaluated_date: evaluatedDateFallback,
              triggered: false,
              status: "skipped",
              details: { reason: "Unsupported scope (MVP)" },
            });
          }
          continue;
        }

        // Get the most recent metrics date for this rule scope.
        const { data: latestDateRows, error: latestErr } = await supabase
          .from("campaign_metrics")
          .select("date")
          .in("campaign_id", campaignIds)
          .order("date", { ascending: false })
          .limit(1);

        if (latestErr) throw latestErr;
        const evaluatedDate = latestDateRows?.[0]?.date as string | undefined;
        if (!evaluatedDate) {
          skippedRules += 1;
          const { data: existingNoMetricsRows } = await supabase
            .from("budget_rule_executions")
            .select("id")
            .eq("budget_rule_id", rule.id)
            .eq("evaluated_date", evaluatedDateFallback)
            .limit(1);
          if ((existingNoMetricsRows ?? []).length === 0) {
            await supabase.from("budget_rule_executions").insert({
              budget_rule_id: rule.id,
              organization_id: rule.organization_id,
              evaluated_date: evaluatedDateFallback,
              triggered: false,
              status: "skipped",
              details: { reason: "No metrics found" },
            });
          }
          continue;
        }

        // Idempotency: skip if already executed for that date.
        const { data: existingRows } = await supabase
          .from("budget_rule_executions")
          .select("id")
          .eq("budget_rule_id", rule.id)
          .eq("evaluated_date", evaluatedDate)
          .limit(1);
        if ((existingRows ?? []).length > 0) {
          skippedRules += 1;
          continue;
        }

        const { data: metricsRows, error: metricsErr } = await supabase
          .from("campaign_metrics")
          .select("campaign_id,spend,conversions,revenue,clicks,impressions,leads")
          .in("campaign_id", campaignIds)
          .eq("date", evaluatedDate);

        if (metricsErr) throw metricsErr;
        const metrics = metricsRows ?? [];

        const totals = metrics.reduce(
          (acc, m) => {
            acc.spend += Number(m.spend ?? 0);
            acc.conversions += Number(m.conversions ?? 0);
            acc.revenue += Number(m.revenue ?? 0);
            acc.clicks += Number(m.clicks ?? 0);
            acc.impressions += Number(m.impressions ?? 0);
            acc.leads += Number(m.leads ?? 0);
            return acc;
          },
          {
            spend: 0,
            conversions: 0,
            revenue: 0,
            clicks: 0,
            impressions: 0,
            leads: 0,
          }
        );

        let metricValue: number | null = null;
        switch (rule.metric_type) {
          case "spend":
            metricValue = totals.spend;
            break;
          case "conversions":
            metricValue = totals.conversions;
            break;
          case "clicks":
            metricValue = totals.clicks;
            break;
          case "impressions":
            metricValue = totals.impressions;
            break;
          case "leads":
            metricValue = totals.leads;
            break;
          case "revenue":
            metricValue = totals.revenue;
            break;
          case "cpa":
            metricValue =
              totals.conversions > 0 ? totals.spend / totals.conversions : null;
            break;
          case "roas":
            metricValue = totals.spend > 0 ? totals.revenue / totals.spend : null;
            break;
          default:
            metricValue = null;
        }

        const threshold =
          typeof rule.threshold_value === "string"
            ? Number(rule.threshold_value)
            : rule.threshold_value;

        if (metricValue == null) {
          skippedRules += 1;
          await supabase.from("budget_rule_executions").insert({
            budget_rule_id: rule.id,
            organization_id: rule.organization_id,
            evaluated_date: evaluatedDate,
            triggered: false,
            status: "skipped",
            details: {
              reason: "Metric value missing/invalid",
              metric_type: rule.metric_type,
            },
          });
          continue;
        }

        const triggered = compare(rule.operator, metricValue, threshold);
        if (!triggered) {
          await supabase.from("budget_rule_executions").insert({
            budget_rule_id: rule.id,
            organization_id: rule.organization_id,
            evaluated_date: evaluatedDate,
            triggered: false,
            status: "skipped",
            details: {
              metricValue,
              threshold,
              operator: rule.operator,
              action_type: rule.action_type,
            },
          });
          continue;
        }

        triggeredRules += 1;

        const detailsBase = {
          metricValue,
          threshold,
          operator: rule.operator,
          action_type: rule.action_type,
          action_value: rule.action_value,
          max_daily_change_pct: rule.max_daily_change_pct,
          campaigns: campaignIds,
          evaluatedDate,
        };

        if (rule.action_type === "pause") {
          const { error: pauseErr } = await supabase
            .from("campaigns")
            .update({ status: "paused" })
            .in("id", campaignIds);
          if (pauseErr) throw pauseErr;
          pausedCampaignsUpdated += campaignIds.length;

          await supabase.from("budget_rule_executions").insert({
            budget_rule_id: rule.id,
            organization_id: rule.organization_id,
            evaluated_date: evaluatedDate,
            triggered: true,
            status: "success",
            details: { ...detailsBase, pausedCampaignsUpdated: campaignIds.length },
          });

          continue;
        }

        if (rule.action_type === "increase_budget" || rule.action_type === "decrease_budget") {
          const amount = rule.action_value ? Number(rule.action_value) : NaN;
          if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error(
              `Invalid action_value for ${rule.action_type}. Expected positive EUR amount.`
            );
          }
          const signedDelta = rule.action_type === "increase_budget" ? amount : -amount;

          const { data: campaignsRows, error: campErr } = await supabase
            .from("campaigns")
            .select("id, daily_budget_amount")
            .in("id", campaignIds);
          if (campErr) throw campErr;

          let updatedCount = 0;
          const maxPct = rule.max_daily_change_pct ?? null;

          for (const c of campaignsRows ?? []) {
            const currentBudget = Number(c.daily_budget_amount ?? 0);

            let deltaToApply = signedDelta;
            if (maxPct != null) {
              const maxDeltaAbs = currentBudget * (Number(maxPct) / 100);
              const desiredAbs = Math.abs(signedDelta);
              // If current budget is 0 (or missing), ignore the pct cap so initial increases work.
              const clampedAbs = currentBudget > 0 ? Math.min(desiredAbs, maxDeltaAbs) : desiredAbs;
              deltaToApply = Math.sign(signedDelta) * clampedAbs;
            }

            const newBudget = Math.max(0, currentBudget + deltaToApply);
            const { error: updErr } = await supabase
              .from("campaigns")
              .update({ daily_budget_amount: newBudget })
              .eq("id", c.id);
            if (updErr) throw updErr;

            updatedCount += 1;
          }

          budgetCampaignsUpdated += updatedCount;

          await supabase.from("budget_rule_executions").insert({
            budget_rule_id: rule.id,
            organization_id: rule.organization_id,
            evaluated_date: evaluatedDate,
            triggered: true,
            status: "success",
            details: {
              ...detailsBase,
              updatedCount,
              signedDelta,
            },
          });

          continue;
        }

        // alert/notify: only log.
        await supabase.from("budget_rule_executions").insert({
          budget_rule_id: rule.id,
          organization_id: rule.organization_id,
          evaluated_date: evaluatedDate,
          triggered: true,
          status: "success",
          details: {
            ...detailsBase,
            note: "No budget change executed for action_type",
          },
        });
      } catch (ruleErr) {
        skippedRules += 0;
        errors.push(
          ruleErr instanceof Error ? ruleErr.message : "Budget rule execution failed"
        );
        // Best effort execution log.
        try {
          await supabase.from("budget_rule_executions").insert({
            budget_rule_id: rule.id,
            organization_id: rule.organization_id,
            evaluated_date: new Date().toISOString().slice(0, 10),
            triggered: false,
            status: "error",
            error_message:
              ruleErr instanceof Error ? ruleErr.message : "Budget rule execution failed",
            details: {},
          });
        } catch {
          // ignore
        }
      }
    }

    revalidatePath("/app/rules");
    revalidatePath("/app/dashboard");

    return {
      processedRules,
      triggeredRules,
      budgetCampaignsUpdated,
      pausedCampaignsUpdated,
      skippedRules,
      errors,
    };
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

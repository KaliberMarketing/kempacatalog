"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createBudgetRule,
  toggleBudgetRule,
  updateBudgetRule,
  runBudgetRules,
} from "@/lib/actions/budget-rules";
import { z } from "zod";
import {
  budgetRuleSchema,
  type BudgetRuleFormData,
} from "@/lib/validators";
import type {
  AdAccount,
  BudgetRule,
  BusinessUnit,
  Campaign,
  Channel,
  Department,
  Organization,
} from "@/types/database";
import { useUser } from "@/components/providers/user-provider";

const METRIC_TYPE_OPTIONS: {
  value: BudgetRuleFormData["metric_type"];
  label: string;
}[] = [
  { value: "spend", label: "Spend" },
  { value: "cpa", label: "CPA" },
  { value: "roas", label: "ROAS" },
  { value: "clicks", label: "Clicks" },
  { value: "conversions", label: "Conversions" },
  { value: "impressions", label: "Impressions" },
  { value: "leads", label: "Leads" },
  { value: "revenue", label: "Revenue" },
];

const OPERATOR_OPTIONS: {
  value: BudgetRuleFormData["operator"];
  label: string;
}[] = [
  { value: ">", label: ">" },
  { value: "<", label: "<" },
  { value: ">=", label: ">=" },
  { value: "<=", label: "<=" },
  { value: "=", label: "=" },
];

const ACTION_TYPE_OPTIONS: {
  value: BudgetRuleFormData["action_type"];
  label: string;
}[] = [
  { value: "alert", label: "Alert" },
  { value: "pause", label: "Pause" },
  { value: "increase_budget", label: "Increase budget" },
  { value: "decrease_budget", label: "Decrease budget" },
  { value: "notify", label: "Notify" },
];

type BudgetRuleFormValues = z.input<typeof budgetRuleSchema>;

const defaultFormValues: BudgetRuleFormValues = {
  organization_id: "",
  business_unit_id: null,
  department_id: null,
  channel_id: null,
  ad_account_id: null,
  campaign_id: null,
  name: "",
  description: null,
  metric_type: "spend",
  operator: ">",
  threshold_value: 0,
  action_type: "alert",
  action_value: null,
  max_daily_change_pct: null,
  is_active: true,
};

export function getBudgetRuleScopeDisplay(rule: BudgetRule): string {
  if (rule.campaign_id)
    return rule.campaign?.name ? `Campaign · ${rule.campaign.name}` : "Campaign";
  if (rule.ad_account_id)
    return rule.ad_account?.name
      ? `Ad account · ${rule.ad_account.name}`
      : "Ad account";
  if (rule.channel_id)
    return rule.channel?.name ? `Channel · ${rule.channel.name}` : "Channel";
  if (rule.department_id)
    return rule.department?.name
      ? `Department · ${rule.department.name}`
      : "Department";
  if (rule.business_unit_id)
    return rule.business_unit?.name
      ? `Business unit · ${rule.business_unit.name}`
      : "Business unit";
  if (rule.organization_id)
    return rule.organization?.name
      ? `Organization · ${rule.organization.name}`
      : "Organization";
  return "—";
}

function formatActionType(type: BudgetRule["action_type"]): string {
  return type.replace(/_/g, " ");
}

function ruleToFormData(rule: BudgetRule): BudgetRuleFormValues {
  return {
    organization_id: rule.organization_id,
    business_unit_id: rule.business_unit_id,
    department_id: rule.department_id,
    channel_id: rule.channel_id,
    ad_account_id: rule.ad_account_id,
    campaign_id: rule.campaign_id,
    name: rule.name,
    description: rule.description,
    metric_type: rule.metric_type,
    operator: rule.operator,
    threshold_value: rule.threshold_value,
    action_type: rule.action_type,
    action_value: rule.action_value,
    max_daily_change_pct: rule.max_daily_change_pct,
    is_active: rule.is_active,
  };
}

function nullifyEmptyUuid(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

function normalizeBudgetPayload(data: BudgetRuleFormData): BudgetRuleFormData {
  return {
    ...data,
    organization_id: data.organization_id,
    business_unit_id: nullifyEmptyUuid(data.business_unit_id),
    department_id: nullifyEmptyUuid(data.department_id),
    channel_id: nullifyEmptyUuid(data.channel_id),
    ad_account_id: nullifyEmptyUuid(data.ad_account_id),
    campaign_id: nullifyEmptyUuid(data.campaign_id),
    description:
      data.description != null && String(data.description).trim() === ""
        ? null
        : data.description,
    action_value:
      data.action_value != null && String(data.action_value).trim() === ""
        ? null
        : data.action_value,
    max_daily_change_pct:
      data.max_daily_change_pct === undefined ||
      data.max_daily_change_pct === null ||
      (typeof data.max_daily_change_pct === "number" &&
        Number.isNaN(data.max_daily_change_pct))
        ? null
        : data.max_daily_change_pct,
  };
}

interface RulesClientProps {
  rules: BudgetRule[];
  organizations: Organization[];
  businessUnits: BusinessUnit[];
  departments: Department[];
  channels: Channel[];
  adAccounts: AdAccount[];
  campaigns: Campaign[];
}

export function RulesClient({
  rules,
  organizations,
  businessUnits,
  departments,
  channels,
  adAccounts,
  campaigns,
}: RulesClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetRule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [runningRules, setRunningRules] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const form = useForm<BudgetRuleFormValues>({
    resolver: zodResolver(budgetRuleSchema),
    defaultValues: defaultFormValues,
  });

  const orgId = form.watch("organization_id");

  const orgOptions = useMemo(
    () =>
      organizations.map((o) => ({
        value: o.id,
        label: o.name,
      })),
    [organizations]
  );

  const buOptions = useMemo(() => {
    const list = orgId
      ? businessUnits.filter((b) => b.organization_id === orgId)
      : businessUnits;
    return list.map((b) => ({ value: b.id, label: b.name }));
  }, [businessUnits, orgId]);

  const deptOptions = useMemo(() => {
    const list = orgId
      ? departments.filter((d) => d.organization_id === orgId)
      : departments;
    return list.map((d) => ({ value: d.id, label: d.name }));
  }, [departments, orgId]);

  const adAccountOptions = useMemo(() => {
    const list = orgId
      ? adAccounts.filter((a) => a.organization_id === orgId)
      : adAccounts;
    return list.map((a) => ({ value: a.id, label: a.name }));
  }, [adAccounts, orgId]);

  const campaignOptions = useMemo(() => {
    const list = orgId
      ? campaigns.filter((c) => c.organization_id === orgId)
      : campaigns;
    return list.map((c) => ({ value: c.id, label: c.name }));
  }, [campaigns, orgId]);

  const channelOptions = useMemo(
    () => channels.map((c) => ({ value: c.id, label: c.name })),
    [channels]
  );

  function openCreate() {
    setEditingItem(null);
    setFormError(null);
    form.reset(defaultFormValues);
    setDialogOpen(true);
  }

  function openEdit(rule: BudgetRule) {
    setEditingItem(rule);
    setFormError(null);
    form.reset(ruleToFormData(rule));
    setDialogOpen(true);
  }

  async function onSubmit(values: BudgetRuleFormValues) {
    setFormError(null);
    setSubmitting(true);
    const parsed = budgetRuleSchema.parse(values);
    const payload = normalizeBudgetPayload(parsed);
    try {
      if (editingItem) {
        await updateBudgetRule(editingItem.id, payload);
      } else {
        await createBudgetRule(payload);
      }
      setDialogOpen(false);
      setEditingItem(null);
      form.reset(defaultFormValues);
      router.refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(rule: BudgetRule, next: boolean) {
    setTogglingId(rule.id);
    setToggleError(null);
    try {
      await toggleBudgetRule(rule.id, next);
      router.refresh();
    } catch (e) {
      setToggleError(
        e instanceof Error ? e.message : "Failed to toggle rule."
      );
    } finally {
      setTogglingId(null);
    }
  }

  const columns = useMemo<ColumnDef<BudgetRule>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        id: "organization",
        header: "Organization",
        cell: ({ row }) => row.original.organization?.name ?? "—",
      },
      {
        id: "scope",
        header: "Scope",
        cell: ({ row }) => getBudgetRuleScopeDisplay(row.original),
      },
      {
        accessorKey: "metric_type",
        header: "Metric",
      },
      {
        id: "condition",
        header: "Condition",
        cell: ({ row }) =>
          `${row.original.operator} ${row.original.threshold_value.toFixed(2)}`,
      },
      {
        accessorKey: "action_type",
        header: "Action",
        cell: ({ row }) => formatActionType(row.original.action_type),
      },
      {
        id: "is_active",
        header: "Active",
        cell: ({ row }) => {
          const r = row.original;
          const busy = togglingId === r.id;
          return (
            <Button
              type="button"
              variant={r.is_active ? "default" : "outline"}
              size="sm"
              disabled={busy}
              onClick={() => handleToggle(r, !r.is_active)}
            >
              {busy ? "…" : r.is_active ? "On" : "Off"}
            </Button>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEdit(row.original)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [togglingId]
  );

  return (
    <div>
      <PageHeader
        title="Budget rules"
        description="Automate alerts and budget actions from metric thresholds."
      >
        {canManage && (
          <div className="flex gap-2">
            <Button type="button" onClick={openCreate}>
              Add rule
            </Button>
            <Button
              type="button"
              disabled={runningRules}
              onClick={async () => {
                setRunningRules(true);
                setRunMessage(null);
                setToggleError(null);
                try {
                  const res = await runBudgetRules();
                  setRunMessage(
                    `Processed ${res.processedRules} rules. Triggered ${res.triggeredRules}. Updated budgets ${res.budgetCampaignsUpdated}.`
                  );
                } catch (e) {
                  setRunMessage(
                    e instanceof Error ? e.message : "Failed to run budget rules."
                  );
                } finally {
                  setRunningRules(false);
                }
              }}
            >
              {runningRules ? "Running…" : "Run rules"}
            </Button>
          </div>
        )}
      </PageHeader>

      {toggleError && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2">
          <p className="text-sm text-destructive">{toggleError}</p>
        </div>
      )}

      {runMessage && (
        <div className="mb-4 rounded-md border border-border px-3 py-2">
          <p className="text-sm">{runMessage}</p>
        </div>
      )}

      {rules.length === 0 ? (
        <EmptyState
          title="No budget rules yet"
          description={canManage ? "Create a rule to react when metrics cross a threshold." : "No budget rules are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add rule
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={rules}
          searchKey="name"
          searchPlaceholder="Search by name…"
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] overflow-y-auto max-w-lg"
        >
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit budget rule" : "New budget rule"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              label="Organization"
              required
              error={form.formState.errors.organization_id}
            >
              <Controller
                name="organization_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Select organization"
                    options={orgOptions}
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      form.setValue("business_unit_id", null);
                      form.setValue("department_id", null);
                      form.setValue("channel_id", null);
                      form.setValue("ad_account_id", null);
                      form.setValue("campaign_id", null);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Business unit"
              error={form.formState.errors.business_unit_id}
            >
              <Controller
                name="business_unit_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Optional"
                    options={buOptions}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Department"
              error={form.formState.errors.department_id}
            >
              <Controller
                name="department_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Optional"
                    options={deptOptions}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField label="Channel" error={form.formState.errors.channel_id}>
              <Controller
                name="channel_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Optional"
                    options={channelOptions}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Ad account"
              error={form.formState.errors.ad_account_id}
            >
              <Controller
                name="ad_account_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Optional"
                    options={adAccountOptions}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Campaign"
              error={form.formState.errors.campaign_id}
            >
              <Controller
                name="campaign_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    placeholder="Optional"
                    options={campaignOptions}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            <FormField label="Name" required error={form.formState.errors.name}>
              <Input {...form.register("name")} />
            </FormField>

            <FormField
              label="Description"
              error={form.formState.errors.description}
            >
              <Textarea
                rows={3}
                {...form.register("description", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? null : v,
                })}
              />
            </FormField>

            <FormField
              label="Metric type"
              required
              error={form.formState.errors.metric_type}
            >
              <Select
                options={METRIC_TYPE_OPTIONS}
                {...form.register("metric_type")}
              />
            </FormField>

            <FormField
              label="Operator"
              required
              error={form.formState.errors.operator}
            >
              <Select options={OPERATOR_OPTIONS} {...form.register("operator")} />
            </FormField>

            <FormField
              label="Threshold"
              required
              error={form.formState.errors.threshold_value}
            >
              <Input
                type="number"
                step="any"
                {...form.register("threshold_value", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Action type"
              required
              error={form.formState.errors.action_type}
            >
              <Select
                options={ACTION_TYPE_OPTIONS}
                {...form.register("action_type")}
              />
            </FormField>

            <FormField
              label="Action value (EUR)"
              error={form.formState.errors.action_value}
            >
              <Input
                {...form.register("action_value", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? null : v,
                })}
              />
            </FormField>

            <FormField
              label="Max daily change %"
              error={form.formState.errors.max_daily_change_pct}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step="0.1"
                {...form.register("max_daily_change_pct", {
                  setValueAs: (v) => {
                    if (v === "" || v === undefined) return null;
                    const n = Number(v);
                    return Number.isNaN(n) ? null : n;
                  },
                })}
              />
            </FormField>

            <FormField label="Active" error={form.formState.errors.is_active}>
              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-input"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingItem ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

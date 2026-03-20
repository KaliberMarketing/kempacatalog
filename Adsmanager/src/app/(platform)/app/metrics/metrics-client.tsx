"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createMetric } from "@/lib/actions/metrics";
import { z } from "zod";
import {
  campaignMetricSchema,
  type CampaignMetricFormData,
} from "@/lib/validators";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import type { Campaign, CampaignMetric } from "@/types/database";

interface MetricsClientProps {
  metrics: CampaignMetric[];
  campaigns: Campaign[];
}

type MetricFormValues = z.input<typeof campaignMetricSchema>;

export function MetricsClient({ metrics, campaigns }: MetricsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<MetricFormValues>({
    resolver: zodResolver(campaignMetricSchema),
    defaultValues: {
      campaign_id: "",
      date: "",
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      conversions: 0,
      revenue: undefined,
    },
  });

  const campaignOptions = useMemo(
    () =>
      campaigns.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [campaigns]
  );

  const columns = useMemo<ColumnDef<CampaignMetric>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: "campaign",
        header: "Campaign",
        cell: ({ row }) => row.original.campaign?.name ?? "—",
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ row }) => formatCurrency(row.original.spend),
      },
      {
        accessorKey: "impressions",
        header: "Impressions",
        cell: ({ row }) => formatNumber(row.original.impressions),
      },
      {
        accessorKey: "clicks",
        header: "Clicks",
        cell: ({ row }) => formatNumber(row.original.clicks),
      },
      {
        accessorKey: "leads",
        header: "Leads",
        cell: ({ row }) => formatNumber(row.original.leads),
      },
      {
        accessorKey: "conversions",
        header: "Conversions",
        cell: ({ row }) => formatNumber(row.original.conversions),
      },
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) =>
          row.original.revenue != null
            ? formatCurrency(row.original.revenue)
            : "—",
      },
      {
        accessorKey: "cpa",
        header: "CPA",
        cell: ({ row }) =>
          row.original.cpa != null ? formatCurrency(row.original.cpa) : "—",
      },
      {
        accessorKey: "roas",
        header: "ROAS",
        cell: ({ row }) =>
          row.original.roas != null
            ? row.original.roas.toFixed(2)
            : "—",
      },
    ],
    []
  );

  function openCreate() {
    setFormError(null);
    form.reset({
      campaign_id: "",
      date: "",
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      conversions: 0,
      revenue: undefined,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: MetricFormValues) {
    setFormError(null);
    setSubmitting(true);
    try {
      const parsed = campaignMetricSchema.parse(values);
      const payload: CampaignMetricFormData = {
        ...parsed,
        revenue:
          parsed.revenue === undefined ||
          parsed.revenue === null ||
          (typeof parsed.revenue === "number" && Number.isNaN(parsed.revenue))
            ? undefined
            : parsed.revenue,
      };
      await createMetric(payload);
      setDialogOpen(false);
      form.reset();
      router.refresh();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Metrics"
        description="Daily campaign performance and spend."
      >
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add metric
          </Button>
        )}
      </PageHeader>

      {metrics.length === 0 ? (
        <EmptyState
          title="No metrics yet"
          description={canManage ? "Record daily spend and performance for a campaign." : "No metrics are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add metric
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={metrics}
          searchKey="date"
          searchPlaceholder="Search by date…"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] overflow-y-auto max-w-lg"
        >
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add campaign metric</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              label="Campaign"
              required
              error={form.formState.errors.campaign_id}
            >
              <Select
                placeholder="Select campaign"
                options={campaignOptions}
                {...form.register("campaign_id")}
              />
            </FormField>

            <FormField label="Date" required error={form.formState.errors.date}>
              <Input type="date" {...form.register("date")} />
            </FormField>

            <FormField label="Spend" required error={form.formState.errors.spend}>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...form.register("spend", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Impressions"
              required
              error={form.formState.errors.impressions}
            >
              <Input
                type="number"
                min={0}
                {...form.register("impressions", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Clicks" required error={form.formState.errors.clicks}>
              <Input
                type="number"
                min={0}
                {...form.register("clicks", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Leads" required error={form.formState.errors.leads}>
              <Input
                type="number"
                min={0}
                {...form.register("leads", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Conversions"
              required
              error={form.formState.errors.conversions}
            >
              <Input
                type="number"
                min={0}
                {...form.register("conversions", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Revenue" error={form.formState.errors.revenue}>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...form.register("revenue", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
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
                {submitting ? "Saving…" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

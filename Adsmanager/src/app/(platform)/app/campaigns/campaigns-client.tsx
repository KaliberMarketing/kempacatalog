"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { createCampaign, updateCampaign } from "@/lib/actions/campaigns";
import { campaignSchema, type CampaignFormData } from "@/lib/validators";
import { formatDate } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import type { Campaign, Organization, AdAccount, BusinessUnit, Department } from "@/types/database";

const campaignFormSchema = campaignSchema.extend({
  business_unit_id: z.union([z.string().uuid(), z.literal("")]).optional(),
  department_id: z.union([z.string().uuid(), z.literal("")]).optional(),
  external_campaign_id: z.union([z.string().max(100), z.literal("")]).optional(),
  objective: z.union([z.string().max(100), z.literal("")]).optional(),
  start_date: z.union([z.string(), z.literal("")]).optional(),
  end_date: z.union([z.string(), z.literal("")]).optional(),
});

type CampaignFormValues = z.input<typeof campaignFormSchema>;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "draft", label: "Draft" },
];

function toPayload(values: CampaignFormValues): CampaignFormData {
  return campaignSchema.parse({
    ...values,
    business_unit_id: values.business_unit_id === "" ? undefined : values.business_unit_id,
    department_id: values.department_id === "" ? undefined : values.department_id,
    external_campaign_id:
      values.external_campaign_id === "" ? undefined : values.external_campaign_id,
    objective: values.objective === "" ? undefined : values.objective,
    start_date: values.start_date === "" ? undefined : values.start_date,
    end_date: values.end_date === "" ? undefined : values.end_date,
  });
}

const defaultFormValues: CampaignFormValues = {
  ad_account_id: "",
  organization_id: "",
  business_unit_id: "",
  department_id: "",
  name: "",
  external_campaign_id: "",
  objective: "",
  status: "active",
  start_date: "",
  end_date: "",
};

interface CampaignsClientProps {
  campaigns: Campaign[];
  organizations: Organization[];
  adAccounts: AdAccount[];
  businessUnits: BusinessUnit[];
  departments: Department[];
}

export function CampaignsClient({
  campaigns,
  organizations,
  adAccounts,
  businessUnits,
  departments,
}: CampaignsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Campaign | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: defaultFormValues,
  });

  const organizationId = watch("organization_id");
  const adAccountField = register("ad_account_id");
  const orgField = register("organization_id");

  const orgOptions = useMemo(
    () => organizations.map((o) => ({ value: o.id, label: o.name })),
    [organizations]
  );
  const adAccountOptions = useMemo(() => {
    const filtered = organizationId
      ? adAccounts.filter((a) => a.organization_id === organizationId)
      : adAccounts;
    return filtered.map((a) => ({ value: a.id, label: a.name }));
  }, [adAccounts, organizationId]);
  const buOptions = useMemo(() => {
    const filtered = organizationId
      ? businessUnits.filter((b) => b.organization_id === organizationId)
      : businessUnits;
    return filtered.map((b) => ({ value: b.id, label: b.name }));
  }, [businessUnits, organizationId]);
  const deptOptions = useMemo(() => {
    const filtered = organizationId
      ? departments.filter((d) => d.organization_id === organizationId)
      : departments;
    return filtered.map((d) => ({ value: d.id, label: d.name }));
  }, [departments, organizationId]);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setSubmitError(null);
    reset(defaultFormValues);
    setDialogOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (row: Campaign) => {
      setEditingItem(row);
      setSubmitError(null);
      reset({
        ad_account_id: row.ad_account_id,
        organization_id: row.organization_id,
        business_unit_id: row.business_unit_id ?? "",
        department_id: row.department_id ?? "",
        name: row.name,
        external_campaign_id: row.external_campaign_id ?? "",
        objective: row.objective ?? "",
        status: row.status,
        start_date: row.start_date ? row.start_date.slice(0, 10) : "",
        end_date: row.end_date ? row.end_date.slice(0, 10) : "",
      });
      setDialogOpen(true);
    },
    [reset]
  );

  const onSubmit = async (values: CampaignFormValues) => {
    setSubmitError(null);
    try {
      const payload = toPayload(values);
      if (editingItem) {
        await updateCampaign(editingItem.id, payload);
      } else {
        await createCampaign(payload);
      }
      setDialogOpen(false);
      setEditingItem(null);
      reset(defaultFormValues);
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const columns = useMemo<ColumnDef<Campaign>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        id: "ad_account",
        header: "Ad account",
        accessorFn: (row) => row.ad_account?.name ?? "—",
      },
      {
        id: "organization",
        header: "Organization",
        accessorFn: (row) => row.organization?.name ?? "—",
      },
      {
        id: "objective",
        header: "Objective",
        accessorFn: (row) => row.objective ?? "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "start_date",
        header: "Start",
        accessorFn: (row) => (row.start_date ? formatDate(row.start_date) : "—"),
      },
      {
        id: "end_date",
        header: "End",
        accessorFn: (row) => (row.end_date ? formatDate(row.end_date) : "—"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            Edit
          </Button>
        ),
      },
    ],
    [openEdit]
  );

  return (
    <div>
      <PageHeader title="Campaigns" description="Plan and track campaigns across ad accounts.">
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add campaign
          </Button>
        )}
      </PageHeader>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description={canManage ? "Create a campaign to start tracking performance." : "No campaigns are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add campaign
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable columns={columns} data={campaigns} searchKey="name" searchPlaceholder="Search by name…" />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingItem(null);
            setSubmitError(null);
            reset(defaultFormValues);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit campaign" : "New campaign"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Ad account" required error={errors.ad_account_id}>
              <Select
                options={adAccountOptions}
                placeholder="Select ad account"
                name={adAccountField.name}
                ref={adAccountField.ref}
                onBlur={adAccountField.onBlur}
                onChange={(e) => {
                  adAccountField.onChange(e);
                  const acc = adAccounts.find((a) => a.id === e.target.value);
                  if (acc) {
                    setValue("organization_id", acc.organization_id, { shouldValidate: true });
                  }
                }}
              />
            </FormField>
            <FormField label="Organization" required error={errors.organization_id}>
              <Select
                options={orgOptions}
                placeholder="Select organization"
                name={orgField.name}
                ref={orgField.ref}
                onBlur={orgField.onBlur}
                onChange={(e) => {
                  orgField.onChange(e);
                  const oid = e.target.value;
                  const currentAd = watch("ad_account_id");
                  const acc = adAccounts.find((a) => a.id === currentAd);
                  if (acc && oid && acc.organization_id !== oid) {
                    setValue("ad_account_id", "");
                  }
                  setValue("business_unit_id", "");
                  setValue("department_id", "");
                }}
              />
            </FormField>
            <FormField label="Business unit" error={errors.business_unit_id}>
              <Select options={buOptions} placeholder="None" {...register("business_unit_id")} />
            </FormField>
            <FormField label="Department" error={errors.department_id}>
              <Select options={deptOptions} placeholder="None" {...register("department_id")} />
            </FormField>
            <FormField label="Name" required error={errors.name}>
              <Input {...register("name")} />
            </FormField>
            <FormField label="External campaign ID" error={errors.external_campaign_id}>
              <Input {...register("external_campaign_id")} />
            </FormField>
            <FormField label="Objective" error={errors.objective}>
              <Input {...register("objective")} />
            </FormField>
            <FormField label="Status" required error={errors.status}>
              <Select options={statusOptions} {...register("status")} />
            </FormField>
            <FormField label="Start date" error={errors.start_date}>
              <Input type="date" {...register("start_date")} />
            </FormField>
            <FormField label="End date" error={errors.end_date}>
              <Input type="date" {...register("end_date")} />
            </FormField>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : editingItem ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

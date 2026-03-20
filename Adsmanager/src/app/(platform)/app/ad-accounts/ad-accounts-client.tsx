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
import { createAdAccount, updateAdAccount } from "@/lib/actions/ad-accounts";
import { adAccountSchema, type AdAccountFormData } from "@/lib/validators";
import { useUser } from "@/components/providers/user-provider";
import type { AdAccount, Organization, BusinessUnit, Department, Channel } from "@/types/database";

const adAccountFormSchema = adAccountSchema.extend({
  business_unit_id: z.union([z.string().uuid(), z.literal("")]).optional(),
  department_id: z.union([z.string().uuid(), z.literal("")]).optional(),
  external_account_id: z.union([z.string().max(100), z.literal("")]).optional(),
});

type AdAccountFormValues = z.input<typeof adAccountFormSchema>;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "disabled", label: "Disabled" },
  { value: "archived", label: "Archived" },
];

function toPayload(values: AdAccountFormValues): AdAccountFormData {
  return adAccountSchema.parse({
    ...values,
    business_unit_id: values.business_unit_id === "" ? undefined : values.business_unit_id,
    department_id: values.department_id === "" ? undefined : values.department_id,
    external_account_id:
      values.external_account_id === "" ? undefined : values.external_account_id,
  });
}

const defaultFormValues: AdAccountFormValues = {
  organization_id: "",
  channel_id: "",
  business_unit_id: "",
  department_id: "",
  name: "",
  external_account_id: "",
  currency: "EUR",
  timezone: "Europe/Brussels",
  status: "active",
};

interface AdAccountsClientProps {
  adAccounts: AdAccount[];
  organizations: Organization[];
  businessUnits: BusinessUnit[];
  departments: Department[];
  channels: Channel[];
}

export function AdAccountsClient({
  adAccounts,
  organizations,
  businessUnits,
  departments,
  channels,
}: AdAccountsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdAccount | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdAccountFormValues>({
    resolver: zodResolver(adAccountFormSchema),
    defaultValues: defaultFormValues,
  });

  const organizationId = watch("organization_id");
  const orgField = register("organization_id");

  const orgOptions = useMemo(
    () => organizations.map((o) => ({ value: o.id, label: o.name })),
    [organizations]
  );
  const channelOptions = useMemo(
    () => channels.map((c) => ({ value: c.id, label: c.name })),
    [channels]
  );
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
    (row: AdAccount) => {
      setEditingItem(row);
      setSubmitError(null);
      reset({
        organization_id: row.organization_id,
        channel_id: row.channel_id,
        business_unit_id: row.business_unit_id ?? "",
        department_id: row.department_id ?? "",
        name: row.name,
        external_account_id: row.external_account_id ?? "",
        currency: row.currency,
        timezone: row.timezone,
        status: row.status,
      });
      setDialogOpen(true);
    },
    [reset]
  );

  const onSubmit = async (values: AdAccountFormValues) => {
    setSubmitError(null);
    try {
      const payload = toPayload(values);
      if (editingItem) {
        await updateAdAccount(editingItem.id, payload);
      } else {
        await createAdAccount(payload);
      }
      setDialogOpen(false);
      setEditingItem(null);
      reset(defaultFormValues);
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const columns = useMemo<ColumnDef<AdAccount>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        id: "organization",
        header: "Organization",
        accessorFn: (row) => row.organization?.name ?? "—",
      },
      {
        id: "channel",
        header: "Channel",
        accessorFn: (row) => row.channel?.name ?? "—",
      },
      {
        id: "business_unit",
        header: "Business unit",
        accessorFn: (row) => row.business_unit?.name ?? "—",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "currency", header: "Currency" },
      {
        id: "external_account_id",
        header: "External ID",
        accessorFn: (row) => row.external_account_id ?? "—",
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
      <PageHeader title="Ad accounts" description="Connect and manage advertising accounts.">
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add ad account
          </Button>
        )}
      </PageHeader>

      {adAccounts.length === 0 ? (
        <EmptyState
          title="No ad accounts yet"
          description={canManage ? "Create an ad account to link channels and organizations." : "No ad accounts are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add ad account
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable columns={columns} data={adAccounts} searchKey="name" searchPlaceholder="Search by name…" />
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
            <DialogTitle>{editingItem ? "Edit ad account" : "New ad account"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Organization" required error={errors.organization_id}>
              <Select
                options={orgOptions}
                placeholder="Select organization"
                name={orgField.name}
                ref={orgField.ref}
                onBlur={orgField.onBlur}
                onChange={(e) => {
                  orgField.onChange(e);
                  setValue("business_unit_id", "");
                  setValue("department_id", "");
                }}
              />
            </FormField>
            <FormField label="Channel" required error={errors.channel_id}>
              <Select options={channelOptions} placeholder="Select channel" {...register("channel_id")} />
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
            <FormField label="External account ID" error={errors.external_account_id}>
              <Input {...register("external_account_id")} />
            </FormField>
            <FormField label="Currency" required error={errors.currency}>
              <Input {...register("currency")} />
            </FormField>
            <FormField label="Timezone" required error={errors.timezone}>
              <Input {...register("timezone")} />
            </FormField>
            <FormField label="Status" required error={errors.status}>
              <Select options={statusOptions} {...register("status")} />
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

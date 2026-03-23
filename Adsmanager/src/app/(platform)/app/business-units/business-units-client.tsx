"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { z } from "zod";
import { slugify, formatDate } from "@/lib/utils";
import { businessUnitSchema } from "@/lib/validators";
import {
  createBusinessUnit,
  updateBusinessUnit,
  deleteBusinessUnit,
} from "@/lib/actions/business-units";
import { useUser } from "@/components/providers/user-provider";
import type { BusinessUnit, Organization } from "@/types/database";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

type BusinessUnitFormValues = z.input<typeof businessUnitSchema>;

const defaultFormValues: BusinessUnitFormValues = {
  organization_id: "",
  name: "",
  slug: "",
  type: "",
  status: "active",
};

interface BusinessUnitsClientProps {
  businessUnits: BusinessUnit[];
  organizations: Organization[];
}

export function BusinessUnitsClient({
  businessUnits,
  organizations,
}: BusinessUnitsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessUnit | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const orgOptions = useMemo(
    () =>
      organizations.map((o) => ({
        value: o.id,
        label: o.name,
      })),
    [organizations]
  );

  const form = useForm<BusinessUnitFormValues>({
    resolver: zodResolver(businessUnitSchema),
    defaultValues: defaultFormValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const nameRegister = register("name");

  function openCreate() {
    setEditingItem(null);
    setActionError(null);
    reset(defaultFormValues);
    setDialogOpen(true);
  }

  function openEdit(item: BusinessUnit) {
    setEditingItem(item);
    setActionError(null);
    reset({
      organization_id: item.organization_id,
      name: item.name,
      slug: item.slug,
      type: item.type ?? "",
      status: item.status,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: BusinessUnitFormValues) {
    setActionError(null);
    const data = businessUnitSchema.parse({
      ...values,
      type: values.type === "" ? null : values.type,
    });
    try {
      if (editingItem) {
        await updateBusinessUnit(editingItem.id, data);
      } else {
        await createBusinessUnit(data);
      }
      setDialogOpen(false);
      setEditingItem(null);
      reset(defaultFormValues);
      router.refresh();
    } catch {
      setActionError("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!isSuperAdmin) return;

    const ok = window.confirm(
      "Delete this business unit permanently?\n\nThis cannot be undone. Related ad accounts and campaigns will be updated as needed."
    );
    if (!ok) return;

    setActionError(null);
    setDialogOpen(false);
    setEditingItem(null);
    reset(defaultFormValues);

    try {
      await deleteBusinessUnit(id);
      router.refresh();
    } catch {
      window.alert("Delete failed. Please check your permissions or try again.");
      setActionError("Something went wrong. Please try again.");
    }
  }

  const columns = useMemo<ColumnDef<BusinessUnit>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        id: "organization",
        header: "Organization",
        accessorFn: (row) => row.organization?.name ?? "—",
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.type ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <StatusBadge status={String(getValue())} />
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ getValue }) => formatDate(String(getValue())),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row.original)}
            >
              Edit
            </Button>
            {isSuperAdmin && (
              <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(row.original.id)}>
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <PageHeader
        title="Business units"
        description="Structure organizations into brands, regions, or divisions."
      >
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add business unit
          </Button>
        )}
      </PageHeader>

      {businessUnits.length === 0 ? (
        <EmptyState
          title="No business units yet"
          description={canManage ? "Create a business unit to segment campaigns and spend." : "No business units are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add business unit
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={businessUnits}
          searchKey="name"
          searchPlaceholder="Search by name…"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] overflow-y-auto"
        >
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit business unit" : "New business unit"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}

            <FormField
              label="Organization"
              required
              error={errors.organization_id}
            >
              <Select
                placeholder="Select organization"
                options={orgOptions}
                {...register("organization_id")}
              />
            </FormField>

            <FormField label="Name" required error={errors.name}>
              <Input
                {...nameRegister}
                onChange={(e) => {
                  nameRegister.onChange(e);
                  setValue("slug", slugify(e.target.value), {
                    shouldValidate: true,
                  });
                }}
              />
            </FormField>

            <FormField label="Slug" required error={errors.slug}>
              <Input {...register("slug")} />
            </FormField>

            <FormField label="Type" error={errors.type}>
              <Input placeholder="Optional" {...register("type")} />
            </FormField>

            <FormField label="Status" error={errors.status}>
              <Select options={statusOptions} {...register("status")} />
            </FormField>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : editingItem ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

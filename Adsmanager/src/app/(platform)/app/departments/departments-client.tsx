"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  DataTable,
  type ColumnDef,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { z } from "zod";
import { slugify, formatDate } from "@/lib/utils";
import { departmentSchema } from "@/lib/validators";
import {
  createDepartment,
  updateDepartment,
} from "@/lib/actions/departments";
import { useUser } from "@/components/providers/user-provider";
import type { Department, Organization } from "@/types/database";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

type DepartmentFormValues = z.input<typeof departmentSchema>;

const defaultFormValues: DepartmentFormValues = {
  organization_id: "",
  name: "",
  slug: "",
  description: "",
  status: "active",
};

function truncateDescription(text: string | null, max = 72): string {
  if (!text) return "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

interface DepartmentsClientProps {
  departments: Department[];
  organizations: Organization[];
}

export function DepartmentsClient({
  departments,
  organizations,
}: DepartmentsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Department | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const orgOptions = useMemo(
    () =>
      organizations.map((o) => ({
        value: o.id,
        label: o.name,
      })),
    [organizations]
  );

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
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

  function openEdit(item: Department) {
    setEditingItem(item);
    setActionError(null);
    reset({
      organization_id: item.organization_id,
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      status: item.status,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: DepartmentFormValues) {
    setActionError(null);
    const data = departmentSchema.parse(values);
    try {
      if (editingItem) {
        await updateDepartment(editingItem.id, data);
      } else {
        await createDepartment(data);
      }
      setDialogOpen(false);
      setEditingItem(null);
      reset(defaultFormValues);
      router.refresh();
    } catch {
      setActionError("Something went wrong. Please try again.");
    }
  }

  const columns = useMemo<ColumnDef<Department>[]>(
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
        id: "description",
        header: "Description",
        accessorFn: (row) => truncateDescription(row.description),
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
    []
  );

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize teams and cost centers within organizations."
      >
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add department
          </Button>
        )}
      </PageHeader>

      {departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description={canManage ? "Create a department to align reporting and access." : "No departments are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add department
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={departments}
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
              {editingItem ? "Edit department" : "New department"}
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

            <FormField label="Description" error={errors.description}>
              <Textarea rows={3} {...register("description")} />
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

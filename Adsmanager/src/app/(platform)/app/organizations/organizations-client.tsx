"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
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
import {
  createOrganization,
  updateOrganization,
} from "@/lib/actions/organizations";
import { organizationSchema, type OrganizationFormData } from "@/lib/validators";
import { formatDate, slugify } from "@/lib/utils";
import { useUser } from "@/components/providers/user-provider";
import type { Organization } from "@/types/database";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

const defaultFormValues: OrganizationFormData = {
  name: "",
  slug: "",
  status: "active",
};

function slugFromName(name: string): string {
  return slugify(name).replace(/_/g, "-");
}

export function OrganizationsClient({
  organizations,
  initialEditId,
}: {
  organizations: Organization[];
  initialEditId?: string;
}) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.canManage ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(
      organizationSchema
    ) as Resolver<OrganizationFormData>,
    defaultValues: defaultFormValues,
  });

  const { register, handleSubmit, control, reset, watch, setValue, formState } = form;

  const openCreate = useCallback(() => {
    setEditingId(null);
    setSubmitError(null);
    reset(defaultFormValues);
    setDialogOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (org: Organization) => {
      setEditingId(org.id);
      setSubmitError(null);
      reset({
        name: org.name,
        slug: org.slug,
        status: org.status,
      });
      setDialogOpen(true);
    },
    [reset]
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setSubmitError(null);
    reset(defaultFormValues);
    router.replace("/app/organizations");
  }, [reset, router]);

  useEffect(() => {
    if (!initialEditId || organizations.length === 0) return;
    const org = organizations.find((o) => o.id === initialEditId);
    if (org) openEdit(org);
  }, [initialEditId, organizations, openEdit]);

  const name = watch("name");
  useEffect(() => {
    if (editingId) return;
    setValue("slug", slugFromName(name), { shouldValidate: true });
  }, [name, setValue, editingId]);

  const columns = useMemo<ColumnDef<Organization>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => (
          <Link
            href={`/app/organizations/${row.original.id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openEdit(row.original)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [openEdit]
  );

  const onSubmit = (data: OrganizationFormData) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        if (editingId) {
          await updateOrganization(editingId, data);
        } else {
          await createOrganization(data);
        }
        reset(defaultFormValues);
        setDialogOpen(false);
        setEditingId(null);
        router.replace("/app/organizations");
        router.refresh();
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <>
      <PageHeader title="Organizations">
        {canManage && (
          <Button type="button" onClick={openCreate}>
            New Organization
          </Button>
        )}
      </PageHeader>

      {organizations.length === 0 ? (
        <EmptyState
          title="No organizations yet"
          description={canManage ? "Create an organization to manage business units, departments, and ad accounts." : "No organizations are available for your account."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              New Organization
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={organizations}
          searchKey="name"
          searchPlaceholder="Search by name…"
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="relative max-h-[90vh] overflow-y-auto">
          <DialogClose onClose={closeDialog} />
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit organization" : "New organization"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Name" error={formState.errors.name} required>
              <Input {...register("name")} autoComplete="organization" />
            </FormField>

            <FormField label="Slug" error={formState.errors.slug} required>
              <Input {...register("slug")} autoComplete="off" />
            </FormField>

            <FormField label="Status" error={formState.errors.status} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    options={STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </FormField>

            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : editingId ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

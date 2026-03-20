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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { slugify, formatDate } from "@/lib/utils";
import { channelSchema } from "@/lib/validators";
import { createChannel, updateChannel } from "@/lib/actions/channels";
import { useUser } from "@/components/providers/user-provider";
import type { Channel } from "@/types/database";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type ChannelFormValues = z.input<typeof channelSchema>;

const defaultFormValues: ChannelFormValues = {
  name: "",
  slug: "",
  type: "",
  status: "active",
};

interface ChannelsClientProps {
  channels: Channel[];
}

export function ChannelsClient({ channels }: ChannelsClientProps) {
  const router = useRouter();
  const user = useUser();
  const canManage = user?.isSuperAdmin ?? false;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Channel | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
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

  function openEdit(item: Channel) {
    setEditingItem(item);
    setActionError(null);
    reset({
      name: item.name,
      slug: item.slug,
      type: item.type,
      status: item.status,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: ChannelFormValues) {
    setActionError(null);
    const data = channelSchema.parse(values);
    try {
      if (editingItem) {
        await updateChannel(editingItem.id, data);
      } else {
        await createChannel(data);
      }
      setDialogOpen(false);
      setEditingItem(null);
      reset(defaultFormValues);
      router.refresh();
    } catch {
      setActionError("Something went wrong. Please try again.");
    }
  }

  const columns = useMemo<ColumnDef<Channel>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "slug",
        header: "Slug",
      },
      {
        accessorKey: "type",
        header: "Type",
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
        title="Channels"
        description="Global ad platforms (Meta, Google, LinkedIn, …)."
      >
        {canManage && (
          <Button type="button" onClick={openCreate}>
            Add channel
          </Button>
        )}
      </PageHeader>

      {channels.length === 0 ? (
        <EmptyState
          title="No channels yet"
          description={canManage ? "Add channels to connect ad accounts and campaigns." : "No channels have been configured yet."}
        >
          {canManage && (
            <Button type="button" onClick={openCreate}>
              Add channel
            </Button>
          )}
        </EmptyState>
      ) : (
        <DataTable
          columns={columns}
          data={channels}
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
              {editingItem ? "Edit channel" : "New channel"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {actionError && (
              <p className="text-sm text-destructive">{actionError}</p>
            )}

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

            <FormField label="Type" required error={errors.type}>
              <Input placeholder="e.g. meta, google_ads" {...register("type")} />
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

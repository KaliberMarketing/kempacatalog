"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateProfileRole,
  deleteProfile,
  createMembership,
  updateMembershipRole,
  deleteMembership,
} from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import type { Profile, UserRole, OrgMemberRole } from "@/types/database";

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "org_admin", label: "Org Admin" },
  { value: "analyst", label: "Analyst" },
];

const MEMBERSHIP_ROLE_OPTIONS = [
  { value: "org_admin", label: "Org Admin" },
  { value: "analyst", label: "Analyst" },
];

type MembershipRow = {
  id: string;
  profile_id: string;
  organization_id: string;
  role: OrgMemberRole;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  organizations: { name: string } | null;
};

type OrgOption = { id: string; name: string; slug: string };

interface AdminClientProps {
  profiles: Profile[];
  memberships: MembershipRow[];
  organizations: OrgOption[];
  currentProfileId: string;
}

function roleBadgeVariant(role: string) {
  if (role === "super_admin") return "destructive" as const;
  if (role === "org_admin") return "warning" as const;
  return "secondary" as const;
}

function humanizeRole(role: string) {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Tab = "users" | "memberships";

export function AdminClient({
  profiles,
  memberships,
  organizations,
  currentProfileId,
}: AdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("users");

  // Role edit dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("analyst");
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  // Add membership dialog
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [memberProfileId, setMemberProfileId] = useState("");
  const [memberOrgId, setMemberOrgId] = useState("");
  const [memberRole, setMemberRole] = useState<OrgMemberRole>("analyst");

  const openRoleDialog = useCallback((profile: Profile) => {
    setEditingProfile(profile);
    setSelectedRole(profile.role);
    setDialogError(null);
    setRoleDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((profile: Profile) => {
    setDeletingProfile(profile);
    setDialogError(null);
    setDeleteDialogOpen(true);
  }, []);

  const openMemberDialog = useCallback(() => {
    setMemberProfileId(profiles[0]?.id ?? "");
    setMemberOrgId(organizations[0]?.id ?? "");
    setMemberRole("analyst");
    setDialogError(null);
    setMemberDialogOpen(true);
  }, [profiles, organizations]);

  const handleRoleSave = () => {
    if (!editingProfile) return;
    setDialogError(null);
    startTransition(async () => {
      try {
        await updateProfileRole(editingProfile.id, selectedRole);
        setRoleDialogOpen(false);
        router.refresh();
      } catch (e) {
        setDialogError(e instanceof Error ? e.message : "Failed to update role.");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingProfile) return;
    setDialogError(null);
    startTransition(async () => {
      try {
        await deleteProfile(deletingProfile.id);
        setDeleteDialogOpen(false);
        router.refresh();
      } catch (e) {
        setDialogError(e instanceof Error ? e.message : "Failed to delete user.");
      }
    });
  };

  const handleAddMembership = () => {
    setDialogError(null);
    startTransition(async () => {
      try {
        await createMembership(memberProfileId, memberOrgId, memberRole);
        setMemberDialogOpen(false);
        router.refresh();
      } catch (e) {
        setDialogError(e instanceof Error ? e.message : "Failed to add membership.");
      }
    });
  };

  const handleMembershipRoleChange = (id: string, role: OrgMemberRole) => {
    startTransition(async () => {
      try {
        await updateMembershipRole(id, role);
        router.refresh();
      } catch {
        // silent
      }
    });
  };

  const handleDeleteMembership = (id: string) => {
    startTransition(async () => {
      try {
        await deleteMembership(id);
        router.refresh();
      } catch {
        // silent
      }
    });
  };

  const profileColumns = useMemo<ColumnDef<Profile>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge variant={roleBadgeVariant(row.original.role)}>
            {humanizeRole(row.original.role)}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const isSelf = row.original.id === currentProfileId;
          return (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openRoleDialog(row.original)}
              >
                Change Role
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(row.original)}
                disabled={isSelf}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [currentProfileId, openRoleDialog, openDeleteDialog]
  );

  const membershipColumns = useMemo<ColumnDef<MembershipRow>[]>(
    () => [
      {
        accessorKey: "profiles.full_name",
        header: "User",
        enableSorting: true,
        accessorFn: (row) => row.profiles?.full_name ?? "—",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">
              {row.original.profiles?.full_name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.profiles?.email ?? ""}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "organizations.name",
        header: "Organization",
        enableSorting: true,
        accessorFn: (row) => row.organizations?.name ?? "—",
      },
      {
        accessorKey: "role",
        header: "Membership Role",
        enableSorting: true,
        cell: ({ row }) => (
          <Select
            options={MEMBERSHIP_ROLE_OPTIONS}
            value={row.original.role}
            onChange={(e) =>
              handleMembershipRoleChange(
                row.original.id,
                e.target.value as OrgMemberRole
              )
            }
            className="w-32"
          />
        ),
      },
      {
        accessorKey: "created_at",
        header: "Added",
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteMembership(row.original.id)}
          >
            Remove
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const profileOptions = profiles.map((p) => ({
    value: p.id,
    label: `${p.full_name} (${p.email})`,
  }));
  const orgOptions = organizations.map((o) => ({
    value: o.id,
    label: o.name,
  }));

  return (
    <>
      <PageHeader
        title="Admin Panel"
        description="Manage all users, roles, and organization memberships"
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "users"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Users ({profiles.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("memberships")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "memberships"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Memberships ({memberships.length})
        </button>
      </div>

      {/* Users tab */}
      {activeTab === "users" && (
        <>
          {profiles.length === 0 ? (
            <EmptyState
              title="No users yet"
              description="Users will appear here once they sign up."
            />
          ) : (
            <DataTable
              columns={profileColumns}
              data={profiles}
              searchKey="full_name"
              searchPlaceholder="Search users…"
            />
          )}
        </>
      )}

      {/* Memberships tab */}
      {activeTab === "memberships" && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              onClick={openMemberDialog}
              disabled={organizations.length === 0}
            >
              Add Membership
            </Button>
          </div>
          {memberships.length === 0 ? (
            <EmptyState
              title="No memberships yet"
              description="Assign users to organizations to grant them access."
            />
          ) : (
            <DataTable
              columns={membershipColumns}
              data={memberships}
              searchKey="profiles.full_name"
              searchPlaceholder="Search by user…"
            />
          )}
        </>
      )}

      {/* Change role dialog */}
      <Dialog
        open={roleDialogOpen}
        onOpenChange={(open) => !open && setRoleDialogOpen(false)}
      >
        <DialogContent>
          <DialogClose onClose={() => setRoleDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Changing role for{" "}
                <strong>{editingProfile.full_name}</strong> (
                {editingProfile.email})
              </p>
              <Select
                options={ROLE_OPTIONS}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              />
              {dialogError && (
                <p className="text-sm text-destructive">{dialogError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRoleDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRoleSave}
                  disabled={isPending}
                >
                  {isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !open && setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          {deletingProfile && (
            <div className="space-y-4">
              <p className="text-sm">
                Are you sure you want to permanently delete{" "}
                <strong>{deletingProfile.full_name}</strong> (
                {deletingProfile.email})? This will also remove their auth
                account and all memberships.
              </p>
              <p className="text-sm text-destructive font-medium">
                This action cannot be undone.
              </p>
              {dialogError && (
                <p className="text-sm text-destructive">{dialogError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting…" : "Delete User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add membership dialog */}
      <Dialog
        open={memberDialogOpen}
        onOpenChange={(open) => !open && setMemberDialogOpen(false)}
      >
        <DialogContent>
          <DialogClose onClose={() => setMemberDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Membership</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">User</label>
              <Select
                options={profileOptions}
                value={memberProfileId}
                onChange={(e) => setMemberProfileId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Organization</label>
              <Select
                options={orgOptions}
                value={memberOrgId}
                onChange={(e) => setMemberOrgId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select
                options={MEMBERSHIP_ROLE_OPTIONS}
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(e.target.value as OrgMemberRole)
                }
              />
            </div>
            {dialogError && (
              <p className="text-sm text-destructive">{dialogError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddMembership}
                disabled={isPending}
              >
                {isPending ? "Adding…" : "Add Membership"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

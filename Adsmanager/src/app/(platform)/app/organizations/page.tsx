import { PageHeader } from "@/components/shared/page-header";
import { getOrganizations } from "@/lib/actions/organizations";
import { OrganizationsClient } from "./organizations-client";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: initialEditId } = await searchParams;

  try {
    const organizations = await getOrganizations();
    const list = organizations ?? [];

    return (
      <OrganizationsClient
        organizations={list}
        initialEditId={initialEditId}
      />
    );
  } catch {
    return (
      <>
        <PageHeader title="Organizations" />
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm">
          <p className="font-medium text-destructive">Could not load organizations</p>
          <p className="mt-1 text-muted-foreground">
            Check your connection and try again. If the problem continues, contact support.
          </p>
        </div>
      </>
    );
  }
}

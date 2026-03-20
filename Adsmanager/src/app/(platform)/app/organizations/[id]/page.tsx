import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrganization } from "@/lib/actions/organizations";
import { formatDate } from "@/lib/utils";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let organization;
  try {
    organization = await getOrganization(id);
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader title={organization.name}>
        <div className="flex items-center gap-2">
          <Link
            href="/app/organizations"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to list
          </Link>
          <Link
            href={`/app/organizations?edit=${organization.id}`}
            className={cn(buttonVariants())}
          >
            Edit organization
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Core organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Slug</p>
              <p className="font-mono text-foreground">{organization.slug}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={organization.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{formatDate(organization.created_at)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p>{formatDate(organization.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business units</CardTitle>
            <CardDescription>Teams and brands under this organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No business units linked yet.{" "}
              <Link
                href="/app/business-units"
                className="text-primary underline-offset-4 hover:underline"
              >
                Manage business units
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Functional groups within the org</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Department listing will appear here.{" "}
              <Link
                href="/app/departments"
                className="text-primary underline-offset-4 hover:underline"
              >
                Manage departments
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ad accounts</CardTitle>
            <CardDescription>Connected advertising accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ad accounts for this organization will show here.{" "}
              <Link
                href="/app/ad-accounts"
                className="text-primary underline-offset-4 hover:underline"
              >
                Manage ad accounts
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

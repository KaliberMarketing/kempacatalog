import { getDashboardMetrics } from "@/lib/actions/metrics";
import { getCampaigns } from "@/lib/actions/campaigns";
import { getBudgetRules } from "@/lib/actions/budget-rules";
import { getSession } from "@/lib/actions/auth";
import { DashboardView } from "./dashboard-view";
import Link from "next/link";

export default async function DashboardPage() {
  try {
    const session = await getSession();

    if (!session) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Unable to verify your session. Please{" "}
            <Link href="/login" className="text-primary underline">
              sign in
            </Link>{" "}
            again.
          </p>
        </div>
      );
    }

    if (session.memberships.length === 0 && !session.isSuperAdmin) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Welcome, {session.profile.full_name}</h1>
          <div className="rounded-lg border border-border bg-muted/50 p-6 max-w-lg">
            <h2 className="font-medium mb-1">No organization access</h2>
            <p className="text-sm text-muted-foreground">
              Your account is not yet linked to any organization. Ask an
              administrator to invite you, or contact support for assistance.
            </p>
          </div>
        </div>
      );
    }

    const [metrics, campaigns, rules] = await Promise.all([
      getDashboardMetrics(),
      getCampaigns(),
      getBudgetRules(),
    ]);
    return (
      <DashboardView
        metrics={metrics}
        campaigns={campaigns}
        rules={rules}
      />
    );
  } catch {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Unable to load dashboard data. Please try refreshing the page.
        </p>
      </div>
    );
  }
}

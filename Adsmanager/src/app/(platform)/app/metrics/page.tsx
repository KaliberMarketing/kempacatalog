import { getCampaigns } from "@/lib/actions/campaigns";
import { getMetrics } from "@/lib/actions/metrics";
import type { Campaign, CampaignMetric } from "@/types/database";
import { MetricsClient } from "./metrics-client";

export default async function MetricsPage() {
  try {
    const [metricsRaw, campaignsRaw] = await Promise.all([
      getMetrics(),
      getCampaigns(),
    ]);

    const metrics = (metricsRaw ?? []) as CampaignMetric[];
    const campaigns = (campaignsRaw ?? []) as Campaign[];

    return <MetricsClient metrics={metrics} campaigns={campaigns} />;
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load metrics. Please try again later.
      </div>
    );
  }
}

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { fadeIn, staggerContainer } from "@/components/shared/motion";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { CampaignMetric, Campaign, BudgetRule, AdAccount, Channel } from "@/types/database";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface DashboardViewProps {
  metrics: CampaignMetric[];
  campaigns: Campaign[];
  rules: BudgetRule[];
}

const CHART_COLORS = {
  spend: "#2f73e9",
  clicks: "#28caea",
  conversions: "#e6605f",
  revenue: "#255399",
};

export function DashboardView({ metrics, campaigns, rules }: DashboardViewProps) {
  const kpis = useMemo(() => {
    const totalSpend = metrics.reduce((s, m) => s + Number(m.spend), 0);
    const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
    const totalLeads = metrics.reduce((s, m) => s + m.leads, 0);
    const totalConversions = metrics.reduce((s, m) => s + m.conversions, 0);
    const totalRevenue = metrics.reduce((s, m) => s + Number(m.revenue ?? 0), 0);
    const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    return { totalSpend, totalClicks, totalLeads, totalConversions, totalRevenue, avgCPA, avgROAS };
  }, [metrics]);

  const dailyData = useMemo(() => {
    const byDate: Record<string, { date: string; spend: number; clicks: number; conversions: number; revenue: number }> = {};
    for (const m of metrics) {
      if (!byDate[m.date]) {
        byDate[m.date] = { date: m.date, spend: 0, clicks: 0, conversions: 0, revenue: 0 };
      }
      byDate[m.date].spend += Number(m.spend);
      byDate[m.date].clicks += m.clicks;
      byDate[m.date].conversions += m.conversions;
      byDate[m.date].revenue += Number(m.revenue ?? 0);
    }
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [metrics]);

  const channelData = useMemo(() => {
    const byChannel: Record<string, { channel: string; spend: number; clicks: number; conversions: number }> = {};
    for (const m of metrics) {
      const campaign = campaigns.find((c) => c.id === m.campaign_id);
      const adAccount = campaign?.ad_account as
        | (AdAccount & { channel?: Channel })
        | undefined;
      const channelName = adAccount?.channel?.name ?? "Unknown";
      if (!byChannel[channelName]) {
        byChannel[channelName] = { channel: channelName, spend: 0, clicks: 0, conversions: 0 };
      }
      byChannel[channelName].spend += Number(m.spend);
      byChannel[channelName].clicks += m.clicks;
      byChannel[channelName].conversions += m.conversions;
    }
    return Object.values(byChannel);
  }, [metrics, campaigns]);

  const recentCampaigns = campaigns.slice(0, 5);
  const activeRules = rules.filter((r) => r.is_active).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of advertising performance across all accounts</p>
      </motion.div>

      {/* KPI Cards — staggered */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <KPICard title="Total Spend" value={formatCurrency(kpis.totalSpend)} />
        <KPICard title="Clicks" value={formatNumber(kpis.totalClicks)} />
        <KPICard title="Leads" value={formatNumber(kpis.totalLeads)} />
        <KPICard title="Conversions" value={formatNumber(kpis.totalConversions)} />
        <KPICard title="Revenue" value={formatCurrency(kpis.totalRevenue)} />
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-md"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <KPICard title="Avg CPA" value={kpis.avgCPA > 0 ? formatCurrency(kpis.avgCPA) : "—"} />
        <KPICard title="Avg ROAS" value={kpis.avgROAS > 0 ? kpis.avgROAS.toFixed(2) + "x" : "—"} />
      </motion.div>

      {/* Charts row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <div role="img" aria-label={`Line chart showing daily spend over ${dailyData.length} days. Total spend: ${formatCurrency(kpis.totalSpend)}`}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2dae8" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="spend" name="Spend" stroke={CHART_COLORS.spend} strokeWidth={2} dot={false} animationDuration={800} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={false} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No metric data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <div role="img" aria-label={`Bar chart comparing spend and clicks across ${channelData.length} channels`}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2dae8" />
                    <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => formatNumber(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="spend" name="Spend" fill={CHART_COLORS.spend} radius={[4, 4, 0, 0]} animationDuration={800} />
                    <Bar dataKey="clicks" name="Clicks" fill={CHART_COLORS.clicks} radius={[4, 4, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">No channel data yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom row */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {recentCampaigns.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between py-1"
                  >
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.organization?.name ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No campaigns yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total rules</span>
                <Badge variant="secondary">{rules.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active rules</span>
                <Badge variant="success">{activeRules}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Inactive rules</span>
                <Badge variant="outline">{rules.length - activeRules}</Badge>
              </div>
              <p className="text-xs text-muted-foreground border-t border-border pt-3">
                Automation engine coming soon — rules are currently view-only
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function KPICard({ title, value }: { title: string; value: string }) {
  return (
    <motion.div variants={fadeIn} transition={{ duration: 0.3 }}>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          <p className="text-lg font-semibold mt-1">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

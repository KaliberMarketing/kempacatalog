"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeIn, staggerContainer } from "@/components/shared/motion";
import { getOrganizations } from "@/lib/actions/organizations";
import { getIntegrationConnection } from "@/lib/actions/integrations";
import type { Organization, IntegrationConnectionStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const googleAdsParam = searchParams.get("google_ads");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("");
  const [googleAdsStatus, setGoogleAdsStatus] = useState<IntegrationConnectionStatus>("not_connected");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleAdsConnected = googleAdsStatus === "connected";
  const googleAdsMessage = useMemo(() => {
    if (!googleAdsParam) return null;

    const messages: Record<string, string> = {
      connected: "Google Ads connected successfully.",
      error_missing_org: "Missing organization when starting Google Ads connection.",
      error_missing_code_state: "Google OAuth callback was missing required data.",
      error_env: "Google Ads OAuth is not configured correctly on this environment.",
      error_token_exchange: "Google token exchange failed. Please try again.",
      error_missing_refresh_or_access: "Google did not return the required OAuth tokens.",
      error_updating_connection: "Could not update the Google Ads connection record.",
      error_inserting_connection: "Could not save the Google Ads connection record.",
    };

    return messages[googleAdsParam] ?? "Google Ads connection returned an unknown response.";
  }, [googleAdsParam]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const orgs = (await getOrganizations()) as Organization[];
        if (!isMounted) return;
        setOrganizations(orgs ?? []);
        setSelectedOrganizationId((prev) => prev || (orgs?.[0]?.id ?? ""));
      } catch {
        if (!isMounted) return;
        setError("Could not load organizations.");
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedOrganizationId) return;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const conn = await getIntegrationConnection(selectedOrganizationId, "google_ads");
        if (!isMounted) return;
        setGoogleAdsStatus(conn?.status ?? "not_connected");
      } catch {
        if (!isMounted) return;
        setGoogleAdsStatus("not_connected");
        setError("Could not load Google Ads connection status.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedOrganizationId]);

  const connectGoogleAds = () => {
    if (!selectedOrganizationId) return;
    setError(null);
    window.location.href = `/api/integrations/google-ads/connect?organizationId=${encodeURIComponent(
      selectedOrganizationId
    )}`;
  };

  const orgOptions = useMemo(
    () => organizations.map((o) => ({ value: o.id, label: o.name })),
    [organizations]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration and integrations</p>
      </motion.div>

      <motion.div
        className="grid gap-6 max-w-2xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeIn} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Connect external ad platform APIs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium">Google Ads</div>
                  <Badge variant={googleAdsConnected ? "success" : "outline"}>
                    {googleAdsConnected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedOrganizationId}
                    onChange={(e) => setSelectedOrganizationId(e.target.value)}
                    options={orgOptions}
                    placeholder="Select organization"
                  />
                  <Button
                    type="button"
                    onClick={connectGoogleAds}
                    disabled={!selectedOrganizationId || googleAdsConnected || loading}
                  >
                    {loading ? "Connecting…" : googleAdsConnected ? "Connected" : "Connect"}
                  </Button>
                </div>
                {googleAdsMessage && (
                  <p className={googleAdsParam === "connected" ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
                    {googleAdsMessage}
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <IntegrationRow name="Meta Ads API" status="not_connected" index={1} />
              <IntegrationRow name="LinkedIn Ads API" status="not_connected" index={2} />
              <IntegrationRow name="TikTok Ads API" status="not_connected" index={3} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>These features are under active development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <UpcomingFeature title="Profile Management" description="View and edit your account information" />
                <UpcomingFeature title="Automation Engine" description="Configure budget rule execution, cron frequency, and safety limits" />
                <UpcomingFeature title="Notifications" description="Email, Slack, and webhook alert preferences" />
                <UpcomingFeature title="Team & Permissions" description="Invite team members and assign roles per organization" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function IntegrationRow({ name, status, index }: { name: string; status: string; index: number }) {
  const isConnected = status !== "not_connected";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
      className="flex items-center justify-between py-2 border-b border-border last:border-0"
    >
      <span className="text-sm font-medium">{name}</span>
      <Badge variant={isConnected ? "success" : "outline"}>
        {isConnected ? "Connected" : "Not connected"}
      </Badge>
    </motion.div>
  );
}

function UpcomingFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

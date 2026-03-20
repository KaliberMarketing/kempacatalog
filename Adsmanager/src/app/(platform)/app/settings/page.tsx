"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeIn, staggerContainer } from "@/components/shared/motion";

export default function SettingsPage() {
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
              <IntegrationRow name="Google Ads API" status="not_connected" index={0} />
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

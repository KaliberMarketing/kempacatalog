import { getChannels } from "@/lib/actions/channels";
import type { Channel } from "@/types/database";
import { ChannelsClient } from "./channels-client";

export default async function ChannelsPage() {
  try {
    const channelsRaw = await getChannels();
    const channels = (channelsRaw ?? []) as Channel[];

    return <ChannelsClient channels={channels} />;
  } catch {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-sm text-destructive">
        Could not load channels. Please try again later.
      </div>
    );
  }
}

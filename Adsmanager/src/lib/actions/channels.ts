"use server";

import { channelSchema, type ChannelFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { requireAuth, sanitizeError } from "./helpers";

export async function getChannels() {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function createChannel(formData: ChannelFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = channelSchema.parse(formData);
    const { error } = await supabase.from("channels").insert(parsed);
    if (error) throw error;
    revalidatePath("/app/channels");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

export async function updateChannel(id: string, formData: ChannelFormData) {
  try {
    const { supabase } = await requireAuth();
    const parsed = channelSchema.parse(formData);
    const { error } = await supabase
      .from("channels")
      .update(parsed)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/app/channels");
  } catch (e) {
    throw new Error(sanitizeError(e));
  }
}

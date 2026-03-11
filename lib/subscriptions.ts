import { createAdminClient } from "./supabase/admin";

/** Returns true if the user has an active Superfan subscription. */
export async function isSuperfan(userId: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();
    return !!data;
  } catch {
    return false;
  }
}

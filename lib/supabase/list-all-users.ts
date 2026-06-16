import type { User } from "@supabase/supabase-js";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Fetches all auth users by paginating through listUsers.
 * Supabase's perPage cap is 1000 — this loops until exhausted.
 */
export async function listAllUsers(admin: AdminClient): Promise<User[]> {
  const all: User[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage });
    all.push(...(data.users ?? []));
    if ((data.users ?? []).length < perPage) break;
    page++;
  }
  return all;
}

/**
 * Fetches emails for a specific set of user IDs via targeted per-user lookups.
 * Replaces listAllUsers() when you already have a filtered ID list — N targeted
 * lookups instead of M full-page scans of auth.users.
 */
export async function getUserEmailsByIds(
  admin: AdminClient,
  ids: string[]
): Promise<Array<{ id: string; email: string }>> {
  const results = await Promise.all(
    ids.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      return data.user?.email ? { id, email: data.user.email } : null;
    })
  );
  return results.filter((r): r is { id: string; email: string } => r !== null);
}

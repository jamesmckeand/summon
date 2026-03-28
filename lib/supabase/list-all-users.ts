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

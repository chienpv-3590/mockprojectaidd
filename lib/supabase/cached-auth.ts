import { cache } from "react";
import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

/**
 * Returns the authenticated Supabase user for the current request, deduplicated
 * via React.cache() so that multiple RSC components in the same render tree
 * (e.g. root layout + a nested page) share one `auth.getUser()` network call.
 *
 * Without this, each independent `createClient()` + `getUser()` pair becomes a
 * separate async span in React 19's RSC dev perf tracker. When the layout span
 * and the nested page span overlap in time-accounting, React records a negative
 * duration and throws:
 *   "Failed to execute 'measure' on 'Performance': '<Component>' cannot have a
 *    negative time stamp."
 * (See vercel/next.js#86060 for the upstream tracker bug.)
 *
 * Usage:
 *   const user = await getCachedUser();   // null when unauthenticated
 */
export const getCachedUser: () => Promise<User | null> = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

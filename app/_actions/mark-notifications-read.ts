"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markAllReadForUser } from "@/lib/data/notifications";

export async function markNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await markAllReadForUser(supabase, user.id);
  revalidatePath("/");
}

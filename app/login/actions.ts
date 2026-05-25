"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/`,
    },
  });

  if (error) {
    redirect(`/login?error=oauth_init_failed`);
  }
  if (data?.url) {
    redirect(data.url);
  }
  redirect(`/login?error=oauth_init_failed`);
}

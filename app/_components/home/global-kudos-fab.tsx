"use client";

/**
 * global-kudos-fab.tsx — Orchestrator for the global FAB feature.
 *
 * Mounted ONCE at the root layout (see `app/layout.tsx`) so the FAB is
 * persistent across every authenticated page. Owns:
 *   - The FAB itself (`<FloatingFab>`) — collapsed / expanded.
 *   - The Thể lệ right-side drawer (`<RulesDrawer>`).
 *   - A dedicated `<SubmitKudosDialog>` instance for the "Viết KUDOS"
 *     popup — independent of the live-board page's own dialog, so the
 *     compose flow works on /, /he-thong-giai, /tieu-chuan-cong-dong, etc.
 *
 * Hides itself on /login + /auth/* via pathname guard (belt-and-suspenders
 * — the layout only mounts when the user is authed, but the guard handles
 * transitional client-side navigation).
 *
 * Submit / upload / search handlers reuse the same primitives the live
 * board uses (`submitKudos`, `searchSunners`, `uploadKudosImage`).
 */

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadKudosImage } from "@/lib/storage/kudos-images";
import { submitKudos, searchSunners } from "@/app/_actions/sun-kudos";
import type { SubmitKudosInput, UserProfile } from "@/lib/data/types";
import type { KudosComposeBootstrap } from "@/lib/data/kudos-compose-bootstrap";
import { FloatingFab } from "./floating-fab";
import { RulesDrawer } from "@/app/_components/rules/rules-drawer";
import { SubmitKudosDialog } from "@/app/_components/sun-kudos/submit-kudos-dialog";

export type GlobalKudosFabProps = {
  bootstrap: KudosComposeBootstrap;
};

// Hide the FAB on unauthenticated routes. Optional leading `/{locale}`
// segment (vi/en) covers locale-prefixed variants like /vi/login.
const HIDE_FAB_PATTERN = /^(\/[a-z]{2})?\/(login|auth)(\/|$)/;

export function GlobalKudosFab({ bootstrap }: GlobalKudosFabProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Submit, upload, and search handlers — declared as hooks BEFORE any
  // early return so React's rule-of-hooks holds across path changes.
  const handleSubmitKudos = useCallback(
    async (input: SubmitKudosInput): Promise<void> => {
      // The SubmitKudosDialog owns its own close-on-success lifecycle
      // (matches live-board's pattern); no need to force-close here. If
      // submitKudos throws, the dialog's catch surfaces the error.
      await submitKudos(input);
    },
    [],
  );

  const handleUploadImage = useCallback(
    async (file: File): Promise<string> => {
      // Browser-side supabase client — used here only for storage upload.
      // The kudos-images bucket's INSERT RLS policy requires the first
      // path segment to equal auth.uid(); we pass `currentUserId` from
      // the layout-resolved auth user.
      const supabase = createClient();
      const buf = await file.arrayBuffer();
      const { path } = await uploadKudosImage(
        supabase,
        bootstrap.currentUserId,
        buf,
        file.type,
      );
      return path;
    },
    [bootstrap.currentUserId],
  );

  const handleSunnerSearch = useCallback(
    async (q: string): Promise<UserProfile[]> => searchSunners(q),
    [],
  );

  const handleWriteFromDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDialogOpen(true);
  }, []);

  // Pathname guard — hide on auth-less chrome.
  if (pathname && HIDE_FAB_PATTERN.test(pathname)) return null;

  return (
    <>
      <FloatingFab
        onOpenRules={() => setDrawerOpen(true)}
        onOpenCompose={() => setDialogOpen(true)}
      />
      <RulesDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onWriteKudos={handleWriteFromDrawer}
      />
      <SubmitKudosDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        smallHashtags={bootstrap.smallHashtags}
        featureHashtags={bootstrap.featureHashtags}
        departments={bootstrap.departments}
        sunnerSearch={handleSunnerSearch}
        onUpload={handleUploadImage}
        onSubmit={handleSubmitKudos}
        initialRecipient={null}
      />
    </>
  );
}

"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { KudosCardData as DbCard, KudosFilters, SubmitKudosInput } from "@/lib/data/types";
import type { Department, Hashtag, SpotlightNode, UserProfile } from "@/lib/data/types";
import type { KudosCardData, SidebarStats, SecretBoxRecipient } from "./types";
import { adaptKudosCard, adaptKudosCards } from "./_lib/kudos-adapter";
import { useKudosFeed } from "./_hooks/use-kudos-feed";
import { useRealtimeSubscriptions } from "./_hooks/use-realtime-subscriptions";
import { useToast } from "./_lib/use-toast";
import { ToastContainer } from "./_lib/toast-container";
import { KudosHero } from "./kudos-hero";
import { SubmitInput } from "./submit-input";
import { SunnerSearchInput } from "./sunner-search-input";
import { HighlightCarousel } from "./highlight-carousel";
import { SpotlightContainer } from "./spotlight-container";
import { KudosFeed } from "./kudos-feed";
import { KudosSidebar } from "./kudos-sidebar";
import { SubmitKudosDialog } from "./submit-kudos-dialog";
import { KudosDetailDialog } from "./kudos-detail-dialog";
import { ComposeKudosProvider } from "./compose-kudos-context";
import {
  fetchKudosCard,
  refetchHighlight,
  refetchFeed,
  searchSunners,
  submitKudos,
  toggleHeart,
  openSecretBox,
  getNextUnopenedBox,
} from "@/app/_actions/sun-kudos";
import { uploadKudosImage } from "@/lib/storage/kudos-images";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type LiveBoardInitialData = {
  highlightRows: DbCard[];
  feedRows: DbCard[];
  feedNextCursor: string | null;
  stats: SidebarStats;
  recipients: SecretBoxRecipient[];
  spotlightNodes: SpotlightNode[];
  totalKudos: number;
  featureHashtags: Hashtag[];
  smallHashtags: Hashtag[];
  departments: Department[];
};

type LiveBoardClientProps = {
  initial: LiveBoardInitialData;
  currentUserId: string;
  initialRecipient?: UserProfile | null;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LiveBoardClient({ initial, currentUserId, initialRecipient }: LiveBoardClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<KudosFilters>({});

  // ── Highlight state ───────────────────────────────────────────────────────
  const [highlight, setHighlight] = useState<KudosCardData[]>(
    () => adaptKudosCards(initial.highlightRows)
  );

  // ── Feed state (reducer) ──────────────────────────────────────────────────
  const { feed, dispatchFeed, snapshotHeart: snapshotFeedHeart } = useKudosFeed({
    rows: adaptKudosCards(initial.feedRows),
    nextCursor: initial.feedNextCursor,
  });

  // Mirror highlight hearts in a ref for rollback (updated via layout effect
  // to satisfy react-compiler — no render-time ref mutation).
  const highlightRef = useRef(highlight);
  useLayoutEffect(() => { highlightRef.current = highlight; });

  // ── Sidebar state ─────────────────────────────────────────────────────────
  const [stats, setStats] = useState<SidebarStats>(initial.stats);
  const [recipients] = useState<SecretBoxRecipient[]>(initial.recipients);

  // ── Spotlight state ───────────────────────────────────────────────────────
  const [spotlightNodes] = useState<SpotlightNode[]>(initial.spotlightNodes);
  const [highlightedUserId, setHighlightedUserId] = useState<string | undefined>();

  // ── Dialog state ──────────────────────────────────────────────────────────
  // Auto-open when a compose recipient was resolved from ?compose= deep-link
  const [dialogOpen, setDialogOpen] = useState(!!initialRecipient);
  // Dynamic recipient set by avatar hover-card "Gửi KUDO" — falls back to
  // deep-link `initialRecipient` when no hover-card has fired yet.
  const [hoverRecipient, setHoverRecipient] = useState<UserProfile | null>(null);

  const handleOpenCompose = useCallback((recipient: UserProfile) => {
    setHoverRecipient(recipient);
    setDialogOpen(true);
  }, []);

  const handleCloseCompose = useCallback(() => {
    setDialogOpen(false);
    setHoverRecipient(null);
  }, []);

  const composeContextValue = useMemo(
    () => ({ openCompose: handleOpenCompose }),
    [handleOpenCompose]
  );

  // ── Detail popup state (view kudos without leaving the board) ─────────────
  const [viewCard, setViewCard] = useState<KudosCardData | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  // Generation guard: a slow fetch must not overwrite the popup after the user
  // has closed it or opened a different kudos (zombie-state race).
  const viewFetchGenRef = useRef(0);

  // ── Load-more guard (prevent double-fire from IntersectionObserver) ───────
  const loadingMoreRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Realtime: new kudos INSERT
  // ---------------------------------------------------------------------------

  const handleRealtimeKudos = useCallback(
    async (card: KudosCardData) => {
      // The hook passes a synthetic card with __rawId
      const rawId = (card as unknown as { __rawId?: string }).__rawId;
      if (!rawId) return;

      try {
        const full = await fetchKudosCard(rawId);
        if (!full) return;
        const adapted = adaptKudosCard(full);
        dispatchFeed({ type: "PREPEND", card: adapted });

        // Re-evaluate top-5 highlight
        const newHighlight = await refetchHighlight(
          Object.keys(filters).length > 0 ? filters : undefined
        );
        setHighlight(adaptKudosCards(newHighlight));
      } catch {
        // Non-critical: realtime fetch failure is silent
      }
    },
    [dispatchFeed, filters]
  );

  // ---------------------------------------------------------------------------
  // Realtime: heart INSERT / DELETE
  // ---------------------------------------------------------------------------

  const handleRealtimeHeart = useCallback(
    (kudosId: string, delta: number, byCurrentUser: boolean) => {
      // Update feed
      dispatchFeed({
        type: "TOGGLE_HEART",
        kudosId,
        liked: byCurrentUser ? delta > 0 : false,
        delta,
      });

      // Update highlight
      setHighlight((prev) =>
        prev.map((c) =>
          c.id === kudosId
            ? {
                ...c,
                heartCount: Math.max(0, c.heartCount + delta),
                isHearted: byCurrentUser ? delta > 0 : c.isHearted,
              }
            : c
        )
      );
    },
    [dispatchFeed]
  );

  useRealtimeSubscriptions({
    supabase,
    currentUserId,
    onNewKudos: handleRealtimeKudos,
    onHeartChange: handleRealtimeHeart,
  });

  // ---------------------------------------------------------------------------
  // Filter — apply hashtag/department selection, re-fetch highlight + feed.
  // A selection filters BOTH the Highlight carousel and the All-Kudos feed
  // (spec B.1); the carousel re-centers itself when its result set changes.
  // ---------------------------------------------------------------------------

  const applyFilters = useCallback(
    async (next: KudosFilters) => {
      setFilters(next);
      const effective = Object.keys(next).length > 0 ? next : undefined;
      try {
        const [newHighlight, newFeed] = await Promise.all([
          refetchHighlight(effective),
          refetchFeed(undefined, effective),
        ]);
        setHighlight(adaptKudosCards(newHighlight));
        dispatchFeed({
          type: "SET_INITIAL",
          rows: adaptKudosCards(newFeed.rows),
          nextCursor: newFeed.nextCursor,
        });
      } catch {
        showToast("Không thể tải dữ liệu, vui lòng thử lại.", "error");
      }
    },
    [dispatchFeed, showToast]
  );

  const handleSelectHashtag = useCallback(
    (id: string | null) => {
      const next: KudosFilters = { ...filters };
      if (id) next.hashtag_id = id;
      else delete next.hashtag_id;
      applyFilters(next);
    },
    [filters, applyFilters]
  );

  const handleSelectDepartment = useCallback(
    (code: string | null) => {
      const next: KudosFilters = { ...filters };
      if (code) next.department_code = code;
      else delete next.department_code;
      applyFilters(next);
    },
    [filters, applyFilters]
  );

  // ---------------------------------------------------------------------------
  // Heart toggle — optimistic
  // ---------------------------------------------------------------------------

  const handleHeartToggle = useCallback(
    async (kudosId: string) => {
      // Snapshot before optimistic update
      const feedSnapshot = snapshotFeedHeart(kudosId);
      const hlCard = highlightRef.current.find((c) => c.id === kudosId);
      const hlSnapshot = hlCard
        ? { prevLiked: hlCard.isHearted ?? false, prevCount: hlCard.heartCount }
        : null;

      const isCurrentlyLiked = feedSnapshot?.prevLiked ?? hlSnapshot?.prevLiked ?? false;
      const delta = isCurrentlyLiked ? -1 : 1;

      // Optimistic update — feed
      if (feedSnapshot) {
        dispatchFeed({
          type: "TOGGLE_HEART",
          kudosId,
          liked: !isCurrentlyLiked,
          delta,
        });
      }
      // Optimistic update — highlight
      if (hlSnapshot) {
        setHighlight((prev) =>
          prev.map((c) =>
            c.id === kudosId
              ? { ...c, isHearted: !isCurrentlyLiked, heartCount: c.heartCount + delta }
              : c
          )
        );
      }

      try {
        await toggleHeart({ kudos_id: kudosId });
      } catch (err: unknown) {
        // Rollback
        if (feedSnapshot) {
          dispatchFeed({
            type: "ROLLBACK_HEART",
            kudosId,
            prevLiked: feedSnapshot.prevLiked,
            prevCount: feedSnapshot.prevCount,
          });
        }
        if (hlSnapshot) {
          setHighlight((prev) =>
            prev.map((c) =>
              c.id === kudosId
                ? { ...c, isHearted: hlSnapshot.prevLiked, heartCount: hlSnapshot.prevCount }
                : c
            )
          );
        }
        const msg = err instanceof Error ? err.message : "unknown";
        if (msg !== "cannot_like_own_kudos") {
          showToast("Không thể thả tim, vui lòng thử lại.", "error");
        }
      }
    },
    [snapshotFeedHeart, dispatchFeed, showToast]
  );

  // ---------------------------------------------------------------------------
  // Copy link
  // ---------------------------------------------------------------------------

  const handleCopyLink = useCallback(
    (id: string) => {
      if (typeof navigator === "undefined") return;
      navigator.clipboard
        .writeText(`${window.location.origin}/sun-kudos/${id}`)
        .then(() => showToast("Link copied — ready to share!"))
        .catch(() => showToast("Không thể sao chép link.", "error"));
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // View detail
  // ---------------------------------------------------------------------------

  // Open the detail popup instead of navigating. Fetch the full card (RLS-safe,
  // includes signed image URLs) then adapt to the component shape — same path
  // the realtime INSERT handler uses. The standalone /sun-kudos/[id] page stays
  // for shared/deep links (copy-link still points there).
  const handleViewDetail = useCallback(
    async (id: string) => {
      const gen = ++viewFetchGenRef.current;
      setViewLoading(true);
      try {
        const full = await fetchKudosCard(id);
        if (viewFetchGenRef.current !== gen) return; // superseded by close/re-open
        if (full) setViewCard(adaptKudosCard(full));
        else showToast("Không tìm thấy kudos.", "error");
      } catch {
        if (viewFetchGenRef.current === gen)
          showToast("Không thể tải kudos, vui lòng thử lại.", "error");
      } finally {
        if (viewFetchGenRef.current === gen) setViewLoading(false);
      }
    },
    [showToast]
  );

  const handleCloseDetail = useCallback(() => {
    viewFetchGenRef.current++; // invalidate any in-flight fetch
    setViewCard(null);
    setViewLoading(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Load more feed
  // ---------------------------------------------------------------------------

  const handleLoadMore = useCallback(async () => {
    if (feed.isLoading || !feed.nextCursor || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    dispatchFeed({ type: "LOADING" });

    try {
      const result = await refetchFeed(feed.nextCursor, filters);
      dispatchFeed({
        type: "APPEND",
        rows: adaptKudosCards(result.rows),
        nextCursor: result.nextCursor,
      });
    } catch {
      showToast("Không thể tải thêm kudos.", "error");
      dispatchFeed({ type: "APPEND", rows: [], nextCursor: feed.nextCursor });
    } finally {
      loadingMoreRef.current = false;
    }
  }, [feed.isLoading, feed.nextCursor, dispatchFeed, filters, showToast]);

  // ---------------------------------------------------------------------------
  // Secret box
  // ---------------------------------------------------------------------------

  const handleOpenSecretBox = useCallback(async () => {
    if (stats.secretBoxPending === 0) {
      showToast("Bạn không có Secret Box chưa mở.", "error");
      return;
    }
    try {
      const box = await getNextUnopenedBox();
      if (!box) { showToast("Không tìm thấy Secret Box.", "error"); return; }
      const result = await openSecretBox({ box_id: box.id });
      setStats((prev) => ({
        ...prev,
        secretBoxPending: Math.max(0, prev.secretBoxPending - 1),
        secretBoxOpened: prev.secretBoxOpened + 1,
      }));
      showToast(`Bạn nhận được: ${result.reward_label_vi}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      showToast(
        msg === "box_already_opened" ? "Hộp này đã được mở rồi." : "Không thể mở Secret Box.",
        "error"
      );
    }
  }, [stats.secretBoxPending, showToast]);

  // ---------------------------------------------------------------------------
  // Submit kudos
  // ---------------------------------------------------------------------------

  const handleSubmitKudos = useCallback(
    async (input: SubmitKudosInput) => {
      await submitKudos(input);
      showToast("Đã gửi lời cảm ơn!");
    },
    [showToast]
  );

  // ---------------------------------------------------------------------------
  // Image upload (for dialog)
  // ---------------------------------------------------------------------------

  const handleUploadImage = useCallback(
    async (file: File): Promise<string> => {
      const buf = await file.arrayBuffer();
      // Path prefix MUST be the uploader's UID — the kudos-images storage RLS
      // INSERT policy enforces auth.uid() = (string_to_array(name, '/'))[1].
      const { path } = await uploadKudosImage(supabase, currentUserId, buf, file.type);
      return path;
    },
    [supabase, currentUserId]
  );

  // ---------------------------------------------------------------------------
  // Sunner search (for dialog)
  // ---------------------------------------------------------------------------

  const handleSunnerSearch = useCallback(
    async (q: string): Promise<UserProfile[]> => searchSunners(q),
    []
  );

  // ---------------------------------------------------------------------------
  // Spotlight interactions
  // ---------------------------------------------------------------------------

  // Click node in SPOTLIGHT BOARD → navigate to that user's profile page.
  const handleNodeClick = useCallback(
    (node: SpotlightNode) => {
      router.push(`/sun-kudos/profile/${node.user_id}`);
    },
    [router]
  );

  const handleSpotlightSearch = useCallback((q: string) => {
    if (!q.trim()) { setHighlightedUserId(undefined); return; }
    const match = spotlightNodes.find((n) =>
      n.name.toLowerCase().includes(q.toLowerCase())
    );
    setHighlightedUserId(match?.user_id);
  }, [spotlightNodes]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ComposeKudosProvider value={composeContextValue}>
    <div className="flex min-h-screen flex-col bg-[#00101A] text-white">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* 1. Hero banner */}
      <KudosHero />

      {/* 2. Submit + Search row */}
      <div className="px-6 py-8 sm:px-10 lg:px-36">
        <div className="mx-auto flex max-w-[1152px] items-center gap-4">
          <SubmitInput onOpenDialog={() => setDialogOpen(true)} />
          <SunnerSearchInput onChange={handleSpotlightSearch} />
        </div>
      </div>

      {/* 3. Highlight Carousel */}
      <div className="py-8">
        <HighlightCarousel
          kudos={highlight}
          hashtags={initial.smallHashtags}
          departments={initial.departments}
          selectedHashtagId={filters.hashtag_id}
          selectedDepartmentCode={filters.department_code}
          onSelectHashtag={handleSelectHashtag}
          onSelectDepartment={handleSelectDepartment}
          onHeartToggle={handleHeartToggle}
          onCopyLink={handleCopyLink}
          onViewDetail={handleViewDetail}
        />
      </div>

      {/* 4. Spotlight Board */}
      <div className="py-8">
        <SpotlightContainer
          totalKudos={initial.totalKudos}
          nodes={spotlightNodes}
          highlightedUserId={highlightedUserId}
          onNodeClick={handleNodeClick}
          onSearchChange={handleSpotlightSearch}
        />
      </div>

      {/* 5. ALL KUDOS section */}
      <div className="px-6 pb-20 pt-8 sm:px-10 lg:px-36">
        <div className="mx-auto flex max-w-[1152px] flex-col gap-20 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <KudosFeed
              initialKudos={feed.rows}
              onLoadMore={handleLoadMore}
              onHeartToggle={handleHeartToggle}
              onCopyLink={handleCopyLink}
              onViewDetail={handleViewDetail}
            />
          </div>
          <KudosSidebar
            stats={stats}
            recipients={recipients}
            onOpenSecretBox={handleOpenSecretBox}
          />
        </div>
      </div>

      {/* Submit dialog */}
      <SubmitKudosDialog
        open={dialogOpen}
        onClose={handleCloseCompose}
        departments={initial.departments}
        featureHashtags={initial.featureHashtags}
        smallHashtags={initial.smallHashtags}
        sunnerSearch={handleSunnerSearch}
        onUpload={handleUploadImage}
        onSubmit={handleSubmitKudos}
        initialRecipient={hoverRecipient ?? initialRecipient}
      />

      {/* Detail popup — view a kudos without leaving the board */}
      <KudosDetailDialog
        card={viewCard}
        loading={viewLoading}
        onClose={handleCloseDetail}
        onCopyLink={handleCopyLink}
      />
    </div>
    </ComposeKudosProvider>
  );
}

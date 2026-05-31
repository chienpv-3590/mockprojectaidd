import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile, getProfileStats } from "@/lib/data/profile";
import { getSecretBoxCounts, listRecentRecipients } from "@/lib/data/secret-boxes";
import { listFeatureHashtags, listSmallHashtags } from "@/lib/data/hashtags";
import { listDepartments } from "@/lib/data/departments";
import { getHighlightKudos, getAllKudos } from "@/lib/data/kudos-feed";
import { getSpotlightRecipients, getTotalKudosCount } from "@/lib/data/spotlight";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { LiveBoardClient } from "@/app/_components/sun-kudos/live-board-client";
import type { LiveBoardInitialData } from "@/app/_components/sun-kudos/live-board-client";
import type { SidebarStats } from "@/app/_components/sun-kudos/types";
import { adaptSecretBoxRecipient } from "@/app/_components/sun-kudos/_lib/kudos-adapter";

export const metadata = { title: "Sun* Kudos — SAA 2025" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  searchParams: Promise<{ compose?: string }>;
};

export default async function SunKudosPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sun-kudos");

  // Resolve ?compose=<uuid> deep-link — validate uuid before any DB call
  const { compose } = await searchParams;
  const composeId = compose && UUID_RE.test(compose) ? compose : null;

  // Parallel-fetch all data needed for the initial render
  const [
    notifications,
    unreadCount,
    profile,
    profileStats,
    secretBoxCounts,
    recentRecipients,
    featureHashtags,
    smallHashtags,
    departments,
    highlightRows,
    feedResult,
    spotlightNodes,
    totalKudos,
  ] = await Promise.all([
    getNotifications(supabase, user.id, 10),
    getUnreadCount(supabase, user.id),
    getProfile(supabase, user.id),
    getProfileStats(supabase, user.id),
    getSecretBoxCounts(supabase, user.id),
    listRecentRecipients(supabase, 10),
    listFeatureHashtags(supabase),
    listSmallHashtags(supabase),
    listDepartments(supabase),
    getHighlightKudos(supabase, undefined),
    getAllKudos(supabase, undefined, 10, undefined),
    getSpotlightRecipients(supabase),
    getTotalKudosCount(supabase),
  ]);

  // Resolve compose recipient — only when a valid uuid was provided
  const initialRecipient = composeId ? await getProfile(supabase, composeId) : null;

  const stats: SidebarStats = {
    kudosReceived: profileStats.received,
    kudosSent: profileStats.sent,
    hearts: profileStats.hearts,
    secretBoxOpened: secretBoxCounts.opened,
    secretBoxPending: secretBoxCounts.unopened,
  };

  const initial: LiveBoardInitialData = {
    highlightRows,
    feedRows: feedResult.rows,
    feedNextCursor: feedResult.nextCursor,
    stats,
    recipients: recentRecipients.map(adaptSecretBoxRecipient),
    spotlightNodes,
    totalKudos, // global count(*) from kudos — per Spotlight B.7.1 spec
    featureHashtags,
    smallHashtags,
    departments,
  };

  const userProps = {
    name: profile?.full_name_vi ?? user.user_metadata?.full_name ?? user.email ?? "Người dùng",
    email: user.email ?? "",
    avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#00101A]">
      <Header
        languageSlot={<LanguageSwitcher />}
        notificationSlot={
          <NotificationBell
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
          />
        }
        userSlot={<UserMenu user={userProps} />}
      />

      <main className="flex-1">
        <LiveBoardClient initial={initial} currentUserId={user.id} initialRecipient={initialRecipient} />
      </main>

      <Footer />
    </div>
  );
}

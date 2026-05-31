/**
 * /sun-kudos/profile — Self-profile page (server component, Phase 03).
 *
 * Layout (top → bottom, Figma node 362:5037 "Profile bản thân"):
 *   1. Shared Header (notifications + UserMenu)
 *   2. Keyvisual banner (spotlight art) + Section A — ProfileBanner
 *   3. Section B/C/D — ProfileSelfClient (stats + awards header + feed tabs)
 *   4. Footer
 *
 * Data is fetched server-side for the logged-in user only; the interactive
 * pieces (feed tabs, year filter, secret box) live in ProfileSelfClient.
 */

import { redirect } from "next/navigation";
import Image from "next/image";
import { getCachedUser } from "@/lib/supabase/cached-auth";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile, getProfileStats, getUserHeroRank } from "@/lib/data/profile";
import { getSecretBoxCounts, getOwnedIcons } from "@/lib/data/secret-boxes";
import { getUserKudos, getUserKudosYears } from "@/lib/data/kudos-feed";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { ProfileBanner } from "./_components/profile-banner";
import { ProfileSelfClient } from "./_components/profile-self-client";

export const metadata = { title: "Trang cá nhân — Sun* Kudos" };

export default async function SelfProfilePage() {
  const supabase = await createClient();
  // Shared cache with the root layout — see `lib/supabase/cached-auth.ts`.
  const user = await getCachedUser();
  if (!user) redirect("/login?next=/sun-kudos/profile");

  // Years drive the awards dropdown; the newest year seeds the initial feed.
  const years = await getUserKudosYears(supabase, user.id);
  const initialYear = years[0] ?? new Date().getFullYear();

  const [notifications, unreadCount, profile, profileStats, secretBoxCounts, heroRank, ownedIcons, feedResult] =
    await Promise.all([
      getNotifications(supabase, user.id, 10),
      getUnreadCount(supabase, user.id),
      getProfile(supabase, user.id),
      getProfileStats(supabase, user.id),
      getSecretBoxCounts(supabase, user.id),
      getUserHeroRank(supabase, user.id),
      getOwnedIcons(supabase, user.id),
      getUserKudos(supabase, user.id, "received", { year: initialYear }),
    ]);

  const displayName =
    profile?.full_name_vi ?? user.user_metadata?.full_name ?? user.email ?? "Người dùng";
  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null;
  const userProps = { name: displayName, email: user.email ?? "", avatarUrl };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#00101A" }}>
      <Header
        languageSlot={<LanguageSwitcher />}
        notificationSlot={
          <NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />
        }
        userSlot={<UserMenu user={userProps} />}
      />

      <main className="flex flex-1 flex-col">
        {/* Keyvisual banner + Section A overlay */}
        <div className="relative w-full" style={{ minHeight: 468 }}>
          <div className="absolute inset-0 overflow-hidden">
            <Image src="/home/spotlight-bg.png" alt="" fill priority className="object-cover" aria-hidden />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <Image src="/home/spotlight-mesh.png" alt="" fill className="object-cover mix-blend-screen" aria-hidden />
          </div>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image src="/home/spotlight-ribbon.png" alt="" fill className="object-cover" aria-hidden />
          </div>
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,16,26,0.55) 0%, rgba(0,7,12,0.75) 100%)",
            }}
          />

          <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-10 sm:px-10 lg:px-20">
            <div className="w-full max-w-5xl">
              <ProfileBanner
                name={displayName}
                employeeCode={profile?.title ?? profile?.department_code ?? profile?.employee_code ?? ""}
                avatarUrl={avatarUrl}
                heroRank={heroRank}
                ownedIcons={ownedIcons}
              />
            </div>
          </div>
        </div>

        {/* Content area — stats + awards + feed */}
        <div
          className="mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-6 lg:px-8"
          style={{ gap: "64px", paddingTop: "64px", paddingBottom: "120px" }}
        >
          <ProfileSelfClient
            initialStats={{
              received: profileStats.received,
              sent: profileStats.sent,
              hearts: profileStats.hearts,
              boxOpened: secretBoxCounts.opened,
              boxUnopened: secretBoxCounts.unopened,
            }}
            initialRows={feedResult.rows}
            initialNextCursor={feedResult.nextCursor}
            years={years.length > 0 ? years : [initialYear]}
            initialYear={initialYear}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

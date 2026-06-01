/**
 * /sun-kudos/profile/[userId] — Other-user profile page (read-only).
 *
 * Layout mirrors the self-profile page but:
 *  - Redirects to /sun-kudos/profile if the viewer IS the target.
 *  - No secret box; ProfilePublicClient handles received-only feed.
 *  - CTA "Gửi Kudos cho người này" deep-links to ?compose=userId.
 */

import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCachedUser } from "@/lib/supabase/cached-auth";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getProfile, getProfileStats, getUserHeroRank } from "@/lib/data/profile";
import { getOwnedIcons } from "@/lib/data/secret-boxes";
import { getUserKudos } from "@/lib/data/kudos-feed";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { ProfileBanner } from "../_components/profile-banner";
import { ProfilePublicClient } from "../_components/profile-public-client";

// Static metadata avoids a duplicate `cache()` call to `getProfile` from both
// `generateMetadata` and the page body. The duplicate cache hit makes React
// 19's RSC dev perf tracker record the second `await` with a -1 endTime,
// which then throws "Failed to execute 'measure' on 'Performance':
// '<Component>' cannot have a negative time stamp." (see vercel/next.js#86060).
// The viewer still sees the target Sunner's full name rendered in the page's
// banner (Section A) once the page mounts — this only affects the document
// <title>.
export const metadata = { title: "Sunner | Sun* Kudos" };

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  // getCachedUser() is React.cache()-deduplicated: the root layout already
  // called it for the FAB auth gate, so this resolves from the same promise
  // instead of issuing a second independent auth.getUser() async span. That
  // second span was the trigger for the RSC perf tracker negative-timestamp
  // error (vercel/next.js#86060).
  // Auth gate + self-redirect are handled by proxy.ts (middleware), NOT here.
  // An in-page redirect()/notFound() throws before any child renders, leaving
  // React 19's RSC dev perf tracker with childrenEndTime = -Infinity, which
  // then throws "Failed to execute 'measure' on 'Performance': '<ProfilePage>'
  // cannot have a negative time stamp." (vercel/next.js#86060). Doing the
  // redirect at the edge in proxy.ts avoids entering the page at all.
  const user = await getCachedUser();
  const supabase = await createClient();

  if (!user) redirect(`/login?next=/sun-kudos/profile/${userId}`);

  const [notifications, unreadCount, profile, profileStats, heroRank, ownedIcons, feedResult] =
    await Promise.all([
      getNotifications(supabase, user.id, 10),
      getUnreadCount(supabase, user.id),
      getProfile(supabase, userId),
      getProfileStats(supabase, userId),
      getUserHeroRank(supabase, userId),
      getOwnedIcons(supabase, userId),
      getUserKudos(supabase, userId, "received"),
    ]);

  if (!profile) notFound();

  // Header shows the VIEWER's own identity, not the target profile.
  const userProps = {
    name: user.user_metadata?.full_name ?? user.email ?? "Người dùng",
    email: user.email ?? "",
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };

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
                name={profile.full_name_vi}
                employeeCode={profile.title ?? profile.department_code ?? profile.employee_code ?? ""}
                avatarUrl={profile.avatar_url}
                heroRank={heroRank}
                ownedIcons={ownedIcons}
              />
            </div>
          </div>
        </div>

        {/* Content area — CTA + back link + stats + feed */}
        <div
          className="mx-auto flex w-full max-w-3xl flex-col px-4 sm:px-6 lg:px-8"
          style={{ gap: "64px", paddingTop: "64px", paddingBottom: "120px" }}
        >
          {/* Back link + CTA row */}
          <div className="flex flex-col items-start" style={{ gap: "16px" }}>
            <Link
              href="/sun-kudos"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              className="transition-colors hover:text-white"
            >
              ← Quay lại Sun Kudos
            </Link>

            {/* CTA — deep-link to compose for this user */}
            <Link
              href={`/sun-kudos?compose=${userId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFEA9E",
                color: "#00101A",
                fontFamily: "var(--font-montserrat), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 8,
                padding: "14px 24px",
                textDecoration: "none",
                alignSelf: "stretch",
              }}
            >
              Gửi Kudos cho người này
            </Link>
          </div>

          <ProfilePublicClient
            targetUserId={userId}
            initialStats={{
              received: profileStats.received,
              sent: profileStats.sent,
              hearts: profileStats.hearts,
            }}
            initialRows={feedResult.rows}
            initialNextCursor={feedResult.nextCursor}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

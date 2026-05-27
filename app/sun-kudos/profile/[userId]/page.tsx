import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getProfileStats } from "@/lib/data/profile";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { KudosUserAvatar } from "@/app/sun-kudos/_components/kudos-user-avatar";
import { KudosTierStars } from "@/app/sun-kudos/_components/kudos-tier-stars";

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const profile = await getProfile(supabase, userId);
  if (!profile) return { title: "Sunner | Sun* Kudos" };
  return { title: `${profile.full_name_vi} | Sun* Kudos` };
}

const TIER_LABELS = ["–", "Bronze", "Silver", "Gold"] as const;

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ background: "rgba(255,234,158,0.06)", border: "1px solid rgba(255,234,158,0.15)", borderRadius: 12, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ color: "#FFEA9E", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</span>
      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>{label}</span>
    </div>
  );
}

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/sun-kudos/profile/${userId}`);

  const [profile, stats, notifications, unreadCount] = await Promise.all([
    getProfile(supabase, userId),
    getProfileStats(supabase, userId),
    getNotifications(supabase, user.id, 10),
    getUnreadCount(supabase, user.id),
  ]);

  if (!profile) notFound();

  const userProps = {
    name: user.user_metadata?.full_name ?? user.email ?? "Người dùng",
    email: user.email ?? "",
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#00101A]">
      <Header
        languageSlot={<LanguageSwitcher />}
        notificationSlot={<NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />}
        userSlot={<UserMenu user={userProps} />}
      />
      <main className="flex-1 px-4 py-10 sm:px-6" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
        <div className="mx-auto max-w-2xl">
          <Link
            href="/sun-kudos"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 32 }}
            className="hover:text-white transition-colors"
          >
            ← Quay lại Sun Kudos
          </Link>

          {/* Profile card */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,234,158,0.12)", borderRadius: 16, padding: "36px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ border: "2px solid rgba(255,234,158,0.3)", borderRadius: "50%", overflow: "hidden" }}>
              <KudosUserAvatar url={profile.avatar_url} name={profile.full_name_vi} size={96} />
            </div>
            <h1 style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 22, textAlign: "center", margin: 0 }}>
              {profile.full_name_vi}
            </h1>
            {(profile.department_code ?? profile.department_name_vi) && (
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: 0 }}>
                {profile.department_code ?? profile.department_name_vi}
              </p>
            )}
            <KudosTierStars tier={profile.tier} size={20} />
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <StatTile label="Số Kudos nhận" value={stats.received} />
            <StatTile label="Số Kudos đã gửi" value={stats.sent} />
            <StatTile label="Số tim nhận" value={stats.hearts} />
            <StatTile label="Hoa thị tier" value={TIER_LABELS[stats.tier] ?? "–"} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

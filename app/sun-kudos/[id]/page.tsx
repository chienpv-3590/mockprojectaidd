import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCachedUser } from "@/lib/supabase/cached-auth";
import { createClient } from "@/lib/supabase/server";
import { getKudosById } from "@/lib/data/kudos-feed";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { KudosUserAvatar } from "../_components/kudos-user-avatar";
import { KudosTierStars } from "../_components/kudos-tier-stars";
import { AvatarHoverTrigger } from "@/app/_components/sun-kudos/avatar-hover-trigger";
import type { KudosCardData } from "@/lib/data/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const kudos = await getKudosById(supabase, id);
  if (!kudos) return { title: "Kudos | Sun* Kudos" };
  return {
    title: `${kudos.sender.full_name_vi} → ${kudos.receiver.full_name_vi} | Sun* Kudos`,
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function UserBlock({ profile }: { profile: KudosCardData["sender"] }) {
  return (
    <Link
      href={`/sun-kudos/profile/${profile.user_id}`}
      className="flex flex-col items-center gap-2 text-center hover:opacity-80 transition-opacity"
    >
      <AvatarHoverTrigger userId={profile.user_id}>
        <KudosUserAvatar url={profile.avatar_url} name={profile.full_name_vi} size={64} />
      </AvatarHoverTrigger>
      <div>
        <p style={{ color: "#FFF", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
          {profile.full_name_vi}
        </p>
        {(profile.department_code ?? profile.department_name_vi) && (
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
            {profile.department_code ?? profile.department_name_vi}
          </p>
        )}
        <KudosTierStars tier={profile.tier} size={14} />
      </div>
    </Link>
  );
}

export default async function KudosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // Shared cache with the root layout — see `lib/supabase/cached-auth.ts`.
  const user = await getCachedUser();
  if (!user) redirect(`/login?next=/sun-kudos/${id}`);

  const [kudos, notifications, unreadCount] = await Promise.all([
    getKudosById(supabase, id),
    getNotifications(supabase, user.id, 10),
    getUnreadCount(supabase, user.id),
  ]);

  if (!kudos) notFound();

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
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
          <Link href="/sun-kudos" style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }} className="hover:text-white transition-colors">
            ← Quay lại danh sách
          </Link>

          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,234,158,0.15)", borderRadius: 16, padding: "32px 28px" }}>
            {kudos.feature_hashtag && (
              <div style={{ display: "inline-block", background: "#FFEA9E", color: "#00101A", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", padding: "4px 14px", borderRadius: 6, marginBottom: 24, textTransform: "uppercase" }}>
                {kudos.feature_hashtag.label_vi}
              </div>
            )}

            <div className="flex items-center justify-center gap-6 mb-6">
              <UserBlock profile={kudos.sender} />
              <span style={{ color: "#FFEA9E", fontSize: 28 }} aria-hidden="true">→</span>
              <UserBlock profile={kudos.receiver} />
            </div>

            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", marginBottom: 20 }}>
              {formatDate(kudos.created_at)}
            </p>

            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              {kudos.message}
            </p>

            {kudos.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: kudos.images.length === 1 ? "1fr" : "repeat(2, 1fr)", gap: 8, marginBottom: 20 }}>
                {kudos.images.map((img, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.storage_path} src={img.signed_url} alt={`Kudos image ${idx + 1}`} style={{ width: "100%", borderRadius: 8, objectFit: "cover", aspectRatio: "16/9" }} />
                ))}
              </div>
            )}

            {kudos.small_hashtags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {kudos.small_hashtags.map((tag) => (
                  <span key={tag.id} style={{ fontSize: 12, color: "rgba(255,234,158,0.8)", border: "1px solid rgba(255,234,158,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                    #{tag.label_vi}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#ef4444" }}>♥</span> {kudos.heart_count}
              </span>
              <button
                type="button"
                style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(255,234,158,0.4)", color: "#FFEA9E", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
              >
                Sao chép liên kết
              </button>
            </div>
          </div>

          <div style={{ marginTop: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 24px", color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" }}>
            Tính năng bình luận sẽ sớm có mặt.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

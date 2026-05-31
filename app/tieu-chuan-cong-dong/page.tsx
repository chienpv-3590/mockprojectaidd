import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCachedUser } from "@/lib/supabase/cached-auth";
import { createClient } from "@/lib/supabase/server";
import {
  getNotifications,
  getUnreadCount,
} from "@/lib/data/notifications";
import { getServerI18n } from "@/lib/i18n/server";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";
import { StandardsHero } from "@/app/_components/standards/standards-hero";
import { StandardsContent } from "@/app/_components/standards/standards-content";

const HERO_SUBTITLE = "Sun* Annual Awards 2025";
const ROUTE = "/tieu-chuan-cong-dong";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getServerI18n();
  return { title: dict.standards.metaTitle };
}

/**
 * General Standards (Tiêu chuẩn chung) — bilingual static page covering
 * Community Standards and Security Standards. Entry points:
 *  - Footer link (label `dict.nav.standards`).
 *  - "Tiêu chuẩn cộng đồng" link in the kudos write-form toolbar.
 *
 * Auth: redirects unauthenticated users to /login?next=/tieu-chuan-cong-dong
 * (mirrors /he-thong-giai). Content text is sourced from the i18n dictionary
 * slice `standards.*` so the body follows the active locale (cookie-driven).
 */
export default async function StandardsPage() {
  const supabase = await createClient();
  // Shared cache with the root layout — see `lib/supabase/cached-auth.ts`.
  const user = await getCachedUser();
  if (!user) redirect(`/login?next=${ROUTE}`);

  const [{ dict }, notifications, unreadCount] = await Promise.all([
    getServerI18n(),
    getNotifications(supabase, user.id, 10),
    getUnreadCount(supabase, user.id),
  ]);

  const userProps = {
    name: user.user_metadata?.full_name ?? user.email ?? "Người dùng",
    email: user.email ?? "",
    avatarUrl: user.user_metadata?.avatar_url ?? null,
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
        <StandardsHero
          subtitle={HERO_SUBTITLE}
          title={dict.nav.standards}
        />
        <StandardsContent
          community={dict.standards.community}
          security={dict.standards.security}
        />
      </main>
      <Footer />
    </div>
  );
}

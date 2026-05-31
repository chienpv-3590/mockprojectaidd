import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAwards } from "@/lib/data/awards";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { AwardSystem } from "@/app/_components/award-system/award-system";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";

export const metadata = { title: "Hệ thống giải thưởng SAA 2025" };

export default async function HeThongGiaiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/he-thong-giai");

  const [awards, notifications, unreadCount] = await Promise.all([
    getAwards(supabase),
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
        <AwardSystem awards={awards} />
      </main>
      <Footer />
    </div>
  );
}

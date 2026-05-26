import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { UserMenu } from "@/app/_components/home/user-menu";

export const metadata = { title: "Sun* Kudos — SAA 2025" };

export default async function SunKudosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sun-kudos");

  const [notifications, unreadCount] = await Promise.all([
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
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center text-white">
        <h1
          className="text-4xl font-bold text-[#FFEA9E] sm:text-5xl"
          style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
        >
          Sun* Kudos
        </h1>
        <p
          className="mt-6 max-w-xl text-base text-white/70 sm:text-lg"
          style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
        >
          Coming soon — chi tiết về phong trào ghi nhận Sun* Kudos sẽ sớm có mặt.
        </p>
      </main>
      <Footer />
    </div>
  );
}

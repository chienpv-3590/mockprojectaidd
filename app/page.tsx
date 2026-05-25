import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAwards } from "@/lib/data/awards";
import { getEventDate } from "@/lib/data/event-settings";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { getReceivedCount } from "@/lib/data/kudos";
import { Header } from "./_components/home/header";
import { Hero } from "./_components/home/hero";
import { AwardsGrid } from "./_components/home/awards-grid";
import { KudosSection } from "./_components/home/kudos-section";
import { Footer } from "./_components/home/footer";
import { FloatingFab } from "./_components/home/floating-fab";
import { CountdownTimer } from "./_components/home/countdown-timer";
import { UserMenu } from "./_components/home/user-menu";
import { NotificationBell } from "./_components/home/notification-bell";

// Language switcher: visual stub (per plan — deferred to future i18n plan).
function LanguageStub() {
  return (
    <button type="button" aria-label="Change language" className="text-sm text-white/80 transition hover:text-white">
      VN
    </button>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Belt-and-suspenders — proxy middleware also enforces this.
  if (!user) redirect("/login");

  const [awards, eventDate, notifications, unreadCount, kudosReceived] = await Promise.all([
    getAwards(supabase),
    getEventDate(supabase),
    getNotifications(supabase, user.id, 10),
    getUnreadCount(supabase, user.id),
    getReceivedCount(supabase, user.id),
  ]);

  const userProps = {
    name: user.user_metadata?.full_name ?? user.email ?? "Người dùng",
    email: user.email ?? "",
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#00101A]">
      <Header
        languageSlot={<LanguageStub />}
        notificationSlot={<NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />}
        userSlot={<UserMenu user={userProps} />}
      />
      <main>
        <Hero countdownSlot={<CountdownTimer eventDateIso={eventDate?.toISOString() ?? null} />} />
        <AwardsGrid awards={awards} />
        <KudosSection receivedCount={kudosReceived} />
      </main>
      <Footer />
      <FloatingFab />
    </div>
  );
}

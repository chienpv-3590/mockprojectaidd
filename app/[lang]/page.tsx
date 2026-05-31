import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAwards } from "@/lib/data/awards";
import { getEventDate } from "@/lib/data/event-settings";
import { getNotifications, getUnreadCount } from "@/lib/data/notifications";
import { Header } from "@/app/_components/home/header";
import { Hero } from "@/app/_components/home/hero";
import { AwardsGrid } from "@/app/_components/home/awards-grid";
import { KudosBanner } from "@/app/_components/shared/kudos-banner";
import { Footer } from "@/app/_components/home/footer";
import { RootFurtherDescription } from "@/app/_components/home/root-further-description";
import { CountdownTimer } from "@/app/_components/home/countdown-timer";
import { UserMenu } from "@/app/_components/home/user-menu";
import { NotificationBell } from "@/app/_components/home/notification-bell";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Belt-and-suspenders — proxy middleware also enforces this.
  if (!user) redirect("/login");

  const [awards, eventDate, notifications, unreadCount] = await Promise.all([
    getAwards(supabase),
    getEventDate(supabase),
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
        notificationSlot={<NotificationBell initialNotifications={notifications} initialUnreadCount={unreadCount} />}
        userSlot={<UserMenu user={userProps} />}
      />
      <main>
        {/* Painterly keyvisual background spans Hero + top of RootFurther
            per design: Keyvisual BG Y 0–1392, Cover Y 0–1480 with
            linear-gradient(12deg) fading dark at bottom → transparent at top. */}
        <div className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[1400px] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/home/keyvisual-bg.jpg)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1480px]"
            style={{
              background:
                "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0) 48.92%)",
            }}
          />
          <Hero countdownSlot={<CountdownTimer eventDateIso={eventDate?.toISOString() ?? null} />} />
          <RootFurtherDescription />
        </div>
        <AwardsGrid awards={awards} />
        <KudosBanner href="/sun-kudos" />
      </main>
      <Footer />
      {/* FloatingFab is mounted globally in `app/layout.tsx` via GlobalKudosFab. */}
    </div>
  );
}

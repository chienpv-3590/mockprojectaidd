import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Montserrat_Alternates, Orbitron } from "next/font/google";
import { getServerI18n } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/locale-context";
import { getCachedUser } from "@/lib/supabase/cached-auth";
import { createClient } from "@/lib/supabase/server";
import { loadKudosComposeBootstrap } from "@/lib/data/kudos-compose-bootstrap";
import { GlobalKudosFab } from "@/app/_components/home/global-kudos-fab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alt",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SAA 2025 — Sun* Annual Awards",
    template: "%s | SAA 2025",
  },
  description: "Sun* Annual Awards 2025 — Tôn vinh tài năng và đóng góp xuất sắc.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale + dictionary come from the NEXT_LOCALE cookie (set by the language
  // switcher / proxy from the ?lang query param). The cookie is the source of
  // truth so the locale survives navigation. Defaults to `vi`.
  const { locale, dict } = await getServerI18n();

  // Mount the global Floating Action Button only for authenticated users.
  // Bootstrap data (hashtags, departments, currentUserId) is loaded once
  // here and handed to the client orchestrator. Unauth users (e.g. /login)
  // skip the fetch and the FAB never renders.
  //
  // getCachedUser() is wrapped in React.cache() so any nested page that also
  // calls getCachedUser() (e.g. ProfilePage) shares the same resolved promise
  // instead of issuing a second independent auth.getUser() span. A second
  // independent span causes React 19's RSC dev perf tracker to compute a
  // negative duration for the nested component and throw:
  //   "Failed to execute 'measure' on 'Performance': '<Component>' cannot have
  //    a negative time stamp." (vercel/next.js#86060)
  const user = await getCachedUser();
  const fabBootstrap = user
    ? await loadKudosComposeBootstrap(await createClient(), user.id)
    : null;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${montserratAlternates.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <I18nProvider value={{ locale, dict }}>
          {children}
          {fabBootstrap ? <GlobalKudosFab bootstrap={fabBootstrap} /> : null}
        </I18nProvider>
      </body>
    </html>
  );
}

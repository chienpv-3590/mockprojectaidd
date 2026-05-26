import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/app/_components/home/header";
import { Footer } from "@/app/_components/home/footer";
import { LanguageSwitcher } from "@/app/_components/home/language-switcher";

export const metadata = { title: "Sun* Kudos — SAA 2025" };

export default async function SunKudosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/sun-kudos");

  return (
    <div className="flex min-h-screen flex-col bg-[#00101A]">
      <Header languageSlot={<LanguageSwitcher />} />
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

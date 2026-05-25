import Image from "next/image";
import Link from "next/link";
import { signInWithGoogle } from "./actions";

const ASSETS = "/login";

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed: "Đăng nhập thất bại. Vui lòng thử lại.",
  oauth_init_failed: "Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div
      className="relative isolate flex min-h-screen flex-col overflow-hidden text-white"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Background painterly artwork (full-bleed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-95"
        style={{ backgroundImage: `url(${ASSETS}/background.jpg)` }}
      />
      {/* Horizontal dark-to-transparent gradient (per design node 662:14392) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0,16,26,0) 100%)",
        }}
      />
      {/* Bottom dark cover gradient (per design node 662:14390) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(0deg, #00101A 22.48%, rgba(0,19,32,0) 51.74%)",
        }}
      />

      <Header />

      <main className="relative flex flex-1 items-center px-6 sm:px-12 lg:px-24">
        <div className="flex max-w-2xl flex-col gap-8">
          <Image
            src={`${ASSETS}/root-further-logo.png`}
            alt="ROOT FURTHER"
            width={520}
            height={260}
            priority
            className="h-auto w-72 sm:w-96 lg:w-[28rem]"
          />
          <p className="max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            Bắt đầu hành trình của bạn cùng SAA 2025.
            <br />
            Đăng nhập để khám phá!
          </p>
          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
          <GoogleLoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
      <Link href="/" aria-label="Sun* Annual Awards 2025 — Home">
        <Image
          src={`${ASSETS}/logo.png`}
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          priority
          className="h-10 w-auto sm:h-12"
        />
      </Link>
      <LanguageSwitcher />
    </header>
  );
}

function LanguageSwitcher() {
  // Visual stub only. Dropdown wiring deferred to a future i18n plan.
  return (
    <button
      type="button"
      aria-label="Change language"
      aria-haspopup="listbox"
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/90 hover:bg-white/5 transition"
    >
      <Image src={`${ASSETS}/vn.svg`} alt="Vietnam flag" width={20} height={20} unoptimized className="h-5 w-5" />
      <span>VN</span>
      <Image src={`${ASSETS}/down.svg`} alt="" width={16} height={16} unoptimized className="h-4 w-4 opacity-80" />
    </button>
  );
}

function GoogleLoginForm() {
  return (
    <form action={signInWithGoogle} className="w-fit">
      <button
        type="submit"
        data-testid="login-google"
        className="group inline-flex w-fit items-center gap-3 rounded-md bg-[#FFD24C] px-6 py-3 text-sm font-semibold text-[#0a0a0a] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg active:bg-[#F5C12E] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="tracking-wide">LOGIN With Google</span>
        <Image src={`${ASSETS}/google.svg`} alt="" width={20} height={20} unoptimized className="h-5 w-5" />
      </button>
    </form>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="max-w-md rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-200"
    >
      {message}
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 px-6 py-4 text-center text-xs text-white/70">
      Bản quyền thuộc về Sun* © 2025
    </footer>
  );
}

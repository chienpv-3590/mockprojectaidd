import Image from "next/image";
import Link from "next/link";
import { signInWithGoogle } from "./actions";

const ASSETS = "/login";

// Per-element typography from MoMorph design (nodes get_node verified).
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const FONT_MONTSERRAT_ALT = "var(--font-montserrat-alt), system-ui, sans-serif";

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
      {/* Background painterly artwork — cropped to artwork-only region of design
          (text + header strip excluded to avoid ghost-element duplication). */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-20 bottom-12 -z-20 w-[75%] bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: `url(${ASSETS}/background.jpg)` }}
      />
      {/* Horizontal blend: dark navy left, transparent right (per design node 662:14392) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 30%, rgba(0,16,26,0) 65%)",
        }}
      />
      {/* Bottom dark cover gradient (per design node 662:14390) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(0deg, #00101A 18%, rgba(0,19,32,0) 55%)",
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
          <p
            className="max-w-lg text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: "40px",
              letterSpacing: "0.5px",
            }}
          >
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
      <span
        style={{
          fontFamily: FONT_MONTSERRAT,
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "24px",
          letterSpacing: "0.15px",
        }}
      >
        VN
      </span>
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
        className="group inline-flex w-fit items-center gap-3 rounded-md bg-[#FFD24C] px-6 py-3 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg active:bg-[#F5C12E] disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          fontFamily: FONT_MONTSERRAT,
          fontWeight: 700,
          fontSize: "22px",
          lineHeight: "28px",
        }}
      >
        <span>LOGIN With Google</span>
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
    <footer
      className="relative z-10 px-6 py-4 text-center text-white/70"
      style={{
        fontFamily: FONT_MONTSERRAT_ALT,
        fontWeight: 700,
        fontSize: "16px",
        lineHeight: "24px",
      }}
    >
      Bản quyền thuộc về Sun* © 2025
    </footer>
  );
}

import Link from "next/link";

// Renders inside the root layout (html/body provided).
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#00101A] px-6 text-center text-white">
      <h1 style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif", fontWeight: 700, fontSize: "48px" }}>
        404
      </h1>
      <p className="text-white/70" style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}>
        Không tìm thấy trang bạn yêu cầu.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[#FFEA9E] px-5 py-2.5 text-[#00101A] transition hover:bg-[#FFDD70]"
        style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif", fontWeight: 700 }}
      >
        Về trang chủ
      </Link>
    </main>
  );
}

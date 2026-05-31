import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#00101A] px-4"
      style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif" }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 18,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Sunner không tồn tại.
      </p>
      <Link
        href="/sun-kudos"
        style={{
          color: "#FFEA9E",
          fontSize: 14,
          textDecoration: "none",
          border: "1px solid rgba(255,234,158,0.4)",
          padding: "8px 20px",
          borderRadius: 8,
        }}
        className="hover:bg-[rgba(255,234,158,0.1)] transition-colors"
      >
        ← Quay lại Sun Kudos
      </Link>
    </div>
  );
}

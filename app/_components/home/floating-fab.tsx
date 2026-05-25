import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

// Visual stub per spec item 6. No click handler — pill displays only.
export function FloatingFab() {
  return (
    <div
      aria-hidden
      className="fixed bottom-6 right-6 z-40 flex h-16 w-[105px] items-center justify-center gap-2 rounded-full bg-[#FFD24C] text-[#00101A] shadow-lg"
      style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700, fontSize: "14px" }}
    >
      <Image src={`${ASSETS}/pen.svg`} alt="" width={20} height={20} unoptimized className="h-5 w-5" />
      <span>Feedback</span>
    </div>
  );
}

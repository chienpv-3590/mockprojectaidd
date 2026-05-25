import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export function FloatingFab() {
  return (
    <div
      aria-hidden
      className="fixed bottom-6 right-6 z-40 flex h-16 w-[105px] items-center justify-center gap-1 rounded-full bg-[#FFEA9E] px-3 text-[#00101A]"
      style={{
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 #FAE287",
        fontFamily: FONT_MONTSERRAT,
        fontWeight: 700,
        fontSize: "20px",
      }}
    >
      <Image src={`${ASSETS}/pen.svg`} alt="" width={24} height={24} unoptimized className="h-6 w-6" />
      <span className="text-[#00101A]/70">/</span>
      <Image src={`${ASSETS}/logo.png`} alt="" width={28} height={28} className="h-7 w-auto" />
    </div>
  );
}

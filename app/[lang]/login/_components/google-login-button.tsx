"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";

const ASSETS = "/login";

const BUTTON_STYLE = {
  fontFamily: "var(--font-montserrat), system-ui, sans-serif",
  fontWeight: 700 as const,
  fontSize: "22px",
  lineHeight: "28px",
};

// Must be inside a <form action={signInWithGoogle}> — uses useFormStatus().
export function GoogleLoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      data-testid="login-google"
      disabled={pending}
      aria-busy={pending}
      className="group inline-flex w-fit cursor-pointer items-center gap-3 rounded-md bg-[#FFD24C] px-6 py-3 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg active:bg-[#F5C12E] disabled:cursor-wait disabled:opacity-70"
      style={BUTTON_STYLE}
    >
      <span>{pending ? "Đang đăng nhập…" : "LOGIN With Google"}</span>
      {pending ? (
        <Spinner />
      ) : (
        <Image src={`${ASSETS}/google.svg`} alt="" width={20} height={20} unoptimized className="h-5 w-5" />
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      role="status"
      aria-hidden
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 animate-spin"
    >
      <circle cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={3} className="opacity-25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

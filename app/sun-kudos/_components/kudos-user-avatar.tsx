/**
 * Shared avatar component for Sun Kudos detail and profile pages.
 * Uses plain <img> to avoid next/image domain-allowlist friction with signed URLs.
 */

type Props = { url: string | null; name: string; size: number };

export function KudosUserAvatar({ url, name, size }: Props) {
  const initial = name.charAt(0).toUpperCase();
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,234,158,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFEA9E",
        fontWeight: 700,
        fontSize: size * 0.4,
        fontFamily: "var(--font-montserrat), system-ui, sans-serif",
      }}
    >
      {initial}
    </div>
  );
}

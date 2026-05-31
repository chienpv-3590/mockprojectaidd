import Image from "next/image";

/**
 * 6-icon grid (3 cols × 2 rows) of SAA secret-box icons for the Thể lệ
 * drawer. Icon order in the drawer follows the MoMorph display order from
 * `dict.rules.senders.iconLabels` (REVIVAL, TOUCH OF LIGHT, …). The
 * label→file mapping lives here.
 *
 * Files in `public/sun-kudos/secret-box-icons/` are numbered by their
 * runtime award order (icon-1-touch-of-light, …); a unit test ensures
 * every label in the dict resolves to a real file.
 */

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export const RULES_ICON_SRC: Readonly<Record<string, string>> = {
  REVIVAL: "/sun-kudos/secret-box-icons/icon-6-revival.png",
  "TOUCH OF LIGHT": "/sun-kudos/secret-box-icons/icon-1-touch-of-light.png",
  "STAY GOLD": "/sun-kudos/secret-box-icons/icon-4-stay-gold.png",
  "FLOW TO HORIZON": "/sun-kudos/secret-box-icons/icon-2-flow-to-horizon.png",
  "BEYOND THE BOUNDARY":
    "/sun-kudos/secret-box-icons/icon-5-beyond-the-boundary.png",
  "ROOT FURTHER": "/sun-kudos/secret-box-icons/icon-3-root-further.png",
};

export type RulesSecretIconsProps = {
  labels: ReadonlyArray<string>;
};

export function RulesSecretIcons({ labels }: RulesSecretIconsProps) {
  return (
    <ul
      className="grid grid-cols-3 gap-x-4 gap-y-6"
      style={{ fontFamily: FONT_MONTSERRAT }}
    >
      {labels.map((label) => {
        const src = RULES_ICON_SRC[label];
        return (
          <li
            key={label}
            className="flex flex-col items-center gap-2 text-center"
          >
            {src ? (
              <Image
                src={src}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/10" aria-hidden />
            )}
            <span
              className="text-white"
              style={{
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.05em",
                lineHeight: "14px",
              }}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

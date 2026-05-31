/**
 * Catalog of the 6 exclusive SAA collectible icons won by opening Secret Boxes.
 *
 * Each icon is an SAA annual-edition theme. Slot 6 is reserved (artwork pending)
 * and is never awarded until its `src` is filled in.
 *
 * Single source of truth shared by the `openSecretBox` reward action and the
 * profile "Bộ sưu tập icon của tôi" collection UI (DRY). `id` is the value
 * persisted in `secret_boxes.reward_icon`.
 */

export type SecretBoxIcon = {
  /** 1..6 — persisted in secret_boxes.reward_icon */
  id: number;
  key: string;
  /** Display name (reward toast + collection tooltip) */
  label: string;
  /** Public asset path, or null for a not-yet-released (locked) slot */
  src: string | null;
};

export const SECRET_BOX_ICONS: SecretBoxIcon[] = [
  { id: 1, key: "touch-of-light", label: "Touch of Light", src: "/sun-kudos/secret-box-icons/icon-1-touch-of-light.png" },
  { id: 2, key: "flow-to-horizon", label: "Flow to Horizon", src: "/sun-kudos/secret-box-icons/icon-2-flow-to-horizon.png" },
  { id: 3, key: "root-further", label: "Root Further", src: "/sun-kudos/secret-box-icons/icon-3-root-further.png" },
  { id: 4, key: "stay-gold", label: "Stay Gold", src: "/sun-kudos/secret-box-icons/icon-4-stay-gold.png" },
  { id: 5, key: "beyond-the-boundary", label: "Beyond the Boundary", src: "/sun-kudos/secret-box-icons/icon-5-beyond-the-boundary.png" },
  // Slot 6 — Revival; placeholder artwork pending final design.
  { id: 6, key: "revival", label: "Revival", src: "/sun-kudos/secret-box-icons/icon-6-revival.png" },
];

export const SECRET_BOX_ICON_COUNT = SECRET_BOX_ICONS.length; // 6

/** Ids that can actually be awarded (have artwork). */
export const REWARDABLE_ICON_IDS: number[] = SECRET_BOX_ICONS.filter((i) => i.src !== null).map(
  (i) => i.id
);

/**
 * Weighted draw table for openSecretBox rolls. Percentages defined by the
 * "Open Secret Box - chưa mở" MoMorph spec C (screen J3-4YFIpMM): Stay Gold 30,
 * Flow to Horizon 25, Touch of Light 20, Beyond the Boundary 10, Revival 10,
 * Root Further 5. Order matters — the cumulative scan in pickRandomRewardIcon
 * walks the entries in array order, so reordering changes the rng->id mapping.
 */
export const SECRET_BOX_REWARD_WEIGHTS: { id: number; percent: number }[] = [
  { id: 4, percent: 30 }, // Stay Gold
  { id: 2, percent: 25 }, // Flow to Horizon
  { id: 1, percent: 20 }, // Touch of Light
  { id: 5, percent: 10 }, // Beyond the Boundary
  { id: 6, percent: 10 }, // Revival
  { id: 3, percent: 5 },  // Root Further
];

export function getSecretBoxIcon(id: number | null | undefined): SecretBoxIcon | null {
  if (id == null) return null;
  return SECRET_BOX_ICONS.find((i) => i.id === id) ?? null;
}

/**
 * Pick a reward icon id using the weighted distribution from
 * SECRET_BOX_REWARD_WEIGHTS. Cumulative-scan over [0, 1). The `rng` parameter
 * is injectable so tests can pin the draw without mocking Math.random globally.
 */
export function pickRandomRewardIcon(rng: () => number = Math.random): number {
  const roll = rng() * 100;
  let acc = 0;
  for (const { id, percent } of SECRET_BOX_REWARD_WEIGHTS) {
    acc += percent;
    if (roll < acc) return id;
  }
  // Floating-point fallback: return the last weighted id.
  return SECRET_BOX_REWARD_WEIGHTS[SECRET_BOX_REWARD_WEIGHTS.length - 1].id;
}

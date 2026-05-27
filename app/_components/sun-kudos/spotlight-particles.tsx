"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

/**
 * SpotlightParticles — drifting white/grey particle "constellation" behind the
 * Spotlight word cloud (B.7). Config mirrors the SAA production site
 * (saa.sun-asterisk.vn/kudos) 1:1: 60 nodes, linked at distance 150, gentle
 * bounce drift, circle + triangle shapes, no mouse interaction. Rendered
 * full-bleed inside the card and pointer-events:none so it never blocks the
 * word cloud's pan/zoom/click. Honours prefers-reduced-motion (freezes drift).
 */

// Engine loads once per page, shared across mounts.
let enginePromise: Promise<void> | null = null;

const BASE_OPTIONS: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  detectRetina: true,
  interactivity: {
    events: {
      onClick: { enable: false, mode: "push" },
      onHover: { enable: false, mode: "repulse" },
      resize: { enable: true, delay: 0.5 },
    },
  },
  particles: {
    color: { value: ["#ffffff", "#e0e0e0", "#cccccc"] },
    links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.3, width: 1 },
    move: {
      direction: "none",
      enable: true,
      outModes: { default: "bounce" },
      random: false,
      speed: 0.5,
      straight: false,
    },
    number: { density: { enable: true, width: 800, height: 800 }, value: 60 },
    opacity: { value: 0.5 },
    shape: { type: ["circle", "triangle"] },
    size: { value: { min: 1, max: 3 } },
  },
};

export function SpotlightParticles() {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const sync = () => setReducedMotion(!!mq?.matches);
    sync();
    mq?.addEventListener?.("change", sync);

    if (!enginePromise) {
      enginePromise = initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
    }
    let active = true;
    enginePromise.then(() => active && setReady(true)).catch(() => {});

    return () => {
      active = false;
      mq?.removeEventListener?.("change", sync);
    };
  }, []);

  // Freeze drift when the user prefers reduced motion (links still render).
  const options = useMemo<ISourceOptions>(
    () => ({
      ...BASE_OPTIONS,
      particles: {
        ...BASE_OPTIONS.particles,
        move: { ...BASE_OPTIONS.particles!.move, enable: !reducedMotion },
      },
    }),
    [reducedMotion]
  );

  if (!ready) return null;

  return (
    <Particles
      id="spotlight-tsparticles"
      options={options}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

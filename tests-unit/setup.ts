import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

afterEach(() => {
  cleanup();
});

// Stub next/image — render a plain <img> so RTL queries work without the
// Next.js runtime. Drops Next-specific props that confuse the DOM.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const {
      src,
      alt,
      // strip next-only props
      fill: _fill,
      sizes: _sizes,
      priority: _priority,
      unoptimized: _unoptimized,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      ...rest
    } = props as { src?: string; alt?: string; [k: string]: unknown };
    void _fill;
    void _sizes;
    void _priority;
    void _unoptimized;
    void _placeholder;
    void _blurDataURL;
    return React.createElement("img", { src, alt, ...rest });
  },
}));

// tsParticles stubs — the engine needs a real canvas (absent in jsdom).
// Render nothing; component logic (reduced-motion, layering) is unaffected.
vi.mock("@tsparticles/react", () => ({
  default: () => null,
  initParticlesEngine: () => Promise.resolve(),
}));
vi.mock("@tsparticles/slim", () => ({ loadSlim: () => Promise.resolve() }));

// next/link stub — render an <a>
vi.mock("next/link", () => ({
  default: (props: Record<string, unknown>) => {
    const { href, children, ...rest } = props as {
      href: string;
      children: React.ReactNode;
    };
    return React.createElement(
      "a",
      { href, ...rest },
      children as React.ReactNode
    );
  },
}));

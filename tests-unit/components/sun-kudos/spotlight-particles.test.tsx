import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SpotlightParticles } from "@/app/_components/sun-kudos/spotlight-particles";

// tsParticles engine + Particles are mocked in tests-unit/setup.ts (no canvas
// in jsdom). This just guards the import chain + mount path against regressions.
describe("<SpotlightParticles />", () => {
  it("mounts without crashing", () => {
    const { container } = render(<SpotlightParticles />);
    expect(container).toBeTruthy();
  });
});

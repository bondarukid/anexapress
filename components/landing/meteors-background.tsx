"use client";

/**
 * Full-viewport Meteor layer for the `(landing)` shell.
 * Sits behind header/main/footer (`fixed` + `z-0`); shells use `relative z-10`.
 * Props mirror Magic UI docs: https://magicui.design/docs/components/meteors
 */
import { Meteors } from "@/components/ui/meteors";

export default function LandingMeteorsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* `relative` so each meteor span’s absolute hit this box, not viewport edge */}
      <div className="relative h-full min-h-dvh w-full">
        <Meteors number={28} />
      </div>
    </div>
  );
}

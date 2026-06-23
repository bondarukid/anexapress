"use client";

import { type RefObject, useRef } from "react";

import { Cpu, Zap } from "lucide-react";

import { AnimatedBeam } from "@/components/landing/features/animated-beam";

const BEAM_DURATION = 4;
const BEAM_REVERSE = false;
const CENTER_LOGO = "/reference/feature250/assets/block-1.svg";

function CpuNode({ nodeRef, className }: { nodeRef: RefObject<HTMLDivElement | null>; className: string }) {
  return (
    <div
      ref={nodeRef}
      className={`absolute z-10 flex size-18 -translate-y-1/2 items-center justify-center rounded-full bg-background p-1 ${className}`}
    >
      <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background p-[5px]">
        <div className="flex size-full items-center justify-center rounded-md border border-border bg-muted">
          <Cpu size={16} />
        </div>
      </div>
    </div>
  );
}

/**
 * CPU node network with animated beams (shadcnblocks feature250).
 */
export function Feature250Network() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightTopRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const zapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden p-10"
      ref={containerRef}
    >
      <div className="flex w-full flex-col items-center justify-between gap-10 lg:flex-row">
        <div className="relative z-10 flex h-100 w-full items-center justify-center rounded-3xl lg:w-0">
          <CpuNode nodeRef={leftRef} className="top-40 left-0 lg:top-1/2 lg:left-0" />
          <CpuNode nodeRef={rightTopRef} className="top-40 right-0 lg:top-20 lg:left-20" />
          <CpuNode nodeRef={bottomLeftRef} className="bottom-0 left-6 lg:bottom-2 lg:left-20" />
          <CpuNode nodeRef={rightRef} className="right-6 bottom-0 lg:top-0 lg:left-50" />
          <CpuNode nodeRef={topRef} className="top-20 lg:top-100 lg:left-50" />
        </div>

        <div
          ref={centerRef}
          className="z-10 flex size-32 items-center justify-center rounded-3xl border bg-muted lg:size-42"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG hub matches shadcnblocks bundle */}
          <img src={CENTER_LOGO} className="size-14 lg:size-18 dark:invert" alt="" />
        </div>

        <div
          ref={zapRef}
          className="z-10 mt-40 flex size-15 items-center justify-center rounded-xl border bg-muted lg:mt-0"
        >
          <Zap fill="currentColor" />
        </div>
      </div>

      <div className="block lg:hidden">
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={bottomLeftRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          endYOffset={-60}
          endXOffset={-10}
          curvature={10}
          containerRef={containerRef}
          fromRef={leftRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={topRef}
          toRef={centerRef}
          direction="vertical"
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          endYOffset={-60}
          endXOffset={10}
          curvature={10}
          containerRef={containerRef}
          fromRef={rightTopRef}
          toRef={centerRef}
          reverse={!BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={rightRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={zapRef}
          direction="vertical"
          reverse={BEAM_REVERSE}
        />
      </div>

      <div className="hidden lg:block">
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={leftRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          endYOffset={-30}
          endXOffset={60}
          duration={BEAM_DURATION}
          curvature={-140}
          containerRef={containerRef}
          fromRef={rightTopRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          endYOffset={30}
          curvature={140}
          containerRef={containerRef}
          fromRef={bottomLeftRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          endYOffset={-30}
          endXOffset={-60}
          curvature={-180}
          containerRef={containerRef}
          fromRef={rightRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          endXOffset={-60}
          endYOffset={30}
          curvature={180}
          containerRef={containerRef}
          fromRef={topRef}
          toRef={centerRef}
          reverse={BEAM_REVERSE}
        />
        <AnimatedBeam
          duration={BEAM_DURATION}
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={zapRef}
          reverse={BEAM_REVERSE}
        />
      </div>
    </div>
  );
}

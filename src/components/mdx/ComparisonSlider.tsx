"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonSliderProps {
  /** Content for the left side (the "before" / monolithic state) */
  before: {
    title: string;
    icon?: string;
    items: string[];
    accent?: "rose" | "amber" | "slate";
  };
  /** Content for the right side (the "after" / ROS2 state) */
  after: {
    title: string;
    icon?: string;
    items: string[];
    accent?: "emerald" | "cyan" | "teal";
  };
  /** Optional overall label */
  label?: string;
}

const ACCENT_STYLES = {
  rose: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    text: "text-rose-400",
    dot: "bg-rose-400",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  slate: {
    border: "border-slate-500/30",
    bg: "bg-slate-500/5",
    text: "text-slate-400",
    dot: "bg-slate-400",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  cyan: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  teal: {
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    text: "text-teal-400",
    dot: "bg-teal-400",
  },
} as const;

/**
 * ComparisonSlider — a visual before/after comparison component where the
 * learner drags a divider to reveal the two architectural states. The left
 * side (before) and right side (after) each show a list of characteristics.
 *
 * Uses a draggable handle that clips the "after" panel over the "before"
 * panel.
 */
export function ComparisonSlider({
  before,
  after,
  label,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50); // 0-100
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const beforeAccent =
    ACCENT_STYLES[before.accent ?? "rose"] ?? ACCENT_STYLES.rose;
  const afterAccent =
    ACCENT_STYLES[after.accent ?? "emerald"] ?? ACCENT_STYLES.emerald;

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX =
        e instanceof TouchEvent ? e.touches[0]?.clientX : (e as MouseEvent).clientX;
      if (clientX !== undefined) updatePosition(clientX);
    };
    const handleUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [updatePosition]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const clientX =
      e instanceof TouchEvent ? e.touches[0]?.clientX : e.clientX;
    if (clientX !== undefined) updatePosition(clientX);
  };

  return (
    <div className="my-6">
      {label && (
        <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <div
        ref={containerRef}
        className="relative h-80 cursor-col-resize select-none overflow-hidden rounded-xl border border-border bg-card/20"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        {/* Before (left side, full width underneath) */}
        <div className="absolute inset-0">
          <SidePanel
            title={before.title}
            items={before.items}
            accent={beforeAccent}
            side="before"
          />
        </div>

        {/* After (right side, clipped to position) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <SidePanel
            title={after.title}
            items={after.items}
            accent={afterAccent}
            side="after"
          />
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-0 bottom-0 z-20 flex w-1 cursor-col-resize items-center justify-center bg-cyan-400 shadow-lg shadow-cyan-500/50"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cyan-400 bg-background shadow-lg shadow-cyan-500/30">
            <div className="flex items-center">
              <ChevronLeft className="h-4 w-4 text-cyan-400" />
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Side labels */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
          ← Before
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
          After →
        </div>
      </div>

      {/* Position indicator */}
      <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">{Math.round(position)}%</span>
        <span className="opacity-50">drag to compare</span>
      </div>
    </div>
  );
}

function SidePanel({
  title,
  items,
  accent,
  side,
}: {
  title: string;
  items: string[];
  accent: (typeof ACCENT_STYLES)[keyof typeof ACCENT_STYLES];
  side: "before" | "after";
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col p-6",
        side === "after" ? "items-end text-right" : "items-start text-left"
      )}
    >
      <h4
        className={cn(
          "mb-4 flex items-center gap-2 text-lg font-bold",
          accent.text
        )}
      >
        {side === "after" && <span>{title}</span>}
        {side === "before" && <span>{title}</span>}
      </h4>
      <ul
        className={cn(
          "space-y-2.5",
          side === "after" ? "text-right" : "text-left"
        )}
      >
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2 text-sm text-muted-foreground",
              side === "after" && "flex-row-reverse"
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                accent.dot
              )}
            />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComparisonSlider;

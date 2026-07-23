"use client";

import { cn } from "@/lib/utils";
import { useLearningStreak } from "@/hooks/use-learning-streak";
import { Flame, TrendingUp } from "lucide-react";

/**
 * StreakDisplay — a compact card showing the current learning streak with
 * a flame icon. Designed for the Course Overview hero section. Hidden when
 * streak is 0.
 */
export function StreakDisplay() {
  const { currentStreak, longestStreak, completedToday } = useLearningStreak();

  if (currentStreak === 0) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border px-4 py-3",
        completedToday
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-border/60 bg-card/40"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          completedToday
            ? "bg-amber-500/20 text-amber-400"
            : "bg-muted/50 text-muted-foreground"
        )}
      >
        <Flame
          className={cn(
            "h-5 w-5",
            completedToday && "fill-amber-400/30"
          )}
        />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-bold text-foreground tabular-nums">
            {currentStreak}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            day{currentStreak === 1 ? "" : "s"}
          </span>
        </div>
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <TrendingUp className="h-2.5 w-2.5" />
          Best: {longestStreak} day{longestStreak === 1 ? "" : "s"}
        </p>
      </div>
      {completedToday && (
        <span className="ml-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
          ✓ Today
        </span>
      )}
    </div>
  );
}

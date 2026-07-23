"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLearningStreak } from "@/hooks/use-learning-streak";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  className?: string;
}

/**
 * StreakBadge — shows a flame icon with the current learning streak count.
 * Hidden when streak is 0 or before hydration. Tooltip shows the longest
 * streak and total active days.
 */
export function StreakBadge({ className }: StreakBadgeProps) {
  const { currentStreak, longestStreak, totalCompletedDays, completedToday } =
    useLearningStreak();

  if (currentStreak === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "hidden sm:flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs tabular-nums transition-colors",
            completedToday
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
              : "border-border/60 bg-muted/30 text-muted-foreground",
            className
          )}
        >
          <Flame
            className={cn(
              "h-3.5 w-3.5",
              completedToday && "fill-amber-400/30"
            )}
          />
          <span className="font-semibold font-mono">{currentStreak}</span>
          <span className="text-muted-foreground/60">
            day{currentStreak === 1 ? "" : "s"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold text-amber-400">
            {currentStreak}-day streak
          </p>
          <p>Longest: {longestStreak} days</p>
          <p>Active days: {totalCompletedDays}</p>
          {completedToday ? (
            <p className="text-emerald-400">✓ Completed today</p>
          ) : (
            <p className="text-muted-foreground">Complete a lesson to extend!</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

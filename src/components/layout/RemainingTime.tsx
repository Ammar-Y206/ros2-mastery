"use client";

import { Clock, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSE_PHASES, findModule } from "@/lib/course-data";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * RemainingTime — shows the estimated time left to complete the course,
 * based on the reading times of incomplete modules. Hidden until the store
 * hydrates to avoid SSR mismatch.
 */
export function RemainingTime({ className }: { className?: string }) {
  const completed = useProgressStore((s) => s.completedModules);
  const hydrated = useProgressHydrated();

  if (!hydrated) {
    // Placeholder to prevent layout shift
    return <div className={cn("h-9 w-0", className)} aria-hidden />;
  }

  // Sum reading times of all incomplete modules
  let totalMinutes = 0;
  for (const phase of COURSE_PHASES) {
    for (const mod of phase.modules) {
      if (!completed[mod.id] && mod.readingTime) {
        totalMinutes += mod.readingTime;
      }
    }
  }

  // Don't show if everything is done or no reading times
  if (totalMinutes === 0) return null;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const display =
    hours > 0
      ? `${hours}h ${mins}m`
      : `${mins}m`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "hidden md:flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground tabular-nums",
            className
          )}
        >
          <Hourglass className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium">{display}</span>
          <span className="text-muted-foreground/60">left</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Estimated time to complete remaining lessons
      </TooltipContent>
    </Tooltip>
  );
}

"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUnlockedAchievementCount } from "@/components/layout/AchievementWatcher";
import { useProgressHydrated } from "@/hooks/use-progress";
import { Trophy } from "lucide-react";

interface AchievementsButtonProps {
  className?: string;
  /** Called when the user clicks the button */
  onClick: () => void;
}

/**
 * AchievementsButton — shows a trophy icon with a badge count of unlocked
 * achievements. The badge is hidden when there are 0 unlocked or before
 * hydration.
 */
export function AchievementsButton({ className, onClick }: AchievementsButtonProps) {
  const count = useUnlockedAchievementCount();
  const hydrated = useProgressHydrated();
  const displayCount = hydrated ? count : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label="View achievements"
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-amber-400 active:scale-95",
            className
          )}
        >
          <Trophy className="h-4 w-4" />
          {displayCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 font-mono text-[9px] font-bold text-white shadow-sm">
              {displayCount > 9 ? "9+" : displayCount}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Achievements{displayCount > 0 ? ` (${displayCount})` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

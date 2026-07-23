"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import { Bookmark } from "lucide-react";

interface BookmarksButtonProps {
  className?: string;
  /** Called when the user clicks the button */
  onClick: () => void;
}

/**
 * BookmarksButton — shows a bookmark icon with a badge count of bookmarked
 * lessons. The badge is hidden when there are 0 bookmarks or before hydration.
 */
export function BookmarksButton({ className, onClick }: BookmarksButtonProps) {
  const bookmarks = useProgressStore((s) => s.bookmarks);
  const hydrated = useProgressHydrated();

  const count = hydrated
    ? Object.values(bookmarks).filter(Boolean).length
    : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label="View bookmarks"
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-cyan-400 active:scale-95",
            className
          )}
        >
          <Bookmark className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 font-mono text-[9px] font-bold text-white shadow-sm">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Bookmarks{count > 0 ? ` (${count})` : ""}</TooltipContent>
    </Tooltip>
  );
}

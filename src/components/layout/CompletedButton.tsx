"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import { CheckCircle2 } from "lucide-react";

interface CompletedButtonProps {
  className?: string;
  onClick: () => void;
}

/**
 * CompletedButton — shows a check-circle icon with a badge count of
 * completed lessons. The badge is hidden when there are 0 completed or
 * before hydration.
 */
export function CompletedButton({ className, onClick }: CompletedButtonProps) {
  const completed = useProgressStore((s) => s.completedModules);
  const hydrated = useProgressHydrated();

  const count = hydrated
    ? Object.values(completed).filter(Boolean).length
    : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label="View completed lessons"
          className={cn(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-emerald-400 active:scale-95",
            className
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[9px] font-bold text-white shadow-sm">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Completed{count > 0 ? ` (${count})` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

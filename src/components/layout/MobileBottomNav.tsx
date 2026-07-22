"use client";

import { ChevronLeft, ChevronRight, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  findModule,
  findPhaseByModule,
  getAdjacentModules,
} from "@/lib/course-data";
import { useModuleProgress } from "@/hooks/use-progress";

interface MobileBottomNavProps {
  moduleId: string;
  onNavigate: (moduleId: string) => void;
}

/**
 * MobileBottomNav — a sticky bottom action bar visible only on mobile (below
 * the `lg` breakpoint). Provides Prev / Mark-Complete / Next controls so users
 * don't have to scroll to the bottom of a long lesson to navigate.
 *
 * Hidden on desktop (lg:hidden) where the full DocContent pagination + right
 * sidebar "Mark as completed" checkbox are available.
 */
export function MobileBottomNav({
  moduleId,
  onNavigate,
}: MobileBottomNavProps) {
  const mod = findModule(moduleId);
  const phase = findPhaseByModule(moduleId);
  const { isComplete, toggle } = useModuleProgress(moduleId);
  const adjacent = getAdjacentModules(moduleId);

  if (!mod || !phase) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
      {/* Safe area padding for iOS notch devices */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Previous */}
          <button
            onClick={() => adjacent.prev && onNavigate(adjacent.prev.module.id)}
            disabled={!adjacent.prev}
            aria-label="Previous lesson"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
              adjacent.prev
                ? "border-border/70 bg-card text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95"
                : "border-border/40 bg-muted/30 text-muted-foreground/30"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Mark complete */}
          <button
            onClick={() => toggle()}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all active:scale-[0.98]",
              isComplete
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
            )}
          >
            {isComplete ? (
              <>
                <Check className="h-4 w-4" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                <span>Mark Complete</span>
              </>
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => adjacent.next && onNavigate(adjacent.next.module.id)}
            disabled={!adjacent.next}
            aria-label="Next lesson"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
              adjacent.next
                ? "border-border/70 bg-card text-muted-foreground hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95"
                : "border-border/40 bg-muted/30 text-muted-foreground/30"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

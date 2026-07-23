"use client";

import { useState } from "react";
import { X, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  findModule,
  findPhaseByModule,
  ACCENT_CLASSES,
} from "@/lib/course-data";
import { useProgressHydrated, useLastVisitedModule } from "@/hooks/use-progress";

interface ContinueBannerProps {
  currentModuleId: string;
  onNavigate: (moduleId: string) => void;
}

/**
 * ContinueBanner — a dismissible banner shown at the top of the content area
 * when the user has previously visited a DIFFERENT module. Shows "Continue
 * where you left off" with the module title, phase, and reading time, plus a
 * CTA button. Auto-hides when the user navigates to that module or dismisses.
 *
 * Only appears once per session (tracked via local `dismissed` state).
 */
export function ContinueBanner({
  currentModuleId,
  onNavigate,
}: ContinueBannerProps) {
  const { lastVisitedModule } = useLastVisitedModule();
  const hydrated = useProgressHydrated();
  const [dismissed, setDismissed] = useState(false);

  // Determine the "continue" target: the last visited module that isn't the
  // current one. Only show after hydration so we don't flash on SSR.
  const continueTarget = (() => {
    if (!hydrated || dismissed) return null;
    if (lastVisitedModule && lastVisitedModule !== currentModuleId) {
      return findModule(lastVisitedModule);
    }
    return null;
  })();

  if (!continueTarget) return null;

  const phase = findPhaseByModule(continueTarget.id);
  if (!phase) return null;

  const accent = ACCENT_CLASSES[phase.accent];

  const handleNavigate = () => {
    onNavigate(continueTarget.id);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-3 rounded-xl border bg-gradient-to-r p-4 transition-all animate-fade-in",
        accent.border,
        accent.bg,
        "from-card/60 to-transparent"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          accent.bg,
          accent.text
        )}
      >
        <Play className="h-4 w-4 fill-current" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Continue where you left off
        </p>
        <p className="truncate text-sm font-medium text-foreground">
          {continueTarget.title}
        </p>
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
          <span className={accent.text}>
            Phase {phase.number} · {phase.title}
          </span>
          {continueTarget.readingTime && (
            <>
              <span className="opacity-40">·</span>
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {continueTarget.readingTime}m
              </span>
            </>
          )}
        </p>
      </div>
      <Button
        size="sm"
        onClick={handleNavigate}
        className="shrink-0 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
      >
        Resume
      </Button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-md p-1 text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

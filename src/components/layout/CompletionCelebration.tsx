"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Check, PartyPopper, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  findPhaseByModule,
  getAdjacentModules,
  ACCENT_CLASSES,
} from "@/lib/course-data";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/store/progress-store";

interface CompletionCelebrationProps {
  moduleId: string;
  onNavigate: (moduleId: string) => void;
}

/**
 * CompletionCelebration — shows a celebratory toast when ALL modules in the
 * current phase become complete. Derives "should show" purely from the store
 * (no setState-in-effect): `shouldShow = allComplete && !dismissed`.
 *
 * Auto-dismiss is handled by a deferred setTimeout callback (not a
 * synchronous setState in the effect body), which satisfies the
 * `react-hooks/set-state-in-effect` lint rule.
 */
export function CompletionCelebration({
  moduleId,
  onNavigate,
}: CompletionCelebrationProps) {
  const phase = findPhaseByModule(moduleId);
  const completedModules = useProgressStore((s) => s.completedModules);
  const [dismissedPhases, setDismissedPhases] = useState<Set<string>>(
    new Set()
  );

  const allComplete = useMemo(() => {
    if (!phase) return false;
    return phase.modules.every((m) => completedModules[m.id]);
  }, [phase, completedModules]);

  const shouldShow = !!phase && allComplete && !dismissedPhases.has(phase.id);

  const handleDismiss = useCallback(() => {
    if (phase) {
      setDismissedPhases((prev) => new Set(prev).add(phase.id));
    }
  }, [phase]);

  // Keep a stable ref to the dismiss handler so the effect doesn't re-run
  // every time dismissedPhases changes. Updated inside an effect to avoid
  // the "cannot update ref during render" lint rule.
  const dismissRef = useRef(handleDismiss);
  useEffect(() => {
    dismissRef.current = handleDismiss;
  }, [handleDismiss]);

  // Auto-dismiss after 8 seconds. The setTimeout callback fires asynchronously
  // (not synchronously in the effect body), so this is the correct pattern.
  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => dismissRef.current(), 8000);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  if (!shouldShow || !phase) return null;

  const accent = ACCENT_CLASSES[phase.accent];
  const adjacent = getAdjacentModules(moduleId);
  const nextPhaseModule = adjacent.next;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 animate-fade-in">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-card/95 p-5 shadow-2xl backdrop-blur-xl",
          accent.border
        )}
      >
        {/* Confetti dots */}
        <ConfettiDots />

        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              accent.bg,
              accent.text
            )}
          >
            <PartyPopper className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">
              Phase {phase.number} Complete!
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You&apos;ve mastered{" "}
              <span className={accent.text}>{phase.title}</span> — all{" "}
              {phase.modules.length} lessons done.
            </p>
            {nextPhaseModule ? (
              <Button
                size="sm"
                onClick={() => {
                  handleDismiss();
                  onNavigate(nextPhaseModule.module.id);
                }}
                className={cn(
                  "mt-3 h-8 gap-1.5 text-xs",
                  "bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
                )}
              >
                Start Phase {nextPhaseModule.phase.number}
                <Check className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                You&apos;ve completed the entire roadmap!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Decorative animated confetti dots. */
function ConfettiDots() {
  const dots = [
    { left: "5%", top: "20%", color: "bg-cyan-400", delay: "0s" },
    { left: "15%", top: "60%", color: "bg-emerald-400", delay: "0.3s" },
    { left: "85%", top: "15%", color: "bg-violet-400", delay: "0.1s" },
    { left: "92%", top: "50%", color: "bg-amber-400", delay: "0.5s" },
    { left: "45%", top: "10%", color: "bg-rose-400", delay: "0.2s" },
    { left: "70%", top: "75%", color: "bg-teal-400", delay: "0.4s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d, i) => (
        <span
          key={i}
          className={cn("absolute h-1.5 w-1.5 rounded-full", d.color)}
          style={{
            left: d.left,
            top: d.top,
            animation: `confetti-fall 2.5s ${d.delay} ease-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) scale(0); opacity: 0; }
          30% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(80px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

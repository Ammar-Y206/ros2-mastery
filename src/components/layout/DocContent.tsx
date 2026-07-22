"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, Clock, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  findModule,
  findPhaseByModule,
  getAdjacentModules,
  ACCENT_CLASSES,
} from "@/lib/course-data";
import { useModuleProgress, useProgressStore } from "@/hooks/use-progress";
import { ContinueBanner } from "@/components/layout/ContinueBanner";

interface DocContentProps {
  moduleId: string;
  onNavigate: (moduleId: string) => void;
  children: React.ReactNode;
}

export function DocContent({ moduleId, onNavigate, children }: DocContentProps) {
  const mod = findModule(moduleId);
  const phase = findPhaseByModule(moduleId);
  const { isComplete, toggle, bookmarked } = useModuleProgress(moduleId);
  const setLastVisited = useProgressStore((s) => s.setLastVisitedModule);

  const contentRef = useRef<HTMLDivElement>(null);
  const adjacent = getAdjacentModules(moduleId);

  // Track last visited + reset scroll on module change.
  // NOTE: We intentionally do NOT call setState here. The MDX content is
  // server-rendered and changes via the RSC payload when moduleId changes,
  // so React re-renders naturally. We only sync external state (localStorage
  // via the store + window scroll position).
  useEffect(() => {
    setLastVisited(moduleId);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [moduleId, setLastVisited]);

  // After content renders, scroll to the module's slug anchor if present
  useEffect(() => {
    if (!mod?.slug) return;
    const t = setTimeout(() => {
      const el = document.getElementById(mod.slug!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [mod]);

  if (!mod || !phase) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Content not found for: {moduleId}</p>
          <Button
            variant="link"
            onClick={() => onNavigate("phase-1/middleware")}
            className="mt-2"
          >
            Go to Phase 1
          </Button>
        </div>
      </div>
    );
  }

  const accent = ACCENT_CLASSES[phase.accent];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:px-10 lg:py-10">
      {/* Continue where you left off banner */}
      <ContinueBanner moduleId={moduleId} onNavigate={onNavigate} />

      {/* Phase / module breadcrumb header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
              accent.border,
              accent.bg,
              accent.text
            )}
          >
            <span className="font-mono font-bold">PHASE {phase.number}</span>
            <span className="opacity-50">·</span>
            <span>{phase.title}</span>
          </span>
          {mod.readingTime && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {mod.readingTime} min read
            </span>
          )}
          {bookmarked && (
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <Bookmark className="h-3 w-3 fill-cyan-400" />
              Bookmarked
            </span>
          )}
          {isComplete && (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>

        {/* Phase mission banner (only on first module of each phase) */}
        {phase.modules[0]?.id === moduleId && (
          <div
            className={cn(
              "mb-6 rounded-xl border bg-gradient-to-br p-5",
              accent.border,
              accent.bg,
              "from-card/50 to-transparent"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mission
            </p>
            <p className="mt-1.5 text-sm italic leading-relaxed text-foreground/90">
              &ldquo;{phase.mission}&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {phase.objectives.map((obj, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-background/60 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  <span className={cn("h-1 w-1 rounded-full", accent.dot)} />
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* The MDX content (server-rendered, passed as children) */}
      <article
        id="doc-content"
        ref={contentRef}
        className="prose-doc animate-fade-in"
      >
        {children}
      </article>

      {/* Bottom mark-as-complete (mobile-friendly) */}
      <div className="mt-10 rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              {isComplete ? "Lesson completed" : "Finished this lesson?"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isComplete
                ? "Your progress is saved locally on this device."
                : "Mark it complete to track your roadmap progress."}
            </p>
          </div>
          <Button
            onClick={() => toggle()}
            variant={isComplete ? "default" : "outline"}
            size="sm"
            className={cn(
              isComplete
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "hover:border-cyan-500/50 hover:text-cyan-400"
            )}
          >
            {isComplete ? (
              <>
                <Check className="h-4 w-4" />
                Completed
              </>
            ) : (
              "Mark complete"
            )}
          </Button>
        </div>
      </div>

      {/* Prev / Next pagination */}
      <nav className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {adjacent.prev ? (
          <button
            onClick={() => onNavigate(adjacent.prev!.module.id)}
            className="group flex flex-col items-start gap-1 rounded-lg border border-border/60 bg-card/40 p-4 text-left transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5"
          >
            <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ChevronLeft className="h-3 w-3" />
              Previous
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-cyan-400">
              {adjacent.prev.module.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Phase {adjacent.prev.phase.number} · {adjacent.prev.phase.title}
            </span>
          </button>
        ) : (
          <div />
        )}
        {adjacent.next ? (
          <button
            onClick={() => onNavigate(adjacent.next!.module.id)}
            className="group flex flex-col items-end gap-1 rounded-lg border border-border/60 bg-card/40 p-4 text-right transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/5"
          >
            <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Next
              <ChevronRight className="h-3 w-3" />
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-cyan-400">
              {adjacent.next.module.title}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Phase {adjacent.next.phase.number} · {adjacent.next.phase.title}
            </span>
          </button>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}

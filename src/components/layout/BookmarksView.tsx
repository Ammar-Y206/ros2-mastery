"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  COURSE_PHASES,
  ACCENT_CLASSES,
  findModule,
  findPhaseByModule,
} from "@/lib/course-data";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import * as Icons from "lucide-react";
import {
  Bookmark,
  BookmarkX,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";

interface BookmarksViewProps {
  onNavigate: (moduleId: string) => void;
  onBack: () => void;
}

/**
 * BookmarksView — a full-screen page showing all lessons the user has
 * bookmarked. Each card shows the lesson title, phase, reading time, and
 * a remove-from-bookmarks button. Empty state encourages exploring lessons.
 */
export function BookmarksView({ onNavigate, onBack }: BookmarksViewProps) {
  const bookmarks = useProgressStore((s) => s.bookmarks);
  const toggleBookmark = useProgressStore((s) => s.toggleBookmark);
  const hydrated = useProgressHydrated();

  // Collect all bookmarked modules with their phase info
  const bookmarkedModules = useMemo(() => {
    if (!hydrated) return [];
    const result: { moduleId: string; phaseId: string }[] = [];
    for (const phase of COURSE_PHASES) {
      for (const mod of phase.modules) {
        if (bookmarks[mod.id]) {
          result.push({ moduleId: mod.id, phaseId: phase.id });
        }
      }
    }
    return result;
  }, [bookmarks, hydrated]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-gradient-to-r from-cyan-500/5 to-transparent">
        <div className="mx-auto max-w-4xl px-5 py-12 lg:px-10">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <Bookmark className="h-6 w-6 fill-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Bookmarked Lessons
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hydrated
                  ? `${bookmarkedModules.length} lesson${bookmarkedModules.length === 1 ? "" : "s"} saved for later`
                  : "Loading your bookmarks…"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-10">
        {hydrated && bookmarkedModules.length === 0 ? (
          <EmptyState onBrowse={onBack} />
        ) : (
          <div className="space-y-3">
            {bookmarkedModules.map(({ moduleId }) => {
              const mod = findModule(moduleId);
              const phase = findPhaseByModule(moduleId);
              if (!mod || !phase) return null;
              const accent = ACCENT_CLASSES[phase.accent];
              const PhaseIcon = (Icons[phase.icon as keyof typeof Icons] ??
                Icons.Circle) as Icons.LucideIcon;

              return (
                <div
                  key={moduleId}
                  className={cn(
                    "group flex items-center gap-4 rounded-xl border bg-card/40 p-4 transition-all hover:shadow-lg",
                    accent.border
                  )}
                >
                  {/* Phase icon */}
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                      accent.border,
                      accent.bg,
                      accent.text
                    )}
                  >
                    <PhaseIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <button
                    onClick={() => onNavigate(moduleId)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider",
                          accent.text
                        )}
                      >
                        Phase {phase.number} · {phase.title}
                      </span>
                      {mod.readingTime && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {mod.readingTime}m
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                      {mod.title}
                    </p>
                  </button>

                  {/* Remove bookmark */}
                  <button
                    onClick={() => toggleBookmark(moduleId)}
                    aria-label="Remove bookmark"
                    className="shrink-0 rounded-md p-2 text-muted-foreground/60 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Navigate arrow */}
                  <button
                    onClick={() => onNavigate(moduleId)}
                    aria-label="Open lesson"
                    className="shrink-0 rounded-md p-2 text-muted-foreground/60 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 group-hover:translate-x-0.5"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-card/40 text-muted-foreground/40">
        <BookmarkX className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">
        No bookmarks yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Bookmark lessons as you learn to save them for quick access later.
        Look for the bookmark icon in the right sidebar or press{" "}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          B
        </kbd>{" "}
        on any lesson.
      </p>
      <Button
        onClick={onBrowse}
        className="mt-6 gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
      >
        Browse Lessons
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

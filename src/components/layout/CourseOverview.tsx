"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  COURSE_PHASES,
  ACCENT_CLASSES,
  ALL_MODULE_IDS,
  type NavPhase,
} from "@/lib/course-data";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import * as Icons from "lucide-react";
import {
  Check,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Target,
  Play,
} from "lucide-react";

interface CourseOverviewProps {
  onNavigate: (moduleId: string) => void;
  onDismiss: () => void;
}

/**
 * CourseOverview — a full-screen dashboard showing all 7 phases as visual
 * cards with progress, estimated time, objectives, and a "Continue" CTA.
 * Shown when the user clicks the logo or visits without a module param.
 */
export function CourseOverview({ onNavigate, onDismiss }: CourseOverviewProps) {
  const completed = useProgressStore((s) => s.completedModules);
  const lastVisited = useProgressStore((s) => s.lastVisitedModule);
  const hydrated = useProgressHydrated();

  const totalCompleted = useMemo(
    () => ALL_MODULE_IDS.filter((id) => completed[id]).length,
    [completed]
  );
  const totalModules = ALL_MODULE_IDS.length;
  const overallPct =
    totalModules > 0 ? Math.round((totalCompleted / totalModules) * 100) : 0;

  const totalMinutes = useMemo(
    () =>
      COURSE_PHASES.reduce(
        (sum, p) => sum + p.modules.reduce((s, m) => s + (m.readingTime ?? 0), 0),
        0
      ),
    []
  );

  // Find the next incomplete module to continue with
  // (Lightweight computation over 21 modules — no memoization needed)
  const continueTarget = (() => {
    if (!hydrated) return null;
    // Prefer last visited if incomplete
    if (lastVisited) {
      const lastPhase = COURSE_PHASES.find((p) =>
        p.modules.some((m) => m.id === lastVisited)
      );
      const lastMod = lastPhase?.modules.find((m) => m.id === lastVisited);
      if (lastMod && lastPhase && !completed[lastMod.id]) {
        return { module: lastMod, phase: lastPhase };
      }
    }
    // Otherwise find first incomplete
    for (const phase of COURSE_PHASES) {
      for (const mod of phase.modules) {
        if (!completed[mod.id]) {
          return { module: mod, phase };
        }
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border/60">
        {/* Grid background */}
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
        {/* Gradient glow */}
        <div
          className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              ROS2 Humble · 7-Phase Strategic Roadmap
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master ROS2 from{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Zero to Production
              </span>
            </h1>

            <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
              A modern, interactive learning platform for robotics engineers.
              Build the nervous system of autonomous robots — from Nodes and
              Topics to SLAM and Nav2.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Stat
                icon={Target}
                label="Phases"
                value="7"
                accent="text-cyan-400"
              />
              <Stat
                icon={Award}
                label="Lessons"
                value={String(totalModules)}
                accent="text-emerald-400"
              />
              <Stat
                icon={Clock}
                label="Total Time"
                value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                accent="text-violet-400"
              />
              <Stat
                icon={TrendingUp}
                label="Your Progress"
                value={hydrated ? `${totalCompleted}/${totalModules}` : "—"}
                accent="text-amber-400"
              />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {continueTarget ? (
                <Button
                  size="lg"
                  onClick={() => onNavigate(continueTarget.module.id)}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {totalCompleted > 0 ? "Continue Learning" : "Start Phase 1"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => onNavigate("phase-1/middleware")}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start Phase 1
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={onDismiss}
                className="gap-2 border-border/70 hover:border-cyan-500/40 hover:text-cyan-400"
              >
                Browse Lessons
              </Button>
            </div>

            {/* Overall progress bar */}
            {hydrated && totalCompleted > 0 && (
              <div className="w-full max-w-md pt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="font-mono font-semibold text-cyan-400 tabular-nums">
                    {overallPct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-700 ease-out"
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase cards grid */}
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10 lg:py-16">
        <div className="mb-8 flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            The 7-Phase Roadmap
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_PHASES.map((phase, idx) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={idx}
              completed={completed}
              hydrated={hydrated}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-5 text-center lg:px-10">
          <p className="text-sm text-muted-foreground">
            Progress is saved locally in your browser. Built with Next.js · MDX
            · Tailwind CSS · shadcn/ui.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: Icons.LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/40">
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {label}
        </p>
        <p className="text-sm font-bold text-foreground tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  completed,
  hydrated,
  onNavigate,
}: {
  phase: NavPhase;
  index: number;
  completed: Record<string, boolean>;
  hydrated: boolean;
  onNavigate: (moduleId: string) => void;
}) {
  const accent = ACCENT_CLASSES[phase.accent];
  const PhaseIcon = (Icons[phase.icon as keyof typeof Icons] ??
    Icons.Circle) as Icons.LucideIcon;

  const completedCount = phase.modules.filter((m) => completed[m.id]).length;
  const totalCount = phase.modules.length;
  const allDone = completedCount === totalCount;
  const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const estimatedMinutes = phase.modules.reduce(
    (sum, m) => sum + (m.readingTime ?? 0),
    0
  );

  // First incomplete module in this phase
  const nextModule = phase.modules.find((m) => !completed[m.id]);

  return (
    <button
      onClick={() =>
        onNavigate(nextModule?.id ?? phase.modules[0].id)
      }
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card/40 p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        accent.border,
        "hover:" + accent.border
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Top accent gradient */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-60",
          `from-${phase.accent}-500 to-${phase.accent}-400`
        )}
        style={{
          background: `linear-gradient(to right, var(--tw-gradient-stops))`,
        }}
      />

      {/* Phase number + icon */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-bold transition-transform group-hover:scale-110",
            allDone
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : cn(accent.border, accent.bg, accent.text)
          )}
        >
          {allDone ? <Check className="h-6 w-6" /> : phase.number}
        </div>
        <PhaseIcon className={cn("h-5 w-5 opacity-40", accent.text)} />
      </div>

      {/* Title */}
      <h3 className="mb-1 text-lg font-bold text-foreground">
        {phase.title}
      </h3>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
        {phase.subtitle}
      </p>

      {/* Mission excerpt */}
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {phase.mission}
      </p>

      {/* Objectives (first 2) */}
      <div className="mb-4 space-y-1.5">
        {phase.objectives.slice(0, 2).map((obj, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs text-muted-foreground/80"
          >
            <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", accent.dot)} />
            <span className="line-clamp-1">{obj}</span>
          </div>
        ))}
      </div>

      {/* Footer: progress + time */}
      <div className="mt-auto border-t border-border/40 pt-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {estimatedMinutes}m
          </span>
          <span
            className={cn(
              "font-mono font-semibold tabular-nums",
              allDone ? "text-emerald-400" : accent.text
            )}
          >
            {hydrated ? `${completedCount}/${totalCount}` : "—"}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              allDone
                ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                : "bg-gradient-to-r from-cyan-400 to-teal-400"
            )}
            style={{ width: `${hydrated ? pct : 0}%` }}
          />
        </div>
      </div>

      {/* Hover arrow */}
      <div
        className={cn(
          "absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100",
          accent.bg,
          accent.text
        )}
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

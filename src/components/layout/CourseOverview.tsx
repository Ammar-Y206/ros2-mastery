"use client";

import { useMemo, useRef } from "react";
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
  Play,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SettingsDialog } from "@/components/layout/SettingsDialog";
import { BookmarksButton } from "@/components/layout/BookmarksButton";
import { AchievementsButton } from "@/components/layout/AchievementsButton";
import { CompletedButton } from "@/components/layout/CompletedButton";
import { AchievementWatcher } from "@/components/layout/AchievementWatcher";

interface CourseOverviewProps {
  onNavigate: (moduleId: string) => void;
  onDismiss: () => void;
  onBookmarks?: () => void;
  onAchievements?: () => void;
  onCompleted?: () => void;
}

/**
 * CourseOverview — the landing page / homepage of the platform.
 *
 * Design philosophy: immersive, inspiring, and product-focused.
 * - Hero section with animated gradient mesh background (no empty charts)
 * - "Start Phase 1" deep-links directly to the first lesson
 * - "Browse Curriculum" scrolls to the phase cards
 * - Phase cards feel like "levels to unlock" with distinct icons
 * - Professional footer (no raw tech stack text)
 */
export function CourseOverview({ onNavigate, onDismiss, onBookmarks, onAchievements, onCompleted }: CourseOverviewProps) {
  const completed = useProgressStore((s) => s.completedModules);
  const lastVisited = useProgressStore((s) => s.lastVisitedModule);
  const hydrated = useProgressHydrated();

  const totalCompleted = useMemo(
    () => ALL_MODULE_IDS.filter((id) => completed[id]).length,
    [completed]
  );
  const totalModules = ALL_MODULE_IDS.length;

  const totalMinutes = useMemo(
    () =>
      COURSE_PHASES.reduce(
        (sum, p) => sum + p.modules.reduce((s, m) => s + (m.readingTime ?? 0), 0),
        0
      ),
    []
  );

  // The continue target — either the last-visited incomplete module, or null
  const continueTarget = (() => {
    if (!hydrated) return null;
    if (lastVisited) {
      const lastPhase = COURSE_PHASES.find((p) =>
        p.modules.some((m) => m.id === lastVisited)
      );
      const lastMod = lastPhase?.modules.find((m) => m.id === lastVisited);
      if (lastMod && lastPhase && !completed[lastMod.id]) {
        return { module: lastMod, phase: lastPhase };
      }
    }
    for (const phase of COURSE_PHASES) {
      for (const mod of phase.modules) {
        if (!completed[mod.id]) {
          return { module: mod, phase };
        }
      }
    }
    return null;
  })();

  // Ref for "Browse Curriculum" scroll
  const curriculumRef = useRef<HTMLDivElement>(null);

  const scrollToCurriculum = () => {
    curriculumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating top-right controls */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-0.5">
        {onBookmarks && <BookmarksButton onClick={onBookmarks} />}
        {onCompleted && <CompletedButton onClick={onCompleted} />}
        {onAchievements && <AchievementsButton onClick={onAchievements} />}
        <ThemeToggle />
        <SettingsDialog />
      </div>

      {/* Achievement watcher */}
      <AchievementWatcher />

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        {/* Animated background: gradient mesh + floating node dots */}
        <div className="absolute inset-0" aria-hidden>
          {/* Grid background */}
          <div className="grid-bg absolute inset-0 opacity-30" />
          {/* Large cyan glow */}
          <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[120px]" />
          {/* Teal glow bottom-right */}
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/6 blur-[100px]" />
          {/* Violet accent top-right */}
          <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-[80px]" />

          {/* Floating animated nodes — subtle "network" feel */}
          <div className="absolute left-[15%] top-[30%] h-2 w-2 animate-pulse rounded-full bg-cyan-400/40" style={{ animationDelay: "0s" }} />
          <div className="absolute left-[80%] top-[25%] h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400/30" style={{ animationDelay: "0.5s" }} />
          <div className="absolute left-[60%] top-[60%] h-2 w-2 animate-pulse rounded-full bg-cyan-400/30" style={{ animationDelay: "1s" }} />
          <div className="absolute left-[25%] top-[70%] h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400/25" style={{ animationDelay: "1.5s" }} />
          <div className="absolute left-[85%] top-[65%] h-1 w-1 animate-pulse rounded-full bg-cyan-400/50" style={{ animationDelay: "2s" }} />

          {/* Connecting lines (SVG) — very subtle */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
            <line x1="15%" y1="30%" x2="60%" y2="60%" stroke="currentColor" strokeWidth="1" />
            <line x1="60%" y1="60%" x2="80%" y2="25%" stroke="currentColor" strokeWidth="1" />
            <line x1="25%" y1="70%" x2="60%" y2="60%" stroke="currentColor" strokeWidth="1" />
            <line x1="80%" y1="25%" x2="85%" y2="65%" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative mx-auto w-full max-w-5xl px-5 py-20 lg:px-10">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            ROS2 Humble · Interactive Learning Platform
          </div>

          {/* Headline — bold and inspiring */}
          <h1 className="mb-4 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Ready to master the{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              autonomous stack?
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-8 max-w-2xl text-balance text-lg text-muted-foreground/80 sm:text-xl">
            Build the nervous system of autonomous robots — from Nodes and Topics
            to SLAM and Nav2. Seven phases. Twenty-one interactive lessons.
            Zero boring documentation.
          </p>

          {/* CTA buttons — distinct routing */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={() => onNavigate(continueTarget?.module.id ?? "phase-1/middleware")}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-teal-400 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-current" />
              {hydrated && totalCompleted > 0 ? "Continue Learning" : "Start Phase 1"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToCurriculum}
              className="gap-2 border-border/70 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-400"
            >
              <BookOpen className="h-4 w-4" />
              Browse Curriculum
            </Button>
          </div>

          {/* Quick stats — minimal, welcoming */}
          <div className="mt-12 flex flex-wrap items-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/5">
                <Icons.Network className="h-4 w-4 text-cyan-400" />
              </div>
              <span><span className="font-bold text-foreground">7</span> Phases</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <Icons.BookOpen className="h-4 w-4 text-emerald-400" />
              </div>
              <span><span className="font-bold text-foreground">{totalModules}</span> Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/5">
                <Clock className="h-4 w-4 text-violet-400" />
              </div>
              <span><span className="font-bold text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span> of content</span>
            </div>
            {hydrated && totalCompleted > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/5">
                  <Icons.TrendingUp className="h-4 w-4 text-amber-400" />
                </div>
                <span><span className="font-bold text-foreground">{totalCompleted}/{totalModules}</span> completed</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Curriculum / Phase Cards ─────────────────────────────────── */}
      <section ref={curriculumRef} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:px-10 lg:py-20">
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The 7-Phase Roadmap
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_PHASES.map((phase, idx) => {
            const isActivePhase = hydrated && (
              (lastVisited && phase.modules.some((m) => m.id === lastVisited)) ||
              (!lastVisited && phase === COURSE_PHASES.find((p) => p.modules.some((m) => !completed[m.id])))
            );
            return (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={idx}
                completed={completed}
                hydrated={hydrated}
                onNavigate={onNavigate}
                isActive={isActivePhase}
              />
            );
          })}
        </div>
      </section>

      {/* ── Professional Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row lg:px-10">
          {/* Left: copyright */}
          <p className="text-sm text-muted-foreground">
            © 2024 ROS2 Mastery. Open-source learning platform.
          </p>
          {/* Right: social icons + version */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ros2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/50 transition-colors hover:text-cyan-400"
              aria-label="GitHub"
            >
              <Icons.Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/50 transition-colors hover:text-cyan-400"
              aria-label="Twitter/X"
            >
              <Icons.Twitter className="h-4 w-4" />
            </a>
            <span className="rounded-full border border-border/40 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/40">
              v1.0
            </span>
          </div>
        </div>
        {/* Micro-text: tech stack (very subtle, 20% opacity) */}
        <p className="mt-4 text-center text-[10px] text-muted-foreground/20">
          Built with Next.js · MDX · Tailwind CSS · shadcn/ui
        </p>
      </footer>
    </div>
  );
}

// ── Phase Card ───────────────────────────────────────────────────────

function PhaseCard({
  phase,
  index,
  completed,
  hydrated,
  onNavigate,
  isActive,
}: {
  phase: NavPhase;
  index: number;
  completed: Record<string, boolean>;
  hydrated: boolean;
  onNavigate: (moduleId: string) => void;
  isActive?: boolean;
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

  const nextModule = phase.modules.find((m) => !completed[m.id]);

  return (
    <button
      onClick={() =>
        onNavigate(nextModule?.id ?? phase.modules[0].id)
      }
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card/40 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10",
        accent.border,
        isActive && "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-background shadow-xl shadow-cyan-500/15"
      )}
    >
      {/* Active phase gradient border glow */}
      {isActive && (
        <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-transparent" aria-hidden />
      )}

      {/* Active phase badge */}
      {isActive && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </span>
          Current
        </div>
      )}

      {/* Top accent gradient bar */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100",
          isActive && "opacity-100"
        )}
        style={{
          background: `linear-gradient(to right, var(--${phase.accent}-500, currentColor), var(--${phase.accent}-400, currentColor))`,
        }}
      />

      {/* Phase number + representative icon */}
      <div className="relative mb-4 flex items-start justify-between">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-bold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            allDone
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
              : cn(accent.border, accent.bg, accent.text)
          )}
        >
          {allDone ? <Check className="h-6 w-6" /> : phase.number}
        </div>
        {/* Large representative icon — the "level" icon */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-border/30 bg-background/40 transition-all duration-300 group-hover:scale-110",
            accent.text,
            "opacity-50 group-hover:opacity-80"
          )}
        >
          <PhaseIcon className="h-5 w-5" />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1 text-lg font-bold leading-tight text-foreground">
        {phase.title}
      </h3>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {phase.subtitle}
      </p>

      {/* Mission excerpt */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {phase.mission}
      </p>

      {/* Objectives (first 2) */}
      <div className="mb-4 space-y-1.5">
        {phase.objectives.slice(0, 2).map((obj, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs text-muted-foreground/80"
          >
            <span
              className={cn(
                "mt-1.5 h-1 w-1 shrink-0 rounded-full",
                accent.dot
              )}
            />
            <span>{obj}</span>
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
          "absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100",
          accent.bg,
          accent.text
        )}
      >
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

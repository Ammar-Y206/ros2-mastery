"use client";

import { useState, useCallback } from "react";
import {
  ChevronRight,
  Check,
  Circle,
  CircleDot,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  COURSE_PHASES,
  ACCENT_CLASSES,
  findPhaseByModule,
  type NavPhase,
} from "@/lib/course-data";
import { useProgressStore } from "@/store/progress-store";
import * as Icons from "lucide-react";

interface LeftSidebarProps {
  activeModuleId: string;
  onNavigate: (moduleId: string) => void;
  /** Mobile: whether the sidebar drawer is open */
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Desktop: whether the sidebar is hidden (focus mode) */
  isHidden: boolean;
  /** Callback to hide the sidebar (desktop focus mode) */
  onHide: () => void;
}

/**
 * LeftSidebar — a lightweight, progressive-disclosure navigation sidebar.
 *
 * Accordion logic: only ONE phase is expanded at a time. The active phase
 * is expanded by default. Clicking a collapsed phase expands it and
 * collapses all others. Clicking the expanded phase collapses it.
 *
 * Visual decluttering: unstarted phases are dimmed, the active phase has
 * a subtle background highlight, and the time/progress stats are very
 * subtle (small font, low opacity) so they don't fight for attention.
 */
export function LeftSidebar({
  activeModuleId,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  isHidden,
  onHide,
}: LeftSidebarProps) {
  const activePhase = findPhaseByModule(activeModuleId);

  // ── Accordion: track which single phase is expanded ──
  // Default: the active phase. If no active phase (shouldn't happen), default to phase-1.
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(
    activePhase?.id ?? "phase-1"
  );

  // When the active module changes, auto-expand its phase (accordion follows the user).
  // We use a derived approach: if the active phase differs from the expanded one,
  // we update the expanded one. This is done via a callback on navigation, not an effect.
  const effectiveExpanded = expandedPhaseId ?? activePhase?.id ?? "phase-1";

  const handleTogglePhase = useCallback(
    (phaseId: string) => {
      // Accordion: if this phase is already expanded, collapse it.
      // If it's collapsed, expand it AND collapse all others.
      setExpandedPhaseId((prev) => (prev === phaseId ? null : phaseId));
    },
    []
  );

  const handleNavigate = (moduleId: string) => {
    onNavigate(moduleId);
    onCloseMobile();
    // Auto-expand the phase containing the navigated module.
    const phase = findPhaseByModule(moduleId);
    if (phase) {
      setExpandedPhaseId(phase.id);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <TooltipProvider delayDuration={400}>
        <aside
          className={cn(
            "fixed lg:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-all duration-300",
            // Mobile: slide in/out
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            // Desktop: hide when isHidden
            isHidden && "lg:-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden lg:border-0"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header — with focus-mode close button */}
            <div className="flex items-center justify-between border-b border-sidebar-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                  Learning Path
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden text-[10px] font-mono text-sidebar-foreground/40 sm:inline">
                  7 phases
                </span>
                {/* Desktop focus-mode: hide sidebar button */}
                <button
                  onClick={onHide}
                  className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/80"
                  aria-label="Hide sidebar (focus mode)"
                  title="Hide sidebar for full-width focus"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation tree */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
              <ul className="space-y-0.5">
                {COURSE_PHASES.map((phase) => (
                  <PhaseItem
                    key={phase.id}
                    phase={phase}
                    expanded={effectiveExpanded === phase.id}
                    onToggle={() => handleTogglePhase(phase.id)}
                    activeModuleId={activeModuleId}
                    onNavigate={handleNavigate}
                  />
                ))}
              </ul>
            </nav>

            {/* Footer mini-stats */}
            <SidebarFooter />
          </div>
        </aside>
      </TooltipProvider>
    </>
  );
}

function PhaseItem({
  phase,
  expanded,
  onToggle,
  activeModuleId,
  onNavigate,
}: {
  phase: NavPhase;
  expanded: boolean;
  onToggle: () => void;
  activeModuleId: string;
  onNavigate: (id: string) => void;
}) {
  const completed = useProgressStore((s) => s.completedModules);
  const accent = ACCENT_CLASSES[phase.accent];
  const PhaseIcon = (Icons[phase.icon as keyof typeof Icons] ??
    Icons.Circle) as Icons.LucideIcon;

  const completedCount = phase.modules.filter(
    (m) => completed[m.id]
  ).length;
  const totalCount = phase.modules.length;
  const allDone = completedCount === totalCount;
  const isStarted = completedCount > 0;
  const estimatedMinutes = phase.modules.reduce(
    (sum, m) => sum + (m.readingTime ?? 0),
    0
  );

  const isActive = phase.modules.some((m) => m.id === activeModuleId);

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              "group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
              isActive
                ? "bg-sidebar-accent/50"
                : "hover:bg-sidebar-accent/30"
            )}
            aria-expanded={expanded}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                expanded && "rotate-90",
                isActive ? "text-cyan-400/70" : "text-sidebar-foreground/30"
              )}
            />
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold transition-all",
                allDone
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : isActive
                    ? cn(accent.border, accent.bg, accent.text)
                    : "border-border/50 bg-muted/20 text-muted-foreground/50"
              )}
            >
              {allDone ? <Check className="h-3 w-3" /> : phase.number}
            </span>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span
                className={cn(
                  "truncate text-[13px] font-medium transition-colors",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : isStarted
                      ? "text-sidebar-foreground/80"
                      : "text-sidebar-foreground/45"
                )}
              >
                {phase.title}
              </span>
              <span className="truncate text-[10px] text-sidebar-foreground/35">
                {phase.subtitle}
              </span>
            </div>
            {/* Stats — very subtle, only show count (not time) when collapsed */}
            <span
              className={cn(
                "shrink-0 font-mono text-[9px] tabular-nums transition-opacity",
                isActive ? "text-cyan-400/60" : "text-sidebar-foreground/25"
              )}
            >
              {completedCount}/{totalCount}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[260px]">
          <p className="font-semibold">{phase.title}</p>
          <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <span className="text-cyan-400">
              {completedCount}/{totalCount} completed
            </span>
            {estimatedMinutes > 0 && (
              <span className="text-muted-foreground">
                · {estimatedMinutes} min total
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {expanded && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border/50 pl-3">
          {phase.modules.map((module, idx) => {
            const isDone = !!completed[module.id];
            const isActiveModule = module.id === activeModuleId;
            return (
              <li key={module.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onNavigate(module.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-all duration-200",
                        isActiveModule
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-sidebar-foreground/55 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground/85 hover:translate-x-0.5"
                      )}
                    >
                      <span className="shrink-0 transition-transform group-hover:scale-110">
                        {isDone ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : isActiveModule ? (
                          <CircleDot className="h-3 w-3 text-primary" />
                        ) : (
                          <Circle className="h-3 w-3 text-sidebar-foreground/20 group-hover:text-sidebar-foreground/35" />
                        )}
                      </span>
                      <span className="flex-1 truncate">{module.title}</span>
                      {module.readingTime && (
                        <span className="shrink-0 text-[9px] font-mono text-sidebar-foreground/20">
                          {module.readingTime}m
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[260px]">
                    <p className="font-medium">{module.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Phase {phase.number} · {phase.title}</span>
                    </p>
                    {module.readingTime && (
                      <p className="text-xs text-cyan-400">
                        {module.readingTime} min read
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

function SidebarFooter() {
  const completed = useProgressStore((s) => s.completedModules);
  const totalDone = Object.values(completed).filter(Boolean).length;
  const totalModules = COURSE_PHASES.reduce(
    (sum, p) => sum + p.modules.length,
    0
  );
  const pct = totalModules > 0 ? (totalDone / totalModules) * 100 : 0;

  return (
    <div className="border-t border-sidebar-border/60 px-4 py-2.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-sidebar-foreground/40">Overall</span>
        <span className="font-mono font-medium text-sidebar-foreground/60 tabular-nums">
          {totalDone}/{totalModules}
          {pct > 0 && (
            <span className="ml-1 text-cyan-400/70">({Math.round(pct)}%)</span>
          )}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-sidebar-border/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400/80 to-teal-400/80 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

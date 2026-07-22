"use client";

import { useState } from "react";
import {
  ChevronRight,
  Check,
  Circle,
  CircleDot,
  Sparkles,
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
}

export function LeftSidebar({
  activeModuleId,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: LeftSidebarProps) {
  const activePhase = findPhaseByModule(activeModuleId);
  // Track only the phases the user has manually toggled. The active phase is
  // ALWAYS shown as expanded (derived), so we never need a setState-in-effect.
  const [userToggled, setUserToggled] = useState<Set<string>>(new Set(["phase-1"]));

  // The set of expanded phases = user-toggled phases ∪ { active phase }
  const expandedPhases = new Set(userToggled);
  if (activePhase) {
    expandedPhases.add(activePhase.id);
  }

  const togglePhase = (phaseId: string) => {
    setUserToggled((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleNavigate = (moduleId: string) => {
    onNavigate(moduleId);
    onCloseMobile();
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
            "fixed lg:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-border/60 bg-sidebar/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                  Learning Path
                </span>
              </div>
              <span className="text-[10px] font-mono text-sidebar-foreground/40">
                7 phases
              </span>
            </div>

            {/* Navigation tree */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
              <ul className="space-y-0.5">
                {COURSE_PHASES.map((phase) => (
                  <PhaseItem
                    key={phase.id}
                    phase={phase}
                    expanded={expandedPhases.has(phase.id)}
                    onToggle={() => togglePhase(phase.id)}
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
                ? "bg-sidebar-accent/60"
                : "hover:bg-sidebar-accent/40"
            )}
            aria-expanded={expanded}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 transition-transform",
                expanded && "rotate-90"
              )}
            />
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors",
                allDone
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : cn(accent.border, accent.bg, accent.text)
              )}
            >
              {allDone ? <Check className="h-3.5 w-3.5" /> : phase.number}
            </span>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/90"
                )}
              >
                {phase.title}
              </span>
              <span className="truncate text-[11px] text-sidebar-foreground/50">
                {phase.subtitle}
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-mono text-sidebar-foreground/40">
              {completedCount}/{totalCount}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[240px]">
          <p className="font-semibold">{phase.title}</p>
          <p className="text-xs text-muted-foreground">{phase.subtitle}</p>
          <p className="mt-1 text-xs text-cyan-400">
            {completedCount}/{totalCount} completed
          </p>
        </TooltipContent>
      </Tooltip>

      {expanded && (
        <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-sidebar-border/60 pl-3">
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
                        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                        isActiveModule
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90"
                      )}
                    >
                      <span className="shrink-0">
                        {isDone ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : isActiveModule ? (
                          <CircleDot className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-sidebar-foreground/25 group-hover:text-sidebar-foreground/40" />
                        )}
                      </span>
                      <span className="flex-1 truncate">{module.title}</span>
                      {module.readingTime && (
                        <span className="shrink-0 text-[10px] font-mono text-sidebar-foreground/30">
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
    <div className="border-t border-sidebar-border/60 px-4 py-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-sidebar-foreground/50">Overall progress</span>
        <span className="font-mono font-semibold text-sidebar-foreground/80 tabular-nums">
          {totalDone}/{totalModules}
          {pct > 0 && (
            <span className="ml-1 text-cyan-400">({Math.round(pct)}%)</span>
          )}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";
import { COURSE_PHASES, ALL_MODULE_IDS } from "@/lib/course-data";
import { useToast } from "@/hooks/use-toast";
import {
  Award,
  BookCheck,
  Flame,
  Target,
  Trophy,
  Zap,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

/**
 * Achievement definitions. Each achievement has a unique ID, an icon, a
 * title, a description, and a `check` function that receives the current
 * progress state and returns true when the achievement is unlocked.
 */
interface Achievement {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string; // tailwind text color class
  check: (ctx: {
    completedCount: number;
    totalModules: number;
    phasesFullyCompleted: number;
    bookmarkCount: number;
  }) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-step",
    icon: Zap,
    title: "First Step",
    description: "Complete your first lesson",
    accent: "text-cyan-400",
    check: (ctx) => ctx.completedCount >= 1,
  },
  {
    id: "getting-started",
    icon: BookCheck,
    title: "Getting Started",
    description: "Complete 5 lessons",
    accent: "text-emerald-400",
    check: (ctx) => ctx.completedCount >= 5,
  },
  {
    id: "quarter-master",
    icon: Target,
    title: "Quarter Master",
    description: "Complete 25% of the roadmap",
    accent: "text-violet-400",
    check: (ctx) =>
      ctx.totalModules > 0 && ctx.completedCount >= Math.ceil(ctx.totalModules * 0.25),
  },
  {
    id: "halfway-there",
    icon: Flame,
    title: "Halfway There",
    description: "Complete 50% of the roadmap",
    accent: "text-amber-400",
    check: (ctx) =>
      ctx.totalModules > 0 && ctx.completedCount >= Math.ceil(ctx.totalModules * 0.5),
  },
  {
    id: "phase-master",
    icon: Award,
    title: "Phase Master",
    description: "Complete an entire phase",
    accent: "text-rose-400",
    check: (ctx) => ctx.phasesFullyCompleted >= 1,
  },
  {
    id: "multi-phase",
    icon: Trophy,
    title: "Multi-Phase Master",
    description: "Complete 3 entire phases",
    accent: "text-teal-400",
    check: (ctx) => ctx.phasesFullyCompleted >= 3,
  },
  {
    id: "completionist",
    icon: CheckCircle2,
    title: "Completionist",
    description: "Complete the entire roadmap",
    accent: "text-emerald-400",
    check: (ctx) =>
      ctx.totalModules > 0 && ctx.completedCount >= ctx.totalModules,
  },
  {
    id: "collector",
    icon: BookCheck,
    title: "Collector",
    description: "Bookmark 5 lessons",
    accent: "text-cyan-400",
    check: (ctx) => ctx.bookmarkCount >= 5,
  },
];

/**
 * AchievementWatcher — invisible component that watches the progress store
 * and fires a celebratory toast when a new achievement is unlocked.
 * Tracks unlocked achievements in localStorage to avoid re-triggering.
 *
 * Place once in the root layout or AppShell.
 */
const ACHIEVEMENTS_STORAGE_KEY = "ros2-mastery-achievements";

/** Read unlocked achievement IDs from localStorage (client-only, safe fallback). */
function loadUnlockedFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as string[]);
    }
  } catch {
    // ignore parse errors
  }
  return new Set();
}

export function AchievementWatcher() {
  const completedModules = useProgressStore((s) => s.completedModules);
  const bookmarks = useProgressStore((s) => s.bookmarks);
  const hydrated = useProgressHydrated();
  const { toast } = useToast();

  // Lazy-initialize from localStorage so we don't need a setState-in-effect.
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() =>
    loadUnlockedFromStorage()
  );
  const prevUnlockedRef = useRef<Set<string>>(unlockedIds);

  // Compute current progress context
  const ctx = (() => {
    const completedCount = Object.values(completedModules).filter(Boolean).length;
    const phasesFullyCompleted = COURSE_PHASES.filter((phase) =>
      phase.modules.every((m) => completedModules[m.id])
    ).length;
    const bookmarkCount = Object.values(bookmarks).filter(Boolean).length;
    return {
      completedCount,
      totalModules: ALL_MODULE_IDS.length,
      phasesFullyCompleted,
      bookmarkCount,
    };
  })();

  // Check for newly unlocked achievements
  useEffect(() => {
    if (!hydrated) return;

    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => a.check(ctx) && !prevUnlockedRef.current.has(a.id)
    );

    if (newlyUnlocked.length === 0) return;

    // Update the unlocked set
    const nextSet = new Set(prevUnlockedRef.current);
    for (const a of newlyUnlocked) {
      nextSet.add(a.id);
    }
    prevUnlockedRef.current = nextSet;
    setUnlockedIds(nextSet);

    // Persist to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(nextSet)));
    } catch {
      // ignore
    }

    // Fire a toast for each newly unlocked achievement (with a slight delay)
    newlyUnlocked.forEach((achievement, idx) => {
      setTimeout(() => {
        const Icon = achievement.icon;
        toast({
          title: (
            <span className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${achievement.accent}`} />
              Achievement Unlocked: {achievement.title}
            </span>
          ) as unknown as string,
          description: achievement.description,
        });
      }, idx * 600);
    });
  }, [hydrated, ctx, toast]);

  return null; // This component renders nothing — it's a watcher
}

/**
 * useAchievements — hook returning the list of all achievements with their
 * unlocked status. Used by the achievements display UI.
 */
export function useAchievements() {
  const completedModules = useProgressStore((s) => s.completedModules);
  const bookmarks = useProgressStore((s) => s.bookmarks);
  // Lazy-initialize from localStorage so we don't need a setState-in-effect.
  const [unlockedIds] = useState<Set<string>>(() => loadUnlockedFromStorage());

  const ctx = (() => {
    const completedCount = Object.values(completedModules).filter(Boolean).length;
    const phasesFullyCompleted = COURSE_PHASES.filter((phase) =>
      phase.modules.every((m) => completedModules[m.id])
    ).length;
    const bookmarkCount = Object.values(bookmarks).filter(Boolean).length;
    return {
      completedCount,
      totalModules: ALL_MODULE_IDS.length,
      phasesFullyCompleted,
      bookmarkCount,
    };
  })();

  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedIds.has(a.id) || a.check(ctx),
  }));
}

/**
 * getUnlockedCount — returns the number of unlocked achievements (for badges).
 */
export function useUnlockedAchievementCount(): number {
  const achievements = useAchievements();
  return achievements.filter((a) => a.unlocked).length;
}

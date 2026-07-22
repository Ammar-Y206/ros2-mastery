"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/components/layout/AchievementWatcher";
import { ArrowLeft, Lock, Trophy } from "lucide-react";

interface AchievementsViewProps {
  onBack: () => void;
}

/**
 * AchievementsView — full-screen page showing all achievements (unlocked
 * and locked). Unlocked achievements show in full color with their icon;
 * locked achievements are greyed out with a lock overlay.
 */
export function AchievementsView({ onBack }: AchievementsViewProps) {
  const achievements = useAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="mx-auto max-w-4xl px-5 py-12 lg:px-10">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Achievements
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {unlockedCount} of {totalCount} unlocked · {pct}% complete
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement grid */}
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "relative flex items-start gap-4 rounded-xl border p-5 transition-all",
                  a.unlocked
                    ? "border-border/60 bg-card/40 hover:shadow-lg"
                    : "border-border/40 bg-muted/20"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all",
                    a.unlocked
                      ? cn("border-current", a.accent, "bg-current/10")
                      : "border-border/60 bg-muted/50 text-muted-foreground/40"
                  )}
                >
                  {a.unlocked ? (
                    <Icon className={cn("h-6 w-6", a.accent)} />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "text-sm font-bold",
                        a.unlocked ? "text-foreground" : "text-muted-foreground/60"
                      )}
                    >
                      {a.title}
                    </h3>
                    {a.unlocked && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                          cn(a.accent, "bg-current/10")
                        )}
                      >
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      a.unlocked
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

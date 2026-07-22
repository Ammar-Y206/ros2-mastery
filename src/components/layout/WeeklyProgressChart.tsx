"use client";

import { cn } from "@/lib/utils";
import { useWeeklyActivity } from "@/hooks/use-weekly-activity";
import { useProgressHydrated } from "@/hooks/use-progress";
import { Activity } from "lucide-react";

/**
 * WeeklyProgressChart — a simple bar chart showing lessons completed per day
 * over the last 7 days. Bars use a cyan→teal gradient, with today's bar
 * highlighted. Hovering a bar shows the count tooltip.
 */
export function WeeklyProgressChart() {
  const days = useWeeklyActivity();
  const hydrated = useProgressHydrated();

  const maxCount = Math.max(1, ...days.map((d) => d.count));
  const totalThisWeek = days.reduce((sum, d) => sum + d.count, 0);

  if (!hydrated || days.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              This Week
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {totalThisWeek} lesson{totalThisWeek === 1 ? "" : "s"} completed
            </p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2" style={{ height: "80px" }}>
        {days.map((day) => {
          const heightPct = (day.count / maxCount) * 100;
          return (
            <div
              key={day.date}
              className="group flex flex-1 flex-col items-center gap-1.5"
            >
              {/* Tooltip on hover */}
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className={cn(
                    "absolute -top-6 z-10 hidden rounded-md border border-border bg-popover px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground shadow-md group-hover:block",
                  )}
                >
                  {day.count}
                </div>
                <div
                  className={cn(
                    "w-full max-w-[24px] rounded-t-md transition-all duration-300",
                    day.count > 0
                      ? day.isToday
                        ? "bg-gradient-to-t from-cyan-500 to-teal-400 shadow-sm shadow-cyan-500/30"
                        : "bg-gradient-to-t from-cyan-600/60 to-teal-500/60"
                      : "bg-muted/40",
                    day.isToday && day.count === 0 && "bg-cyan-500/10",
                  )}
                  style={{
                    height: day.count > 0 ? `${Math.max(heightPct, 8)}%` : "4px",
                    minHeight: day.count > 0 ? "8px" : "4px",
                  }}
                />
              </div>
              {/* Day label */}
              <span
                className={cn(
                  "text-[10px] font-medium",
                  day.isToday
                    ? "text-cyan-400"
                    : "text-muted-foreground/60"
                )}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

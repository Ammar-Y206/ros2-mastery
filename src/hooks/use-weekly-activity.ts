"use client";

import { useMemo } from "react";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";

export interface DayActivity {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Day label (e.g. "Mon") */
  label: string;
  /** Number of lessons completed on this day */
  count: number;
  /** Whether this day is today */
  isToday: boolean;
}

/**
 * useWeeklyActivity — returns an array of the last 7 days with the number of
 * lessons completed on each day. Uses the `completionDates` map from the
 * progress store. Days are ordered oldest → newest (left → right).
 */
export function useWeeklyActivity(): DayActivity[] {
  const completionDates = useProgressStore((s) => s.completionDates);
  const hydrated = useProgressHydrated();

  return useMemo(() => {
    if (!hydrated) return [];

    const today = new Date();
    const days: DayActivity[] = [];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Count completions per date
    const countMap: Record<string, number> = {};
    for (const date of Object.values(completionDates)) {
      if (date) {
        countMap[date] = (countMap[date] || 0) + 1;
      }
    }

    // Build the last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = dayLabels[d.getDay()];
      days.push({
        date: dateStr,
        label,
        count: countMap[dateStr] || 0,
        isToday: i === 0,
      });
    }

    return days;
  }, [completionDates, hydrated]);
}

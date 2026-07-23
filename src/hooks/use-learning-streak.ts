"use client";

import { useMemo } from "react";
import { useProgressStore } from "@/store/progress-store";
import { useProgressHydrated } from "@/hooks/use-progress";

/**
 * useLearningStreak — computes the user's current learning streak (consecutive
 * days with at least one lesson completed) and the longest streak ever.
 *
 * A "day" is counted as completed if any module in `completionDates` has a
 * date matching that day. The streak counts backwards from today (or
 * yesterday if nothing completed today yet).
 */
export function useLearningStreak(): {
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  lastCompletionDate: string | null;
  completedToday: boolean;
} {
  const completionDates = useProgressStore((s) => s.completionDates);
  const hydrated = useProgressHydrated();

  return useMemo(() => {
    if (!hydrated) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletedDays: 0,
        lastCompletionDate: null,
        completedToday: false,
      };
    }

    // Collect all unique completion dates
    const dates = Object.values(completionDates).filter(Boolean);
    const uniqueDates = Array.from(new Set(dates)).sort(); // YYYY-MM-DD sorts chronologically

    if (uniqueDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletedDays: 0,
        lastCompletionDate: null,
        completedToday: false,
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    const completedToday = uniqueDates.includes(today);
    const lastCompletionDate = uniqueDates[uniqueDates.length - 1];

    // Compute current streak: count backwards from today (or yesterday if
    // nothing done today yet). If the last completion is older than yesterday,
    // the streak is 0.
    let currentStreak = 0;
    const startDate = completedToday
      ? today
      : uniqueDates.includes(yesterday)
        ? yesterday
        : null;

    if (startDate) {
      const dateSet = new Set(uniqueDates);
      const cursor = new Date(startDate + "T00:00:00Z");
      while (true) {
        const dateStr = cursor.toISOString().slice(0, 10);
        if (dateSet.has(dateStr)) {
          currentStreak++;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else {
          break;
        }
      }
    }

    // Compute longest streak: iterate through sorted dates and find the
    // longest run of consecutive days.
    let longestStreak = 0;
    let runLength = 0;
    let prevDate: Date | null = null;
    for (const dateStr of uniqueDates) {
      const cur = new Date(dateStr + "T00:00:00Z");
      if (prevDate) {
        const diffDays = Math.round(
          (cur.getTime() - prevDate.getTime()) / 86400000
        );
        if (diffDays === 1) {
          runLength++;
        } else {
          runLength = 1;
        }
      } else {
        runLength = 1;
      }
      if (runLength > longestStreak) longestStreak = runLength;
      prevDate = cur;
    }

    return {
      currentStreak,
      longestStreak,
      totalCompletedDays: uniqueDates.length,
      lastCompletionDate,
      completedToday,
    };
  }, [completionDates, hydrated]);
}

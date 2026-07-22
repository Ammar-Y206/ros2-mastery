"use client";

import { useRouter } from "next/navigation";
import { CourseOverview } from "@/components/layout/CourseOverview";

/**
 * OverviewWrapper — client component that wires the CourseOverview dashboard
 * to Next.js router navigation.
 */
export function OverviewWrapper() {
  const router = useRouter();

  const handleNavigate = (moduleId: string) => {
    router.push(`/?m=${moduleId}`);
  };

  const handleDismiss = () => {
    router.push("/?m=phase-1/middleware");
  };

  const handleBookmarks = () => {
    router.push("/?view=bookmarks");
  };

  const handleAchievements = () => {
    router.push("/?view=achievements");
  };

  return (
    <CourseOverview
      onNavigate={handleNavigate}
      onDismiss={handleDismiss}
      onBookmarks={handleBookmarks}
      onAchievements={handleAchievements}
    />
  );
}

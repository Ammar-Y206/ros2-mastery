"use client";

import { useRouter } from "next/navigation";
import { AchievementsView } from "@/components/layout/AchievementsView";

/**
 * AchievementsWrapper — client component that wires the AchievementsView to
 * Next.js router navigation.
 */
export function AchievementsWrapper() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return <AchievementsView onBack={handleBack} />;
}

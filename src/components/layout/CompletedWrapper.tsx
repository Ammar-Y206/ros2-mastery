"use client";

import { useRouter } from "next/navigation";
import { CompletedView } from "@/components/layout/CompletedView";

/**
 * CompletedWrapper — client component that wires the CompletedView to
 * Next.js router navigation.
 */
export function CompletedWrapper() {
  const router = useRouter();

  const handleNavigate = (moduleId: string) => {
    router.push(`/?m=${moduleId}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  return <CompletedView onNavigate={handleNavigate} onBack={handleBack} />;
}

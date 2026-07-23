"use client";

import { useRouter } from "next/navigation";
import { BookmarksView } from "@/components/layout/BookmarksView";

/**
 * BookmarksWrapper — client component that wires the BookmarksView to
 * Next.js router navigation.
 */
export function BookmarksWrapper() {
  const router = useRouter();

  const handleNavigate = (moduleId: string) => {
    router.push(`/?m=${moduleId}`);
  };

  const handleBack = () => {
    router.push("/");
  };

  return <BookmarksView onNavigate={handleNavigate} onBack={handleBack} />;
}

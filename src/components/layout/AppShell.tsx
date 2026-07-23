"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { DocContent } from "@/components/layout/DocContent";
import { ReadingProgressBar } from "@/components/layout/ReadingProgressBar";
import { BackToTop } from "@/components/layout/BackToTop";
import { KeyboardShortcuts } from "@/components/layout/KeyboardShortcuts";
import { CompletionCelebration } from "@/components/layout/CompletionCelebration";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AchievementWatcher } from "@/components/layout/AchievementWatcher";
import { useModuleProgress } from "@/hooks/use-progress";
import { useToast } from "@/hooks/use-toast";
import { getAdjacentModules } from "@/lib/course-data";

interface AppShellProps {
  moduleId: string;
  /** Server-rendered MDX content (the MDXRemote output). */
  children: React.ReactNode;
}

/**
 * Client-side application shell. Wraps the server-rendered MDX content with
 * the Navbar, LeftSidebar, RightSidebar, and footer. Navigation is performed
 * via `router.push('/?m=moduleId')` so the server component re-renders with
 * the new module's MDX.
 *
 * Sidebar hide/show: the learner can hide the left sidebar for a full-width
 * "focus mode". When hidden, a floating "Show Menu" button appears on the
 * left edge.
 */
export function AppShell({ moduleId, children }: AppShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const { toggle, bookmarked, toggleBookmark } = useModuleProgress(moduleId);
  const { toast } = useToast();

  const handleNavigate = useCallback(
    (nextModuleId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("m", nextModuleId);
      router.push(`/?${params.toString()}`, { scroll: false });
      setMobileSidebarOpen(false);
    },
    [router, searchParams]
  );

  // Global keyboard shortcuts for lesson actions (M, B, T, O, H, Arrow keys)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "combobox";

      if (isTyping || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggle();
        toast({
          title: "Lesson marked complete",
          description: "Progress saved locally.",
        });
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleBookmark();
        toast({
          title: bookmarked ? "Bookmark removed" : "Lesson bookmarked",
          description: bookmarked
            ? "Removed from your saved lessons."
            : "Saved for later reference.",
        });
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (e.key.toLowerCase() === "o") {
        e.preventDefault();
        router.push("/");
      } else if (e.key.toLowerCase() === "h") {
        // Toggle sidebar hide/show (focus mode)
        e.preventDefault();
        setSidebarHidden((h) => !h);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const adjacent = getAdjacentModules(moduleId);
        if (e.key === "ArrowLeft" && adjacent.prev) {
          e.preventDefault();
          handleNavigate(adjacent.prev.module.id);
        } else if (e.key === "ArrowRight" && adjacent.next) {
          e.preventDefault();
          handleNavigate(adjacent.next.module.id);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, toggleBookmark, bookmarked, toast, moduleId, handleNavigate, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ReadingProgressBar />
      <Navbar
        onToggleSidebar={() => setMobileSidebarOpen((o) => !o)}
        onNavigate={handleNavigate}
        activeModuleId={moduleId}
      />

      <div className="flex flex-1">
        <LeftSidebar
          activeModuleId={moduleId}
          onNavigate={handleNavigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isHidden={sidebarHidden}
          onHide={() => setSidebarHidden(true)}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1">
            <div className="min-w-0 flex-1">
              <DocContent moduleId={moduleId} onNavigate={handleNavigate}>
                {children}
              </DocContent>
            </div>
            <RightSidebar moduleId={moduleId} />
          </div>
          {/* Bottom padding on mobile so content isn't hidden behind MobileBottomNav */}
          <div className="h-16 lg:hidden" aria-hidden="true" />
        </main>
      </div>

      {/* Floating "Show Menu" button — appears when sidebar is hidden (desktop only) */}
      {sidebarHidden && (
        <button
          onClick={() => setSidebarHidden(false)}
          className="fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-1 rounded-r-lg border border-l-0 border-border/60 bg-card/90 py-3 pl-1.5 pr-2.5 text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:text-cyan-400 lg:flex"
          aria-label="Show sidebar"
          title="Show sidebar (or press H)"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <footer className="mt-auto border-t border-border/40 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground/60 sm:flex-row sm:px-6">
          <p>© 2024 ROS2 Mastery. Open-source learning platform.</p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Press </span>
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/40 bg-muted/50 px-1.5 font-mono text-[10px]">?</kbd>
            <span className="hidden sm:inline">for shortcuts</span>
            <span className="rounded-full border border-border/40 px-2 py-0.5 font-mono text-[10px] font-medium opacity-50">v1.0</span>
          </div>
        </div>
      </footer>

      {/* Floating / overlay components */}
      <BackToTop />
      <KeyboardShortcuts />
      <CompletionCelebration moduleId={moduleId} onNavigate={handleNavigate} />
      <MobileBottomNav moduleId={moduleId} onNavigate={handleNavigate} />
      <AchievementWatcher />
    </div>
  );
}

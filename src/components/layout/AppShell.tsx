"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { DocContent } from "@/components/layout/DocContent";

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
 */
export function AppShell({ moduleId, children }: AppShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = useCallback(
    (nextModuleId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("m", nextModuleId);
      router.push(`/?${params.toString()}`, { scroll: false });
      // Close the mobile sidebar — this is the only place moduleId changes,
      // so no separate effect is needed.
      setMobileSidebarOpen(false);
    },
    [router, searchParams]
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
        </main>
      </div>

      <footer className="mt-auto border-t border-border/60 bg-background/80 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            <span className="font-semibold text-foreground/80">ROS2 Mastery</span>{" "}
            · A 7-phase strategic roadmap to production robotics
          </p>
          <p className="flex items-center gap-3">
            <span>Progress saved locally</span>
            <span className="opacity-40">·</span>
            <span>Built with Next.js · MDX · shadcn/ui</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

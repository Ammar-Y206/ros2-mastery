import { Suspense, createElement } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewWrapper } from "@/components/layout/OverviewWrapper";
import { BookmarksWrapper } from "@/components/layout/BookmarksWrapper";
import { AchievementsWrapper } from "@/components/layout/AchievementsWrapper";
import { CompletedWrapper } from "@/components/layout/CompletedWrapper";
import { getContentComponent } from "@/lib/content-registry";
import { findModule } from "@/lib/course-data";
import { Callout } from "@/components/mdx/Callout";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { TerminalBlock } from "@/components/mdx/TerminalBlock";
import { Quiz } from "@/components/mdx/Quiz";
import { InteractiveGraph } from "@/components/mdx/InteractiveGraph";
import { StepByStepCode } from "@/components/mdx/StepByStepCode";
import { SimulatedTerminal } from "@/components/mdx/SimulatedTerminal";
import { ComparisonSlider } from "@/components/mdx/ComparisonSlider";

// All interactive MDX components are 'use client' — webpack automatically
// code-splits them. The homepage (/) renders OverviewWrapper which doesn't
// import any of these, so they only download when a lesson page is visited.
const MDX_COMPONENTS = {
  Callout,
  CodeBlock,
  TerminalBlock,
  Quiz,
  InteractiveGraph,
  StepByStepCode,
  SimulatedTerminal,
  ComparisonSlider,
};

interface PageProps {
  searchParams: Promise<{ m?: string; view?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  // Route: ?view=bookmarks    → Bookmarks page
  // Route: ?view=achievements → Achievements page
  // Route: ?view=completed    → Completed Lessons page
  // Route: ?m=moduleId        → Lesson page
  // Route: (nothing)          → Course Overview dashboard
  const showBookmarks = params.view === "bookmarks";
  const showAchievements = params.view === "achievements";
  const showCompleted = params.view === "completed";
  const showOverview = !params.m && !showBookmarks && !showAchievements && !showCompleted;
  const moduleId = resolveModuleId(params.m);
  const ContentComponent = getContentComponent(moduleId);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </div>
      }
    >
      {showBookmarks ? (
        <BookmarksWrapper />
      ) : showAchievements ? (
        <AchievementsWrapper />
      ) : showCompleted ? (
        <CompletedWrapper />
      ) : showOverview ? (
        <OverviewWrapper />
      ) : (
        <AppShell moduleId={moduleId}>
          {ContentComponent
            ? createElement(ContentComponent, { components: MDX_COMPONENTS })
            : (
              <div className="p-8 text-muted-foreground">
                Content not found for module: {moduleId}
              </div>
            )
          }
        </AppShell>
      )}
    </Suspense>
  );
}

function resolveModuleId(raw: string | undefined): string {
  const fallback = "phase-1/middleware";
  if (!raw) return fallback;
  const found = findModule(raw);
  return found ? raw : fallback;
}

export const dynamic = "force-dynamic";

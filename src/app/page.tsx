import { Suspense, createElement } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewWrapper } from "@/components/layout/OverviewWrapper";
import { getContentComponent } from "@/lib/content-registry";
import { findModule } from "@/lib/course-data";
import { Callout } from "@/components/mdx/Callout";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { TerminalBlock } from "@/components/mdx/TerminalBlock";
import { Quiz } from "@/components/mdx/Quiz";

const MDX_COMPONENTS = { Callout, CodeBlock, TerminalBlock, Quiz };

interface PageProps {
  searchParams: Promise<{ m?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  // If no `m` param, show the Course Overview dashboard.
  const showOverview = !params.m;
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
      {showOverview ? (
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

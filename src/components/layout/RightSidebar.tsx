"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Bookmark, BookmarkCheck, ListTree, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useModuleProgress } from "@/hooks/use-progress";
import { findModule, findPhaseByModule, ACCENT_CLASSES } from "@/lib/course-data";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface RightSidebarProps {
  moduleId: string;
  /** HTML id of the main scroll container, used to observe headings */
  contentContainerId?: string;
}

export function RightSidebar({
  moduleId,
  contentContainerId = "doc-content",
}: RightSidebarProps) {
  const { isComplete, toggle, bookmarked, toggleBookmark } =
    useModuleProgress(moduleId);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const mod = findModule(moduleId);
  const phase = findPhaseByModule(moduleId);

  // Build TOC from rendered headings inside the content container
  useEffect(() => {
    const collect = () => {
      const container = document.getElementById(contentContainerId);
      if (!container) {
        setToc([]);
        return;
      }
      const headings = Array.from(
        container.querySelectorAll("h2, h3")
      ) as HTMLHeadingElement[];
      const items: TocItem[] = headings
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: h.textContent?.replace(/#$/, "").trim() ?? "",
          level: h.tagName === "H2" ? 2 : 3,
        }));
      setToc(items);
    };
    // Defer until MDX renders
    const t = setTimeout(collect, 200);
    return () => clearTimeout(t);
  }, [moduleId, contentContainerId]);

  // Track the active heading with IntersectionObserver
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      }
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <aside className="hidden xl:flex sticky top-14 z-20 h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-l border-border/60 bg-background/40">
      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-thin">
        {/* On this page */}
        <div className="mb-6">
          <div className="mb-2.5 flex items-center gap-2">
            <ListTree className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </span>
          </div>
          {toc.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">Loading...</p>
          ) : (
            <ul className="space-y-1 border-l border-border/60">
              {toc.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      "-ml-px block w-full border-l-2 py-1 text-left text-[13px] leading-snug transition-colors",
                      item.level === 3 && "pl-6",
                      item.level === 2 && "pl-3",
                      activeId === item.id
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-muted-foreground/70 hover:border-border hover:text-foreground"
                    )}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Module meta */}
        {mod && phase && (
          <div className="mb-6 rounded-lg border border-border/60 bg-card/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-5 items-center rounded px-1.5 text-[10px] font-bold",
                  ACCENT_CLASSES[phase.accent].bg,
                  ACCENT_CLASSES[phase.accent].text
                )}
              >
                P{phase.number}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {phase.title}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              {mod.title}
            </h4>
            {mod.readingTime && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <Clock className="h-3 w-3" />
                {mod.readingTime} min read
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mark as completed + bookmark */}
      <div className="border-t border-border/60 px-5 py-4 space-y-2.5">
        <label
          htmlFor="mark-complete"
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors",
            isComplete
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-border/70 bg-card/40 hover:border-border hover:bg-card"
          )}
        >
          <Checkbox
            id="mark-complete"
            checked={isComplete}
            onCheckedChange={() => toggle()}
            className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <div className="flex-1">
            <span
              className={cn(
                "block text-sm font-medium",
                isComplete ? "text-emerald-400" : "text-foreground"
              )}
            >
              {isComplete ? "Completed" : "Mark as completed"}
            </span>
            <span className="block text-[11px] text-muted-foreground/70">
              {isComplete
                ? "Nice work! Progress saved locally."
                : "Track your progress through the roadmap."}
            </span>
          </div>
          {isComplete && (
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          )}
        </label>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleBookmark()}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          {bookmarked ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-cyan-400" />
              <span>Bookmarked</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Bookmark this lesson</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

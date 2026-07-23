"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { Search, Command, Github, BookOpen, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { ALL_MODULE_IDS } from "@/lib/course-data";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { COURSE_PHASES } from "@/lib/course-data";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SettingsDialog } from "@/components/layout/SettingsDialog";
import { BookmarksButton } from "@/components/layout/BookmarksButton";
import { AchievementsButton } from "@/components/layout/AchievementsButton";
import { CompletedButton } from "@/components/layout/CompletedButton";
import { RemainingTime } from "@/components/layout/RemainingTime";
import { StreakBadge } from "@/components/layout/StreakBadge";
import { SEARCH_INDEX, type SearchEntry } from "@/lib/search-index";

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (moduleId: string) => void;
  activeModuleId: string;
}

export function Navbar({ onToggleSidebar, onNavigate, activeModuleId }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fuse.js instance for full-text fuzzy search across all content
  const fuse = useMemo(() => {
    return new Fuse(SEARCH_INDEX, {
      keys: [
        { name: "moduleTitle", weight: 0.4 },
        { name: "phaseTitle", weight: 0.2 },
        { name: "keywords", weight: 0.3 },
        { name: "headings", weight: 0.1 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }, []);

  // Search results — either Fuse.js matches or all modules when query is empty
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return all modules grouped by phase (default view)
      return SEARCH_INDEX;
    }
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, fuse]);

  // Group results by phase for display
  const groupedResults = useMemo(() => {
    const groups: Record<number, SearchEntry[]> = {};
    for (const entry of searchResults) {
      if (!groups[entry.phaseNumber]) groups[entry.phaseNumber] = [];
      groups[entry.phaseNumber].push(entry);
    }
    return groups;
  }, [searchResults]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors",
        scrolled && "bg-background/95 shadow-sm shadow-black/5"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4 lg:px-6">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo — clicking goes to the Course Overview dashboard */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/20">
            <span className="font-mono text-sm font-bold text-black">R</span>
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-foreground">
              ROS2 <span className="text-cyan-400">Mastery</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Humble · 7-Phase Roadmap
            </span>
          </div>
        </Link>

        {/* Search trigger */}
        <button
          onClick={() => setOpen(true)}
          className="ml-auto hidden md:inline-flex h-9 w-64 items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search lessons...</span>
          <kbd className="inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Progress indicator + remaining time + streak */}
        <div className="hidden sm:flex items-center gap-2">
          <ProgressIndicator moduleIds={ALL_MODULE_IDS} variant="compact" />
          <RemainingTime />
          <StreakBadge />
        </div>

        {/* Bookmarks + Completed + Achievements + Theme toggle + Settings — clustered in a pill */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-muted/20 p-0.5">
          <BookmarksButton onClick={() => router.push("/?view=bookmarks")} />
          <CompletedButton onClick={() => router.push("/?view=completed")} />
          <AchievementsButton onClick={() => router.push("/?view=achievements")} />
          <div className="mx-0.5 h-5 w-px bg-border/50" aria-hidden="true" />
          <ThemeToggle />
          <SettingsDialog />
        </div>

        {/* External links */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="https://docs.ros.org/en/humble/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-cyan-400 transition-all active:scale-95"
            aria-label="ROS2 Official Docs"
            title="ROS2 Official Docs"
          >
            <BookOpen className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/ros2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-cyan-400 transition-all active:scale-95"
            aria-label="GitHub"
            title="ROS2 on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </nav>
      </div>

      {/* Command palette — powered by Fuse.js full-text search */}
      <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearchQuery(""); }}>
        <CommandInput
          placeholder="Search lessons, concepts, commands... (e.g. 'tf2_echo', 'EKF', 'ros2 launch')"
          onValueChange={handleSearchChange}
        />
        <CommandList>
          {searchResults.length === 0 && searchQuery.trim() ? (
            <CommandEmpty>No results found for "{searchQuery}". Try a different term.</CommandEmpty>
          ) : (
            Object.entries(groupedResults)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([phaseNum, entries]) => {
                const phase = COURSE_PHASES.find((p) => p.number === Number(phaseNum));
                if (!phase) return null;
                return (
                  <CommandGroup
                    key={phaseNum}
                    heading={`Phase ${phaseNum} — ${phase.title}`}
                  >
                    {entries.map((entry) => (
                      <CommandItem
                        key={entry.moduleId}
                        value={`${entry.moduleTitle} ${entry.phaseTitle} ${entry.keywords}`}
                        onSelect={() => {
                          onNavigate(entry.moduleId);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        className={cn(
                          activeModuleId === entry.moduleId && "bg-accent/50"
                        )}
                      >
                        <span className="mr-2 text-xs font-mono text-muted-foreground">
                          {entry.phaseNumber}.{phase.modules.findIndex((m) => m.id === entry.moduleId) + 1}
                        </span>
                        <span>{entry.moduleTitle}</span>
                        {searchQuery.trim() && (
                          <span className="ml-auto text-[10px] text-muted-foreground/50">
                            {entry.headings[0]?.slice(0, 30)}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: { section: string; items: ShortcutItem[] }[] = [
  {
    section: "Navigation",
    items: [
      { keys: ["⌘", "K"], description: "Open search / command palette" },
      { keys: ["?"], description: "Show this keyboard shortcuts panel" },
      { keys: ["Esc"], description: "Close dialog / overlay" },
    ],
  },
  {
    section: "Lesson",
    items: [
      { keys: ["M"], description: "Mark current lesson as complete" },
      { keys: ["B"], description: "Bookmark current lesson" },
      { keys: ["T"], description: "Scroll back to top" },
    ],
  },
  {
    section: "Code Blocks",
    items: [
      { keys: ["1"], description: "Switch to C++ tab (on focused code block)" },
      { keys: ["2"], description: "Switch to Python tab (on focused code block)" },
    ],
  },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only trigger on "?" when not typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute("role") === "combobox";

      if (e.key === "?" && !isTyping && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4 text-cyan-400" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-xs">
            Press <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">?</kbd> anytime to toggle this panel.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {SHORTCUTS.map((group) => (
            <div key={group.section} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.section}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-foreground/80">{item.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-foreground/80 shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

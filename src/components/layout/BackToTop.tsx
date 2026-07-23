"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * BackToTop — a floating circular button that appears in the bottom-right
 * corner after the user scrolls past 400px. Smooth-scrolls to the top on click.
 * Hidden on mobile to avoid overlapping the bottom mark-complete bar.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-30 hidden lg:flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/80 text-muted-foreground shadow-lg backdrop-blur-xl transition-all duration-300",
        "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 hover:shadow-cyan-500/20",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * ReadingProgressBar — a thin cyan gradient bar fixed to the very top of the
 * viewport (above the navbar) that fills as the user scrolls through the
 * current lesson. Uses requestAnimationFrame-throttled scroll listener for
 * smooth, jank-free updates.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent"
      aria-hidden="true"
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-[width] duration-150 ease-out",
          "shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

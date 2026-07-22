import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "why" | "how" | "best-practice" | "pitfall";

export interface CalloutProps {
  type: CalloutType;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

interface CalloutConfig {
  defaultTitle: string;
  icon: LucideIcon;
  /** Inline style applied to the outer container */
  containerStyle: React.CSSProperties;
  /** Tailwind classes for the outer container */
  containerClass: string;
  /** Tailwind classes for the icon wrapper */
  iconWrapperClass: string;
  /** Tailwind classes for the title text */
  titleClass: string;
  /** Glow / ring classes for pitfall */
  glowClass?: string;
}

const CALLOUT_CONFIG: Record<CalloutType, CalloutConfig> = {
  why: {
    defaultTitle: "The Why",
    icon: HelpCircle,
    containerStyle: {
      // emerald-500 #10b981
      borderLeftColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.06)",
      boxShadow: "0 0 20px rgba(16, 185, 129, 0.08)",
    },
    containerClass:
      "border border-l-4 border-l-emerald-500 border-emerald-500/20",
    iconWrapperClass:
      "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
    titleClass: "text-emerald-300",
  },
  how: {
    defaultTitle: "The How",
    icon: Wrench,
    containerStyle: {
      // cyan-500 #06b6d4
      borderLeftColor: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.06)",
      boxShadow: "0 0 20px rgba(6, 182, 212, 0.08)",
    },
    containerClass: "border border-l-4 border-l-cyan-500 border-cyan-500/20",
    iconWrapperClass: "bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30",
    titleClass: "text-cyan-300",
  },
  "best-practice": {
    defaultTitle: "Best Practice",
    icon: CheckCircle2,
    containerStyle: {
      // violet-500 #8b5cf6
      borderLeftColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.06)",
      boxShadow: "0 0 20px rgba(139, 92, 246, 0.08)",
    },
    containerClass:
      "border border-l-4 border-l-violet-500 border-violet-500/20",
    iconWrapperClass:
      "bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30",
    titleClass: "text-violet-300",
  },
  pitfall: {
    defaultTitle: "CRITICAL Pitfall",
    icon: AlertTriangle,
    containerStyle: {
      // rose-500 #f43f5e
      borderLeftColor: "#f43f5e",
      backgroundColor: "rgba(244, 63, 94, 0.06)",
      // subtle red glow
      boxShadow:
        "0 0 0 1px rgba(244,63,94,0.25), 0 0 28px rgba(244,63,94,0.20)",
    },
    containerClass: "border border-l-4 border-l-rose-500 border-rose-500/20",
    iconWrapperClass: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/40",
    titleClass: "text-rose-300",
    glowClass: "ring-1 ring-rose-500/30",
  },
};

/**
 * Callout — a styled callout box for highlighting Why / How / Best-Practice / Pitfall
 * content inside MDX documents. Pure presentational (server-compatible).
 */
export function Callout({
  type,
  title,
  className,
  children,
}: CalloutProps) {
  const config = CALLOUT_CONFIG[type];
  const Icon = config.icon;
  const resolvedTitle = title ?? config.defaultTitle;

  return (
    <div
      role="note"
      data-callout-type={type}
      className={cn(
        "relative my-6 flex gap-3 rounded-lg p-4 sm:gap-4 sm:p-5",
        config.containerClass,
        config.glowClass,
        className,
      )}
      style={config.containerStyle}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md sm:size-8",
          config.iconWrapperClass,
        )}
        aria-hidden="true"
      >
        <Icon className="size-4 sm:size-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-bold uppercase tracking-wide",
              config.titleClass,
            )}
          >
            {resolvedTitle}
          </span>
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground [&>p]:my-0 [&>p:last-child]:mb-0 [&>p:first-child]:mt-0 [&_code]:rounded-md [&_code]:border [&_code]:border-cyan-500/20 [&_code]:bg-cyan-500/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-cyan-200">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Callout;

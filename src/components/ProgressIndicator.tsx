"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useOverallProgress, useProgressHydrated } from "@/hooks/use-progress";

export type ProgressIndicatorVariant = "compact" | "bar" | "ring";

export interface ProgressIndicatorProps {
  /** All module IDs participating in the course. */
  moduleIds: string[];
  /** Visual variant. Defaults to `compact`. */
  variant?: ProgressIndicatorVariant;
  /** Optional label rendered alongside the indicator. */
  label?: string;
  className?: string;
}

/**
 * Compact circular SVG progress indicator.
 * Renders a small ring with the count "X/Y" beside it.
 */
function CompactIndicator({
  percentage,
  completed,
  total,
  hydrated,
  label,
  className,
}: {
  percentage: number;
  completed: number;
  total: number;
  hydrated: boolean;
  label?: string;
  className?: string;
}) {
  const size = 28;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-medium text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={
        hydrated
          ? `${label ? label + ": " : ""}${completed} of ${total} modules completed (${percentage}%)`
          : "Loading progress"
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-primary/15"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={hydrated ? dashOffset : circumference}
            className="text-cyan-400 transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        {percentage === 100 && hydrated && (
          <CheckCircle2
            className="absolute inset-0 m-auto h-3.5 w-3.5 text-cyan-400"
            aria-hidden="true"
          />
        )}
      </div>
      <span className="tabular-nums">
        {hydrated ? (
          <>
            {label ? <span className="mr-1.5">{label}</span> : null}
            <span className="text-foreground">
              {completed}/{total}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </span>
    </div>
  );
}

/**
 * Horizontal progress bar using shadcn `Progress`.
 */
function BarIndicator({
  percentage,
  completed,
  total,
  hydrated,
  label,
  className,
}: {
  percentage: number;
  completed: number;
  total: number;
  hydrated: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      role="status"
      aria-live="polite"
      aria-label={
        hydrated
          ? `${label ? label + ": " : ""}${completed} of ${total} modules completed (${percentage}%)`
          : "Loading progress"
      }
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{label ?? "Phase Progress"}</span>
        <span className="tabular-nums">
          {hydrated ? (
            <>
              <span className="text-foreground">{completed}</span>
              <span className="text-muted-foreground/60">/{total}</span>
              <span className="ml-1.5 text-cyan-400">({percentage}%)</span>
            </>
          ) : (
            <span className="text-muted-foreground/60">—</span>
          )}
        </span>
      </div>
      <Progress
        value={hydrated ? percentage : 0}
        className="h-2 bg-primary/10 [&>[data-slot=progress-indicator]]:bg-cyan-400"
      />
    </div>
  );
}

/**
 * Large ring indicator with the percentage centered.
 */
function RingIndicator({
  percentage,
  completed,
  total,
  hydrated,
  label,
  className,
}: {
  percentage: number;
  completed: number;
  total: number;
  hydrated: boolean;
  label?: string;
  className?: string;
}) {
  const size = 64;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-label={
        hydrated
          ? `${label ? label + ": " : ""}${completed} of ${total} modules completed (${percentage}%)`
          : "Loading progress"
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-primary/15"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={hydrated ? dashOffset : circumference}
            className="text-cyan-400 transition-[stroke-dashoffset] duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hydrated ? (
            <>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {percentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                {completed}/{total}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground/60">—</span>
          )}
        </div>
      </div>
      {label ? (
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {hydrated ? `${completed} of ${total} done` : "Loading…"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Overall progress indicator. Subscribes to the progress store and renders
 * one of three variants based on the `variant` prop.
 *
 * Until the store hydrates from localStorage, a neutral placeholder is
 * rendered to avoid SSR/client mismatches.
 */
export function ProgressIndicator({
  moduleIds,
  variant = "compact",
  label,
  className,
}: ProgressIndicatorProps) {
  const hydrated = useProgressHydrated();
  const { completed, total, percentage } = useOverallProgress(moduleIds);

  const shared = {
    percentage,
    completed,
    total,
    hydrated,
    label,
    className,
  };

  switch (variant) {
    case "bar":
      return <BarIndicator {...shared} />;
    case "ring":
      return <RingIndicator {...shared} />;
    case "compact":
    default:
      return <CompactIndicator {...shared} />;
  }
}

export default ProgressIndicator;

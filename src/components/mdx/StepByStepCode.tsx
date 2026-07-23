"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/store/progress-store";

export interface CodeStep {
  /** Step title (e.g. "Step 1: Class Inheritance") */
  title: string;
  /** Explanation shown alongside the code for this step */
  explanation: string;
  /** C++ code for this step */
  cpp: string;
  /** Python code for this step */
  python: string;
  /** Optional: which lines to highlight in this step */
  highlightLines?: number[];
}

export interface StepByStepCodeProps {
  steps: CodeStep[];
  /** File title (e.g. "src/telemetry_node.cpp") */
  title?: string;
  /** Overall description shown before the steps begin */
  description?: string;
  className?: string;
}

type TabKey = "cpp" | "python";

/**
 * StepByStepCode — a progressive code reveal component.
 *
 * Breaks a code sample into logical steps. The learner clicks "Next Step" to
 * advance through the steps, each of which shows its own snippet with a clear
 * explanation. A step indicator at the top shows progress as a row of numbered
 * dots connected by lines.
 */
export function StepByStepCode({
  steps,
  title,
  description,
  className,
}: StepByStepCodeProps) {
  const safeSteps = steps ?? [];
  const total = safeSteps.length;

  const [current, setCurrent] = React.useState(0);
  // Bump on every step change to retrigger the fade-in animation.
  const [animKey, setAnimKey] = React.useState(0);

  // Sync C++/Python tab with the global language preference (mirrors CodeBlock).
  const preferredLanguage = useProgressStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useProgressStore(
    (s) => s.setPreferredLanguage,
  );
  const [tab, setTab] = React.useState<TabKey>(
    preferredLanguage === "python" ? "python" : "cpp",
  );

  React.useEffect(() => {
    if (preferredLanguage === "cpp" || preferredLanguage === "python") {
      setTab(preferredLanguage);
    }
  }, [preferredLanguage]);

  const handleTabChange = React.useCallback(
    (key: TabKey) => {
      setTab(key);
      setPreferredLanguage(key);
    },
    [setPreferredLanguage],
  );

  // Guard against empty steps array.
  if (total === 0) {
    return null;
  }

  const safeIndex = Math.min(current, total - 1);
  const step = safeSteps[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === total - 1;

  const goNext = () => {
    if (isLast) {
      setCurrent(0);
    } else {
      setCurrent((i) => Math.min(i + 1, total - 1));
    }
    setAnimKey((k) => k + 1);
  };

  const goPrev = () => {
    if (isFirst) return;
    setCurrent((i) => Math.max(i - 1, 0));
    setAnimKey((k) => k + 1);
  };

  const handleStepClick = (index: number) => {
    if (index === safeIndex) return;
    setCurrent(index);
    setAnimKey((k) => k + 1);
  };

  const code = tab === "cpp" ? step.cpp : step.python;
  const codeLines = code.split("\n");
  const showLineNumbers = codeLines.length > 3;
  const highlightLines = step.highlightLines ?? [];

  // Determine which line numbers should get the cyan tint background.
  // react-syntax-highlighter wraps each line in a node; we use wrapLongLines=false
  // and rely on `lineProps` via `showLineNumbers` rendering. Since per-line
  // styling via `lineProps` callback isn't in our minimal type decl, we emulate
  // the highlight by overlaying a subtle marker above the code area is not
  // trivial — instead we set `highlight` through the `customStyle` approach.
  // To keep it robust and typesafe against our minimal .d.ts, we render a
  // legend strip listing the highlighted line numbers when provided.
  const hasHighlight = highlightLines.length > 0;

  return (
    <div
      className={cn(
        "my-6 overflow-hidden rounded-lg border border-border bg-[#0d1117] shadow-lg",
        className,
      )}
      data-stepbystep=""
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#161b22] px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
            <Terminal
              className="size-3.5 shrink-0 text-cyan-400"
              aria-hidden="true"
            />
            <span className="truncate font-mono">
              {title ?? "snippet"}
            </span>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
            Step {safeIndex + 1} of {total}
          </span>
        </div>

        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {/* ── Step indicator (dots + connecting lines) ───────────────────── */}
      <div className="border-b border-white/5 bg-[#0d1117] px-4 py-4 sm:px-5">
        <ol
          className="flex items-center"
          aria-label="Progress through steps"
        >
          {safeSteps.map((s, i) => {
            const completed = i < safeIndex;
            const active = i === safeIndex;
            const future = i > safeIndex;

            // Connecting line BEFORE this dot (skip the first).
            const lineBefore =
              i > 0 ? (
                <li
                  aria-hidden="true"
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors duration-300",
                    i <= safeIndex
                      ? "bg-gradient-to-r from-cyan-400 to-cyan-400"
                      : "bg-slate-700",
                  )}
                />
              ) : null;

            return (
              <React.Fragment key={`step-${i}`}>
                {lineBefore}
                <li className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(i)}
                    aria-label={`Go to step ${i + 1}: ${s.title}`}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "relative flex size-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-300 sm:size-8 sm:text-xs",
                      active &&
                        "border-cyan-400 bg-cyan-400/15 text-cyan-200 shadow-[0_0_0_3px_rgba(34,211,238,0.15)]",
                      completed &&
                        "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 hover:border-emerald-400",
                      future &&
                        "border-slate-700 bg-slate-800/40 text-slate-500 hover:border-slate-600 hover:text-slate-300",
                    )}
                  >
                    {active ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border border-cyan-400/60 motion-safe:animate-ping"
                        />
                        <span className="relative">{i + 1}</span>
                      </>
                    ) : completed ? (
                      <Check
                        className="size-3.5 sm:size-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </button>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>

      {/* ── Explanation callout ────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#0d1117] px-4 py-4 sm:px-5">
        <div
          className="rounded-md border-l-2 border-cyan-400 bg-cyan-500/5 px-4 py-3"
          role="group"
          aria-label={`Step ${safeIndex + 1} explanation`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-cyan-500/15 font-mono text-[10px] font-bold text-cyan-300">
              {safeIndex + 1}
            </span>
            <h4 className="text-sm font-semibold text-cyan-100">
              {step.title}
            </h4>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {step.explanation}
          </p>
        </div>
      </div>

      {/* ── Code area: tabs + syntax-highlighted code ──────────────────── */}
      <div className="bg-[#0d1117]">
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Language selection"
          className="flex border-b border-white/5 bg-[#0d1117]"
        >
          {(["cpp", "python"] as const).map((key) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => handleTabChange(key)}
                className={cn(
                  "relative -mb-px px-4 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-cyan-300"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {key === "cpp" ? "C++" : "Python"}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400"
                  />
                )}
              </button>
            );
          })}

          {/* "What this step adds" label on the right */}
          <div className="ml-auto flex items-center pr-4 text-[11px] text-slate-500">
            <span className="hidden sm:inline">adds&nbsp;</span>
            <span className="font-mono text-slate-400">
              {codeLines.length} {codeLines.length === 1 ? "line" : "lines"}
            </span>
            {hasHighlight ? (
              <span className="ml-2 rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                ★ highlighted
              </span>
            ) : null}
          </div>
        </div>

        {/* Code body — re-mounts on step change for the fade-in animation */}
        <div
          key={animKey}
          className="animate-fade-in codeblock-scroll overflow-x-auto"
        >
          <SyntaxHighlighter
            language={tab === "cpp" ? "cpp" : "python"}
            style={oneDark}
            showLineNumbers={showLineNumbers}
            lineNumberStyle={{
              color: "#3b4252",
              fontSize: "0.75rem",
              paddingRight: "1rem",
              userSelect: "none",
              minWidth: "2.5em",
            }}
            customStyle={{
              margin: 0,
              padding: "1rem 1.25rem",
              background: "transparent",
              fontSize: "0.85rem",
              lineHeight: "1.6",
              fontFamily:
                '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              },
            }}
            wrapLongLines={false}
            // Mark highlighted lines with a subtle cyan tint background.
            // `wrapLines` + `lineProps` enable per-line className injection.
            wrapLines
            // @ts-expect-error — lineProps is supported by Prism but not in our minimal .d.ts
            lineProps={(lineNumber: number) => {
              if (highlightLines.includes(lineNumber)) {
                return {
                  style: {
                    display: "block",
                    backgroundColor: "rgba(34,211,238,0.07)",
                    borderLeft: "2px solid rgba(34,211,238,0.6)",
                    paddingLeft: "0.5rem",
                    marginLeft: "-0.5rem",
                  },
                };
              }
              return { style: { display: "block" } };
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* ── Navigation footer ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-[#161b22] px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous step"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
            isFirst
              ? "cursor-not-allowed border-white/5 bg-transparent text-slate-600"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200",
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="hidden text-[11px] text-slate-500 sm:block">
          {isLast ? (
            <span className="text-cyan-300/80">You&apos;re at the final step</span>
          ) : (
            <span>
              {total - safeIndex - 1} step{total - safeIndex - 1 === 1 ? "" : "s"} remaining
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label={isLast ? "Restart from step 1" : "Next step"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-4 py-1.5 text-xs font-semibold transition-all active:scale-95",
            "border-cyan-400/40 bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-[0_0_18px_-6px_rgba(34,211,238,0.7)] hover:from-cyan-400 hover:to-teal-400",
          )}
        >
          {isLast ? (
            <>
              <RotateCcw className="size-4" aria-hidden="true" />
              <span>Restart</span>
            </>
          ) : (
            <>
              <span>Next Step</span>
              <ChevronRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default StepByStepCode;

"use client";

import * as React from "react";
import {
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  className?: string;
}

interface QuestionState {
  selectedIndex: number | null;
}

/**
 * Quiz — an interactive quiz component rendered at the end of learning phases.
 * Tracks selected answers per question, gives immediate feedback (correct / wrong),
 * shows explanations, and reports an aggregate score with a progress bar.
 */
export function Quiz({ questions, title = "Knowledge Check", className }: QuizProps) {
  // Defensive guard: if questions is missing (e.g. during RSC hydration edge
  // cases where the prop hasn't been serialized yet), render a fallback.
  const safeQuestions = Array.isArray(questions) ? questions : [];

  const [states, setStates] = React.useState<Record<string, QuestionState>>(
    () => {
      const initial: Record<string, QuestionState> = {};
      for (const q of safeQuestions) initial[q.id] = { selectedIndex: null };
      return initial;
    },
  );

  const answeredCount = React.useMemo(
    () =>
      safeQuestions.reduce(
        (acc, q) => acc + (states[q.id]?.selectedIndex !== null ? 1 : 0),
        0,
      ),
    [safeQuestions, states],
  );

  const correctCount = React.useMemo(
    () =>
      safeQuestions.reduce((acc, q) => {
        const sel = states[q.id]?.selectedIndex;
        return acc + (sel === q.correctIndex ? 1 : 0);
      }, 0),
    [safeQuestions, states],
  );

  const scorePercent = safeQuestions.length
    ? Math.round((correctCount / safeQuestions.length) * 100)
    : 0;

  const allAnswered = answeredCount === safeQuestions.length && safeQuestions.length > 0;

  const handleSelect = React.useCallback(
    (questionId: string, optionIndex: number) => {
      setStates((prev) => {
        const cur = prev[questionId];
        // Lock the answer once chosen
        if (cur && cur.selectedIndex !== null) return prev;
        return { ...prev, [questionId]: { selectedIndex: optionIndex } };
      });
    },
    [],
  );

  const handleReset = React.useCallback(() => {
    setStates(() => {
      const reset: Record<string, QuestionState> = {};
      for (const q of safeQuestions) reset[q.id] = { selectedIndex: null };
      return reset;
    });
  }, [safeQuestions]);

  return (
    <section
      className={cn(
        "my-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
      data-quiz=""
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-cyan-500/10 to-transparent px-5 py-4 sm:px-6">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30"
          aria-hidden="true"
        >
          <GraduationCap className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {answeredCount} of {safeQuestions.length} answered
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Reset Quiz</span>
        </button>
      </header>

      {/* Questions */}
      <div className="divide-y divide-border">
        {safeQuestions.map((q, qIdx) => {
          const state = states[q.id];
          const selected = state?.selectedIndex ?? null;
          const answered = selected !== null;

          return (
            <div key={q.id} className="px-5 py-5 sm:px-6">
              <div className="mb-3 flex items-start gap-2">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                  {qIdx + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {q.question}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selected === optIdx;
                  const isCorrect = q.correctIndex === optIdx;
                  const showAsCorrect = answered && isCorrect;
                  const showAsWrong = answered && isSelected && !isCorrect;

                  return (
                    <QuizOptionButton
                      key={optIdx}
                      label={opt}
                      disabled={answered}
                      selected={isSelected}
                      answered={answered}
                      isCorrect={isCorrect}
                      showAsCorrect={showAsCorrect}
                      showAsWrong={showAsWrong}
                      onClick={() => handleSelect(q.id, optIdx)}
                    />
                  );
                })}
              </div>

              {/* Explanation */}
              {answered && q.explanation && (
                <div
                  className={cn(
                    "mt-3 rounded-md border-l-2 px-3 py-2.5 text-xs leading-relaxed",
                    selected === q.correctIndex
                      ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-200/90"
                      : "border-rose-500/50 bg-rose-500/5 text-rose-200/90",
                  )}
                >
                  <span className="font-semibold">
                    {selected === q.correctIndex ? "Correct. " : "Not quite. "}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Score summary */}
      {safeQuestions.length > 0 && (
        <footer className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {allAnswered ? "Final score" : "Progress"}
            </span>
            <span
              className={cn(
                "font-mono text-sm font-semibold",
                !allAnswered
                  ? "text-muted-foreground"
                  : correctCount === safeQuestions.length
                    ? "text-emerald-300"
                    : correctCount / safeQuestions.length >= 0.5
                      ? "text-cyan-300"
                      : "text-rose-300",
              )}
            >
              {correctCount}/{safeQuestions.length}
              {allAnswered && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({scorePercent}%)
                </span>
              )}
            </span>
          </div>
          <Progress value={allAnswered ? scorePercent : (answeredCount / safeQuestions.length) * 100} />
          {allAnswered && (
            <p className="mt-2 text-xs text-muted-foreground">
              {correctCount === safeQuestions.length
                ? "Perfect — you've mastered this section!"
                : correctCount / safeQuestions.length >= 0.7
                  ? "Great work! Review any missed questions and try again."
                  : "Keep going — review the material and reset to try again."}
            </p>
          )}
        </footer>
      )}
    </section>
  );
}

interface QuizOptionButtonProps {
  label: string;
  disabled: boolean;
  selected: boolean;
  answered: boolean;
  isCorrect: boolean;
  showAsCorrect: boolean;
  showAsWrong: boolean;
  onClick: () => void;
}

function QuizOptionButton({
  label,
  disabled,
  selected,
  answered,
  isCorrect,
  showAsCorrect,
  showAsWrong,
  onClick,
}: QuizOptionButtonProps) {
  let Icon: LucideIcon | null = null;
  if (showAsCorrect) Icon = CheckCircle2;
  if (showAsWrong) Icon = XCircle;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        disabled ? "cursor-default" : "cursor-pointer hover:border-cyan-500/40 hover:bg-cyan-500/5",
        // Base state
        !answered && !selected && "border-border bg-background text-muted-foreground",
        // Selected but unanswered (cyan accent)
        !answered && selected && "border-cyan-500 bg-cyan-500/10 text-cyan-100",
        // After answering — correct
        showAsCorrect && "border-emerald-500/60 bg-emerald-500/10 text-emerald-100",
        // After answering — wrong selection
        showAsWrong && "border-rose-500/60 bg-rose-500/10 text-rose-100",
        // After answering — non-selected incorrect option (dim)
        answered && !selected && !isCorrect && "border-border/60 bg-background/40 text-muted-foreground/70",
        // After answering — non-selected correct option (still highlight green)
        answered && !selected && isCorrect && "border-emerald-500/60 bg-emerald-500/10 text-emerald-100",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
          !answered && !selected && "border-border text-muted-foreground",
          !answered && selected && "border-cyan-400 bg-cyan-400 text-background",
          showAsCorrect && "border-emerald-400 bg-emerald-400 text-background",
          showAsWrong && "border-rose-400 bg-rose-400 text-background",
          answered && !selected && !isCorrect && "border-border/60 text-muted-foreground/70",
          answered && !selected && isCorrect && "border-emerald-400 bg-emerald-400 text-background",
        )}
        aria-hidden="true"
      >
        {Icon ? <Icon className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1 leading-relaxed">{label}</span>
    </button>
  );
}

export default Quiz;

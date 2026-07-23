"use client";

import * as React from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SimulatedCommand {
  /** The command the user types (e.g. "ros2 node list") */
  command: string;
  /** Mock output lines to display */
  output: string[];
  /** Optional description shown before the command hint */
  description?: string;
}

export interface SimulatedTerminalProps {
  /** Pre-programmed commands and their outputs */
  commands: SimulatedCommand[];
  /** Terminal title (default "ROS2 Terminal") */
  title?: string;
  /** Initial welcome message lines */
  welcomeMessage?: string[];
  /** Hint commands shown as clickable chips above the terminal */
  hintCommands?: string[];
}

type LineKind =
  | "welcome"
  | "input"
  | "comment"
  | "info"
  | "error"
  | "output"
  | "blank";

interface OutputLine {
  id: number;
  kind: LineKind;
  text: string;
}

const MONO_FONT_STACK =
  '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

/** Classify a raw output line into a LineKind for styling. */
function classifyLine(raw: string): LineKind {
  const trimmed = raw.trim();
  if (trimmed === "") return "blank";
  if (trimmed.startsWith("#")) return "comment";
  // "not found" must be checked before INFO so "command not found" reads as error.
  if (/not found/i.test(trimmed)) return "error";
  if (/\bERROR\b/i.test(trimmed)) return "error";
  if (/\bINFO\b/i.test(trimmed)) return "info";
  return "output";
}

let lineIdCounter = 0;
function nextLineId(): number {
  lineIdCounter += 1;
  return lineIdCounter;
}

/**
 * SimulatedTerminal — a mock, interactive terminal where learners can type
 * ROS2 CLI commands and see pre-programmed mock outputs. Provides a safe
 * "playground" without needing a real ROS2 install.
 */
export function SimulatedTerminal({
  commands,
  title = "ROS2 Terminal",
  welcomeMessage = [
    "# Welcome to the simulated ROS2 terminal.",
    "# Type a command below, or click a hint chip above.",
    "# This is a safe playground — nothing here affects a real robot.",
  ],
  hintCommands = [],
}: SimulatedTerminalProps) {
  const [input, setInput] = React.useState("");
  const [lines, setLines] = React.useState<OutputLine[]>(() =>
    welcomeMessage.map((text) => ({
      id: nextLineId(),
      kind: classifyLine(text) === "output" ? "welcome" : classifyLine(text),
      text,
    })),
  );
  const [history, setHistory] = React.useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState<number | null>(null);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Build a case-insensitive lookup map for pre-programmed commands.
  const commandMap = React.useMemo(() => {
    const map = new Map<string, SimulatedCommand>();
    for (const cmd of commands) {
      map.set(cmd.command.trim().toLowerCase(), cmd);
    }
    return map;
  }, [commands]);

  // Auto-scroll to bottom whenever lines change.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [lines]);

  const appendLines = React.useCallback(
    (entries: Array<{ kind: LineKind; text: string }>) => {
      setLines((prev) => [
        ...prev,
        ...entries.map((e) => ({ id: nextLineId(), ...e })),
      ]);
    },
    [],
  );

  const runCommand = React.useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        // Echo an empty prompt line so the terminal feels alive.
        appendLines([{ kind: "input", text: "" }]);
        return;
      }

      // Echo the typed command with a `$` prefix.
      appendLines([{ kind: "input", text: trimmed }]);

      const match = commandMap.get(trimmed.toLowerCase());
      if (match) {
        appendLines(
          match.output.map((text) => ({
            kind: classifyLine(text),
            text,
          })),
        );
      } else {
        appendLines([
          {
            kind: "error",
            text: `command not found: ${trimmed}. Try one of the hint commands above.`,
          },
        ]);
      }
    },
    [appendLines, commandMap],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input;
    if (value.trim() !== "") {
      setHistory((prev) => [...prev, value]);
    }
    setHistoryIndex(null);
    setInput("");
    runCommand(value);
  };

  const handleHintClick = (cmd: string) => {
    setInput(cmd);
    // Defer focus to next tick so the value is set first.
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      // Place caret at end.
      const len = cmd.length;
      inputRef.current?.setSelectionRange(len, len);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      e.preventDefault();
      const nextIdx =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx] ?? "");
    } else if (e.key === "ArrowDown") {
      if (history.length === 0 || historyIndex === null) return;
      e.preventDefault();
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx] ?? "");
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const renderLine = (line: OutputLine) => {
    switch (line.kind) {
      case "welcome":
        return (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words text-emerald-300/50 italic"
          >
            {line.text}
          </div>
        );
      case "input":
        return (
          <div key={line.id} className="flex whitespace-pre-wrap break-words">
            <span
              className="mr-2 select-none text-cyan-400"
              aria-hidden="true"
            >
              $
            </span>
            <span className="text-slate-200">{line.text}</span>
          </div>
        );
      case "comment":
        return (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words text-emerald-300/60 italic"
          >
            {line.text}
          </div>
        );
      case "info":
        return (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words text-cyan-300"
          >
            {line.text}
          </div>
        );
      case "error":
        return (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words text-rose-400"
          >
            {line.text}
          </div>
        );
      case "blank":
        return <div key={line.id} className="h-4" aria-hidden="true" />;
      case "output":
      default:
        return (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-words text-slate-300"
          >
            {line.text}
          </div>
        );
    }
  };

  return (
    <div className="my-6 w-full">
      {/* Hint chips */}
      {hintCommands.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Try:
          </span>
          {hintCommands.map((cmd, idx) => (
            <button
              key={`${cmd}-${idx}`}
              type="button"
              onClick={() => handleHintClick(cmd)}
              className="rounded-full border border-cyan-500/40 bg-cyan-500/5 px-3 py-1 font-mono text-xs text-cyan-300 transition-colors hover:border-cyan-400 hover:bg-cyan-500/15 hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              style={{ fontFamily: MONO_FONT_STACK }}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Terminal window */}
      <div
        className="overflow-hidden rounded-lg border border-white/10 bg-[#0a0e14] shadow-lg"
        onClick={focusInput}
        role="application"
        aria-label={title}
      >
        {/* Mac-style window header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#11161d] px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#ff5f56] ring-1 ring-black/20" />
            <span className="size-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/20" />
            <span className="size-3 rounded-full bg-[#27c93f] ring-1 ring-black/20" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 text-xs text-slate-400">
            <Terminal className="size-3.5 text-cyan-400" aria-hidden="true" />
            <span
              className="truncate"
              style={{ fontFamily: MONO_FONT_STACK }}
            >
              {title}
            </span>
          </div>
          {/* Spacer to balance the traffic lights on the left. */}
          <div className="w-12 sm:w-16" aria-hidden="true" />
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="max-h-80 overflow-y-auto px-4 py-3.5"
          style={{ fontFamily: MONO_FONT_STACK }}
        >
          <div className="space-y-1 text-[0.82rem] leading-relaxed">
            {lines.map(renderLine)}

            {/* Active prompt line */}
            <form
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <span
                className="mr-2 select-none text-cyan-400"
                aria-hidden="true"
              >
                $
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="Terminal command input"
                placeholder="type a command and press Enter…"
                className={cn(
                  "min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-200",
                  "placeholder:text-slate-600",
                  "caret-cyan-400 outline-none",
                  "focus:outline-none focus:ring-0",
                )}
                style={{ fontFamily: MONO_FONT_STACK }}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulatedTerminal;

"use client";

import * as React from "react";
import { Check, Copy, SquareTerminal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TerminalBlockProps {
  /** Command(s) to render. Multi-line strings are split on newlines. */
  children: React.ReactNode;
  /** Window title (defaults to "bash") */
  title?: string;
  className?: string;
}

type LineKind = "command" | "comment" | "output" | "blank";

interface ParsedLine {
  raw: string;
  kind: LineKind;
}

function toPlainText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join("");
  if (typeof node === "object" && "props" in node) {
    // @ts-expect-error - React element shape
    return toPlainText(node.props?.children);
  }
  return "";
}

function parseLine(line: string): ParsedLine {
  const trimmed = line.trim();
  if (trimmed === "") return { raw: line, kind: "blank" };
  if (/^#\s*Expected\b/i.test(trimmed) || /Expected Terminal Output/i.test(trimmed)) {
    return { raw: line, kind: "output" };
  }
  if (trimmed.startsWith("#")) return { raw: line, kind: "comment" };
  return { raw: line, kind: "command" };
}

function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(
    async (text: string) => {
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          try {
            document.execCommand("copy");
          } catch {
            /* no-op */
          }
          document.body.removeChild(textarea);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), timeout);
      } catch {
        /* no-op */
      }
    },
    [timeout],
  );

  return { copied, copy };
}

/**
 * TerminalBlock — a mac-style terminal window for displaying `ros2` CLI commands,
 * comments, and expected output. Pure styled monospace — no syntax highlighting lib.
 */
export function TerminalBlock({
  children,
  title = "bash",
  className,
}: TerminalBlockProps) {
  const text = React.useMemo(
    () => toPlainText(children).replace(/\n+$/, ""),
    [children],
  );

  const lines = React.useMemo<ParsedLine[]>(
    () => text.split("\n").map(parseLine),
    [text],
  );

  const { copied, copy } = useCopyToClipboard();

  const handleCopy = React.useCallback(() => {
    if (text) copy(text);
  }, [copy, text]);

  return (
    <div
      className={cn(
        "group my-6 overflow-hidden rounded-lg border border-border bg-[#0a0e14] shadow-lg",
        className,
      )}
      data-terminal-block=""
    >
      {/* Mac-style window header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#11161d] px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f56] ring-1 ring-black/20" />
          <span className="size-3 rounded-full bg-[#ffbd2e] ring-1 ring-black/20" />
          <span className="size-3 rounded-full bg-[#27c93f] ring-1 ring-black/20" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 text-xs text-slate-400">
          <SquareTerminal className="size-3.5 text-cyan-400" aria-hidden="true" />
          <span className="truncate font-mono">{title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy commands to clipboard"}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200",
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="overflow-x-auto px-4 py-3.5">
        <pre
          className="min-w-0 font-mono text-[0.82rem] leading-relaxed"
          style={{
            fontFamily:
              '"Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          <code className="block">
            {lines.map((line, idx) => {
              if (line.kind === "blank") {
                return <div key={idx} className="h-5" aria-hidden="true" />;
              }
              if (line.kind === "comment") {
                return (
                  <div
                    key={idx}
                    className="whitespace-pre text-slate-500 italic"
                  >
                    {line.raw}
                  </div>
                );
              }
              if (line.kind === "output") {
                return (
                  <div
                    key={idx}
                    className="whitespace-pre text-emerald-300/70"
                  >
                    {line.raw}
                  </div>
                );
              }
              return (
                <div key={idx} className="flex whitespace-pre">
                  <span
                    className="mr-2 select-none text-cyan-400"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <span className="text-slate-200">{line.raw}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default TerminalBlock;

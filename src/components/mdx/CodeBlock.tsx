"use client";

import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/store/progress-store";

export interface CodeBlockProps {
  /** C++ source code (mutually exclusive with single-language `children`) */
  cpp?: string;
  /** Python source code (mutually exclusive with single-language `children`) */
  python?: string;
  /** Optional filename / path label (e.g. `src/telemetry_node.cpp`) */
  title?: string;
  /** Fallback single-language code when neither cpp nor python provided */
  children?: React.ReactNode;
  /** Language hint for fallback children content (e.g. "bash", "cpp") */
  language?: string;
  className?: string;
}

type TabKey = "cpp" | "python" | "text";

interface LangConfig {
  label: string;
  prismLang: string;
  badge: string;
}

const LANG_CONFIG: Record<TabKey, LangConfig> = {
  cpp: { label: "C++", prismLang: "cpp", badge: "C++" },
  python: { label: "Python", prismLang: "python", badge: "PY" },
  text: { label: "Text", prismLang: "text", badge: "TXT" },
};

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
          // Fallback for non-secure contexts
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

/**
 * CodeBlock — a syntax-highlighted code block with optional C++ / Python tabs
 * and a copy-to-clipboard button. The active tab is synced to a global
 * `preferredLanguage` preference in the progress store, so switching to Python
 * on one block switches all blocks on the page.
 */
export function CodeBlock({
  cpp,
  python,
  title,
  children,
  language = "text",
  className,
}: CodeBlockProps) {
  const hasTabs = typeof cpp === "string" && typeof python === "string";
  const fallback = React.useMemo(
    () => toPlainText(children).replace(/\n$/, ""),
    [children],
  );

  // Sync with the global preferred language preference
  const preferredLanguage = useProgressStore((s) => s.preferredLanguage);
  const setPreferredLanguage = useProgressStore(
    (s) => s.setPreferredLanguage,
  );

  const [localTab, setLocalTab] = React.useState<TabKey>(
    hasTabs ? "cpp" : "text",
  );

  // When the global preference changes (or on first mount), sync the local tab.
  React.useEffect(() => {
    if (hasTabs && preferredLanguage) {
      setLocalTab(preferredLanguage);
    }
  }, [hasTabs, preferredLanguage]);

  const handleTabChange = React.useCallback(
    (key: TabKey) => {
      setLocalTab(key);
      // Persist the choice globally
      if (key === "cpp" || key === "python") {
        setPreferredLanguage(key);
      }
    },
    [setPreferredLanguage],
  );

  const { copied, copy } = useCopyToClipboard();

  const currentCode = hasTabs
    ? localTab === "cpp"
      ? (cpp as string)
      : (python as string)
    : fallback;

  const currentLang: TabKey = hasTabs ? localTab : "text";
  const prismLang = hasTabs
    ? LANG_CONFIG[localTab].prismLang
    : language || "text";

  const handleCopy = React.useCallback(() => {
    if (currentCode) copy(currentCode);
  }, [copy, currentCode]);

  // Line count for the "X lines" label
  const lineCount = currentCode ? currentCode.split("\n").length : 0;

  return (
    <div
      className={cn(
        "group relative my-6 overflow-hidden rounded-lg border border-border bg-[#0d1117] shadow-lg transition-shadow hover:shadow-cyan-500/5",
        className,
      )}
      data-codeblock=""
    >
      {/* Header bar: filename + copy */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-[#161b22] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <Terminal className="size-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
          <span className="truncate font-mono">
            {title ?? (hasTabs ? "snippet" : language || "code")}
          </span>
          {lineCount > 0 && (
            <span className="hidden shrink-0 text-[10px] text-slate-500 sm:inline">
              · {lineCount} lines
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-cyan-300"
            aria-hidden="true"
          >
            {hasTabs ? LANG_CONFIG[localTab].badge : (language || "txt").toUpperCase().slice(0, 4)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-all active:scale-95",
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
      </div>

      {/* Tab bar (only when both cpp and python provided) */}
      {hasTabs && (
        <div
          role="tablist"
          aria-label="Language selection"
          className="flex border-b border-white/5 bg-[#0d1117]"
        >
          {(["cpp", "python"] as const).map((key) => {
            const isActive = localTab === key;
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
                {LANG_CONFIG[key].label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-teal-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Code body */}
      <div className="codeblock-scroll overflow-x-auto">
        <SyntaxHighlighter
          language={prismLang}
          style={oneDark}
          showLineNumbers={currentCode.split("\n").length > 3}
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
        >
          {currentCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeBlock;

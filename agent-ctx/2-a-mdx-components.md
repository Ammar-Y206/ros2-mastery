# Task 2-a — MDX Components

**Agent:** full-stack-developer (MDX components)
**Task:** Create 4 custom MDX React components in `src/components/mdx/` — `Callout`, `CodeBlock`, `TerminalBlock`, `Quiz`. Dark high-tech theme, cyan/teal accents, shadcn/ui + lucide-react, TypeScript.

## Files created
1. `src/components/mdx/Callout.tsx` — server-compatible callout box (why/how/best-practice/pitfall). 4 distinct color tints (emerald / cyan / violet / rose) with matching lucide icons. Pitfall gets a red glow/ring.
2. `src/components/mdx/CodeBlock.tsx` — `'use client'`. C++/Python tabs (only when both provided, else fallback to `children`). Header with filename + lang badge + copy button. Uses `react-syntax-highlighter` Prism + `oneDark` theme on a `#0d1117` GitHub-dark container.
3. `src/components/mdx/TerminalBlock.tsx` — `'use client'`. Mac-style window with 3 traffic lights. Parses lines: `$`-prefixed commands (cyan prompt), `#` comments (italic muted, no prompt), `# Expected...` output (dim emerald, no prompt). Copy button.
4. `src/components/mdx/Quiz.tsx` — `'use client'`. Per-question locked answers, immediate correct/wrong feedback (CheckCircle2 / XCircle), explanation panel, aggregate score + `Progress` bar, reset button, `GraduationCap` header icon.

## Supporting file
- `src/types/react-syntax-highlighter.d.ts` — ambient module declarations (no `@types/react-syntax-highlighter` shipped). Declares default export, `Prism`, `Light`, and the two theme subpaths (`one-dark`, `vsc-dark-plus`).

## Color system (for downstream agents)
- cyan (primary)   — `#06b6d4` / oklch(0.72 0.15 195) — CodeBlock tabs, TerminalBlock prompt, Quiz accent.
- emerald (success) — `#10b981` — Callout `why`, Quiz correct.
- violet (best)    — `#8b5cf6` — Callout `best-practice`.
- rose (danger)    — `#f43f5e` — Callout `pitfall`, Quiz wrong.

**No indigo/blue used.**

## Props cheat-sheet (for MDX authors)
```mdx
<Callout type="why" title="Optional override">body…</Callout>
<Callout type="how">body…</Callout>
<Callout type="best-practice">body…</Callout>
<Callout type="pitfall">body…</Callout>

<CodeBlock
  cpp={`#include "rclcpp/rclcpp.hpp"\nint main(){return 0;}`}
  python={`import rclpy\nrclpy.init()`}
  title="src/telemetry_node.cpp"
/>

<CodeBlock language="bash" title="install.sh">{`apt install ros-humble-desktop`}</CodeBlock>

<TerminalBlock title="bash">{`# Build the workspace\ncolcon build --symlink-install\n# Expected: 0 errors`}</TerminalBlock>

<Quiz
  title="Knowledge Check"
  questions={[
    {
      id: "q1",
      question: "Which command lists active ROS2 nodes?",
      options: ["ros2 node list", "ros2 list nodes", "rosnode list", "ros2 nodes"],
      correctIndex: 0,
      explanation: "`ros2 node list` is the canonical command in ROS2.",
    },
  ]}
/>
```

## Validation
- `bun run lint` → 0 errors, 0 warnings.
- dev.log shows successful Turbopack recompiles after edits.

## Notes / decisions
- CodeBlock's `cpp`/`python` props are RAW strings (not double-escaped). MDX authors should pass them as JS template literals (`{`...`}`) or via frontmatter, NOT as JSX text children, so backticks/quotes are preserved verbatim.
- The `children` fallback path in CodeBlock uses a `toPlainText()` reducer to strip JSX wrapping (so `<CodeBlock>{someString}</CodeBlock>` still works).
- Quiz answers are locked once selected — to retry, user clicks "Reset Quiz" (which clears all answers, not just one).
- All copy buttons have a `document.execCommand('copy')` fallback for non-secure contexts.

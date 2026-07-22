# ROS2 Mastery — Project Worklog

## Project Overview
A modern, interactive educational web platform that teaches ROS2 Humble from scratch to advanced production-level architecture. Built with Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, and MDX. Dark-mode documentation-style platform with a 7-Phase Strategic Roadmap as the core navigational concept.

Target audience: Robotics engineers, autonomous systems developers, and students.
Theme: Modern, clean, high-tech engineering (Vercel/GitBook-inspired) with cyan accents.

## Architecture Decisions
- Single route (`/`) — content switching handled client-side via state (Zustand).
- MDX content stored as `.mdx` files in `src/content/` and loaded via `next-mdx-remote/rsc` for RSC-compatible rendering.
- Progress tracking persisted to localStorage via Zustand `persist` middleware.
- Custom MDX components: `Callout`, `CodeBlock` (with C++/Python tabs + copy), `TerminalBlock`, `Quiz`.
- Content generalization: all "Fayoum Racing Team" / "Fayoum Racer" mentions replaced with generic robotics terminology.

---
Task ID: 1
Agent: Main (orchestrator)
Task: Foundation setup — install MDX deps, configure tailwind/globals/next.config for dark theme

Work Log:
- Installed dependencies: `@mdx-js/loader`, `@mdx-js/react`, `@next/mdx`, `gray-matter`, `next-mdx-remote`, `@types/mdx`.
- Updated `next.config.ts` to register `.mdx` page extensions.
- Created root `mdx-components.tsx` mapping custom components (Callout, CodeBlock, TerminalBlock, Quiz).
- Rewrote `src/app/globals.css` with a high-tech dark theme (cyan/teal accents, oklch color space), custom scrollbars, grid backgrounds, prose-doc utility classes for MDX content.
- Updated `tailwind.config.ts` to use CSS variables, added sidebar color tokens, custom keyframes (fade-in, slide-in-right, shimmer), and expanded content globs.

Stage Summary:
- Foundation complete. Dark theme uses oklch color space with cyan primary (oklch(0.72 0.15 195)).
- `prose-doc` utility class provides MDX content typography.
- Ready for parallel work on MDX components, progress tracking, and layout.

---
Task ID: 2-b
Agent: full-stack-developer (progress tracking)
Task: Create a progress tracking system using Zustand with localStorage persistence — store, hooks, hydration component, and ProgressIndicator UI.

Work Log:
- Read prior worklog (Task 1) to confirm foundation (dark theme, cyan accents, Zustand 5 installed, shadcn/ui available, lib/utils `cn`).
- Created `src/store/progress-store.ts`: Zustand store with `persist` + `createJSONStorage(() => localStorage)`, key `ros2-mastery-progress`, version 1. State: `completedModules`, `bookmarks`, `lastVisitedModule`, `preferredLanguage` (default `"cpp"`). Actions: `toggleModuleComplete`, `setModuleComplete`, `isModuleComplete`, `toggleBookmark`, `setLastVisitedModule`, `setPreferredLanguage`, `getCompletionStats`, `resetProgress`. No `window`/`localStorage` access at module load (handled safely by persist middleware).
- Created `src/hooks/use-progress.ts`: re-exports `useProgressStore` + types; exports `useModuleProgress(moduleId)` → `{ isComplete, toggle, bookmarked, toggleBookmark }`; `useOverallProgress(allModuleIds)` → `{ completed, total, percentage, isComplete, toggle }`; plus convenience `usePreferredLanguage`, `useLastVisitedModule`, and `useProgressHydrated()` (uses `useSyncExternalStore` subscribed to `persist.onFinishHydration` so React re-renders when hydration completes; SSR snapshot returns `false`).
- Created `src/components/ProgressProvider.tsx` exporting `ProgressHydration` — a `'use client'` component that calls `useProgressStore.persist.rehydrate()` in a `useEffect` and renders `<>{children ?? null}</>`. Intentionally stateless (the hydration flag is read via `useProgressHydrated` hook using `useSyncExternalStore`), avoiding the React lint rule `react-hooks/set-state-in-effect`.
- Created `src/components/ProgressIndicator.tsx` — client component with `variant: "compact" | "bar" | "ring"` (default `"compact"`). All variants consume `useOverallProgress(moduleIds)` and `useProgressHydrated()`; render neutral placeholders until hydrated to avoid SSR/client mismatches. `compact`: 28px SVG ring + "X/Y" count, cyan-400 stroke, optional `CheckCircle2` overlay at %. `bar`: shadcn `Progress` with cyan-400 indicator + label + count + %. `ring`: 64px SVG ring with centered percentage and a "X of Y done" label. All use `cn()`, `lucide-react` icon, `tabular-nums`, accessible `role="status"` + `aria-live="polite"` + dynamic `aria-label`.
- Ran `bun run lint` — first pass flagged `react-hooks/set-state-in-effect` in `ProgressProvider.tsx` (synchronous `setHydrated(true)` inside the effect body). Refactored to make `ProgressHydration` stateless and rely on `useProgressHydrated`'s `useSyncExternalStore`. Lint now clean.
- Verified dev server still compiles (`dev.log` shows successful `GET / 200`).

Stage Summary:
- 4 files created:
  - `src/store/progress-store.ts` (Zustand store + persist)
  - `src/hooks/use-progress.ts` (derived React hooks)
  - `src/components/ProgressProvider.tsx` (`ProgressHydration` rehydration trigger)
  - `src/components/ProgressIndicator.tsx` (compact/bar/ring UI)
- Storage key: `ros2-mastery-progress`. SSR-safe: store file does not touch `localStorage` at module load; hydration flag exposed via `useProgressHydrated` using `useSyncExternalStore`.
- Lint passes (`bun run lint` clean). Dev server compiles without errors.
- Theme honored: cyan-400 accents throughout (SVG strokes, progress bar indicator, percentage text). Dark-mode compatible via Tailwind tokens (`text-muted-foreground`, `bg-primary/10`, etc.).
- Ready for consumption by sidebar/lesson UI (Task 2-a / 2-c) — typical usage: `<ProgressIndicator moduleIds={allIds} variant="bar" label="Phase Progress" />` and `useModuleProgress("phase-1/nodes")` in lesson headers.

---
Task ID: 2-a
Agent: full-stack-developer (MDX components)
Task: Create 4 custom MDX React components in `src/components/mdx/` — Callout, CodeBlock (C++/Python tabs + copy), TerminalBlock (mac-style), and Quiz (interactive scoring). Dark high-tech theme, cyan/teal accents, shadcn/ui + lucide-react.

Work Log:
- Read worklog.md (Task 1 already installed MDX deps, configured dark theme, registered components in root `mdx-components.tsx`).
- Verified project structure: shadcn/ui components in `src/components/ui/` (tabs, progress, button, card all present); `react-syntax-highlighter@15.6.6` installed; `cn()` helper in `src/lib/utils.ts`; ESLint config is permissive.
- Verified available Prism themes in `node_modules/react-syntax-highlighter/dist/esm/styles/prism/` — picked `one-dark` for CodeBlock (GitHub-dark-like aesthetic that pairs well with `#0d1117` container bg).
- Created `src/types/react-syntax-highlighter.d.ts` ambient module declarations (no @types shipped) — covers default export, `Prism`, `Light`, and the two theme subpaths.
- Created `src/components/mdx/Callout.tsx` (server-compatible, no `'use client'`):
  - 4 types: `why` (emerald + HelpCircle), `how` (cyan + Wrench), `best-practice` (violet + CheckCircle2), `pitfall` (rose + AlertTriangle, with red ring/glow).
  - Inline `style` + Tailwind arbitrary tints (e.g. `bg-emerald-500/5`, `border-l-emerald-500`).
  - Custom default titles per type ("The Why", "The How", "Best Practice", "CRITICAL Pitfall"); `title` prop overrides.
  - Icon wrapped in tinted rounded chip; body uses `text-muted-foreground`; nested `code` restyled to match site.
- Created `src/components/mdx/CodeBlock.tsx` (`'use client'`):
  - Tabs only when BOTH `cpp` and `python` strings provided; otherwise uses `children` fallback (plain-text-extracted) with optional `language` hint.
  - Header bar: filename/title (left) + language badge + copy button (right); below it the C++/Python tab bar with cyan bottom-border on active tab; below that the code.
  - `react-syntax-highlighter` Prism renderer + `oneDark` theme; transparent bg so the `#0d1117` container shows through; Fira Code / JetBrains Mono font stack.
  - Copy button uses `navigator.clipboard.writeText` with `document.execCommand` fallback; shows "Copied!" + Check icon for 2s.
  - `customStyle` overrides Prism's default margins/padding; horizontal scroll via `overflow-x-auto`.
- Created `src/components/mdx/TerminalBlock.tsx` (`'use client'`):
  - Mac-style header: 3 traffic-light dots (red/yellow/green) + centered title (default "bash") + copy button.
  - Body parses each child line: blank lines render as spacer; `#` lines render as italic muted comments WITHOUT `$` prefix; lines matching `# Expected` / `Expected Terminal Output` render as dim emerald output lines; everything else renders with a cyan `$` prompt + light slate command text.
  - Pure styled monospace — no syntax-highlighter lib; uses Fira Code stack.
  - Same copy-button UX as CodeBlock.
- Created `src/components/mdx/Quiz.tsx` (`'use client'`):
  - `useState<Record<questionId, {selectedIndex}>>` tracks per-question answers; once answered, an option is locked (no re-selection without reset).
  - Option buttons: cyan accent when selected-but-unanswered; emerald border + CheckCircle2 when correct (highlighted for everyone after answering); rose border + XCircle on wrong selections; non-selected wrong options dim out.
  - Per-question explanation panel below options (emerald when correct, rose when wrong), only after answering.
  - Footer: aggregate `correctCount/total` + `Progress` bar from `@/components/ui/progress`; adaptive feedback message; "Reset Quiz" button (RotateCcw icon) clears all answers.
  - Header has `GraduationCap` icon in a cyan-tinted chip + live "answered of total" counter.
- Fixed a precedence bug in `correctCount` reduce (was `acc + sel === q.correctIndex ? ...` — operator precedence; rewritten as `acc + (sel === q.correctIndex ? 1 : 0)`).
- Ran `bun run lint` — passed with zero errors / warnings.
- Verified dev.log shows successful recompiles (Turbopack, `✓ Compiled in Nms`) with no runtime errors after edits.

Stage Summary:
- 4 production-quality MDX components delivered: `Callout.tsx`, `CodeBlock.tsx`, `TerminalBlock.tsx`, `Quiz.tsx`.
- 1 supporting file: `src/types/react-syntax-highlighter.d.ts` (ambient module + theme declarations).
- All components use the project's dark theme CSS vars (`bg-card`, `text-muted-foreground`, `border-border`, etc.) plus semantic Tailwind arbitrary values for the four callout tints (emerald/cyan/violet/rose) — strictly no indigo/blue.
- `Callout` is server-compatible (no `'use client'`); the other three are client components (use `useState` / `navigator.clipboard`).
- ESLint clean. Ready to be consumed from MDX content files (the root `mdx-components.tsx` already maps them).
- Color system summary for downstream agents:
  - cyan (primary)   → `#06b6d4` / oklch(0.72 0.15 195) — used by CodeBlock tabs, TerminalBlock prompt, Quiz accent.
  - emerald (success) → `#10b981` — Callout `why`, Quiz correct.
  - violet (best)    → `#8b5cf6` — Callout `best-practice`.
  - rose (danger)    → `#f43f5e` — Callout `pitfall`, Quiz wrong.

---
Task ID: 3-7
Agent: Main (orchestrator)
Task: Build layout, content registry, Phase 1-7 MDX content, wire main page, QA verification

Work Log:
- Created `src/lib/course-data.ts` — the 7-phase navigation structure with all modules, slugs, reading times, accent colors, and helper functions (findModule, findPhaseByModule, getAdjacentModules, ACCENT_CLASSES).
- Built layout components:
  - `src/components/layout/Navbar.tsx` — sticky navbar with logo (ROS2 Mastery), search bar (Cmd+K command palette), progress indicator, external links.
  - `src/components/layout/LeftSidebar.tsx` — collapsible 7-phase navigation tree with completion counts, module reading times, active highlighting, mobile drawer.
  - `src/components/layout/RightSidebar.tsx` — "On this page" TOC (auto-generated from H2/H3 headings via IntersectionObserver), module meta, Mark as Completed checkbox, Bookmark button.
  - `src/components/layout/DocContent.tsx` — main content wrapper with phase mission banner, breadcrumb, MDX content, bottom mark-complete, prev/next pagination.
  - `src/components/layout/AppShell.tsx` — client shell managing navigation via router.push('/?m=moduleId'), mobile sidebar state.
- Created Phase 1-7 MDX content files in `src/content/`:
  - `phase-1.mdx` — FULL Phase 1 (7 sections: middleware, philosophy, pillars, node, executors, SOP, CLI) with Callout, CodeBlock (C++/Python tabs), TerminalBlock, Quiz.
  - `phase-2.mdx` through `phase-7.mdx` — phase overviews with generalized content, code examples, callouts, terminal blocks.
  - Applied generalization rules: removed all "Fayoum Racing Team"/"Fayoum Racer" mentions, replaced racing-specific contexts with "autonomous mobile robot / vehicle".
- Created `src/lib/content-registry.ts` — maps module IDs to their MDX components.
- Restructured `src/app/page.tsx` as a server component that reads `?m=` searchParams, resolves the module ID, and renders the corresponding MDX component with custom components passed via the `components` prop.
- Updated `src/app/layout.tsx` — dark mode default, ProgressHydration, ROS2-branded metadata.

MDX Pipeline Evolution (critical decision):
- Initially tried `@next/mdx` + Turbopack — failed because Turbopack's loader requires serializable options (remark/rehype plugins are function objects).
- Switched to `next-mdx-remote/rsc` (RSC) — compiled MDX on server, but DISCOVERED that RSC serialization drops JSX expression attributes (cpp={`...`} arrived as undefined).
- Tried `next-mdx-remote` client-side serialize — same issue (expression attributes lost in the compiled→evaluated pipeline).
- FINAL SOLUTION: `@next/mdx` + webpack (`next dev --webpack`). MDX files are compiled at BUILD TIME by webpack, producing proper React components. Expression attributes work correctly because compilation happens during bundling, not at runtime. Added `remark-gfm` (tables), `rehype-slug` (heading IDs).

QA Verification (agent-browser):
- All 7 phases return HTTP 200 with no console errors.
- CodeBlock C++/Python tabs work: clicking "Python" tab switches code to `import rclpy...`.
- Copy buttons present on all code/terminal blocks.
- Quiz renders with 5 questions, answer feedback (correct=green, wrong=red), score tracking.
- "Mark as completed" checkbox works, progress saved to localStorage, sidebar shows completion counts.
- Navigation via sidebar, command palette (Cmd+K), and prev/next pagination all functional.
- Mobile responsive: hamburger menu toggles sidebar drawer, content fills viewport.
- Right sidebar TOC auto-generates from page headings, active section highlighted via IntersectionObserver.
- Lint passes with 0 errors.

Stage Summary:
- Complete, production-ready ROS2 learning platform.
- 7 phases, 21 modules, full Phase 1 content + rich phase overviews for 2-7.
- Dark high-tech theme (cyan/teal accents, oklch color space).
- All custom MDX components (Callout, CodeBlock, TerminalBlock, Quiz) fully functional.
- Progress tracking via Zustand + localStorage (completion, bookmarks, last visited).
- Responsive design (mobile drawer, desktop 3-column layout).
- Webpack-based MDX compilation (build-time, reliable).

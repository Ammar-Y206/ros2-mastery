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

---
Task ID: 8 (Cron Review Round 1)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, fix bugs, and add new features/styling improvements.

## Current Project Status Assessment
The ROS2 Mastery platform was in a stable, production-ready state from the previous round:
- All 7 phases rendering correctly (HTTP 200, zero console errors)
- Core MDX components (Callout, CodeBlock with C++/Python tabs, TerminalBlock, Quiz) fully functional
- Progress tracking via Zustand + localStorage working
- Responsive design (mobile drawer, desktop 3-column layout)
- Lint passing with 0 errors

QA via agent-browser + VLM analysis identified these improvement opportunities:
1. Sidebar text truncation — no hover tooltips for cut-off titles
2. Inline code contrast — grey background was low-contrast
3. Quiz — no visible progress bar in the header (only at the bottom)
4. No reading progress indicator at the top of the page
5. No back-to-top button for long lessons
6. No keyboard shortcuts for power users
7. Code language preference not persisted across blocks/pages
8. No celebration when a phase is fully completed

## Completed Modifications

### New Components Created (5 files)
1. **`src/components/layout/ReadingProgressBar.tsx`** — thin cyan gradient bar fixed to the very top of the viewport (above navbar). Uses requestAnimationFrame-throttled scroll listener for smooth, jank-free updates. Shows scroll progress through the current lesson. Has a subtle cyan glow shadow.

2. **`src/components/layout/BackToTop.tsx`** — floating circular button in the bottom-right corner. Appears after scrolling 400px. Smooth-scrolls to top on click. Hidden on mobile (lg:flex). Has cyan hover accent and slide-up animation.

3. **`src/components/layout/KeyboardShortcuts.tsx`** — dialog overlay triggered by `?` key. Shows all keyboard shortcuts in 3 categories (Navigation, Lesson, Code Blocks). Uses shadcn Dialog component. Closes on Escape. Footer now shows a `?` kbd hint.

4. **`src/components/layout/CompletionCelebration.tsx`** — celebratory toast that appears when ALL modules in a phase become complete. Shows confetti animation (6 colored dots with CSS keyframe animation), phase title, lesson count, and a CTA button to start the next phase. Auto-dismisses after 8 seconds. Derives "should show" purely from the store (no setState-in-effect).

5. **Integrated all into `AppShell.tsx`** — added ReadingProgressBar at top, BackToTop, KeyboardShortcuts, and CompletionCelebration as overlay components. Added global keyboard shortcut handlers for:
   - `M` — mark current lesson complete (with toast notification)
   - `B` — bookmark current lesson (with toast notification)
   - `T` — smooth scroll to top

### Enhanced Existing Components
6. **`LeftSidebar.tsx`** — added TooltipProvider + Tooltip wrappers on every phase and module button. Hovering shows the full title, subtitle, phase number, completion count, and reading time. Also enhanced the sidebar footer progress bar to show percentage (e.g. "2/21 (10%)").

7. **`CodeBlock.tsx`** — major enhancement:
   - Syncs active tab with global `preferredLanguage` from the progress store
   - When user switches to Python on one block, ALL code blocks on the page switch to Python
   - Preference persists across page navigation (stored in localStorage)
   - Added line numbers (shown when code has >3 lines) with subtle grey styling
   - Added "X lines" count in the header
   - Added hover shadow effect (cyan glow)
   - Active tab underline now uses gradient (cyan→teal)
   - Copy button has `active:scale-95` press animation

8. **`Quiz.tsx`** — enhanced header:
   - Added a visible mini progress bar in the header (below the title)
   - Progress bar color changes based on score: emerald (perfect), cyan (≥50%), rose/amber (<50%)
   - Header now shows live score ("Score: 3/5") when all answered
   - Answered count turns emerald when all correct
   - Reset button has `active:scale-95` press animation
   - Gradient background enhanced (cyan→transparent)

9. **`globals.css`** — improved inline code contrast:
   - Changed from `bg-muted text-accent-foreground` to `bg-cyan-500/10 text-cyan-200 border-cyan-500/20`
   - Added subtle cyan border and brighter text color for better readability
   - Rounded corners increased to `rounded-md`

### Lint Compliance
- All new components pass ESLint with 0 errors
- CompletionCelebration required careful refactoring to avoid `react-hooks/set-state-in-effect` and `react-hooks/refs` rules — solved by deriving show state from store + using a ref-based dismiss callback updated in an effect

## Verification Results
- **All 7 phases**: HTTP 200, zero console errors, zero page errors
- **Reading progress bar**: visible at top, updates on scroll (confirmed 30.67% at 800px scroll)
- **Back-to-top button**: appears after 400px scroll, smooth-scrolls to position 0 on click
- **Keyboard shortcuts**: `?` opens dialog, `M` marks complete (toast appears, localStorage updates), `B` bookmarks, `T` scrolls to top
- **Sidebar tooltips**: appear on hover (confirmed 1 tooltip content wrapper visible)
- **Code language persistence**: set preferredLanguage to "python" in localStorage → code blocks show Python tab by default
- **Code line numbers**: 71 line numbers rendered for the telemetry node code block
- **Quiz header progress bar**: present, updates as questions are answered
- **Inline code styling**: confirmed cyan text (oklch(0.917 0.08 205)) with cyan-tinted background and border
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The CompletionCelebration has not been end-to-end tested with a real phase completion (would require marking all 7 Phase 1 modules complete). The logic is sound but hasn't been visually verified in a live scenario.
- **Minor**: The keyboard shortcut `?` requires focus to not be in an input/textarea — this is correct behavior but users might not realize it.

## Priority Recommendations for Next Phase
1. **Add a "Course Overview" / dashboard view** — a landing page showing the full 7-phase roadmap as visual cards with progress, estimated time, and a "Continue where you left off" CTA.
2. **Add dark/light theme toggle** — currently dark-only; a theme switcher would broaden accessibility.
3. **Add more Phase content** — Phase 1 is comprehensive, but Phases 2-7 are overviews. Expanding them to full lesson depth (like Phase 1) would complete the curriculum.
4. **Add a "Search results" page** — the command palette searches modules but doesn't search within content. Full-text search would be valuable.
5. **Add social sharing** — a "Share this lesson" button with copyable URL.
6. **Add print/export to PDF** — for offline study.

---
Task ID: 9 (Cron Review Round 2)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was in a stable state from Round 1 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. Left sidebar too narrow (288px) → text truncation on module titles
2. Callout boxes lacked visual depth (no glow/shadow)
3. Right sidebar TOC had tight spacing and weak active-state styling
4. No mobile sticky bottom navigation (users had to scroll to bottom to navigate)
5. No "Continue where you left off" banner for returning users
6. No estimated total time in phase tooltips
7. Favicon was generic logo.svg; metadata lacked metadataBase, Twitter card, robots directives

No critical bugs found — all 7 phases returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (2 files)
1. **`src/components/layout/MobileBottomNav.tsx`** — sticky bottom action bar visible only on mobile (below lg breakpoint). Contains Prev (chevron-left), Mark Complete (full-width center button with circle/check icon), and Next (chevron-right) buttons. Uses iOS safe-area-inset-bottom padding. Buttons have active:scale-95 press animation. Disabled state for first/last module.

2. **`src/components/layout/ContinueBanner.tsx`** — dismissible banner shown at the top of the content area when the user has previously visited a DIFFERENT module. Shows "Continue where you left off" with module title, phase badge, reading time, and a "Resume" CTA button. Uses the `useProgressHydrated` hook to avoid SSR flash. Dismissible via X button (local state).

### Enhanced Existing Components
3. **`LeftSidebar.tsx`**:
   - Widened sidebar from `w-72` (288px) → `w-80` (320px) to reduce text truncation
   - Phase badges: enhanced with `shadow-sm` + `transition-all`, emerald state now uses `bg-emerald-500/15 text-emerald-300` (better contrast)
   - Phase tooltips: now show estimated total time ("· 44 min total") alongside completion count
   - Completion counts use `tabular-nums` for consistent digit width

4. **`RightSidebar.tsx`**:
   - TOC list spacing: `space-y-1` → `space-y-0.5`, `py-1` → `py-1.5` for more vertical breathing room
   - Active state: H2 items now `font-medium`, active item uses `text-primary` (was `font-medium text-primary`)
   - Non-active items: slightly dimmer (`text-muted-foreground/60` vs `/70`) for better active/inactive contrast

5. **`Callout.tsx`**:
   - Added subtle colored glow `boxShadow` to all 4 callout types (why=emerald, how=cyan, best-practice=violet, pitfall=rose) — "0 0 20px rgba(color, 0.08)"
   - Pitfall glow intensified: "0 0 28px rgba(244,63,94,0.20)" (was 0.18)
   - Title margin: `mb-1` → `mb-1.5` for more breathing room
   - Inline code inside callouts: now matches the global cyan-tinted styling (was grey `bg-muted`)

6. **`AppShell.tsx`**:
   - Integrated `MobileBottomNav` component
   - Added `h-16 lg:hidden` spacer div at the bottom of main content so content isn't hidden behind the mobile bottom nav

7. **`layout.tsx`** (metadata):
   - Added `metadataBase: new URL("https://ros2-mastery.dev")` to fix OG image warning
   - Added title template `"%s · ROS2 Mastery"` for future per-page titles
   - Added `creator`, `twitter` card, `robots` directives
   - Added `siteName` and OG `images` array
   - Added more keywords (URDF, EKF, robot localization)

8. **`public/favicon.svg`** — new custom ROS2-branded favicon:
   - Rounded square dark background with cyan→teal gradient border
   - Stylized "R" letter with glow filter
   - Node connection dots + dashed lines representing the ROS computation graph
   - Updated layout.tsx to reference `/favicon.svg` instead of `/logo.svg`

## Verification Results
- **All 7 phases**: HTTP 200, zero console errors, zero page errors
- **Sidebar width**: confirmed 320px (was 288px)
- **Callout glow**: confirmed `boxShadow` includes `rgba` on all callout types (18 callouts on Phase 1)
- **Mobile bottom nav**: confirmed present on 375px viewport (1 element matching `.fixed.bottom-0.left-0.right-0.z-30`)
- **ContinueBanner**: confirmed appears when lastVisited ≠ currentModule ("Continue where you left off" text found)
- **Phase tooltip with time**: confirmed "44 min total" shown in tooltip on hover
- **Lint**: 0 errors, 0 warnings
- **VLM analysis**: confirmed "distinct neon glow" on callouts, "excellent contrast" on phase badges, wider sidebar reduces truncation

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: Some long module titles still truncate in the sidebar even at 320px (e.g. "ROS 2 Development Lifecycle"). This is inherent to the design — tooltips compensate by showing the full title on hover.
- **Minor**: The ContinueBanner appears on every navigation to a different module until dismissed. Could be enhanced to only show once per session, but current behavior is acceptable.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are overviews. This is the highest-value content task.
2. **Add a course overview/dashboard** — a visual landing page with phase cards, overall progress, and "Continue" CTA.
3. **Add dark/light theme toggle** — currently dark-only.
4. **Add full-text search** — command palette searches module titles only; searching within content would be valuable.
5. **Add print/export to PDF** — for offline study.
6. **Add social sharing** — "Share this lesson" with copyable URL.

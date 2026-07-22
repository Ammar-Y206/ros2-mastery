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

---
Task ID: 10 (Cron Review Round 3)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 2 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. Lack of surface variation — sidebar, content, and right-rail were too similar in shade
2. No micro-interactions on sidebar items (hover slide-right effect)
3. No share/social feature
4. No course overview/dashboard — the #1 recommendation from Round 2
5. TOC hierarchy could be more visually distinct

No critical bugs found — all 7 phases returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (3 files)
1. **`src/components/layout/CourseOverview.tsx`** — full-screen dashboard shown when visiting `/` without a `?m=` param. Features:
   - Hero section with animated pulse indicator, gradient title, 4 stat cards (Phases, Lessons, Total Time, Your Progress), CTA buttons ("Continue Learning" / "Browse Lessons"), and overall progress bar
   - 7-phase card grid (responsive: 1/2/3 columns) with phase number badges, icons, mission excerpts, first 2 objectives, estimated time, per-phase progress bar, and hover scale animation
   - Smart "Continue Learning" — finds the next incomplete module (prefers last visited if incomplete)
   - Grid background pattern + gradient glow for visual depth

2. **`src/components/layout/OverviewWrapper.tsx`** — client wrapper that wires CourseOverview to Next.js router navigation

3. **`src/components/layout/ShareButton.tsx`** — copies lesson URL to clipboard with toast notification. Two variants: `icon` (compact, for breadcrumb) and `full` (with label, for CTAs). Uses Tooltip for hover hint, Check icon feedback for 2s.

### Enhanced Existing Components
4. **`page.tsx`** — restructured to show CourseOverview when no `?m=` param is present, and AppShell with lesson content when a module is specified. This makes the root URL (`/`) a proper landing page.

5. **`Navbar.tsx`** — logo click now navigates to `/` (Course Overview) instead of `phase-1/middleware`. Added `useRouter` import for direct navigation.

6. **`RightSidebar.tsx`** — background changed from `bg-background/40` to `bg-[oklch(0.16_0.018_255)]/60 backdrop-blur-sm` — a slightly lighter shade than the main content, creating the three-tier surface variation recommended by VLM (sidebar=darkest, content=mid, right-rail=lightest).

7. **`LeftSidebar.tsx`** — module items now have:
   - `hover:translate-x-0.5` — subtle slide-right effect on hover
   - `transition-all duration-200` — smooth animation
   - Icon `group-hover:scale-110` — icons grow slightly on hover
   - Changed from `transition-colors` to `transition-all` for the slide effect

## Verification Results
- **All 7 phases**: HTTP 200, zero console errors, zero page errors
- **Course Overview**: HTTP 200, hero section with 4 stats, 7 phase cards rendered
- **Logo click**: navigates to `/` (overview) correctly
- **Phase card click**: navigates to the first incomplete module in that phase
- **"Continue Learning" button**: navigates to next incomplete module (phase-1/philosophy after phase-1/middleware was completed)
- **Share button**: "Link copied" toast appears, URL copied to clipboard
- **Mobile overview**: 7 cards render, page is scrollable on 375px viewport
- **Lint**: 0 errors, 0 warnings
- **VLM analysis**: confirmed "high-end Dark Mode aesthetic", "excellent hierarchy", "spacious and uncluttered" layout

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The CourseOverview `continueTarget` computation is not memoized (runs on every render) but is lightweight (21-module iteration). Acceptable for this scale.
- **Minor**: The phase card top accent bar uses inline style for the gradient — could be refactored to use Tailwind dynamic classes, but works correctly.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add dark/light theme toggle** — currently dark-only; a theme switcher would broaden accessibility.
3. **Add full-text search** — command palette searches module titles only; searching within content would be valuable.
4. **Add print/export to PDF** — for offline study.
5. **Add progress export/import** — allow users to backup/restore their progress via JSON file.
6. **Add "reset progress" settings panel** — currently no UI to reset all progress (store action exists but no button).

---
Task ID: 11 (Cron Review Round 4)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 3 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No dark/light theme toggle — dark-only; a theme switcher was the #2 recommendation from Round 3
2. No settings panel — no UI to reset progress (store action existed but no button)
3. Phase cards had truncated mission text (line-clamp-2) and inconsistent heights
4. No hover lift effect on cards (only scale)
5. Card grid spacing was tight (gap-5)

No critical bugs found — all 7 phases returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (3 files)
1. **`src/components/ThemeProvider.tsx`** — wraps next-themes with defaults: `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`, `disableTransitionOnChange`, `storageKey="ros2-mastery-theme"`. Client component.

2. **`src/components/layout/ThemeToggle.tsx`** — dropdown button with Moon/Sun icons. Uses `useTheme()` from next-themes. Includes a mounting guard (`useState(false)` → `useEffect` sets true) to avoid SSR hydration mismatch. Dropdown menu with Light (Sun/amber) and Dark (Moon/cyan) options, highlighting the active theme with `bg-accent`.

3. **`src/components/layout/SettingsDialog.tsx`** — gear-icon button opening a dialog with 3 progress management actions:
   - **Export Progress** — downloads localStorage data as a timestamped JSON file (`ros2-mastery-progress-YYYY-MM-DD.json`)
   - **Import Progress** — hidden file input reads a JSON file, validates it, writes to localStorage, rehydrates the store
   - **Reset All Progress** — AlertDialog confirmation before calling `resetProgress()`, styled with rose/danger theme
   - All actions show toast notifications on success/failure

### Enhanced Existing Components
4. **`layout.tsx`**:
   - Wrapped everything in `<ThemeProvider>` — removed hardcoded `className="dark"` from `<html>`, letting next-themes manage the class based on localStorage
   - Theme now persists across page reloads via `storageKey="ros2-mastery-theme"`

5. **`Navbar.tsx`**:
   - Added `ThemeToggle` + `SettingsDialog` to the navbar (between progress indicator and external links)
   - Both are in a flex container with `gap-0.5`

6. **`CourseOverview.tsx`**:
   - Added floating top-right controls (`fixed right-4 top-4 z-50`) with `ThemeToggle` + `SettingsDialog` — visible on the overview dashboard which has no navbar
   - **Phase cards improved**:
     - Removed `line-clamp-2` from mission text — now shows full text naturally
     - Removed `line-clamp-1` from objectives — full text
     - Added `h-full` to card button + `flex flex-col` so all cards in a row match height (footer pushed to bottom with `mt-auto`)
     - Hover effect: `hover:scale-[1.02]` → `hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10` (lift instead of scale)
     - Phase badge: added `group-hover:rotate-3` for a playful tilt
     - Phase icon: `opacity-40` → `group-hover:opacity-70` for hover reveal
     - Subtitle: `text-xs` → `text-[11px] font-semibold` for better hierarchy
     - Mission text: added `leading-relaxed` for readability
     - Top accent bar: `opacity-60` → `opacity-70 group-hover:opacity-100`
   - Card grid: `gap-5` → `gap-6` for more breathing room

## Verification Results
- **All 7 phases**: HTTP 200, zero console errors, zero page errors
- **Course Overview**: HTTP 200, 7 phase cards with full mission text (no truncation)
- **Theme toggle**: confirmed present in both navbar and overview; clicking opens dropdown with Light/Dark options
- **Light mode**: confirmed working — `htmlClass: "light"`, `bgColor: oklch(0.985 0.002 240)` (light background)
- **Dark mode**: confirmed — `htmlClass: "dark"`, `bgColor: oklch(0.14 0.015 250)` (dark background)
- **Theme persistence**: stored in localStorage under `ros2-mastery-theme` key
- **Settings dialog**: confirmed opens with "Settings" title, shows Export/Import/Reset actions
- **Card hover lift**: confirmed `hover:-translate-y-1` class present on all 7 cards
- **Card grid gap**: confirmed 24px (`gap-6`)
- **Lint**: 0 errors, 0 warnings
- **VLM analysis**: confirmed "full descriptive text for each phase", "hover lift effect", "theme toggle and settings button in the top-right"

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: With 7 phases (odd number), the last row of the 3-column grid has 1 card, leaving empty space on the right. This is inherent to a 3-column layout with 7 items — acceptable.
- **Minor**: The light theme code blocks still use a dark `#0d1117` background (GitHub Dark style). This is intentional — code blocks typically stay dark even in light mode for readability, matching platforms like GitHub and Stripe docs.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add full-text search** — command palette searches module titles only; searching within content would be valuable.
3. **Add print/export to PDF** — for offline study.
4. **Add a "Bookmarks" view** — a page showing all bookmarked lessons in one place.
5. **Add lesson prev/next keyboard shortcuts** — arrow keys to navigate between lessons.
6. **Add estimated remaining time** — "X hours left" in the navbar based on incomplete modules.

---
Task ID: 12 (Cron Review Round 5)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 4 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No bookmarks view — users could bookmark lessons but had no way to view all bookmarks in one place (#4 recommendation from Round 4)
2. No estimated remaining time in navbar (#6 recommendation)
3. No arrow key navigation between lessons (#5 recommendation)
4. Navbar external link icons lacked hover scale effect
5. Keyboard shortcuts panel didn't document arrow key navigation

No critical bugs found — all 7 phases returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (4 files)
1. **`src/components/layout/BookmarksView.tsx`** — full-screen page showing all bookmarked lessons. Features:
   - Header with bookmark icon, "Bookmarked Lessons" title, count subtitle, and back-to-overview link
   - Each bookmark shows as a card with phase icon, phase label, lesson title, reading time, remove-bookmark button (trash icon), and navigate arrow
   - Empty state with BookmarkX icon, helpful message mentioning the `B` keyboard shortcut, and a "Browse Lessons" CTA
   - Cards use the phase's accent color for borders and icons

2. **`src/components/layout/BookmarksWrapper.tsx`** — client wrapper wiring BookmarksView to Next.js router

3. **`src/components/layout/BookmarksButton.tsx`** — reusable navbar icon button with a badge showing the bookmark count. Badge is cyan with white text, hidden when count is 0 or before hydration. Includes tooltip.

4. **`src/components/layout/RemainingTime.tsx`** — navbar widget showing "Xh Ym left" based on the sum of reading times of all incomplete modules. Uses Hourglass icon (cyan), tabular-nums font, tooltip. Hidden when all lessons are complete or no reading times. Hidden on mobile (md:flex).

### Enhanced Existing Components
5. **`page.tsx`** — added `?view=bookmarks` routing. Three-way route: `?view=bookmarks` → Bookmarks page, `?m=moduleId` → Lesson page, (nothing) → Course Overview dashboard.

6. **`Navbar.tsx`**:
   - Added BookmarksButton (with badge count) → navigates to `/?view=bookmarks`
   - Added RemainingTime widget next to the progress indicator
   - External link icons: `hover:text-foreground` → `hover:text-cyan-400 active:scale-95` for better hover feedback
   - Both navbar icons now have `transition-all active:scale-95` press animation

7. **`CourseOverview.tsx`**:
   - Added optional `onBookmarks` prop
   - Added BookmarksButton to the floating top-right controls (between ThemeToggle and SettingsDialog)

8. **`OverviewWrapper.tsx`** — passes `onBookmarks` handler that navigates to `/?view=bookmarks`

9. **`AppShell.tsx`** — added arrow key navigation:
   - `ArrowLeft` → navigate to previous lesson (if exists)
   - `ArrowRight` → navigate to next lesson (if exists)
   - Uses `getAdjacentModules()` from course-data
   - Added `moduleId` and `handleNavigate` to the useEffect dependency array

10. **`KeyboardShortcuts.tsx`** — added `←` (Previous lesson) and `→` (Next lesson) to the Navigation section of the shortcuts panel

## Verification Results
- **All 7 phases + overview + bookmarks**: HTTP 200, zero console errors, zero page errors
- **Bookmarks page**: confirmed renders with "Bookmarked Lessons" h1, empty state shows when no bookmarks, bookmarked lessons appear as cards when present
- **Bookmarks badge**: confirmed shows "1" after bookmarking a lesson via `B` key
- **Remaining time**: confirmed shows "2h 55m left" (correct sum of incomplete lesson reading times)
- **Arrow key navigation**: confirmed ArrowRight navigates from phase-1/middleware → phase-1/philosophy
- **Navbar features**: confirmed BookmarksButton, RemainingTime, ThemeToggle, SettingsDialog all present
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The RemainingTime widget is hidden on mobile (md:flex) to avoid crowding the mobile navbar. This is intentional — mobile users can see progress via the sidebar footer.
- **Minor**: Arrow key navigation only works when not typing in an input/textarea (correctly guarded).

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add full-text search** — command palette searches module titles only; searching within content would be valuable.
3. **Add print/export to PDF** — for offline study.
4. **Add a "Completed Lessons" view** — similar to Bookmarks, but showing all completed lessons for review.
5. **Add progress milestones/achievements** — e.g. "First lesson complete!", "Phase 1 mastered!", to gamify the experience.
6. **Add estimated time per phase in the sidebar** — next to each phase's completion count.

---
Task ID: 13 (Cron Review Round 6)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 5 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No achievements/gamification system (#5 recommendation from Round 5)
2. Stats container on overview hero lacked glassmorphism depth
3. Body text line-height was tight (1.5 → 1.75 recommended)
4. List spacing was cramped (space-y-2 → space-y-3 recommended)
5. No achievements view page

No critical bugs found — all 7 phases + all routes returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (4 files)
1. **`src/components/layout/AchievementWatcher.tsx`** — achievements system with:
   - 8 achievement definitions (First Step, Getting Started, Quarter Master, Halfway There, Phase Master, Multi-Phase Master, Completionist, Collector)
   - Each has an icon, title, description, accent color, and a `check` function
   - `AchievementWatcher` component: invisible watcher that fires celebratory toasts when achievements unlock. Persists unlocked IDs to localStorage under `ros2-mastery-achievements`. Lazy-initializes from localStorage to avoid setState-in-effect lint rule.
   - `useAchievements()` hook: returns all achievements with `unlocked` status
   - `useUnlockedAchievementCount()` hook: returns count for badges

2. **`src/components/layout/AchievementsView.tsx`** — full-screen page showing all 8 achievements in a 2-column grid. Unlocked achievements show in full color with "Unlocked" badge; locked ones are greyed with a Lock icon. Header has Trophy icon, count, and overall progress bar (amber gradient).

3. **`src/components/layout/AchievementsWrapper.tsx`** — client router wrapper

4. **`src/components/layout/AchievementsButton.tsx`** — reusable navbar icon (Trophy) with amber badge showing unlocked count. Hidden when 0 or before hydration.

### Enhanced Existing Components
5. **`page.tsx`** — added `?view=achievements` routing. Four-way route: `?view=bookmarks`, `?view=achievements`, `?m=moduleId`, (nothing) → overview.

6. **`Navbar.tsx`** — added AchievementsButton (with amber badge) between BookmarksButton and ThemeToggle. Navigates to `/?view=achievements`.

7. **`AppShell.tsx`** — added `<AchievementWatcher />` as an invisible overlay component so achievements fire on lesson pages.

8. **`CourseOverview.tsx`**:
   - Added optional `onAchievements` prop
   - Added AchievementsButton to floating top-right controls
   - Added `<AchievementWatcher />` so achievements fire on the overview
   - **Stats container glassmorphism**: changed from `flex flex-wrap` to `inline-flex flex-wrap rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4 backdrop-blur-md` — a subtle frosted-glass effect

9. **`OverviewWrapper.tsx`** — passes `onAchievements` handler

10. **`globals.css`** — typography improvements:
    - Paragraph line-height: `leading-7` → `leading-[1.75]` for better readability
    - List spacing: `space-y-2` → `space-y-3` for more breathing room
    - Ordered list spacing: same improvement

## Verification Results
- **All 7 phases + overview + bookmarks + achievements**: HTTP 200, zero console errors
- **Achievements page**: confirmed renders with "Achievements" h1, 8 achievement cards (17 rounded elements total including badges)
- **Achievement unlocking**: confirmed "First Step" toast fires when marking first lesson complete via `M` key
- **Achievements badge**: confirmed present in navbar (Trophy icon with amber badge)
- **Glassmorphism stats**: confirmed `backdrop-blur-md` + `rounded-2xl` + `border` classes on stats container
- **Navbar features**: BookmarksButton, AchievementsButton, RemainingTime, ThemeToggle, SettingsDialog all present
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The AchievementWatcher fires toasts with a 600ms delay between each to avoid overwhelming the user. If many achievements unlock simultaneously (e.g. on import), they queue up nicely.
- **Minor**: Achievement toasts use JSX in the `title` prop which is cast to `unknown as string` — this is a workaround for the toast hook's typing. Works correctly at runtime.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add a "Completed Lessons" view** — similar to Bookmarks, but showing all completed lessons for review.
3. **Add connecting timeline line through phase cards** on the overview — a horizontal line behind the phase numbers to visualize the journey.
4. **Add full-text search** — command palette searches module titles only.
5. **Add print/export to PDF** — for offline study.
6. **Add estimated time per phase in the sidebar** — next to each phase's completion count.

---
Task ID: 14 (Cron Review Round 7)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 6 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No Completed Lessons view (#2 recommendation from Round 6)
2. No active phase indicator on the overview (#3 VLM recommendation)
3. Overview hero lacked gradient mesh atmosphere (#4 VLM recommendation)
4. No connecting visual element between phase cards

No critical bugs found — all 7 phases + all routes returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (3 files)
1. **`src/components/layout/CompletedView.tsx`** — full-screen page showing all completed lessons. Features:
   - Header with CheckCircle2 icon, "Completed Lessons" title, count subtitle, back-to-overview link
   - Each completed lesson shows as a card with emerald check icon, phase label, lesson title, reading time, unmark-complete button (RotateCcw icon), and navigate arrow
   - Empty state with Inbox icon, helpful message mentioning the `M` keyboard shortcut, and a "Browse Lessons" CTA
   - Cards use emerald accent color for borders and icons

2. **`src/components/layout/CompletedWrapper.tsx`** — client router wrapper

3. **`src/components/layout/CompletedButton.tsx`** — reusable navbar icon (CheckCircle2) with emerald badge showing completed count. Hidden when 0 or before hydration. Added to both Navbar and CourseOverview floating controls.

### Enhanced Existing Components
4. **`page.tsx`** — added `?view=completed` routing. Five-way route: `?view=bookmarks`, `?view=achievements`, `?view=completed`, `?m=moduleId`, (nothing) → overview.

5. **`Navbar.tsx`** — added CompletedButton (with emerald badge) between BookmarksButton and AchievementsButton. Navigates to `/?view=completed`.

6. **`CourseOverview.tsx`** — three major enhancements:
   - **Active phase indicator**: added `isActive` prop to PhaseCard. The active phase (containing lastVisited module, or first phase with incomplete modules) gets a cyan ring, shadow glow, and a "Current" badge with pulsing dot in the top-right corner.
   - **Gradient mesh background**: added 2 additional radial glow divs to the hero — a violet glow (top-right) and a teal glow (bottom-left), complementing the existing cyan glow. Total 3 blurred radial gradients create atmospheric depth.
   - **CompletedButton**: added to floating top-right controls between Bookmarks and Achievements.

7. **`OverviewWrapper.tsx`** — passes `onCompleted` handler

## Verification Results
- **All 7 phases + overview + bookmarks + achievements + completed**: HTTP 200, zero console errors
- **Completed page**: confirmed renders with "Completed Lessons" h1, empty state shows when no completions
- **CompletedButton**: confirmed present in navbar (emerald badge)
- **Active phase indicator**: confirmed "Current" badge appears on the active phase card
- **Gradient mesh**: confirmed 3 `blur-3xl` elements on the overview hero (cyan + violet + teal)
- **Navbar features**: BookmarksButton, CompletedButton, AchievementsButton, RemainingTime, ThemeToggle, SettingsDialog all present
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The active phase detection logic runs on every render but is lightweight (7-phase iteration). Acceptable.
- **Minor**: The "Current" badge with pulsing dot uses `animate-ping` which is a Tailwind built-in animation — performant and smooth.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add full-text search** — command palette searches module titles only.
3. **Add print/export to PDF** — for offline study.
4. **Add estimated time per phase in the sidebar** — next to each phase's completion count.
5. **Add a "Learning streak" tracker** — consecutive days with completed lessons.
6. **Add keyboard shortcut to toggle between overview/lesson** — e.g. `O` for overview.

---
Task ID: 15 (Cron Review Round 8)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 7 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No learning streak tracker (#5 recommendation from Round 7)
2. No keyboard shortcut for overview (#6 recommendation)
3. Stats bar numbers lacked monospace font (VLM recommendation)
4. Active phase card glow could be more pronounced (VLM recommendation)

No critical bugs found — all 7 phases + all routes returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (2 files)
1. **`src/hooks/use-learning-streak.ts`** — hook that computes:
   - `currentStreak`: consecutive days with at least one lesson completed (counting backwards from today or yesterday)
   - `longestStreak`: longest run of consecutive days ever
   - `totalCompletedDays`: total unique active days
   - `lastCompletionDate`: ISO date of last completion
   - `completedToday`: boolean for today's status
   - Uses `completionDates` from the progress store

2. **`src/components/layout/StreakBadge.tsx`** — navbar widget showing a Flame icon + "N days" count. Hidden when streak is 0. Uses amber accent when completed today (with filled flame), grey otherwise. Tooltip shows longest streak, total active days, and today's status.

### Enhanced Existing Components
3. **`src/store/progress-store.tsx`** — major update:
   - Added `completionDates: Record<string, string>` to state (maps module ID → ISO date YYYY-MM-DD)
   - Updated `toggleModuleComplete` and `setModuleComplete` to record/remove dates
   - Bumped storage version 1 → 2 with a `migrate` function that adds `completionDates: {}` to v1 state
   - `setModuleComplete` preserves original date on re-completion (doesn't overwrite)

4. **`Navbar.tsx`** — added StreakBadge next to RemainingTime in the progress indicator cluster

5. **`AppShell.tsx`** — added `O` keyboard shortcut:
   - Pressing `O` navigates to the Course Overview (`/`)
   - Added `router` to the useEffect dependency array
   - Updated comment to reflect new shortcut

6. **`KeyboardShortcuts.tsx`** — added `O` → "Go to Course Overview" to the Navigation section

7. **`CourseOverview.tsx`** — two enhancements:
   - **Monospaced stats numbers**: Stat component value now uses `font-mono` for developer aesthetic
   - **Enhanced active phase glow**: `shadow-lg shadow-cyan-500/10` → `shadow-xl shadow-cyan-500/20` + `ring-cyan-400/60` (was /50) for more pronounced glow

## Verification Results
- **All 7 phases + all routes**: HTTP 200, zero console errors
- **Streak badge**: confirmed shows "1 day" after marking first lesson complete
- **O keyboard shortcut**: confirmed navigates from lesson page to overview
- **Monospaced stats**: confirmed `font-mono` class on stat values
- **Active phase glow**: confirmed enhanced shadow + ring opacity
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The progress store migration (v1→v2) adds `completionDates: {}` for existing users. Their previously-completed modules will NOT have dates (since we didn't track them before), so their streak will start fresh from today. This is acceptable — there's no way to retroactively determine when a module was completed.
- **Minor**: The streak count logic handles timezone by using UTC (`toISOString().slice(0, 10)`). This means "today" is determined by UTC, not the user's local timezone. For most users this is fine, but a user in a far-east timezone completing a lesson at 11pm local might count it as "tomorrow" in UTC. Acceptable tradeoff for simplicity.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add full-text search** — command palette searches module titles only.
3. **Add print/export to PDF** — for offline study.
4. **Add estimated time per phase in the sidebar** — next to each phase's completion count.
5. **Add streak to the Course Overview hero** — show the streak prominently on the dashboard.
6. **Add a weekly progress chart** — visualize lessons completed per day/week.

---
Task ID: 16 (Cron Review Round 9)
Agent: Main (orchestrator) — webDevReview cron trigger
Task: Assess project status, perform QA via agent-browser, improve styling, add new features.

## Current Project Status Assessment
The platform was stable from Round 8 with all features working. QA via agent-browser + VLM analysis identified these improvement opportunities:
1. No streak display on the Course Overview hero (#5 recommendation from Round 8)
2. No weekly progress chart (#6 recommendation)
3. CTA buttons lacked hover glow (VLM recommendation)
4. Phase cards could benefit from connector lines (VLM recommendation)

No critical bugs found — all 7 phases + all routes returned HTTP 200 with zero console errors.

## Completed Modifications

### New Components Created (3 files)
1. **`src/hooks/use-weekly-activity.ts`** — hook returning an array of the last 7 days with lesson completion counts. Each day has: date (ISO), label (Mon/Tue/...), count, and isToday flag. Uses `completionDates` from the progress store.

2. **`src/components/layout/WeeklyProgressChart.tsx`** — bar chart showing lessons completed per day over the last 7 days. Features:
   - 7 vertical bars with cyan→teal gradient (today's bar highlighted)
   - Hover tooltip showing exact count
   - Header with Activity icon, "This Week" title, and total count
   - Day labels (Sun-Sat) below each bar, today's label in cyan
   - Empty days show as a subtle 4px bar
   - Rounded card container with border

3. **`src/components/layout/StreakDisplay.tsx`** — compact card for the overview hero showing the current streak with a Flame icon. Shows current streak count (monospace), "Best: N days" subtitle, and a "✓ Today" badge when completed today. Hidden when streak is 0. Uses amber accent when completed today.

### Enhanced Existing Components
4. **`CourseOverview.tsx`** — three enhancements:
   - **StreakDisplay in hero**: added next to the overall progress bar in a flex-wrap layout. Only shows when there's completed progress.
   - **WeeklyProgressChart**: added between the hero and the phase cards grid, in a max-w-sm container. Only shows when hydrated.
   - **CTA button hover glow**: both "Continue Learning" and "Start Phase 1" buttons now have `hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all` for a premium lift + glow effect on hover.

## Verification Results
- **All 7 phases + all routes**: HTTP 200, zero console errors
- **Streak display**: confirmed shows on overview hero after marking a lesson complete ("day" text present)
- **Weekly progress chart**: confirmed shows "This Week" with bar chart
- **CTA hover glow**: confirmed `hover:shadow-cyan` class present on CTA buttons
- **Lint**: 0 errors, 0 warnings

## Unresolved Issues / Risks
- **None critical** — all features working as designed
- **Minor**: The WeeklyProgressChart only shows when there's hydration — on first visit with no progress, the chart area is empty (the component returns null when no data). This is intentional to avoid cluttering the overview for new users. Once a lesson is completed, the chart appears.
- **Minor**: The StreakDisplay is only visible when streak > 0, which means new users won't see it. This is by design — it's a reward for active learners.

## Priority Recommendations for Next Phase
1. **Expand Phase 2-7 content to full lesson depth** — Phase 1 is comprehensive; Phases 2-7 are still overviews. This remains the highest-value content task.
2. **Add full-text search** — command palette searches module titles only.
3. **Add print/export to PDF** — for offline study.
4. **Add estimated time per phase in the sidebar** — next to each phase's completion count.
5. **Add phase connector lines** — dashed vertical line connecting phase numbers on the overview to reinforce the "roadmap" concept.
6. **Add a "dark mode code blocks" toggle** — let users choose whether code blocks stay dark in light mode.

"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/store/progress-store";

/**
 * `ProgressHydration` is a client-only component whose sole job is to
 * trigger Zustand `persist` rehydration on the client.
 *
 * It renders its children (or `null` if none provided). Place it once in the
 * root layout. Once mounted, it:
 *  1. Calls `rehydrate()` to ensure localStorage values are pulled in even
 *     when `skipHydration` is `false` (defensive — handles HMR & edge cases).
 *
 * Why not rely solely on the default hydration? Because Next.js SSR renders
 * before `localStorage` is available, and we want a deterministic signal that
 * the persisted state has settled. Consumers can read that signal via the
 * `useProgressHydrated()` hook exported from `@/hooks/use-progress`, which
 * uses `useSyncExternalStore` to subscribe to the persist middleware.
 *
 * Note: this component intentionally has no React state of its own. The
 * `rehydrate()` call kicks off hydration; the `useProgressHydrated` hook
 * subscribes to the `onFinishHydration` event and exposes the resulting
 * boolean without triggering cascading renders here.
 */
export function ProgressHydration({
  children,
}: {
  children?: React.ReactNode;
}) {
  useEffect(() => {
    // If hydration already completed synchronously during store creation,
    // this is a no-op. Otherwise it kicks off (or restarts) hydration.
    useProgressStore.persist.rehydrate();
  }, []);

  return <>{children ?? null}</>;
}

export default ProgressHydration;

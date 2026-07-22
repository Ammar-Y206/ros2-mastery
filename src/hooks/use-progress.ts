"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  useProgressStore,
  type PreferredLanguage,
  type ProgressState,
} from "@/store/progress-store";

/**
 * Re-export the underlying store for consumers that need direct access
 * (e.g. to call `.persist.rehydrate()`). All store actions are accessible
 * on the store hook itself, so consumers can do:
 *
 *   const toggle = useProgressStore((s) => s.toggleModuleComplete);
 *
 * The granular hooks below (`useModuleProgress`, `useOverallProgress`, ...)
 * are the preferred ergonomic API.
 */
export { useProgressStore } from "@/store/progress-store";
export type { PreferredLanguage, ProgressState } from "@/store/progress-store";

/**
 * Hook for interacting with a single module's progress + bookmark state.
 */
export function useModuleProgress(moduleId: string) {
  const isComplete = useProgressStore(
    (state) => Boolean(state.completedModules[moduleId])
  );
  const bookmarked = useProgressStore(
    (state) => Boolean(state.bookmarks[moduleId])
  );

  const toggle = useProgressStore((state) => state.toggleModuleComplete);
  const toggleBookmark = useProgressStore((state) => state.toggleBookmark);

  const onToggle = useCallback(() => toggle(moduleId), [toggle, moduleId]);
  const onToggleBookmark = useCallback(
    () => toggleBookmark(moduleId),
    [toggleBookmark, moduleId]
  );

  return useMemo(
    () => ({
      isComplete,
      bookmarked,
      toggle: onToggle,
      toggleBookmark: onToggleBookmark,
    }),
    [isComplete, bookmarked, onToggle, onToggleBookmark]
  );
}

/**
 * Hook returning overall course progress across the provided module IDs.
 */
export function useOverallProgress(allModuleIds: string[]) {
  const completedModules = useProgressStore((state) => state.completedModules);
  const toggle = useProgressStore((state) => state.toggleModuleComplete);

  const { completed, total, percentage, isComplete } = useMemo(() => {
    const total = allModuleIds.length;
    let completed = 0;
    for (const id of allModuleIds) {
      if (completedModules[id]) completed += 1;
    }
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      completed,
      total,
      percentage,
      isComplete: total > 0 && completed === total,
    };
  }, [allModuleIds, completedModules]);

  return { completed, total, percentage, isComplete, toggle };
}

/**
 * Convenience hook for the user's preferred code language.
 */
export function usePreferredLanguage() {
  const preferredLanguage = useProgressStore((state) => state.preferredLanguage);
  const setPreferredLanguage = useProgressStore(
    (state) => state.setPreferredLanguage
  );
  return useMemo(
    () => ({ preferredLanguage, setPreferredLanguage }),
    [preferredLanguage, setPreferredLanguage]
  ) as {
    preferredLanguage: PreferredLanguage;
    setPreferredLanguage: (lang: PreferredLanguage) => void;
  };
}

/**
 * Convenience hook for the last visited module.
 */
export function useLastVisitedModule() {
  const lastVisitedModule = useProgressStore(
    (state) => state.lastVisitedModule
  );
  const setLastVisitedModule = useProgressStore(
    (state) => state.setLastVisitedModule
  );
  return useMemo(
    () => ({ lastVisitedModule, setLastVisitedModule }),
    [lastVisitedModule, setLastVisitedModule]
  );
}

/**
 * Returns a boolean indicating whether the persisted store has finished
 * hydrating from localStorage. Uses `useSyncExternalStore` so React
 * re-renders when Zustand's persist middleware signals hydration complete.
 */
export function useProgressHydrated(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    // Subscribe to hydration lifecycle events.
    const unsubFinish = useProgressStore.persist.onFinishHydration(onChange);
    // If hydration already finished synchronously, onChange won't fire, so
    // the initial snapshot from `getSnapshot` is authoritative.
    return () => {
      unsubFinish();
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => useProgressStore.persist.hasHydrated(),
    () => false // SSR snapshot — not hydrated on the server.
  );
}

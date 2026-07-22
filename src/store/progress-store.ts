import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type PersistStorage,
} from "zustand/middleware";

/**
 * Supported code languages for CodeBlock tabbed snippets.
 */
export type PreferredLanguage = "cpp" | "python";

/**
 * Shape of the persisted ROS2 mastery progress state.
 */
export interface ProgressState {
  /** Map of module ID (e.g. "phase-1", "phase-1/nodes") -> completion status. */
  completedModules: Record<string, boolean>;
  /** Map of module ID -> bookmarked (saved-for-later) status. */
  bookmarks: Record<string, boolean>;
  /** The ID of the last module the user viewed, or null. */
  lastVisitedModule: string | null;
  /** User's preferred code language for CodeBlock tabs. */
  preferredLanguage: PreferredLanguage;
}

/**
 * Actions exposed by the progress store.
 */
export interface ProgressActions {
  toggleModuleComplete: (moduleId: string) => void;
  setModuleComplete: (moduleId: string, complete: boolean) => void;
  isModuleComplete: (moduleId: string) => boolean;
  toggleBookmark: (moduleId: string) => void;
  setLastVisitedModule: (moduleId: string) => void;
  setPreferredLanguage: (lang: PreferredLanguage) => void;
  getCompletionStats: (
    allModuleIds: string[]
  ) => { completed: number; total: number; percentage: number };
  resetProgress: () => void;
}

export type ProgressStore = ProgressState & ProgressActions;

const initialState: ProgressState = {
  completedModules: {},
  bookmarks: {},
  lastVisitedModule: null,
  preferredLanguage: "cpp",
};

/**
 * Zustand store for tracking ROS2 learning progress.
 *
 * Persisted to `localStorage` under the key `ros2-mastery-progress`.
 * Uses `createJSONStorage(() => localStorage)` which is SSR-safe because
 * the persist middleware only invokes the storage factory on the client.
 */
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleModuleComplete: (moduleId) =>
        set((state) => ({
          completedModules: {
            ...state.completedModules,
            [moduleId]: !state.completedModules[moduleId],
          },
        })),

      setModuleComplete: (moduleId, complete) =>
        set((state) => {
          const next = { ...state.completedModules };
          if (complete) {
            next[moduleId] = true;
          } else {
            delete next[moduleId];
          }
          return { completedModules: next };
        }),

      isModuleComplete: (moduleId) => Boolean(get().completedModules[moduleId]),

      toggleBookmark: (moduleId) =>
        set((state) => {
          const next = { ...state.bookmarks };
          if (next[moduleId]) {
            delete next[moduleId];
          } else {
            next[moduleId] = true;
          }
          return { bookmarks: next };
        }),

      setLastVisitedModule: (moduleId) =>
        set({ lastVisitedModule: moduleId }),

      setPreferredLanguage: (lang) => set({ preferredLanguage: lang }),

      getCompletionStats: (allModuleIds) => {
        const completedModules = get().completedModules;
        const total = allModuleIds.length;
        const completed = allModuleIds.reduce(
          (count, id) => (completedModules[id] ? count + 1 : count),
          0
        );
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { completed, total, percentage };
      },

      resetProgress: () => set({ ...initialState }),
    }),
    {
      name: "ros2-mastery-progress",
      storage: createJSONStorage(
        () => localStorage
      ) as PersistStorage<ProgressStore>,
      version: 1,
    }
  )
);

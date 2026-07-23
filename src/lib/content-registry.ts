import type { ComponentType } from "react";

// Import the MDX files — @next/mdx compiles them to React components at
// build time (webpack). Expression attributes (cpp={`...`}) work correctly
// because compilation happens during bundling, not at runtime.
import Phase1Content from "@/content/phase-1.mdx";
import Phase2Content from "@/content/phase-2.mdx";
import Phase3Content from "@/content/phase-3.mdx";
import Phase4Content from "@/content/phase-4.mdx";
import Phase5Content from "@/content/phase-5.mdx";
import Phase6Content from "@/content/phase-6.mdx";
import Phase7Content from "@/content/phase-7.mdx";

export interface ContentEntry {
  phaseId: string;
  Component: ComponentType;
}

/**
 * Maps every module ID → the phase content that contains it.
 * All modules within a phase render the same MDX; the app scrolls
 * to the module's `slug` anchor for in-page navigation.
 */
export const CONTENT_REGISTRY: Record<string, ContentEntry> = {
  "phase-1/middleware": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/philosophy": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/pillars": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/node": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/executors": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/sop": { phaseId: "phase-1", Component: Phase1Content },
  "phase-1/cli": { phaseId: "phase-1", Component: Phase1Content },
  "phase-2/topics": { phaseId: "phase-2", Component: Phase2Content },
  "phase-2/services": { phaseId: "phase-2", Component: Phase2Content },
  "phase-2/actions": { phaseId: "phase-2", Component: Phase2Content },
  "phase-3/parameters": { phaseId: "phase-3", Component: Phase3Content },
  "phase-3/launch": { phaseId: "phase-3", Component: Phase3Content },
  "phase-3/debugging": { phaseId: "phase-3", Component: Phase3Content },
  "phase-4/tf2": { phaseId: "phase-4", Component: Phase4Content },
  "phase-5/composition": { phaseId: "phase-5", Component: Phase5Content },
  "phase-5/lifecycle": { phaseId: "phase-5", Component: Phase5Content },
  "phase-6/urdf": { phaseId: "phase-6", Component: Phase6Content },
  "phase-6/control": { phaseId: "phase-6", Component: Phase6Content },
  "phase-7/ekf": { phaseId: "phase-7", Component: Phase7Content },
  "phase-7/slam": { phaseId: "phase-7", Component: Phase7Content },
  "phase-7/nav2": { phaseId: "phase-7", Component: Phase7Content },
};

export function getContentComponent(moduleId: string): ComponentType | undefined {
  return CONTENT_REGISTRY[moduleId]?.Component;
}

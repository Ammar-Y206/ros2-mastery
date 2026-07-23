"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Circle,
  icons,
  MousePointerClick,
  Network,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import "@xyflow/react/dist/style.css";

export interface InteractiveGraphNode {
  id: string;
  label: string;
  /** Short subtitle shown under the label */
  subtitle?: string;
  /** Icon name from lucide-react (e.g. "Camera", "Brain", "Footprints") */
  icon?: string;
  /** Description shown in the detail panel when this node is clicked */
  description: string;
  /** Accent color: "cyan" | "emerald" | "violet" | "amber" | "rose" | "sky" | "teal" */
  accent?: string;
  /** Position on the canvas (optional — auto-layout if not provided) */
  position?: { x: number; y: number };
}

export interface InteractiveGraphEdge {
  id: string;
  source: string;
  target: string;
  /** Label on the edge (e.g. "Image", "TrackBounds", "cmd_vel") */
  label?: string;
  animated?: boolean;
}

export interface InteractiveGraphProps {
  nodes: InteractiveGraphNode[];
  edges: InteractiveGraphEdge[];
  /** Title shown above the graph */
  title?: string;
  /** Height of the graph canvas (default 320) */
  height?: number;
}

const ACCENT_MAP = {
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    ring: "ring-cyan-400/60",
  },
  emerald: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "ring-emerald-400/60",
  },
  violet: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    ring: "ring-violet-400/60",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    ring: "ring-amber-400/60",
  },
  rose: {
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    ring: "ring-rose-400/60",
  },
  sky: {
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    ring: "ring-sky-400/60",
  },
  teal: {
    border: "border-teal-500/40",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    ring: "ring-teal-400/60",
  },
} as const;

type AccentKey = keyof typeof ACCENT_MAP;

function resolveAccent(accent?: string): (typeof ACCENT_MAP)[AccentKey] {
  if (accent && accent in ACCENT_MAP) {
    return ACCENT_MAP[accent as AccentKey];
  }
  return ACCENT_MAP.cyan;
}

const ICON_REGISTRY = icons as unknown as Record<string, LucideIcon>;

function resolveIcon(name?: string): LucideIcon {
  if (!name) return Circle;
  // Direct lookup (PascalCase, e.g. "Camera")
  const direct = ICON_REGISTRY[name];
  if (direct) return direct;
  // Tolerate kebab / snake / lower-case input ("footprints" → "Footprints")
  const pascal = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return ICON_REGISTRY[pascal] ?? Circle;
}

/**
 * LucideIconRenderer — renders a lucide-react icon by name.
 *
 * Defined as a stable, module-level component (and uses `React.createElement`
 * internally) so that the `react-hooks/static-components` lint rule does not
 * flag the dynamic icon lookup as "creating a component during render".
 */
function LucideIconRenderer({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  return React.createElement(resolveIcon(name), {
    className,
    "aria-hidden": true,
  });
}

type GraphNodeData = {
  label: string;
  subtitle?: string;
  icon?: string;
  description: string;
  accent?: string;
};

type GraphNodeType = Node<GraphNodeData, "rosNode">;

/**
 * RosNode — custom React Flow node rendered as a rounded "neuron" card with
 * an accent-colored border, a lucide icon, a label and an optional subtitle.
 * When selected it gains a glowing cyan ring + cyan glow shadow.
 */
function RosNode({ data, selected }: NodeProps<GraphNodeType>) {
  const accent = resolveAccent(data.accent);

  return (
    <div
      className={cn(
        "relative flex min-w-[176px] max-w-[240px] flex-col gap-1.5 rounded-xl border bg-card/90 px-4 py-3 backdrop-blur-sm transition-all duration-200",
        accent.border,
        accent.bg,
        selected &&
          "ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={cn("!h-2 !w-2 !border-0 !bg-current", accent.text)}
      />
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/5",
            accent.bg,
            accent.text,
          )}
          aria-hidden="true"
        >
          <LucideIconRenderer name={data.icon} className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold leading-tight text-foreground">
            {data.label}
          </div>
          {data.subtitle ? (
            <div className="truncate text-[11px] leading-tight text-muted-foreground">
              {data.subtitle}
            </div>
          ) : null}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={cn("!h-2 !w-2 !border-0 !bg-current", accent.text)}
      />
    </div>
  );
}

// Memoized outside the component to avoid React Flow re-registering node types
// on every render (which would otherwise cause performance warnings).
const nodeTypes = { rosNode: RosNode };

// Auto-layout constants — used only for nodes that don't specify a position.
const AUTO_NODE_W = 220;
const AUTO_GAP_X = 64;
const AUTO_GAP_Y = 120;
const AUTO_COLS = 4;

function withAutoLayout(
  nodes: InteractiveGraphNode[],
): InteractiveGraphNode[] {
  let autoIdx = 0;
  return nodes.map((n) => {
    if (n.position) return n;
    const col = autoIdx % AUTO_COLS;
    const row = Math.floor(autoIdx / AUTO_COLS);
    autoIdx += 1;
    return {
      ...n,
      position: {
        x: col * (AUTO_NODE_W + AUTO_GAP_X),
        y: row * AUTO_GAP_Y,
      },
    };
  });
}

/**
 * InteractiveGraph — a dark-themed, interactive ROS2 computation graph
 * visualizer built on React Flow. Learners can pan/zoom the canvas and click
 * any node to reveal a detail panel describing that node's role.
 *
 * Example (a robot's "nervous system"):
 *   Camera ──Image──▶ Perception ──TrackBounds──▶ Control ──cmd_vel──▶ Motors
 *    (eyes)              (brain)                  (spinal cord)        (legs)
 */
export function InteractiveGraph({
  nodes,
  edges,
  title,
  height = 320,
}: InteractiveGraphProps) {
  const safeNodes = React.useMemo(
    () => (Array.isArray(nodes) ? nodes : []),
    [nodes],
  );
  const safeEdges = React.useMemo(
    () => (Array.isArray(edges) ? edges : []),
    [edges],
  );

  const initialNodes = React.useMemo<GraphNodeType[]>(() => {
    return withAutoLayout(safeNodes).map((n) => ({
      id: n.id,
      type: "rosNode" as const,
      position: n.position ?? { x: 0, y: 0 },
      data: {
        label: n.label,
        subtitle: n.subtitle,
        icon: n.icon,
        description: n.description,
        accent: n.accent,
      },
    }));
  }, [safeNodes]);

  const initialEdges = React.useMemo<Edge[]>(() => {
    return safeEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "smoothstep",
      animated: Boolean(e.animated),
      label: e.label,
      ...(e.label
        ? {
            labelBgPadding: [8, 4] as [number, number],
            labelBgBorderRadius: 6,
            labelBgStyle: {
              fill: "rgba(6,182,212,0.14)",
              stroke: "rgba(34,211,238,0.35)",
              strokeWidth: 1,
            },
            labelStyle: {
              fill: "#67e8f9",
              fontSize: 11,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontWeight: 500,
            },
          }
        : {}),
      style: {
        stroke: e.animated ? "#22d3ee" : "rgba(148,163,184,0.45)",
        strokeWidth: 2,
      },
    }));
  }, [safeEdges]);

  const [rfNodes, , onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selectedNode = React.useMemo(
    () =>
      selectedId
        ? (safeNodes.find((n) => n.id === selectedId) ?? null)
        : null,
    [selectedId, safeNodes],
  );

  const handleNodeClick = React.useCallback(
    (_event: React.MouseEvent, node: GraphNodeType) => {
      setSelectedId(node.id);
    },
    [],
  );

  const handlePaneClick = React.useCallback(() => {
    setSelectedId(null);
  }, []);

  const selectedAccent = selectedNode
    ? resolveAccent(selectedNode.accent)
    : ACCENT_MAP.cyan;

  return (
    <figure className="my-6">
      {title ? (
        <figcaption className="mb-3 flex items-center gap-2">
          <Network className="size-4 text-cyan-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">
            {title}
          </span>
        </figcaption>
      ) : null}

      <div
        className="relative w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-[#0a0e1a]"
        style={{ height }}
      >
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.4}
          maxZoom={1.8}
          className="bg-transparent"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.5}
            color="rgba(34,211,238,0.18)"
          />
          <Controls
            showInteractive={false}
            className="!overflow-hidden !rounded-lg !border-cyan-500/20 !bg-card/80 !shadow-lg !backdrop-blur-sm [&_button]:!border-cyan-500/10 [&_button]:!text-muted-foreground [&_button:hover]:!bg-cyan-500/10 [&_button:hover]:!text-cyan-300"
          />
        </ReactFlow>
      </div>

      {/* Detail panel — shows the selected node's role description */}
      <div
        className={cn(
          "mt-3 rounded-xl border bg-card/50 p-4 transition-colors duration-200",
          selectedNode ? selectedAccent.border : "border-border/60",
        )}
        aria-live="polite"
      >
        {selectedNode ? (
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-white/5",
                selectedAccent.bg,
                selectedAccent.text,
              )}
              aria-hidden="true"
            >
              <LucideIconRenderer
                name={selectedNode.icon}
                className="size-[18px]"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h5 className="text-sm font-semibold text-foreground">
                  {selectedNode.label}
                </h5>
                {selectedNode.subtitle ? (
                  <span
                    className={cn(
                      "font-mono text-[11px] font-medium uppercase tracking-wide",
                      selectedAccent.text,
                    )}
                  >
                    {selectedNode.subtitle}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {selectedNode.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <MousePointerClick
              className="size-4 shrink-0 text-cyan-400/70"
              aria-hidden="true"
            />
            <span>Click a node to learn more.</span>
          </div>
        )}
      </div>
    </figure>
  );
}

export default InteractiveGraph;

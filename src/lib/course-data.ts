/**
 * ROS2 Mastery — Course Navigation Data
 *
 * The 7-Phase Strategic Roadmap. All content has been generalized:
 * references to specific racing teams have been replaced with generic
 * robotics / autonomous vehicle terminology.
 */

export interface NavModule {
  id: string;
  title: string;
  /** Anchor slug for in-page navigation (h2/h3 id) */
  slug?: string;
  /** Estimated reading time in minutes */
  readingTime?: number;
}

export interface NavPhase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  /** The strategic "mission statement" quote */
  mission: string;
  /** What the learner will master */
  objectives: string[];
  /** Accent color token used for phase badges / left border */
  accent: "cyan" | "emerald" | "violet" | "amber" | "rose" | "sky" | "teal";
  icon: string;
  modules: NavModule[];
}

export const COURSE_PHASES: NavPhase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "The Nervous System",
    subtitle: "Core Communication",
    mission:
      "Build the fundamental 'Nervous System' of the robot. This phase establishes how every sensor and actuator acts as a single, synchronized organism using the ROS 2 Computation Graph.",
    objectives: [
      "Transform a single script into a distributed network of Nodes.",
      "Master the Executor logic to ensure no sensor data is lost during high-speed processing.",
      "Adhere to the ROS 2 SOP to maintain professional-grade code stability.",
    ],
    accent: "cyan",
    icon: "Brain",
    modules: [
      { id: "phase-1/middleware", title: "What is Robotics Middleware?", slug: "what-is-robotics-middleware", readingTime: 6 },
      { id: "phase-1/philosophy", title: "Microservices / Nervous System Analogy", slug: "microservices-nervous-system-analogy", readingTime: 4 },
      { id: "phase-1/pillars", title: "The 4 Pillars of ROS", slug: "the-4-pillars-of-ros", readingTime: 5 },
      { id: "phase-1/node", title: "The Node (Fundamental Worker)", slug: "the-node-fundamental-worker", readingTime: 9 },
      { id: "phase-1/executors", title: "Executors (The Engine)", slug: "executors-the-engine-of-the-node", readingTime: 5 },
      { id: "phase-1/sop", title: "ROS 2 Development Lifecycle (SOP)", slug: "ros-2-development-lifecycle-sop", readingTime: 7 },
      { id: "phase-1/cli", title: "Inspecting the Computation Graph (CLI)", slug: "inspecting-the-computation-graph-cli-tools", readingTime: 8 },
    ],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Integrated Communication Protocols",
    subtitle: "Topics · Services · Actions",
    mission:
      "Master the language of robotics. Define the protocols for how the robot 'talks' — from the non-stop stream of LiDAR data to the critical mission commands that must never fail.",
    objectives: [
      "Create robust Publishers/Subscribers for continuous telemetry and sensor feeds.",
      "Design Services for instant, reliable hardware triggers (like resetting an encoder).",
      "Implement Actions for complex maneuvers with proactive cancellation safety.",
    ],
    accent: "emerald",
    icon: "Radio",
    modules: [
      { id: "phase-2/topics", title: "Topics (Continuous Data Streams)", slug: "topics-continuous-data-streams", readingTime: 10 },
      { id: "phase-2/services", title: "Services (Synchronous Requests)", slug: "services-synchronous-requests", readingTime: 9 },
      { id: "phase-2/actions", title: "Actions (Long-Running Tasks)", slug: "actions-asynchronous-long-running-tasks", readingTime: 10 },
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "The Command Center",
    subtitle: "Orchestration & Tools",
    mission:
      "Take full control of the robot's behavior. Move from running parts to orchestrating a complete autonomous machine that can be tuned, launched, and diagnosed with professional precision.",
    objectives: [
      "Tune performance in real-time using Dynamic Parameters without restarting the system.",
      "Automate the entire autonomous stack deployment with a single Master Launch File.",
      "Utilize Rosbag2 as a 'Flight Data Recorder' and RViz2 as our visual eyes.",
    ],
    accent: "violet",
    icon: "Terminal",
    modules: [
      { id: "phase-3/parameters", title: "Parameters (Dynamic Configuration)", slug: "parameters-dynamic-configuration", readingTime: 9 },
      { id: "phase-3/launch", title: "The Launch System", slug: "the-launch-system", readingTime: 8 },
      { id: "phase-3/debugging", title: "Debugging & Data Logging", slug: "debugging-and-data-logging", readingTime: 7 },
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Spatial Awareness & Kinematics",
    subtitle: "TF2 Transform Framework",
    mission:
      "Give the robot a sense of space. Build the 'Digital Geometry' of the robot, ensuring that every sensor knows exactly where it is relative to the world and the chassis, down to the last millimeter.",
    objectives: [
      "Manage complex Coordinate Frames (Map, Odom, Base_link) to prevent localization errors.",
      "Solve real-world problems like sensor displacement and wheel-to-lidar calibration.",
      "Master TF2 Listeners and Broadcasters to maintain a perfect 3D transform tree.",
    ],
    accent: "amber",
    icon: "Compass",
    modules: [
      { id: "phase-4/tf2", title: "TF2 (The Transform Framework)", slug: "tf2-the-transform-framework", readingTime: 12 },
    ],
  },
  {
    id: "phase-5",
    number: 5,
    title: "Advanced Node Architecture",
    subtitle: "Composition & Lifecycle",
    mission:
      "Optimize the robot for extreme performance. Move beyond standard nodes to build a high-speed, deterministic system that can handle 4K vision and high-frequency LiDAR without breaking a sweat.",
    objectives: [
      "Use Composition and Zero-Copy communication to eliminate CPU bottlenecks.",
      "Enforce a Deterministic Boot Sequence using Lifecycle Nodes for safety.",
      "Orchestrate complex shared-memory containers for vision-heavy perception tasks.",
    ],
    accent: "rose",
    icon: "Layers",
    modules: [
      { id: "phase-5/composition", title: "Composition (Component Nodes)", slug: "composition-component-nodes", readingTime: 10 },
      { id: "phase-5/lifecycle", title: "Managed Nodes (Lifecycle)", slug: "managed-nodes-lifecycle-nodes", readingTime: 9 },
    ],
  },
  {
    id: "phase-6",
    number: 6,
    title: "Hardware & Simulation Integration",
    subtitle: "URDF · ros2_control · Gazebo",
    mission:
      "Bridge the gap between code and reality. Create a 'Digital Twin' of the robot, allowing you to test dangerous maneuvers in Gazebo before ever touching the physical hardware.",
    objectives: [
      "Describe the robot's physics and geometry using modular URDF/Xacro files.",
      "Implement ros2_control to handle the 'Muscles' (steering and motor torque).",
      "Master the Gazebo Physics Bridge to simulate real-world sensor feeds.",
    ],
    accent: "sky",
    icon: "Bot",
    modules: [
      { id: "phase-6/urdf", title: "Robot Description (URDF/Xacro)", slug: "robot-description-urdf-xacro", readingTime: 9 },
      { id: "phase-6/control", title: "ros2_control (The Muscle System)", slug: "ros-2-control-the-muscle-system", readingTime: 8 },
    ],
  },
  {
    id: "phase-7",
    number: 7,
    title: "The Autonomous Stack",
    subtitle: "EKF · SLAM · Nav2",
    mission:
      "Awaken the master autonomy. Fuse sensors, map the environment, and plan the optimal path to navigate autonomously while avoiding obstacles.",
    objectives: [
      "Implement the Extended Kalman Filter (EKF) to find the 'Filtered Truth'.",
      "Build high-resolution maps using SLAM while localizing at speed.",
      "Orchestrate the Nav2 Framework to compute paths and avoid obstacles.",
    ],
    accent: "teal",
    icon: "Rocket",
    modules: [
      { id: "phase-7/ekf", title: "Sensor Fusion & State Estimation (EKF)", slug: "sensor-fusion-state-estimation-ekf", readingTime: 10 },
      { id: "phase-7/slam", title: "Perception & Mapping (SLAM)", slug: "perception-mapping-slam", readingTime: 9 },
      { id: "phase-7/nav2", title: "Nav2 (Navigation Framework)", slug: "nav-2-the-navigation-framework", readingTime: 11 },
    ],
  },
];

/** Flat list of all module IDs (for progress tracking). */
export const ALL_MODULE_IDS: string[] = COURSE_PHASES.flatMap((phase) =>
  phase.modules.map((m) => m.id)
);

/** Find a phase by one of its module IDs. */
export function findPhaseByModule(moduleId: string): NavPhase | undefined {
  return COURSE_PHASES.find((phase) =>
    phase.modules.some((m) => m.id === moduleId)
  );
}

/** Find a module by ID. */
export function findModule(moduleId: string): NavModule | undefined {
  for (const phase of COURSE_PHASES) {
    const m = phase.modules.find((mod) => mod.id === moduleId);
    if (m) return m;
  }
  return undefined;
}

/** Get the previous and next module across the whole course (for pagination). */
export function getAdjacentModules(
  moduleId: string
): { prev?: { module: NavModule; phase: NavPhase }; next?: { module: NavModule; phase: NavPhase } } {
  const flat: { module: NavModule; phase: NavPhase }[] = [];
  for (const phase of COURSE_PHASES) {
    for (const mod of phase.modules) {
      flat.push({ module: mod, phase });
    }
  }
  const idx = flat.findIndex((item) => item.module.id === moduleId);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

export const ACCENT_CLASSES: Record<
  NavPhase["accent"],
  { text: string; bg: string; border: string; ring: string; dot: string }
> = {
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    ring: "ring-cyan-500/20",
    dot: "bg-cyan-400",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-400",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    ring: "ring-violet-500/20",
    dot: "bg-violet-400",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    ring: "ring-amber-500/20",
    dot: "bg-amber-400",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    ring: "ring-rose-500/20",
    dot: "bg-rose-400",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    ring: "ring-sky-500/20",
    dot: "bg-sky-400",
  },
  teal: {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    ring: "ring-teal-500/20",
    dot: "bg-teal-400",
  },
};

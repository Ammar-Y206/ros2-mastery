/**
 * Search index for the ROS2 Mastery platform.
 * 
 * Pre-built static index of searchable content across all 7 phases.
 * Each entry contains: phase number, phase title, module id, module title,
 * and a list of keywords/headings that the learner might search for.
 * 
 * This is a static build-time index (no runtime MDX parsing needed).
 * Fuse.js performs fuzzy matching on this index at runtime.
 */

export interface SearchEntry {
  moduleId: string;
  phaseNumber: number;
  phaseTitle: string;
  moduleTitle: string;
  /** Keywords, headings, and concepts found in this module's content */
  keywords: string;
  /** Section headings within this module */
  headings: string[];
}

export const SEARCH_INDEX: SearchEntry[] = [
  // Phase 1
  {
    moduleId: "phase-1/middleware",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "What is Robotics Middleware?",
    keywords: "middleware monolithic vs ros2 dds nodes pub sub nervous system analogy why standalone program fails concurrency bottleneck single point of failure reinventing wheel",
    headings: ["What is Robotics Middleware", "The Nervous System Analogy", "The 4 Pillars of ROS"],
  },
  {
    moduleId: "phase-1/philosophy",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "Microservices / Nervous System Analogy",
    keywords: "microservices nervous system analogy camera node perception node control node eyes brain legs swap test biological",
    headings: ["Microservices Nervous System Analogy"],
  },
  {
    moduleId: "phase-1/pillars",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "The 4 Pillars of ROS",
    keywords: "hardware abstraction drivers message passing plumbing package management ecosystem tools laboratory gazebo rviz2 god node single responsibility",
    headings: ["The 4 Pillars of ROS"],
  },
  {
    moduleId: "phase-1/node",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "The Node (Fundamental Worker)",
    keywords: "node rclcpp rclpy class inheritance constructor timer callback spin executor telemetry_node telemetry_monitor dds graph computation",
    headings: ["The Node Fundamental Worker", "Implementation Writing Your First Node"],
  },
  {
    moduleId: "phase-1/executors",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "Executors (The Engine)",
    keywords: "executor single-threaded multi-threaded spin callback blocking deadlock timer queue dds thread safety",
    headings: ["Executors The Engine of the Node"],
  },
  {
    moduleId: "phase-1/sop",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "ROS 2 Development Lifecycle (SOP)",
    keywords: "sop development lifecycle colcon build symlink-install source setup.bash overlay underlay workspace package create ghost code cross-contaminated bashrc",
    headings: ["ROS 2 Development Lifecycle SOP"],
  },
  {
    moduleId: "phase-1/cli",
    phaseNumber: 1,
    phaseTitle: "The Nervous System",
    moduleTitle: "Inspecting the Computation Graph (CLI)",
    keywords: "ros2 run ros2 node list ros2 node info cli tools introspection graph inspection name collision namespace",
    headings: ["Inspecting the Computation Graph CLI Tools"],
  },

  // Phase 2
  {
    moduleId: "phase-2/topics",
    phaseNumber: 2,
    phaseTitle: "Integrated Communication Protocols",
    moduleTitle: "Topics (Continuous Data Streams)",
    keywords: "topics pub sub publisher subscriber dds lidar scan /vehicle/speed std_msgs float32 qos quality of service fire-and-forget many-to-many decoupled",
    headings: ["Topics Continuous Data Streams", "Implementation The Publisher", "Implementation The Subscriber", "Inspecting the Data Stream CLI Tools"],
  },
  {
    moduleId: "phase-2/services",
    phaseNumber: 2,
    phaseTitle: "Integrated Communication Protocols",
    moduleTitle: "Services (Synchronous Requests)",
    keywords: "services client server request response synchronous setbool pid toggle deadlock trap async_send_request call_async blocking",
    headings: ["Services Synchronous Requests", "Implementation The Service Server", "Implementation The Service Client", "The Deadlock Trap"],
  },
  {
    moduleId: "phase-2/actions",
    phaseNumber: 2,
    phaseTitle: "Integrated Communication Protocols",
    moduleTitle: "Actions (Asynchronous, Long-Running Tasks)",
    keywords: "actions goal feedback result cancel goal_handle preempt proactive cancellation drive_distance safety planner obstacle detection ros2 action send_goal",
    headings: ["Actions Asynchronous Long-Running Tasks", "Implementation The Action Client", "Proactive Cancellation Safety"],
  },

  // Phase 3
  {
    moduleId: "phase-3/parameters",
    phaseNumber: 3,
    phaseTitle: "The Command Center",
    moduleTitle: "Parameters (Dynamic Configuration)",
    keywords: "parameters dynamic parameter kp ki kd pid declare_parameter get_parameter set_parameter add_on_set_parameters_callback yaml bulk loading ros2 param list get set dump",
    headings: ["Parameters Dynamic Configuration", "Implementation Dynamic Parameters", "Inspecting and Mutating Parameters CLI Tools"],
  },
  {
    moduleId: "phase-3/launch",
    phaseNumber: 3,
    phaseTitle: "The Command Center",
    moduleTitle: "The Launch System",
    keywords: "launch system python launch file LaunchDescription Node package executable remapping namespacing include composition master bringup use_sim_time get_package_share_directory",
    headings: ["The Launch System", "Implementation The Python Launch File", "Launch File Composition"],
  },
  {
    moduleId: "phase-3/debugging",
    phaseNumber: 3,
    phaseTitle: "The Command Center",
    moduleTitle: "Debugging & Data Logging",
    keywords: "rosbag2 record play bag info rviz2 visualization raw data vs visualized bag loop clock use_sim_time fixed frame ssd storage nightmare tuning loop",
    headings: ["Debugging and Data Logging Rosbag2 RViz2", "Implementation CLI Tools", "Critical Debugging Pitfalls"],
  },

  // Phase 4
  {
    moduleId: "phase-4/tf2",
    phaseNumber: 4,
    phaseTitle: "Spatial Awareness & Kinematics",
    moduleTitle: "TF2 (The Transform Framework)",
    keywords: "tf2 transform framework coordinate frames map odom base_link lidar_link camera_link imu_link tf tree rep-105 static broadcaster dynamic broadcaster listener quaternion lookupTransform tf2_echo tf2_echo view_frames tf2_monitor extrapolation broken tree",
    headings: ["TF2 The Transform Framework", "The TF Tree", "Implementation Static Broadcaster", "Implementation Dynamic Broadcaster and Listener", "CLI Tools and Debugging CRITICAL"],
  },

  // Phase 5
  {
    moduleId: "phase-5/composition",
    phaseNumber: 5,
    phaseTitle: "Advanced Node Architecture",
    moduleTitle: "Composition (Component Nodes)",
    keywords: "composition component nodes zero-copy intra-process communication ipc shared memory dds network component container rclcpp_components register_node_macro plugin library",
    headings: ["Composition Component Nodes"],
  },
  {
    moduleId: "phase-5/lifecycle",
    phaseNumber: 5,
    phaseTitle: "Advanced Node Architecture",
    moduleTitle: "Managed Nodes (Lifecycle)",
    keywords: "lifecycle nodes managed nodes state machine unconfigured inactive active finalized on_configure on_activate on_deactivate on_cleanup deterministic boot sequence lifecycle manager",
    headings: ["Managed Nodes Lifecycle Nodes"],
  },

  // Phase 6
  {
    moduleId: "phase-6/urdf",
    phaseNumber: 6,
    phaseTitle: "Hardware & Simulation Integration",
    moduleTitle: "Robot Description (URDF/Xacro)",
    keywords: "urdf xacro robot description link joint visual collision inertial static continuous revolute wheel macro property gazebo mesh collada robot_state_publisher rsp launch inertial pitfall orientation trap",
    headings: ["Robot Description URDF Xacro", "Implementation The Xacro File", "Visualizing the Result"],
  },
  {
    moduleId: "phase-6/control",
    phaseNumber: 6,
    phaseTitle: "Hardware & Simulation Integration",
    moduleTitle: "ros2_control (The Muscle System)",
    keywords: "ros2_control hardware abstraction layer hal controller manager resource manager hardware interface plugin command_interface state_interface read write real-time diff_drive ackermann controllers yaml urdf integration",
    headings: ["ros2_control The Muscle System", "The Ecosystem", "Implementation URDF Integration and YAML Config"],
  },

  // Phase 7
  {
    moduleId: "phase-7/ekf",
    phaseNumber: 7,
    phaseTitle: "The Autonomous Stack",
    moduleTitle: "Sensor Fusion & State Estimation (EKF)",
    keywords: "ekf extended kalman filter sensor fusion robot_localization odometry imu gps noisy filtered truth covariance matrix 15-element state vector yaw correction drift map odom base_link world_frame",
    headings: ["Sensor Fusion State Estimation EKF", "The EKF Architecture", "Implementation The EKF Configuration", "Best Practices and Pitfalls CRITICAL"],
  },
  {
    moduleId: "phase-7/slam",
    phaseNumber: 7,
    phaseTitle: "The Autonomous Stack",
    moduleTitle: "Perception & Mapping (SLAM)",
    keywords: "slam simultaneous localization mapping slam_toolbox occupancy grid map save map_saver loop closure scan matching ghost map vibration async vs sync mapping mode localization mode",
    headings: ["Perception and Mapping SLAM", "The SLAM Pipeline", "Implementation SLAM Configuration and Launch"],
  },
  {
    moduleId: "phase-7/nav2",
    phaseNumber: 7,
    phaseTitle: "The Autonomous Stack",
    moduleTitle: "Nav2 (Navigation Framework)",
    keywords: "nav2 navigation framework bt navigator behavior tree planner server controller server recovery server cmd_vel regulated pure pursuit rpp costmap global local inflation radius footprint ackermann navigate_to_pose action lifecycle",
    headings: ["Nav2 The Navigation Framework", "The Nav2 Architecture", "Implementation Nav2 Configuration", "Costmap Management Global vs Local", "Testing the Nav2 Stack"],
  },
];

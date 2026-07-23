"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedRobotSchematic — a stylized SVG blueprint of an autonomous mobile
 * robot with animated data pulses flowing from sensors to the compute box
 * and from the compute box to the motors.
 *
 * Design: minimalist top-down view, dark cyan/teal lines on transparent
 * background. Glowing dots travel along SVG paths representing ROS2 topics:
 *   - LiDAR  → Compute: green pulse (/scan, 10Hz)
 *   - Camera → Compute: blue pulse  (/image_raw, 30Hz)
 *   - Compute → Wheels: orange pulse (/cmd_vel, 20Hz)
 *
 * The compute box has a subtle pulsing glow. On hover, pulse speed
 * increases slightly (high-frequency processing effect).
 *
 * Pure SVG + CSS animations — no Three.js, no GLTF, 60fps, fully responsive.
 */
export function AnimatedRobotSchematic({ className }: { className?: string }) {
  const [hovered, setHovered] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scale animation speed based on hover state
  const speedMultiplier = hovered ? 0.55 : 1; // lower = faster

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredPath(null);
      }}
    >
      <svg
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-label="Animated robot schematic showing data flow from sensors to compute unit to motors"
      >
        <defs>
          {/* Glow filters */}
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients */}
          <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d1117" />
            <stop offset="100%" stopColor="#161b22" />
          </linearGradient>
          <radialGradient id="compute-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Robot Body (top-down view) ── */}
        {/* Main chassis */}
        <rect
          x="180" y="140" width="240" height="220"
          rx="16" ry="16"
          fill="url(#body-grad)"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        {/* Inner chassis detail */}
        <rect
          x="200" y="160" width="200" height="180"
          rx="10" ry="10"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.5"
          strokeOpacity="0.15"
          strokeDasharray="4 4"
        />

        {/* ── Wheels (4 corners) ── */}
        {[
          { x: 165, y: 155, label: "FL" },
          { x: 435, y: 155, label: "FR" },
          { x: 165, y: 345, label: "RL" },
          { x: 435, y: 345, label: "RR" },
        ].map((wheel, i) => (
          <g key={i}>
            <rect
              x={wheel.x - 15} y={wheel.y - 30}
              width="30" height="60"
              rx="6" ry="6"
              fill="#0a0e1a"
              stroke="#475569"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            <rect
              x={wheel.x - 10} y={wheel.y - 22}
              width="20" height="44"
              rx="3" ry="3"
              fill="none"
              stroke="#64748b"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            <text
              x={wheel.x} y={wheel.y + 3}
              textAnchor="middle"
              className="fill-slate-600"
              style={{ fontSize: "8px", fontFamily: "monospace" }}
            >
              {wheel.label}
            </text>
          </g>
        ))}

        {/* ── LiDAR Dome (top center of chassis) ── */}
        <g>
          <circle cx="300" cy="120" r="28" fill="#0a0e1a" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="300" cy="120" r="20" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" />
          <circle cx="300" cy="120" r="12" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.15" />
          <circle cx="300" cy="120" r="4" fill="#22d3ee" fillOpacity="0.3" />
          {/* LiDAR scan rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={300 + Math.cos(rad) * 28}
                y1={120 + Math.sin(rad) * 28}
                x2={300 + Math.cos(rad) * 42}
                y2={120 + Math.sin(rad) * 42}
                stroke="#22d3ee"
                strokeWidth="0.5"
                strokeOpacity="0.15"
              />
            );
          })}
          <text
            x="300" y="85"
            textAnchor="middle"
            className="fill-cyan-400/40"
            style={{ fontSize: "8px", fontFamily: "monospace", fontWeight: 600 }}
          >
            LiDAR
          </text>
        </g>

        {/* ── Camera (front center) ── */}
        <g>
          <rect x="285" y="355" width="30" height="20" rx="4" fill="#0a0e1a" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="300" cy="365" r="5" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.3" />
          <circle cx="300" cy="365" r="2" fill="#3b82f6" fillOpacity="0.2" />
          <text
            x="300" y="392"
            textAnchor="middle"
            className="fill-blue-400/40"
            style={{ fontSize: "8px", fontFamily: "monospace", fontWeight: 600 }}
          >
            Camera
          </text>
        </g>

        {/* ── Compute Box (center) ── */}
        <g>
          {/* Glow halo */}
          <circle cx="300" cy="250" r="60" fill="url(#compute-glow)">
            <animate
              attributeName="r"
              values="55;65;55"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Box */}
          <rect
            x="260" y="215" width="80" height="70"
            rx="10" ry="10"
            fill="#0d1117"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            filter="url(#glow-cyan)"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.6;0.3"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </rect>
          {/* CPU lines inside */}
          <line x1="275" y1="230" x2="325" y2="230" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" />
          <line x1="275" y1="240" x2="320" y2="240" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.15" />
          <line x1="275" y1="250" x2="325" y2="250" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" />
          <line x1="275" y1="260" x2="315" y2="260" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.15" />
          <line x1="275" y1="270" x2="325" y2="270" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Label */}
          <text
            x="300" y="255"
            textAnchor="middle"
            className="fill-cyan-300/50"
            style={{ fontSize: "7px", fontFamily: "monospace", fontWeight: 700 }}
          >
            ROS2
          </text>
          <text
            x="300" y="268"
            textAnchor="middle"
            className="fill-cyan-300/30"
            style={{ fontSize: "6px", fontFamily: "monospace" }}
          >
            COMPUTE
          </text>
        </g>

        {/* ─────────────────────────────────────────────────────── */}
        {/* ── Data Flow Paths (invisible — used for pulse animation) ── */}
        {/* ─────────────────────────────────────────────────────── */}

        {/* LiDAR → Compute (green, /scan) */}
        <path
          id="path-lidar"
          d="M 300 148 L 300 215"
          fill="none"
          stroke={hoveredPath === "lidar" ? "#10b981" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredPath("lidar")}
          onMouseLeave={() => setHoveredPath(null)}
        />
        {/* Visible guide line (very subtle) */}
        <line x1="300" y1="148" x2="300" y2="215" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Camera → Compute (blue, /image_raw) */}
        <path
          id="path-camera"
          d="M 300 355 L 300 285"
          fill="none"
          stroke={hoveredPath === "camera" ? "#3b82f6" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredPath("camera")}
          onMouseLeave={() => setHoveredPath(null)}
        />
        <line x1="300" y1="355" x2="300" y2="285" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Compute → Front-Left Wheel (orange, /cmd_vel) */}
        <path
          id="path-cmd-fl"
          d="M 260 230 L 180 185"
          fill="none"
          stroke={hoveredPath === "cmd" ? "#f97316" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredPath("cmd")}
          onMouseLeave={() => setHoveredPath(null)}
        />
        <line x1="260" y1="230" x2="180" y2="185" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Compute → Front-Right Wheel */}
        <path
          id="path-cmd-fr"
          d="M 340 230 L 420 185"
          fill="none"
          stroke={hoveredPath === "cmd" ? "#f97316" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
        />
        <line x1="340" y1="230" x2="420" y2="185" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Compute → Rear-Left Wheel */}
        <path
          id="path-cmd-rl"
          d="M 260 270 L 180 345"
          fill="none"
          stroke={hoveredPath === "cmd" ? "#f97316" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
        />
        <line x1="260" y1="270" x2="180" y2="345" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Compute → Rear-Right Wheel */}
        <path
          id="path-cmd-rr"
          d="M 340 270 L 420 345"
          fill="none"
          stroke={hoveredPath === "cmd" ? "#f97316" : "none"}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="3 3"
        />
        <line x1="340" y1="270" x2="420" y2="345" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* ─────────────────────────────────────────────────────── */}
        {/* ── Animated Data Pulses ── */}
        {/* ─────────────────────────────────────────────────────── */}

        {/* LiDAR → Compute: Green pulses (/scan 10Hz) */}
        {[0, 0.4, 0.8].map((delay, i) => (
          <circle key={`lidar-${i}`} r="3" fill="#10b981" filter="url(#glow-green)">
            <animateMotion
              dur={`${2.0 * speedMultiplier}s`}
              repeatCount="indefinite"
              begin={`${delay * speedMultiplier}s`}
            >
              <mpath href="#path-lidar" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              dur={`${2.0 * speedMultiplier}s`}
              repeatCount="indefinite"
              begin={`${delay * speedMultiplier}s`}
            />
          </circle>
        ))}

        {/* Camera → Compute: Blue pulses (/image_raw 30Hz — faster) */}
        {[0, 0.25, 0.5, 0.75].map((delay, i) => (
          <circle key={`camera-${i}`} r="2.5" fill="#3b82f6" filter="url(#glow-blue)">
            <animateMotion
              dur={`${1.0 * speedMultiplier}s`}
              repeatCount="indefinite"
              begin={`${delay * speedMultiplier}s`}
            >
              <mpath href="#path-camera" />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;0.85;0.85;0"
              dur={`${1.0 * speedMultiplier}s`}
              repeatCount="indefinite"
              begin={`${delay * speedMultiplier}s`}
            />
          </circle>
        ))}

        {/* Compute → Wheels: Orange pulses (/cmd_vel 20Hz) */}
        {[
          { path: "path-cmd-fl", delays: [0, 0.6] },
          { path: "path-cmd-fr", delays: [0.15, 0.75] },
          { path: "path-cmd-rl", delays: [0.3, 0.9] },
          { path: "path-cmd-rr", delays: [0.45, 1.05] },
        ].map(({ path, delays }) =>
          delays.map((delay, i) => (
            <circle
              key={`${path}-${i}`}
              r="2.5"
              fill="#f97316"
              filter="url(#glow-orange)"
            >
              <animateMotion
                dur={`${1.5 * speedMultiplier}s`}
                repeatCount="indefinite"
                begin={`${delay * speedMultiplier}s`}
              >
                <mpath href={`#${path}`} />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0;0.85;0.85;0"
                dur={`${1.5 * speedMultiplier}s`}
                repeatCount="indefinite"
                begin={`${delay * speedMultiplier}s`}
              />
            </circle>
          ))
        )}

        {/* ── Hover Labels ── */}
        {hoveredPath === "lidar" && (
          <g>
            <rect x="255" y="168" width="90" height="18" rx="4" fill="#0d1117" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.5" />
            <text x="300" y="180" textAnchor="middle" fill="#10b981" style={{ fontSize: "9px", fontFamily: "monospace" }}>
              /scan · 10Hz
            </text>
          </g>
        )}
        {hoveredPath === "camera" && (
          <g>
            <rect x="250" y="308" width="100" height="18" rx="4" fill="#0d1117" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.5" />
            <text x="300" y="320" textAnchor="middle" fill="#3b82f6" style={{ fontSize: "9px", fontFamily: "monospace" }}>
              /image_raw · 30Hz
            </text>
          </g>
        )}
        {hoveredPath === "cmd" && (
          <g>
            <rect x="255" y="248" width="90" height="18" rx="4" fill="#0d1117" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.5" />
            <text x="300" y="260" textAnchor="middle" fill="#f97316" style={{ fontSize: "9px", fontFamily: "monospace" }}>
              /cmd_vel · 20Hz
            </text>
          </g>
        )}

        {/* ── Topic Legend (bottom) ── */}
        <g opacity="0.4">
          <circle cx="195" cy="445" r="3" fill="#10b981" />
          <text x="205" y="448" fill="#10b981" style={{ fontSize: "7px", fontFamily: "monospace" }}>/scan</text>

          <circle cx="270" cy="445" r="3" fill="#3b82f6" />
          <text x="280" y="448" fill="#3b82f6" style={{ fontSize: "7px", fontFamily: "monospace" }}>/image_raw</text>

          <circle cx="365" cy="445" r="3" fill="#f97316" />
          <text x="375" y="448" fill="#f97316" style={{ fontSize: "7px", fontFamily: "monospace" }}>/cmd_vel</text>
        </g>
      </svg>
    </div>
  );
}

export default AnimatedRobotSchematic;

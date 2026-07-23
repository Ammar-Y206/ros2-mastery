"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Float,
  Line,
  Environment,
  ContactShadows,
  MeshDistortMaterial,
} from "@react-three/drei";
import type { Mesh, Group, Points } from "three";
import * as THREE from "three";

/**
 * CyberRover3D — a procedural, low-poly "cyber rover" built entirely from
 * React Three Fiber primitive geometries. No external .glb files.
 *
 * Visual concept: a sci-fi holographic blueprint of an autonomous robot's
 * compute core, with glowing neon data lines flowing from sensors to the
 * brain and from the brain to the wheels.
 *
 * Structure:
 * - Chassis: dark metallic box
 * - Compute Core: distorted icosahedron, glowing cyan, pulsing
 * - LiDAR: thin cylinder, glowing green
 * - Camera: small sphere, glowing blue
 * - 4 Wheels: cylinders at corners, glowing orange rims
 * - Data Lines: neon lines from sensors → core, core → wheels
 * - Animated data packets: small spheres traveling along the lines
 */

// ── Helper: animated sphere traveling between two points ──
function DataPacket({
  start,
  end,
  color,
  speed = 1,
  offset = 0,
  size = 0.05,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
  offset?: number;
  size?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.getElapsedTime() * speed + offset) % 1;
    ref.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], t),
      THREE.MathUtils.lerp(start[1], end[1], t),
      THREE.MathUtils.lerp(start[2], end[2], t)
    );
    // Fade in/out at start/end
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    const fade = Math.sin(t * Math.PI);
    mat.opacity = fade;
    mat.emissiveIntensity = 2 * fade;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

// ── The Rover assembly ──
function RoverModel() {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Slow auto-rotation of the entire rover
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.25;
    }

    // Pulsing core emissive
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + Math.sin(t * 1.5) * 0.2;
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
  });

  // Key positions
  const corePos: [number, number, number] = [0, 0.5, 0];
  const lidarPos: [number, number, number] = [0, 0.8, 1.2];
  const cameraPos: [number, number, number] = [0, 0.6, -1.2];
  const wheelPositions: [number, number, number][] = [
    [0.9, -0.3, 0.8],
    [-0.9, -0.3, 0.8],
    [0.9, -0.3, -0.8],
    [-0.9, -0.3, -0.8],
  ];

  return (
    <group ref={groupRef}>
      {/* ── Chassis (dark metallic box) ── */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.4, 0.5, 2.8]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>

      {/* Chassis top detail (slightly smaller box on top) */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[2.0, 0.15, 2.4]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* ── Compute Core (glowing distorted icosahedron) ── */}
      <mesh ref={coreRef} position={corePos}>
        <icosahedronGeometry args={[0.4, 1]} />
        <MeshDistortMaterial
          color="#0891b2"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.9}
          distort={0.25}
          speed={2.5}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh position={corePos}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.8}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* ── LiDAR (thin green cylinder, front) ── */}
      <mesh position={lidarPos}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 12]} />
        <meshStandardMaterial
          color="#065f46"
          emissive="#10b981"
          emissiveIntensity={1.2}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {/* LiDAR top cap */}
      <mesh position={[lidarPos[0], lidarPos[1] + 0.28, lidarPos[2]]}>
        <cylinderGeometry args={[0.05, 0.08, 0.08, 12]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* ── Camera (small blue sphere, rear) ── */}
      <mesh position={cameraPos}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#1e3a5f"
          emissive="#3b82f6"
          emissiveIntensity={1.0}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {/* Camera lens */}
      <mesh position={[cameraPos[0], cameraPos[1], cameraPos[2] - 0.08]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={2}
        />
      </mesh>

      {/* ── 4 Wheels (cylinders at corners, orange glow) ── */}
      {wheelPositions.map((pos, i) => (
        <group key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          {/* Wheel body */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial
              color="#1a1a2e"
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>
          {/* Wheel rim (glowing orange) */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.16, 12]} />
            <meshStandardMaterial
              color="#7c2d12"
              emissive="#f97316"
              emissiveIntensity={0.8}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* ── Data Flow Lines ── */}
      {/* LiDAR → Core (green) */}
      <Line
        points={[lidarPos, corePos]}
        color="#10b981"
        lineWidth={1.5}
        transparent
        opacity={0.4}
      />
      {/* Camera → Core (blue) */}
      <Line
        points={[cameraPos, corePos]}
        color="#3b82f6"
        lineWidth={1.5}
        transparent
        opacity={0.4}
      />
      {/* Core → 4 Wheels (orange) */}
      {wheelPositions.map((pos, i) => (
        <Line
          key={i}
          points={[corePos, pos]}
          color="#f97316"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}

      {/* ── Animated Data Packets ── */}
      {/* LiDAR → Core (green, /scan) */}
      {[0, 0.33, 0.66].map((offset) => (
        <DataPacket
          key={`lidar-${offset}`}
          start={lidarPos}
          end={corePos}
          color="#10b981"
          speed={0.8}
          offset={offset}
          size={0.06}
        />
      ))}

      {/* Camera → Core (blue, /image_raw — faster) */}
      {[0, 0.25, 0.5, 0.75].map((offset) => (
        <DataPacket
          key={`camera-${offset}`}
          start={cameraPos}
          end={corePos}
          color="#3b82f6"
          speed={1.5}
          offset={offset}
          size={0.05}
        />
      ))}

      {/* Core → Wheels (orange, /cmd_vel) */}
      {wheelPositions.map((pos, i) => (
        <DataPacket
          key={`wheel-${i}`}
          start={corePos}
          end={pos}
          color="#f97316"
          speed={1.0}
          offset={i * 0.25}
          size={0.05}
        />
      ))}

      {/* ── Topic labels (floating text) ── */}
      {/* Using simple small meshes as visual markers instead of text for performance */}
    </group>
  );
}

function SceneContents() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <spotLight
        position={[0, 5, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.5}
        color="#22d3ee"
        castShadow
      />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#818cf8" />
      <pointLight position={[3, -1, 3]} intensity={0.3} color="#f97316" />

      {/* The 3D Rover */}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
        <RoverModel />
      </Float>

      {/* Environment for metallic reflections */}
      <Environment preset="night" />

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.35}
        scale={8}
        blur={2.5}
        far={3}
        color="#22d3ee"
      />
    </>
  );
}

export function CyberRover3D({ className }: { className?: string }) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContents />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default CyberRover3D;

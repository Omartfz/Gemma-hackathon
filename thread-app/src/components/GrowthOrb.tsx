"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls, Sphere } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

const MIN_SCALE = 0.45;
const MAX_SCALE = 1.2;
const MAX_WEEK_FOR_SCALE = 40;

function weekToScale(week: number): number {
  const t = Math.min(Math.max(week / MAX_WEEK_FOR_SCALE, 0), 1);
  return MIN_SCALE + t * (MAX_SCALE - MIN_SCALE);
}

function Orb({ color, targetScale }: { color: string; targetScale: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.y += 0.0025;
    const breathe = 1 + Math.sin(state.clock.getElapsedTime() * 0.9) * 0.02;
    mesh.scale.setScalar(targetScale * breathe);
  });

  return (
    <Sphere ref={meshRef} args={[1, 96, 96]}>
      <MeshDistortMaterial color={color} distort={0.35} speed={1.4} roughness={0.3} metalness={0.05} />
    </Sphere>
  );
}

export function GrowthOrb({ week, color }: { week: number; color: string }) {
  const targetScale = weekToScale(week);

  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <directionalLight position={[-3, -2, -2]} intensity={0.35} />
      <Orb color={color} targetScale={targetScale} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

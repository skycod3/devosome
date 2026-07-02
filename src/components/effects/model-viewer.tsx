"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import type { Group, Mesh } from "three";

/**
 * Point this at a real model once it's added to /public/models — e.g.
 * "/models/avatar.glb". While it's null, the viewer renders an animated
 * wireframe primitive so the hero still works without an asset.
 */
const MODEL_URL: string | null = null;

interface ModelViewerProps {
  /** Idle auto-rotation; turn off for reduced-motion users. */
  spin?: boolean;
}

function SpinningPlaceholder({ spin }: { spin: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (spin && ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial color="#f59e0b" wireframe />
    </mesh>
  );
}

function GltfModel({ url, spin }: { url: string; spin: boolean }) {
  const { scene } = useGLTF(url);
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (spin && ref.current) ref.current.rotation.y += delta * 0.3;
  });
  return (
    <Center>
      <primitive ref={ref} object={scene} />
    </Center>
  );
}

export default function ModelViewer({ spin = true }: ModelViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <Suspense fallback={null}>
        {MODEL_URL ? (
          <GltfModel url={MODEL_URL} spin={spin} />
        ) : (
          <SpinningPlaceholder spin={spin} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={spin}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}

if (MODEL_URL) useGLTF.preload(MODEL_URL);

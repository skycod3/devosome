"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, useGLTF } from "@react-three/drei";
import type { Group, Mesh } from "three";

const MODEL_URL: string | null = "/models/laptop.glb";

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
    <group ref={ref}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function ModelViewer({ spin = true }: ModelViewerProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={1} />
      <hemisphereLight args={["#ffffff", "#9a9aae", 1.2]} />
      <directionalLight position={[3, 4, 3]} intensity={2.5} />
      <directionalLight position={[-4, 2, -3]} intensity={1} />
      <Suspense fallback={null}>
        <Bounds fit margin={1.5}>
          {MODEL_URL ? (
            <GltfModel url={MODEL_URL} spin={spin} />
          ) : (
            <SpinningPlaceholder spin={spin} />
          )}
        </Bounds>
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
    </Canvas>
  );
}

if (MODEL_URL) useGLTF.preload(MODEL_URL);

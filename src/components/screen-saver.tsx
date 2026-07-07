"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import gsap from "gsap";
import {
  SCREENSAVER_AMBIENT_INTENSITY,
  SCREENSAVER_ANIMATION_INDEX,
  SCREENSAVER_BG_COLOR,
  SCREENSAVER_CAMERA_FAR,
  SCREENSAVER_CAMERA_FOV,
  SCREENSAVER_CAMERA_NEAR,
  SCREENSAVER_CAMERA_POSITION,
  SCREENSAVER_CAMERA_TARGET,
  SCREENSAVER_DIR_LIGHT_INTENSITY,
  SCREENSAVER_DIR_LIGHT_POSITION,
  SCREENSAVER_FADEIN_DURATION,
  SCREENSAVER_MODEL_URL,
} from "@/constants/screen-saver";

export function ScreenSaver() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCREENSAVER_BG_COLOR);

    const ambient = new THREE.AmbientLight(
      0xffffff,
      SCREENSAVER_AMBIENT_INTENSITY,
    );
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(
      0xffffff,
      SCREENSAVER_DIR_LIGHT_INTENSITY,
    );
    dirLight.position.set(...SCREENSAVER_DIR_LIGHT_POSITION);
    scene.add(dirLight);

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      SCREENSAVER_CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      SCREENSAVER_CAMERA_NEAR,
      SCREENSAVER_CAMERA_FAR,
    );
    camera.position.set(...SCREENSAVER_CAMERA_POSITION);
    camera.lookAt(...SCREENSAVER_CAMERA_TARGET);

    // ── Model ────────────────────────────────────────────────────────────────
    let mixer: THREE.AnimationMixer | null = null;
    let modelRoot: THREE.Object3D | null = null;

    const loader = new ColladaLoader();
    loader.load(
      SCREENSAVER_MODEL_URL,
      (collada) => {
        if (!collada) return;
        modelRoot = collada.scene;
        const animations = modelRoot.animations;
        if (animations.length > 0) {
          mixer = new THREE.AnimationMixer(modelRoot);
          mixer.clipAction(animations[SCREENSAVER_ANIMATION_INDEX]).play();
        }
        scene.add(modelRoot);

        // The black container is already visible (immediate feedback); fade in
        // just the canvas/model once it's ready.
        gsap.fromTo(
          canvas,
          { opacity: 0 },
          {
            opacity: 1,
            duration: SCREENSAVER_FADEIN_DURATION,
            ease: "power2.out",
          },
        );
      },
      undefined,
      (err) => console.error("[ScreenSaver] model load error", err),
    );

    // ── Resize handler ───────────────────────────────────────────────────────
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    // ── Render loop ──────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      mixer?.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      mixer?.stopAllAction();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-9998 bg-black">
      <canvas ref={canvasRef} className="size-full" style={{ opacity: 0 }} />
    </div>
  );
}

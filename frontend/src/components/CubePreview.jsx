import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function CubePreview({ config = {} }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const frameRef = useRef(null);

  // Create scene ONCE
  useEffect(() => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(280, 280);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: "#66ffdd" });
    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
    scene.add(cube);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(2, 2, 4);
    scene.add(dirLight);

    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mountRef.current.innerHTML = "";
    };
  }, []);

  // Mutate cube on config change
  useEffect(() => {
    if (!cubeRef.current) return;

    const { color, size } = config;

    if (typeof size === "number") {
      cubeRef.current.geometry.dispose();
      cubeRef.current.geometry = new THREE.BoxGeometry(size, size, size);
    }

    if (color) {
      cubeRef.current.material.color.set(color);
    }
  }, [config]);

  return (
    <div
      ref={mountRef}
      className="
        relative flex items-center justify-center min-h-[360px]
        rounded-3xl border
        bg-white/70 border-slate-200
        dark:bg-slate-950/90 dark:border-slate-800
      "
    />
  );
}

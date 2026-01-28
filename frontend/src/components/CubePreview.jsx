import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function CubePreview({ config = {} }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cubeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

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
      // 🛑 cancel animation first
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      // 🧹 dispose Three.js resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();

      // 🧠 remove canvas safely
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      cubeRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  // React to config changes
  useEffect(() => {
    if (!cubeRef.current) return;
    
    // Check if config has entities (engine schema)
    if (config.entities && config.entities.length > 0) {
      const entity = config.entities[0];
      if (entity.material && entity.transform) {
        const [r, g, b] = entity.material.color;
        const [sx, sy, sz] = entity.transform.scale;

        cubeRef.current.geometry.dispose();
        cubeRef.current.geometry = new THREE.BoxGeometry(sx, sy, sz);
        cubeRef.current.material.color.setRGB(r, g, b);
      }
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

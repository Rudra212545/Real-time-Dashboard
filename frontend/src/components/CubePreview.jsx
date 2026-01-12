import { useRef, useEffect } from "react";
import * as THREE from "three";
import "../styles/CubePreview.css";

export default function CubePreview({ config = {} }) {
  const mountRef = useRef(null);
  const rendererRef = useRef();
  const frameRef = useRef();

  useEffect(() => {
    // Cleanup old canvas
    while (mountRef.current && mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(280, 280);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const size = config.size ?? 1;
    const geometry = new THREE.BoxGeometry(size, size, size);

    const material = config.color
      ? new THREE.MeshStandardMaterial({ color: config.color })
      : new THREE.MeshNormalMaterial();

    const cube = new THREE.Mesh(geometry, material);
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
      geometry.dispose();
      material.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [config]);

  return (
    <div
      ref={mountRef}
      className={[
        "relative flex items-center justify-center min-h-[360px]",
        "rounded-3xl border backdrop-blur-2xl",
        "bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95",
        "border-slate-800/80 shadow-[0_16px_40px_rgba(15,23,42,0.7)]",
        "hover:border-sky-400/70 hover:shadow-[0_20px_55px_rgba(56,189,248,0.35)]",
        "transition-all duration-500 overflow-hidden",
      ].join(" ")}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen">
        <div className="absolute -top-24 -right-10 h-44 w-44 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      {/* Optional label overlay */}
      <div className="pointer-events-none absolute top-3 left-4 text-[11px] uppercase tracking-wide text-sky-300/80">
        Cube **preview**
      </div>
    </div>
  );
}

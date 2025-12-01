import { useRef, useEffect } from "react";
import * as THREE from "three";

// config = { color?: "#ff00aa", size?: 1 }
export default function CubePreview({ config = {} }) {
  const mountRef = useRef(null);
  const rendererRef = useRef();
  const frameRef = useRef();

  useEffect(() => {
    // Remove any previous canvas (handle double-effect/rerender)
    while(mountRef.current && mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(280, 280);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Geometry and material
    const geometry = new THREE.BoxGeometry(config.size ?? 1, config.size ?? 1, config.size ?? 1);
    const material = config.color
      ? new THREE.MeshStandardMaterial({ color: config.color })
      : new THREE.MeshNormalMaterial();

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lighting
    const light = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(light);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(2, 2, 4);
    scene.add(dirLight);

    function animate() {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Cleanup
    return () => {
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        // Remove canvas node safely
        if (mountRef.current && rendererRef.current.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      // Remove any additional leftover canvases
      while (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [config]);

  return <div className="cube-preview" ref={mountRef} />;
}

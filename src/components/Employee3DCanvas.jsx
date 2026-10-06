import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export default function Employee3DCanvas({ height = 240, interactive = true }) {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const canvasHeight = height;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / canvasHeight, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for entire workforce network
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Color palette based on theme
    const primaryColor = isDark ? 0x6366f1 : 0x4f46e5;
    const secondaryColor = isDark ? 0x38bdf8 : 0x0284c7;
    const accentViolet = isDark ? 0xa855f7 : 0x7c3aed;
    const emeraldColor = isDark ? 0x10b981 : 0x059669;

    // Create central core node (Organization Hub)
    const coreGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.6 : 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    networkGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: isDark ? 0.8 : 0.6,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    networkGroup.add(innerMesh);

    // Department orbital rings
    const ringMat1 = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isDark ? 0.25 : 0.18,
    });
    const ringGeo1 = new THREE.BufferGeometry();
    const ringPoints1 = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints1.push(new THREE.Vector3(Math.cos(theta) * 7.5, Math.sin(theta) * 7.5, 0));
    }
    ringGeo1.setFromPoints(ringPoints1);
    const ringMesh1 = new THREE.Line(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI * 0.35;
    networkGroup.add(ringMesh1);

    const ringMat2 = new THREE.LineBasicMaterial({
      color: accentViolet,
      transparent: true,
      opacity: isDark ? 0.25 : 0.18,
    });
    const ringGeo2 = new THREE.BufferGeometry();
    const ringPoints2 = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints2.push(new THREE.Vector3(Math.cos(theta) * 11, Math.sin(theta) * 11, 0));
    }
    ringGeo2.setFromPoints(ringPoints2);
    const ringMesh2 = new THREE.Line(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI * 0.4;
    ringMesh2.rotation.x = -Math.PI * 0.2;
    networkGroup.add(ringMesh2);

    // Generate orbiting Employee Nodes
    const nodeCount = 28;
    const nodeMeshes = [];
    const nodePositions = [];
    const nodeColors = [primaryColor, secondaryColor, accentViolet, emeraldColor];

    const nodeGeo = new THREE.SphereGeometry(0.35, 12, 12);

    for (let i = 0; i < nodeCount; i++) {
      const radius = 5 + Math.random() * 8.5;
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const color = nodeColors[i % nodeColors.length];
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isDark ? 0.9 : 0.8 });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.position.set(x, y, z);

      // Store custom orbit metadata
      mesh.userData = {
        radius,
        angle: Math.random() * Math.PI * 2,
        speed: (0.004 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1),
        yAxis: (Math.random() - 0.5) * 6,
      };

      networkGroup.add(mesh);
      nodeMeshes.push(mesh);
      nodePositions.push(mesh.position);
    }

    // Dynamic Connections (Data-link lasers between nearest nodes)
    const lineMat = new THREE.LineBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isDark ? 0.2 : 0.12,
    });

    const linesGeo = new THREE.BufferGeometry();
    const linePositions = [];
    
    // Connect some nodes to core and nearby nodes
    for (let i = 0; i < nodeMeshes.length; i++) {
      if (i % 3 === 0) {
        linePositions.push(0, 0, 0);
        linePositions.push(nodeMeshes[i].position.x, nodeMeshes[i].position.y, nodeMeshes[i].position.z);
      }
      for (let j = i + 1; j < nodeMeshes.length; j++) {
        const dist = nodeMeshes[i].position.distanceTo(nodeMeshes[j].position);
        if (dist < 6.5) {
          linePositions.push(nodeMeshes[i].position.x, nodeMeshes[i].position.y, nodeMeshes[i].position.z);
          linePositions.push(nodeMeshes[j].position.x, nodeMeshes[j].position.y, nodeMeshes[j].position.z);
        }
      }
    }
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeo, lineMat);
    networkGroup.add(linesMesh);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, canvasHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      networkGroup.rotation.y = elapsed * 0.08 + mouseX;
      networkGroup.rotation.x = Math.sin(elapsed * 0.05) * 0.1 + mouseY;

      coreMesh.rotation.x = elapsed * 0.2;
      coreMesh.rotation.z = elapsed * 0.15;

      // Pulse inner sphere
      const scale = 1 + Math.sin(elapsed * 2) * 0.08;
      innerMesh.scale.set(scale, scale, scale);

      // Rotate nodes along individual arcs
      nodeMeshes.forEach((mesh) => {
        mesh.userData.angle += mesh.userData.speed;
        mesh.position.x = Math.cos(mesh.userData.angle) * mesh.userData.radius;
        mesh.position.z = Math.sin(mesh.userData.angle) * mesh.userData.radius;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark, height, interactive]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <div ref={mountRef} className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
}

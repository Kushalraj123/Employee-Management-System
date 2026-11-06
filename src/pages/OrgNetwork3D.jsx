import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  User,
  Building2,
  GitBranch,
  ExternalLink,
  Layers,
  Play,
  Pause,
  Mail,
  Award,
  ChevronRight,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const DEPT_COLORS = {
  Executive: '#f59e0b',
  Engineering: '#6366f1',
  Product: '#a855f7',
  HR: '#ec4899',
  Sales: '#10b981',
  Finance: '#06b6d4',
  Marketing: '#f97316',
};

const DEPT_CENTERS = {
  Executive: { x: 0, y: 7.5, z: 0 },
  Engineering: { x: -10, y: 1.5, z: 4 },
  Product: { x: -5, y: -3.5, z: -5 },
  HR: { x: 0, y: -1.5, z: 7 },
  Sales: { x: 10, y: 1.5, z: 3 },
  Finance: { x: 7, y: -3.5, z: -5 },
  Marketing: { x: -8, y: 2.5, z: -6 },
};

export default function OrgNetwork3D() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const mountRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedManager, setSelectedManager] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');

  // Interactive Selection & View Mode
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [highlightChain, setHighlightChain] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? '2d' : '3d'
  );
  const [cameraZoom, setCameraZoom] = useState(28);

  useEffect(() => {
    const fetchNetwork = async () => {
      setLoading(true);
      try {
        const res = await api.getOrgNetwork();
        const fetchedNodes = res.nodes || [];
        setNodes(fetchedNodes);
        setEdges(res.edges || []);
        if (fetchedNodes.length > 0) {
          setSelectedEmployee(fetchedNodes[0]);
        }
      } catch (err) {
        console.error('Failed to load 3D org network:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  // Compute unique filter options
  const departments = useMemo(
    () => ['All', ...new Set(nodes.map((n) => n.department).filter(Boolean))],
    [nodes]
  );
  const managers = useMemo(
    () => ['All', ...new Set(nodes.map((n) => n.reportingManager).filter(Boolean))],
    [nodes]
  );
  const designations = useMemo(
    () => ['All', ...new Set(nodes.map((n) => n.designation).filter(Boolean))],
    [nodes]
  );

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (selectedDept !== 'All' && n.department !== selectedDept) return false;
      if (selectedManager !== 'All' && n.reportingManager !== selectedManager) return false;
      if (selectedDesignation !== 'All' && n.designation !== selectedDesignation) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = n.name?.toLowerCase().includes(q);
        const matchRole = n.designation?.toLowerCase().includes(q);
        const matchId = n.employeeId?.toLowerCase().includes(q);
        const matchSkill = (n.skills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchRole && !matchId && !matchSkill) return false;
      }
      return true;
    });
  }, [nodes, selectedDept, selectedManager, selectedDesignation, searchQuery]);

  // Compute Reporting Chain (Ancestors + Descendants of selectedEmployee)
  const reportingChainIds = useMemo(() => {
    const chain = new Set();
    if (!selectedEmployee || !highlightChain) return chain;

    chain.add(selectedEmployee.id);

    // Traverse upwards to CEO
    let curr = selectedEmployee;
    let safety = 0;
    while (curr && curr.reportingManagerId && safety < 15) {
      chain.add(curr.reportingManagerId);
      curr = nodes.find((n) => n.id === curr.reportingManagerId);
      safety++;
    }

    // Traverse downwards to all direct & indirect reports
    const findReports = (managerId, depth = 0) => {
      if (depth > 6) return;
      nodes.forEach((n) => {
        if (n.reportingManagerId === managerId && !chain.has(n.id)) {
          chain.add(n.id);
          findReports(n.id, depth + 1);
        }
      });
    };
    findReports(selectedEmployee.id);

    return chain;
  }, [selectedEmployee, nodes, highlightChain]);

  // 3D WebGL Scene Effect
  useEffect(() => {
    if (viewMode !== '3d' || loading) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    camera.position.set(0, 4, cameraZoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 0.95);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x6366f1, 2.5, 60);
    pointLight1.position.set(15, 18, 15);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 60);
    pointLight2.position.set(-15, -12, 12);
    scene.add(pointLight2);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Department Cluster Halos (if enabled)
    if (showClusters) {
      Object.entries(DEPT_CENTERS).forEach(([dept, center]) => {
        const hasVisible = filteredNodes.some((n) => n.department === dept);
        if (!hasVisible) return;

        const colorHex = DEPT_COLORS[dept] || '#6366f1';
        const ringGeo = new THREE.RingGeometry(2.6, 2.85, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: isDark ? 0.22 : 0.18,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(center.x, center.y - 1.2, center.z);
        ringMesh.rotation.x = Math.PI / 2;
        worldGroup.add(ringMesh);
      });
    }

    // 2. Compute 3D coordinates for every employee node
    const nodePositionsMap = {};
    const clickableMeshes = [];

    // Group nodes by department so they form clean 3D constellations around their dept center
    const deptCounters = {};
    nodes.forEach((emp) => {
      const dept = emp.department || 'Engineering';
      deptCounters[dept] = (deptCounters[dept] || 0) + 1;
      const idxInDept = deptCounters[dept] - 1;
      const center = DEPT_CENTERS[dept] || { x: 0, y: 0, z: 0 };

      let pos;
      if (emp.roleLevel === 0) {
        // CEO at apex center
        pos = new THREE.Vector3(0, 7.5, 0);
      } else if (emp.roleLevel === 1) {
        // Department Heads at cluster center elevated
        pos = new THREE.Vector3(center.x, center.y + 1.4, center.z);
      } else {
        // Team members arranged in orbital arc around their department head
        const angle = (idxInDept * 2.1) + 0.5;
        const radius = 2.4 + (idxInDept % 2) * 1.1;
        pos = new THREE.Vector3(
          center.x + Math.cos(angle) * radius,
          center.y - 1.4 - (idxInDept % 3) * 0.9,
          center.z + Math.sin(angle) * radius
        );
      }
      nodePositionsMap[emp.id] = pos;
    });

    // 3. Create Employee Node Meshes
    const visibleIds = new Set(filteredNodes.map((n) => n.id));

    nodes.forEach((emp) => {
      const pos = nodePositionsMap[emp.id];
      if (!pos) return;

      const isVisible = visibleIds.has(emp.id);
      const isSelected = selectedEmployee?.id === emp.id;
      const isInChain = reportingChainIds.has(emp.id);
      const deptColor = DEPT_COLORS[emp.department] || '#6366f1';

      // Distinct 3D geometry by organizational role level
      let geometry;
      if (emp.roleLevel === 0) {
        geometry = new THREE.IcosahedronGeometry(1.15, 1);
      } else if (emp.roleLevel === 1) {
        geometry = new THREE.OctahedronGeometry(0.88, 1);
      } else {
        geometry = new THREE.SphereGeometry(0.62, 20, 20);
      }

      const material = new THREE.MeshStandardMaterial({
        color: isSelected ? '#ffffff' : deptColor,
        emissive: isSelected ? '#38bdf8' : isInChain ? deptColor : '#000000',
        emissiveIntensity: isSelected ? 0.9 : isInChain ? 0.45 : 0.15,
        roughness: 0.25,
        metalness: 0.65,
        transparent: true,
        opacity: !isVisible ? 0.12 : highlightChain && selectedEmployee && !isInChain ? 0.35 : 0.95,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { employee: emp };

      // Outer wireframe aura for Selected or Executive/Manager nodes
      if (isSelected || emp.roleLevel <= 1) {
        const auraGeo = new THREE.SphereGeometry(
          emp.roleLevel === 0 ? 1.45 : emp.roleLevel === 1 ? 1.15 : 0.92,
          12,
          12
        );
        const auraMat = new THREE.MeshBasicMaterial({
          color: isSelected ? '#38bdf8' : deptColor,
          wireframe: true,
          transparent: true,
          opacity: isSelected ? 0.75 : 0.28,
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);
        mesh.add(auraMesh);
      }

      worldGroup.add(mesh);
      if (isVisible) {
        clickableMeshes.push(mesh);
      }
    });

    // 4. Create Reporting Line Edges
    edges.forEach((edge) => {
      const sourcePos = nodePositionsMap[edge.source];
      const targetPos = nodePositionsMap[edge.target];
      if (!sourcePos || !targetPos) return;

      const isChainEdge =
        highlightChain &&
        selectedEmployee &&
        reportingChainIds.has(edge.source) &&
        reportingChainIds.has(edge.target);

      const lineGeo = new THREE.BufferGeometry().setFromPoints([sourcePos, targetPos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isChainEdge ? 0x38bdf8 : isDark ? 0x6366f1 : 0x4f46e5,
        transparent: true,
        opacity: isChainEdge ? 0.95 : isDark ? 0.28 : 0.22,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      worldGroup.add(line);
    });

    // 5. Raycaster & Pointer Interaction (Click Node + Drag Orbit)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0.1;

    const onPointerDown = (e) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      targetRotationY += deltaX * 0.007;
      targetRotationX = Math.max(-0.8, Math.min(0.8, targetRotationX + deltaY * 0.007));
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (moveDist < 6) {
        // Treat as a click -> Raycast to employee nodes
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(clickableMeshes, false);
        if (intersects.length > 0) {
          const hitEmp = intersects[0].object.userData?.employee;
          if (hitEmp) {
            setSelectedEmployee(hitEmp);
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.style.cursor = 'grab';
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotate && !isDragging) {
        targetRotationY += 0.0025;
      }
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.08;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.08;

      camera.position.z += (cameraZoom - camera.position.z) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [
    viewMode,
    loading,
    nodes,
    edges,
    filteredNodes,
    selectedEmployee,
    highlightChain,
    showClusters,
    autoRotate,
    cameraZoom,
    isDark,
    reportingChainIds,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header & Controls Bar */}
      <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>Interactive 3D Organizational Topology</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NEXUS 3D Organizational Network
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore live reporting hierarchies, department clusters, and command chains in interactive 3D WebGL or 2D Hierarchy view.
            </p>
          </div>

          {/* 3D / 2D View Switcher & Camera Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800">
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>3D WebGL Network</span>
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === '2d'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>2D Org Chart</span>
              </button>
            </div>

            {viewMode === '3d' && (
              <>
                <button
                  onClick={() => setCameraZoom((z) => Math.max(14, z - 4))}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCameraZoom((z) => Math.min(44, z + 4))}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/40 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAutoRotate((r) => !r)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                    autoRotate
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
                </button>
                <button
                  onClick={() => {
                    setCameraZoom(28);
                    setSelectedDept('All');
                    setSelectedManager('All');
                    setSelectedDesignation('All');
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Reset View & Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node by name, ID, role, or skill..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : `${d} Dept`}
              </option>
            ))}
          </select>

          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {managers.map((m) => (
              <option key={m} value={m}>
                {m === 'All' ? 'All Reporting Managers' : `Mgr: ${m}`}
              </option>
            ))}
          </select>

          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {designations.map((des) => (
              <option key={des} value={des}>
                {des === 'All' ? 'All Designations' : des}
              </option>
            ))}
          </select>
        </div>

        {/* Legend & Toggles */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(DEPT_COLORS).map(([dept, hex]) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(selectedDept === dept ? 'All' : dept)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-white/10 border-white/40 text-white font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }} />
                <span>{dept}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighlightChain((h) => !h)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                highlightChain
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Highlight Reporting Chain</span>
            </button>

            <button
              onClick={() => setShowClusters((c) => !c)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                showClusters
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Department Clusters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 3D/2D Viewport + Interactive Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 3D WebGL Canvas or 2D Hierarchical Fallback */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-800 overflow-hidden relative">
          {viewMode === '3d' ? (
            <div className="relative">
              <div ref={mountRef} className="w-full h-[560px]" />

              {/* Overlay HUD */}
              <div className="pointer-events-none absolute top-4 left-4 flex flex-col gap-1.5 bg-slate-950/75 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-[11px] text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>3D Node Geometry Guide</span>
                </div>
                <div>&bull; <strong className="text-amber-300">Icosahedron + Aura:</strong> CEO / Executive Core</div>
                <div>&bull; <strong className="text-indigo-300">Octahedron + Halo:</strong> Department VP / Manager</div>
                <div>&bull; <strong className="text-cyan-300">Sphere Node:</strong> Team Member (Click any node)</div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
                <span>
                  Showing <strong className="text-white">{filteredNodes.length}</strong> of{' '}
                  <strong className="text-white">{nodes.length}</strong> nodes &bull;{' '}
                  <strong className="text-cyan-300">{edges.length}</strong> reporting links
                </span>
                <span>Drag to rotate &bull; Click node to inspect</span>
              </div>
            </div>
          ) : (
            /* 2D Organizational Chart Fallback (Mobile & Desktop Accessible) */
            <div className="p-6 space-y-6 max-h-[560px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">2D Hierarchical Organization Chart</h3>
                  <p className="text-xs text-slate-400">
                    Structured tree view grouped by reporting level and department cluster
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                  {filteredNodes.length} Employees
                </span>
              </div>

              {[0, 1, 2].map((level) => {
                const levelNodes = filteredNodes.filter((n) => (n.roleLevel ?? 2) === level);
                if (levelNodes.length === 0) return null;
                const levelTitle =
                  level === 0
                    ? 'Level 0 — Executive Leadership (CEO)'
                    : level === 1
                    ? 'Level 1 — Department Heads & VPs'
                    : 'Level 2 — Engineering, Product & Operations Specialists';

                return (
                  <div key={level} className="space-y-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 font-mono">
                      {levelTitle}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {levelNodes.map((emp) => {
                        const isSelected = selectedEmployee?.id === emp.id;
                        const inChain = reportingChainIds.has(emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/25 border-cyan-400 shadow-lg shadow-cyan-500/10'
                                : inChain
                                ? 'bg-slate-900/90 border-indigo-500/50'
                                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-white truncate">{emp.name}</p>
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: DEPT_COLORS[emp.department] || '#6366f1' }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{emp.designation}</p>
                              <p className="text-[10px] text-indigo-300 mt-0.5 truncate">
                                Reports to: {emp.reportingManager || 'Board'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Node Inspector & Reporting Chain */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between space-y-5">
          {selectedEmployee ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-400/60 shadow-lg"
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950"
                      style={{ backgroundColor: DEPT_COLORS[selectedEmployee.department] || '#6366f1' }}
                    />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">
                      {selectedEmployee.employeeId}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">{selectedEmployee.name}</h3>
                    <p className="text-xs text-slate-400">{selectedEmployee.designation}</p>
                  </div>
                </div>
              </div>

              {/* Quick Meta Badges */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedEmployee.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Performance</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {selectedEmployee.performanceScore || 92} / 100
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reporting Manager</span>
                  <span className="font-bold text-indigo-300 mt-0.5 block">
                    {selectedEmployee.reportingManager || 'Board of Directors'}
                  </span>
                </div>
              </div>

              {/* Core Competencies */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Skills & Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedEmployee.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlighted Reporting Chain List */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                  Active Reporting Chain ({reportingChainIds.size} Connected Nodes)
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {nodes
                    .filter((n) => reportingChainIds.has(n.id))
                    .sort((a, b) => (a.roleLevel ?? 2) - (b.roleLevel ?? 2))
                    .map((chainEmp) => (
                      <button
                        key={chainEmp.id}
                        onClick={() => setSelectedEmployee(chainEmp)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          chainEmp.id === selectedEmployee.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={chainEmp.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                          <span className="truncate">{chainEmp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{chainEmp.designation}</span>
                      </button>
                    ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/employees/${selectedEmployee.id}`)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Full 360° Employee Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Click any 3D employee node to inspect reporting relationships and profile telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


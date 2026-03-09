import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { X, Box, RotateCw, Plus, Minus, Check } from 'lucide-react';

export default function ARViewer({ 
  initialFurniture, 
  onClose 
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [selectedFurniture, setSelectedFurniture] = useState(initialFurniture || { name: 'Modern Sofa', type: 'sofa', color: '#c4a484' });
  
  // State for transformations
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: -1.5, z: -5 });

  const sceneRef = useRef(null);
  const groupRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    // Camera Setup
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(err => console.error("Camera access denied:", err));

    // Three.js Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Floor Grid (Helper for depth)
    const gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0x444444);
    gridHelper.position.y = -2;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Create Furniture Group
    const group = new THREE.Group();
    
    const createFurnitureModel = (type, color) => {
      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(color),
        roughness: 0.6,
        metalness: 0.1
      });

      if (type === 'sofa') {
        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 1), material);
        // Back
        const back = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.2), material);
        back.position.set(0, 0.5, -0.4);
        // Arms
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1), material);
        armL.position.set(-0.9, 0.4, 0);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 1), material);
        armR.position.set(0.9, 0.4, 0);
        
        group.add(base, back, armL, armR);
      } else if (type === 'table') {
        // Top
        const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.1, 32), material);
        // Legs
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), material);
          const angle = (i / 4) * Math.PI * 2;
          leg.position.set(Math.cos(angle) * 0.7, -0.5, Math.sin(angle) * 0.7);
          group.add(leg);
        }
        group.add(top);
      } else if (type === 'chair') {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), material);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.1), material);
        back.position.set(0, 0.4, -0.25);
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), material);
          leg.position.set(i < 2 ? 0.25 : -0.25, -0.25, i % 2 === 0 ? 0.25 : -0.25);
          group.add(leg);
        }
        group.add(seat, back);
      } else {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));
      }
    };

    createFurnitureModel(selectedFurniture.type || 'sofa', selectedFurniture.color || '#c4a484');
    group.position.set(position.x, position.y, position.z);
    scene.add(group);
    groupRef.current = group;

    camera.position.z = 0;

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      if (groupRef.current) {
        groupRef.current.rotation.y = rotation;
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.position.set(position.x, position.y, position.z);
      }
      renderer.render(scene, camera);
      return frameId;
    };
    const frameId = animate();

    setLoading(false);

    // Interaction Handlers
    const handlePointerDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX * 0.01,
        y: prev.y - deltaY * 0.01,
        z: prev.z
      }));
      
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const currentContainer = containerRef.current;
    const currentVideo = videoRef.current;

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
      if (currentContainer && renderer.domElement) {
        currentContainer.removeChild(renderer.domElement);
      }
      if (currentVideo?.srcObject) {
        currentVideo.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedFurniture, rotation, scale, position]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden select-none">
      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        playsInline
      />
      <div ref={containerRef} className="absolute inset-0 cursor-move" />
      
      {/* Top UI */}
      <div className="relative z-10 p-4 sm:p-6 flex justify-between items-start pointer-events-none">
        <div className="glass p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 max-w-[160px] sm:max-w-[200px] pointer-events-auto">
          <div className="flex items-center space-x-2 mb-1">
            <Box size={12} className="text-accent sm:hidden" />
            <Box size={14} className="text-accent hidden sm:block" />
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">AR Mode</h3>
          </div>
          <p className="text-xs sm:text-sm font-medium truncate">{selectedFurniture.name}</p>
          <p className="text-[9px] sm:text-[10px] text-white/40 mt-1">Drag to move object</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-3 sm:p-4 glass rounded-full border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
        >
          <X size={20} className="sm:hidden" />
          <X size={24} className="hidden sm:block" />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 px-4 sm:px-6 flex flex-col items-center space-y-4 sm:space-y-6 z-10">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="glass p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex items-center space-x-1 sm:space-x-2">
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setRotation(prev => prev - 0.4)}
              className="p-2 sm:p-3 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors"
            >
              <RotateCw size={18} className="scale-x-[-1] sm:hidden" />
              <RotateCw size={20} className="scale-x-[-1] hidden sm:block" />
            </button>
            <div className="w-px h-5 sm:h-6 bg-white/10" />
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setRotation(prev => prev + 0.4)}
              className="p-2 sm:p-3 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors"
            >
              <RotateCw size={18} className="sm:hidden" />
              <RotateCw size={20} className="hidden sm:block" />
            </button>
          </div>

          <div className="glass p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex items-center space-x-1 sm:space-x-2">
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setScale(prev => Math.max(0.3, prev - 0.1))}
              className="p-2 sm:p-3 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors"
            >
              <Minus size={18} className="sm:hidden" />
              <Minus size={20} className="hidden sm:block" />
            </button>
            <div className="w-px h-5 sm:h-6 bg-white/10" />
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              className="p-2 sm:p-3 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors"
            >
              <Plus size={18} className="sm:hidden" />
              <Plus size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md glass p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide px-1">
            {['#c4a484', '#2a2a2a', '#e5e5e5', '#5a5a40', '#8b4513'].map(color => (
              <button
                key={color}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setSelectedFurniture(prev => ({ ...prev, color }))}
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all shrink-0",
                  selectedFurniture.color === color ? "border-white scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-accent text-black font-bold rounded-lg sm:rounded-xl flex items-center space-x-2 shrink-0 text-sm sm:text-base"
          >
            <Check size={16} className="sm:hidden" />
            <Check size={18} className="hidden sm:block" />
            <span>Done</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-white/60">Calibrating AR Space...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

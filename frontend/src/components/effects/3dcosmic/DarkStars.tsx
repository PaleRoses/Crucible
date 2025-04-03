"use client"; // Required for hooks interacting with DOM/window

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// Import the dynamic hook for CSS variable resolution
import { useDynamicVariableColor, GetVariableColorOptions } from '../utility/getVariableColor'; // Adjust path as needed

// --- Type Definitions ---
export interface StarsConfig {
  count?: number;
  radius?: number;
  sizeMin?: number;
  sizeMax?: number;
  colorBase?: string; // Allow string (CSS variable or hex/rgb)
  colorVariation?: number;
  twinkleSpeed?: number;
  twinkleRange?: number;
  driftFactor?: number;
  velocityDamping?: number;
  innerRadiusFactor?: number;
}

interface StarData {
  velocities: number[];
  baseSizes: number[];
}

// --- Default Configurations ---
export const DEFAULT_STARS_CONFIG: Required<StarsConfig> = {
  count: 4000,
  radius: 500,
  sizeMin: 0.1,
  sizeMax: 0.8,
  colorBase: 'var(--color-accent1)', // Default fallback color
  colorVariation: 0.1,
  twinkleSpeed: 0.0005,
  twinkleRange: 0.2,
  driftFactor: 0.01,
  velocityDamping: 1.0,
  innerRadiusFactor: 1.5,
};

// Use a placeholder core radius just for positioning stars relative to center
const PLACEHOLDER_CORE_RADIUS = 20;

// --- Component Props Interface ---
interface DarkStarsProps {
  starsConfig?: Partial<StarsConfig>;
}

const DarkStars: React.FC<DarkStarsProps> = ({
  starsConfig: starsConfigProp = {},
}) => {
  // Merge props with defaults
  const starsConfig = useMemo(() => ({ ...DEFAULT_STARS_CONFIG, ...starsConfigProp }), [starsConfigProp]);

  // --- Dynamic Color Resolution ---
  // Define options for the hook, including the default color as fallback
  const colorOptions: GetVariableColorOptions = useMemo(() => ({
      fallback: DEFAULT_STARS_CONFIG.colorBase, // Use default star color as fallback
      // debug: true // Optional: Enable for console logs from the hook
  }), []);

  // Use the dynamic hook to resolve the base color.
  // It will handle CSS variables or standard color strings.
  const resolvedColorBase = useDynamicVariableColor(starsConfig.colorBase, colorOptions);

  // Reference to the points object
  const pointsRef = useRef<THREE.Points>(null);

  // State to store star data for animation
  const [starData] = useState<StarData>(() => {
    // Initialize star data (velocities, base sizes) - Unchanged
    const velocities: number[] = [];
    const baseSizes: number[] = [];

    for (let i = 0; i < starsConfig.count!; i++) {
      velocities.push(
        (Math.random() - 0.5) * starsConfig.driftFactor!,
        (Math.random() - 0.5) * starsConfig.driftFactor!,
        (Math.random() - 0.5) * starsConfig.driftFactor!
      );
      baseSizes.push(THREE.MathUtils.randFloat(starsConfig.sizeMin!, starsConfig.sizeMax!));
    }

    return { velocities, baseSizes };
  });

  // Create the star positions, colors, and sizes
  // Now depends on the *resolvedColorBase*
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(starsConfig.count! * 3);
    const colors = new Float32Array(starsConfig.count! * 3);
    const sizes = new Float32Array(starsConfig.count!);

    // Use the resolved color value here
    const baseColor = new THREE.Color(resolvedColorBase);
    const tempColor = new THREE.Color(); // Temporary color object for calculations
    const innerRadius = PLACEHOLDER_CORE_RADIUS * starsConfig.innerRadiusFactor!;

    for (let i = 0; i < starsConfig.count!; i++) {
      const i3 = i * 3;

      // Position stars spherically (Unchanged)
      const r = THREE.MathUtils.randFloat(innerRadius, starsConfig.radius!);
      const phi = Math.acos(-1 + (2 * Math.random()));
      const theta = Math.random() * 2 * Math.PI;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Assign star color with variation, starting from the resolved base color
      tempColor.copy(baseColor); // Start with the resolved base color
      tempColor.lerp(new THREE.Color(0xffffff * Math.random()), starsConfig.colorVariation!);
      colors[i3] = tempColor.r;
      colors[i3 + 1] = tempColor.g;
      colors[i3 + 2] = tempColor.b;

      // Set initial size (Unchanged)
      sizes[i] = starData.baseSizes[i];
    }

    return [positions, colors, sizes];
    // Add resolvedColorBase to dependency array
  }, [starsConfig, starData.baseSizes, resolvedColorBase]);

  // Create a texture for the star particles (Unchanged)
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error("Failed to get 2D context for particle texture");
      return null;
    }

    const gradient = context.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, []);

  // Shader modifier function for integrating with material (Unchanged)
  const onBeforeCompile = useCallback((shader: any) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ngl_PointSize *= size;'
    );
  }, []);

  // Animation frame handler (Unchanged)
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const sizeAttr = geometry.getAttribute('size') as THREE.BufferAttribute;

    const positions = positionAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;

    const { velocities, baseSizes } = starData;
    const { twinkleSpeed, twinkleRange, velocityDamping, radius, sizeMin, sizeMax, count } = starsConfig; // Destructure count here

    const timeFactor = performance.now() * twinkleSpeed!;
    const particlePos = new THREE.Vector3();

    // Update each star
    for (let i = 0; i < count!; i++) { // Use count from starsConfig
      const i3 = i * 3;

      // Apply velocity damping
      velocities[i3] *= velocityDamping!;
      velocities[i3 + 1] *= velocityDamping!;
      velocities[i3 + 2] *= velocityDamping!;

      // Update position based on velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Keep stars within bounds
      particlePos.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      const distSq = particlePos.lengthSq();
      const maxDist = radius! * 1.1;
      const maxDistSq = maxDist * maxDist;

      if (distSq > maxDistSq) {
        // Pull back towards the center
        const pullStrength = 0.001 * (Math.sqrt(distSq) / maxDist - 1.0);
        particlePos.normalize().multiplyScalar(-pullStrength);

        // Add pull velocity
        velocities[i3] += particlePos.x;
        velocities[i3 + 1] += particlePos.y;
        velocities[i3 + 2] += particlePos.z;
      }

      // Twinkle effect using sine wave
      const baseSize = baseSizes[i];
      const twinkleFactor = (1 + Math.sin(timeFactor + i * 0.8) * twinkleRange!);
      sizes[i] = baseSize * twinkleFactor;

      // Clamp size
      sizes[i] = Math.max(sizeMin! * 0.5, Math.min(sizes[i], sizeMax! * 1.5));
    }

    // Update buffers
    positionAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  // Render the points (Unchanged)
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* Use the dynamically generated positions, colors, and sizes */}
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      {/* Material configuration remains the same */}
      <pointsMaterial
        size={1}
        map={particleTexture || undefined}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        onBeforeCompile={onBeforeCompile}
      />
    </points>
  );
};

export default DarkStars;

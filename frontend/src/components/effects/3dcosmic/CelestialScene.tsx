import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import DarkMoon from './DarkMoon'; // Assuming path is correct
import DarkStars from './DarkStars'; // Assuming path is correct
import Effects from './Effects';   // Assuming path is correct

// Import the dynamic hook for CSS variable resolution
import { useDynamicVariableColor, GetVariableColorOptions } from '../utility/getVariableColor'; // Adjust path as needed

// Types
import type { CoreConfig, InteractionConfig } from './DarkMoon'; // Assuming path is correct
import type { StarsConfig } from './DarkStars'; // Assuming path is correct
import type { PostProcessingConfig } from './Effects'; // Assumibng path is correct

// Scene configuration interface
interface SceneConfig {
  cameraFov?: number;
  cameraNear?: number;
  cameraFar?: number;
  cameraPosition?: [number, number, number];
  backgroundColor?: string; // Allow string (CSS variable or hex/rgb)
  orbitControls?: boolean;
}

// Default scene configuration
const DEFAULT_SCENE_CONFIG: Required<SceneConfig> = { // Make properties required for default
  cameraFov: 50,
  cameraNear: 1,
  cameraFar: 1500,
  cameraPosition: [0, 0, 235],
  backgroundColor: 'var(--color-secondary)', // Default fallback color
  orbitControls: false,
};

// Component props interface
interface CelestialSceneProps {
  width?: string;
  height?: string;
  moonConfig?: Partial<CoreConfig>;
  interactionConfig?: Partial<InteractionConfig>;
  postProcessingConfig?: Partial<PostProcessingConfig>;
  starsConfig?: Partial<StarsConfig>;
  sceneConfig?: Partial<SceneConfig>;
  enableMoon?: boolean;
  enableStars?: boolean;
  enableEffects?: boolean;
}

// Camera setup component (Unchanged)
const CameraSetup = ({ position, fov, near, far }: {
  position: [number, number, number],
  fov: number,
  near: number,
  far: number
}) => {
  const { camera } = useThree();

  React.useEffect(() => {
    camera.position.set(...position);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.near = near;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
  }, [camera, position, fov, near, far]);

  return null;
};

const CelestialScene: React.FC<CelestialSceneProps> = ({
  width = '100%',
  height = '100%',
  moonConfig = {},
  interactionConfig = {},
  postProcessingConfig = {},
  starsConfig = {},
  sceneConfig: sceneConfigProp = {},
  enableMoon = true,
  enableStars = true,
  enableEffects = true,
}) => {
  // Merge scene config with defaults
  const sceneConfig = useMemo(() => ({ ...DEFAULT_SCENE_CONFIG, ...sceneConfigProp }), [sceneConfigProp]);

  // --- Dynamic Background Color Resolution ---
  // Define options for the hook, using the default background color as fallback
  const colorOptions: GetVariableColorOptions = useMemo(() => ({
      fallback: DEFAULT_SCENE_CONFIG.backgroundColor,
      // debug: true // Optional: Enable for console logs
  }), []);

  // Use the dynamic hook to resolve the background color.
  const resolvedBackgroundColor = useDynamicVariableColor(sceneConfig.backgroundColor, colorOptions);

  // State for mouse interaction (Unchanged)
  const [isDragging, setIsDragging] = useState(false);

  // Scene container ref (Unchanged)
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false, // Keep alpha false for solid background
          toneMapping: THREE.ReinhardToneMapping,
          toneMappingExposure: 1.0
        }}
        dpr={window.devicePixelRatio}
        linear // Use linear color space
      >
        {/* Camera setup (Uses merged sceneConfig) */}
        <CameraSetup
          position={sceneConfig.cameraPosition}
          fov={sceneConfig.cameraFov}
          near={sceneConfig.cameraNear}
          far={sceneConfig.cameraFar}
        />

        {/* Scene background - Use the resolved color */}
        <color attach="background" args={[resolvedBackgroundColor]} />

        {/* Optional orbit controls (Uses merged sceneConfig) */}
        {sceneConfig.orbitControls && <OrbitControls enablePan={false} />}

        {/* Moon component (Unchanged) */}
        {enableMoon && (
          <DarkMoon
            coreConfig={moonConfig}
            interactionConfig={interactionConfig}
            onDragChange={setIsDragging}
          />
        )}

        {/* Stars component (Unchanged) */}
        {enableStars && (
          <DarkStars
            starsConfig={starsConfig}
          />
        )}

        {/* Post-processing effects (Unchanged) */}
        {enableEffects && (
          <Effects
            config={postProcessingConfig}
          />
        )}
      </Canvas>
    </div>
  );
};

export default CelestialScene;

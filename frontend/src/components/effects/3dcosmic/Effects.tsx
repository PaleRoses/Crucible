import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import * as THREE from 'three';

// Interface for post-processing configuration
export interface PostProcessingConfig {
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  trailDampening?: number;
}

// Default configuration
const DEFAULT_POSTPROCESSING_CONFIG: PostProcessingConfig = {
  bloomStrength: 0.8,
  bloomRadius: 0.6,
  bloomThreshold: 0.1,
  trailDampening: 0.9,
};

// Props interface
interface EffectsProps {
  config?: Partial<PostProcessingConfig>;
}

// Effects component - uses imperative approach with useEffect instead of JSX for better TypeScript compatibility
const Effects: React.FC<EffectsProps> = ({ config = {} }) => {
  // Merge config with defaults
  const effectsConfig = {
    ...DEFAULT_POSTPROCESSING_CONFIG,
    ...config
  };
  
  // Get Three.js objects
  const { gl, scene, camera, size } = useThree();
  
  // Create refs
  const composerRef = useRef<EffectComposer | null>(null);
  
  // Initialize effect composer
  useEffect(() => {
    // Create composer
    const composer = new EffectComposer(gl);
    composerRef.current = composer;
    
    // Create render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Create bloom pass
    const resolution = new THREE.Vector2(size.width, size.height);
    const bloomPass = new UnrealBloomPass(
      resolution,
      effectsConfig.bloomStrength!,
      effectsConfig.bloomRadius!,
      effectsConfig.bloomThreshold!
    );
    composer.addPass(bloomPass);
    
    // Create afterimage pass
    const afterimagePass = new AfterimagePass(effectsConfig.trailDampening);
    composer.addPass(afterimagePass);
    
    return () => {
      // Clean up
      composer.renderTarget1.dispose();
      composer.renderTarget2.dispose();
    };
  }, [
    gl, 
    scene, 
    camera, 
    size.width, 
    size.height,
    effectsConfig.bloomStrength, 
    effectsConfig.bloomRadius, 
    effectsConfig.bloomThreshold,
    effectsConfig.trailDampening
  ]);
  
  // Render on each frame
  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1);
  
  // No visual elements to return
  return null;
};

export default Effects;
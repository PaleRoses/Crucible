import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import * as THREE from 'three';

// --- Type Definitions ---

// Interface for the configuration options of the stars
interface StarsConfig {
    count: number;           // Number of stars to generate
    radius: number;          // How far out the stars extend from the center
    sizeMin: number;         // Minimum size of a star particle
    sizeMax: number;         // Maximum size of a star particle
    colorBase: string | THREE.Color; // Base color of stars (CSS string or THREE.Color)
    colorVariation: number;  // How much star colors vary (0 = all base color, 1 = full random)
    twinkleSpeed: number;    // How fast the stars twinkle
    twinkleRange: number;   // How much the size varies during twinkle (0 = no twinkle)
    driftFactor: number;    // Base speed for random star movement
    velocityDamping: number; // Damping factor for drift (1 = no damping, <1 = slows down)
    innerRadiusFactor: number; // Stars generated outside CoreRadius * this factor
}

// Interface for the basic scene and camera settings
interface SceneConfig {
    cameraFov: number;
    cameraNear: number;
    cameraFar: number;
    cameraInitialZ: number;
    backgroundColor: string | THREE.Color; // Background color for the canvas
}

// Interface for the data stored per star for animation purposes
interface StarData {
    velocities: number[]; // Flat array [vx1, vy1, vz1, vx2, vy2, vz2, ...]
    baseSizes: number[];  // Flat array [s1, s2, s3, ...]
    count: number;        // Total number of stars
}

// Interface for the component's props
interface DarkStarProps {
    starsConfig?: Partial<StarsConfig>; // Allow overriding default config
    sceneConfig?: Partial<SceneConfig>; // Allow overriding default scene config
}

// --- Default Configurations ---
const DEFAULT_STARS_CONFIG: StarsConfig = {
    count: 4000,
    radius: 500,
    sizeMin: 0.1,
    sizeMax: 0.8,
    colorBase: '#eeeeff',
    colorVariation: 0.1,
    twinkleSpeed: 0.0005,
    twinkleRange: 0.2,
    driftFactor: 0.01,
    velocityDamping: 1.0,
    innerRadiusFactor: 1.5,
};
// Use a placeholder core radius just for positioning stars relative to center
const PLACEHOLDER_CORE_RADIUS = 20;

const DEFAULT_SCENE_CONFIG: SceneConfig = {
    cameraFov: 50,
    cameraNear: 1,
    cameraFar: 1500,
    cameraInitialZ: 235,
    backgroundColor: '#000005',
};

// --- Helper: Create Particle Texture ---
// Creates a simple white radial gradient texture for the star particles
const createParticleTexture = (): THREE.CanvasTexture | null => {
    const canvas = document.createElement('canvas');
    const size = 64; // Texture dimension
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
        console.error("Failed to get 2D context for particle texture");
        return null; // Handle context creation failure
    }

    // Create a radial gradient: white center, fading to transparent
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');   // Center: Opaque white
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)'); // Mid: Semi-transparent white
    gradient.addColorStop(1, 'rgba(255,255,255,0)');   // Edge: Fully transparent

    context.fillStyle = gradient; // Use gradient as fill style
    context.fillRect(0, 0, size, size); // Fill the canvas

    const texture = new THREE.CanvasTexture(canvas); // Create texture from canvas
    texture.needsUpdate = true; // Ensure texture uploads to GPU
    return texture;
};


// --- DarkStar Component (Standalone Stars) ---
const DarkStar: React.FC<DarkStarProps> = memo(({
    starsConfig: propStarsConfig = {}, // Use empty object if prop is undefined
    sceneConfig: propSceneConfig = {}  // Use empty object if prop is undefined
}) => {
    // Merge default configs with provided props
    const starsConfig = { ...DEFAULT_STARS_CONFIG, ...propStarsConfig };
    const sceneConfig = { ...DEFAULT_SCENE_CONFIG, ...propSceneConfig };

    const mountRef = useRef<HTMLDivElement>(null); // Ref for the container div
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const starsRef = useRef<THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null>(null); // Ref for the THREE.Points object
    // Ref to store star-specific data needed for animation
    const starDataRef = useRef<StarData>({ velocities: [], baseSizes: [], count: 0 });
    const particleTextureRef = useRef<THREE.CanvasTexture | null>(null); // Ref for the shared particle texture

    // --- Initialization Effect ---
    useEffect(() => {
        if (!mountRef.current) return; // Ensure mount point exists
        const currentMount = mountRef.current; // Capture mount point for cleanup closure

        // --- Base Three.js Setup ---
        sceneRef.current = new THREE.Scene();
        // Optional: Add fog
        // sceneRef.current.fog = new THREE.FogExp2(new THREE.Color(sceneConfig.backgroundColor), 0.0008);

        cameraRef.current = new THREE.PerspectiveCamera(
            sceneConfig.cameraFov,
            currentMount.clientWidth / currentMount.clientHeight,
            sceneConfig.cameraNear,
            sceneConfig.cameraFar
        );
        cameraRef.current.position.z = sceneConfig.cameraInitialZ; // Set initial camera distance

        try {
            rendererRef.current = new THREE.WebGLRenderer({
                antialias: true, // Enable anti-aliasing for smoother points
                alpha: false     // Background is opaque
            });
        } catch (error) {
            console.error("Failed to create WebGLRenderer:", error);
            // Handle WebGL context loss or creation failure gracefully
            // Maybe display a message to the user
            return; // Stop initialization
        }

        rendererRef.current.setPixelRatio(window.devicePixelRatio); // Adjust for device pixel ratio
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight); // Set canvas size
        rendererRef.current.setClearColor(new THREE.Color(sceneConfig.backgroundColor), 1); // Set background color
        currentMount.appendChild(rendererRef.current.domElement); // Add canvas to DOM

        clockRef.current = new THREE.Clock(); // Clock for animation timing

        // Create particle texture
        particleTextureRef.current = createParticleTexture();
        if (!particleTextureRef.current) {
            console.error("Failed to create particle texture for stars.");
            // Cleanup already created THREE objects if texture fails
            rendererRef.current?.dispose();
            if (currentMount && rendererRef.current?.domElement) {
                 if (rendererRef.current.domElement.parentNode === currentMount) {
                    currentMount.removeChild(rendererRef.current.domElement);
                 }
            }
            return; // Stop initialization if texture fails
        }

        // --- Create Stars ---
        const geometry = new THREE.BufferGeometry(); // Geometry to hold all star data
        const positions: number[] = []; // Array for star positions (x, y, z)
        const colors: number[] = [];    // Array fofr star colors (r, g, b)
        const sizes: number[] = [];     // Array for star sizes
        const velocities: number[] = []; // Array for star velocities (x, y, z)
        const baseSizes: number[] = []; // Array to store original size for twinkling
        const tempColor = new THREE.Color(); // Reusable color object
        const { count, radius, sizeMin, sizeMax, colorBase, colorVariation, driftFactor, innerRadiusFactor } = starsConfig;
        const innerRadius = PLACEHOLDER_CORE_RADIUS * innerRadiusFactor; // Calculate inner bound

        console.log(`Generating ${count} stars...`);
        for (let i = 0; i < count; i++) {
            // Position stars spherically between inner and outer radius
            const r = THREE.MathUtils.randFloat(innerRadius, radius);
            const phi = Math.acos(-1 + (2 * Math.random())); // Distribute evenly on sphere surface latitude
            const theta = Math.random() * 2 * Math.PI;       // Distribute evenly on sphere surface longitude

            positions.push(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );

            // Assign star color with variation
            tempColor.set(colorBase); // Start with base color
            tempColor.lerp(new THREE.Color(0xffffff * Math.random()), colorVariation); // Lerp towards random white
            colors.push(tempColor.r, tempColor.g, tempColor.b);

            // Assign base size and initial velocity
            const baseSize = THREE.MathUtils.randFloat(sizeMin, sizeMax);
            sizes.push(baseSize);
            baseSizes.push(baseSize); // Store for twinkling calculation
            velocities.push(
                (Math.random() - 0.5) * driftFactor, // Random initial drift x
                (Math.random() - 0.5) * driftFactor, // Random initial drift y
                (Math.random() - 0.5) * driftFactor  // Random initial drift z
            );
        }
        const actualStarCount = positions.length / 3;
        console.log(`Generated ${actualStarCount} stars.`);

        // Set attributes on the BufferGeometry
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Store velocities and base sizes in ref for access in animation loop
        starDataRef.current = { velocities, baseSizes, count: actualStarCount };

        // Material for the star points
        const starMaterial = new THREE.PointsMaterial({
            map: particleTextureRef.current, // Use the radial gradient texture
            size: 1, // Base size, will be multiplied by 'size' attribute in shader
            vertexColors: true, // Use colors defined in the 'color' attribute
            sizeAttenuation: true, // Points smaller further away
            transparent: true, // Allow transparency from texture and opacity
            opacity: 0.9, // Overall opacity
            blending: THREE.AdditiveBlending, // Brighter where stars overlap
            depthWrite: false // Don't hide things behind them (usually desired for stars)
        });

        // Modify the material's shader to use the 'size' attribute
        // Use 'any' for shader type as THREE.Shader is not directly exported/suitable here
        starMaterial.onBeforeCompile = (shader: any) => { // <-- Changed type here
            // It's good practice to check if properties exist before modifying
            if (shader && typeof shader.vertexShader === 'string') {
                 shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    // Multiply the default point size by our custom 'size' attribute
                    `#include <begin_vertex>\ngl_PointSize *= size;`
                 );
            } else {
                console.warn("onBeforeCompile: shader or shader.vertexShader is not as expected.");
            }
        };

        // Create the Points object and add to scene
        starsRef.current = new THREE.Points(geometry, starMaterial);
        sceneRef.current.add(starsRef.current);
        // --- End Create Stars ---


        // --- Resize Handler ---
        const handleResize = () => {
             if (currentMount && cameraRef.current && rendererRef.current) {
                 const width = currentMount.clientWidth;
                 const height = currentMount.clientHeight;

                 // Update camera aspect ratio
                 cameraRef.current.aspect = width / height;
                 cameraRef.current.updateProjectionMatrix(); // Apply changes

                 // Update renderer size
                 rendererRef.current.setSize(width, height);
             }
        };
        window.addEventListener('resize', handleResize); // Listen for window resize


        // --- Animation Loop ---
        const animateStarsLoop = () => {
            // Request the next frame
            animationFrameIdRef.current = requestAnimationFrame(animateStarsLoop);

            // Ensure necessary refs and their properties exist
            if (!clockRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current || !starsRef.current) return;
            const geometryAttributes = starsRef.current.geometry.attributes;
            if (!geometryAttributes.position || !geometryAttributes.size) return;

            const elapsedTime = clockRef.current.getElapsedTime(); // Total time elapsed
            const { velocities, baseSizes, count } = starDataRef.current; // Get star data
            // Type assertion needed here as Three.js types BufferAttribute, but we know it's Float32Array
            const positions = geometryAttributes.position.array as Float32Array;
            const sizes = geometryAttributes.size.array as Float32Array;
            const { twinkleSpeed, twinkleRange, velocityDamping, radius, sizeMin, sizeMax } = starsConfig;
            const timeFactor = elapsedTime * twinkleSpeed * 1000; // Scale time for twinkle effect
            const particlePos = new THREE.Vector3(); // Reusable vector for position checks

            // --- Update Star Logic ---
            for (let i = 0; i < count; i++) {
                const i3 = i * 3; // Index for position/velocity arrays (x, y, z)
                const i1 = i;     // Index for size arrays

                // Apply velocity damping (if velocityDamping < 1)
                velocities[i3 + 0] *= velocityDamping;
                velocities[i3 + 1] *= velocityDamping;
                velocities[i3 + 2] *= velocityDamping;

                // Update position based on velocity
                positions[i3 + 0] += velocities[i3 + 0];
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];

                // --- Keep stars within bounds (simple pull back) ---
                particlePos.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
                const distSq = particlePos.lengthSq(); // Use squared distance for efficiency
                const maxDist = radius * 1.1; // Slightly larger boundary than generation radius
                const maxDistSq = maxDist * maxDist;

                if (distSq > maxDistSq) {
                    // Calculate a gentle pull back towards the center based on how far out it is
                    const pullStrength = 0.001 * (Math.sqrt(distSq) / maxDist - 1.0);
                    particlePos.normalize().multiplyScalar(-pullStrength); // Get direction towards center
                    // Add pull velocity to existing velocity
                    velocities[i3 + 0] += particlePos.x;
                    velocities[i3 + 1] += particlePos.y;
                    velocities[i3 + 2] += particlePos.z;
                }
                // --- End bounds check ---

                // Twinkle effect: vary size based on time and star index using sine wave
                const baseSize = baseSizes[i1];
                // Add star index (i1) to sine wave input for variation between stars
                const twinkleFactor = (1 + Math.sin(timeFactor + i1 * 0.8) * twinkleRange);
                sizes[i1] = baseSize * twinkleFactor;
                // Clamp size to avoid extreme values (e.g., negative or excessively large)
                sizes[i1] = Math.max(sizeMin * 0.5, Math.min(sizes[i1], sizeMax * 1.5));
            }

            // Tell Three.js that the position and size buffers have been updated
            geometryAttributes.position.needsUpdate = true;
            geometryAttributes.size.needsUpdate = true;
            // --- End Update Star Logic ---

            // Render the scene directly
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animateStarsLoop(); // Start the animation loop
        // --- End Animation Loop ---


        // --- Cleanup Function (runs when component unmounts) ---
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current); // Stop animation loop
            }
            window.removeEventListener('resize', handleResize); // Remove global resize listener

            // Dispose of Three.js objects to free up memory
            rendererRef.current?.dispose(); // Use optional chaining
            particleTextureRef.current?.dispose(); // Dispose texture

            if (starsRef.current) {
                sceneRef.current?.remove(starsRef.current); // Remove points from scene
                starsRef.current.geometry?.dispose();       // Dispose geometry
                // Check if material is an array or single before disposing
                 if (Array.isArray(starsRef.current.material)) {
                     starsRef.current.material.forEach(mat => mat.dispose());
                 } else if (starsRef.current.material) {
                     starsRef.current.material.dispose();       // Dispose material
                 }
            }

            // Remove the canvas from the DOM
            if (currentMount && rendererRef.current?.domElement) {
                 // Check if the canvas is still a child before removing
                 if (rendererRef.current.domElement.parentNode === currentMount) {
                     currentMount.removeChild(rendererRef.current.domElement);
                 }
            }

            // Nullify refs to help with garbage collection
            rendererRef.current = null; sceneRef.current = null; cameraRef.current = null;
            clockRef.current = null; starsRef.current = null; particleTextureRef.current = null;
            starDataRef.current = { velocities: [], baseSizes: [], count: 0 }; // Clear star data
            console.log("DarkStar cleanup complete");
        };
    }, [starsConfig, sceneConfig]); // Dependencies for the useEffect hook

    // Return the div element that will contain the Three.js canvas
    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative', // Or 'absolute' depending on layout
                overflow: 'hidden'    // Hide potential scrollbars
            }}
            aria-label="Animated starfield background" // Accessibility
        />
    );
});
DarkStar.displayName = 'DarkStar'; // For React DevTools

// Export the component for use in other parts of the application
export default DarkStar;
export type { StarsConfig, SceneConfig, DarkStarProps }; // Export types if needed elsewhere

/*
// Example Usage (in another .tsx component or page):

import DarkStar, { StarsConfig, SceneConfig } from './DarkStar'; // Adjust path as needed
import { DEFAULT_SCENE_CONFIG } from './DarkStar'; // Import defaults if needed outside

function MyPage() {
  // Optional: Define custom configurations using the exported types
  const customStarsConfig: Partial<StarsConfig> = {
    // Use Partial<> because we only override some properties
    count: 8000,
    colorBase: '#fff8cc', // Warmer star color
    twinkleRange: 0.1,
  };
   const customSceneConfig: Partial<SceneConfig> = {
       backgroundColor: '#050005', // Slightly different dark background
   };

   // Determine background color safely
   const bgColor = customSceneConfig.backgroundColor?.toString() ?? (DEFAULT_SCENE_CONFIG.backgroundColor instanceof THREE.Color ? `#${DEFAULT_SCENE_CONFIG.backgroundColor.getHexString()}` : DEFAULT_SCENE_CONFIG.backgroundColor);


  return (
    <div style={{ width: '100vw', height: '100vh', background: bgColor }}>
      <DarkStar
          starsConfig={customStarsConfig}
          sceneConfig={customSceneConfig}
      />
    </div>
  );
}
*/

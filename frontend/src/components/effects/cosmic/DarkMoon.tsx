import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
// It's generally better to import specific modules if possible,
// but these might require direct access from the examples directory.
// Ensure these paths are correct relative to your project setup or use npm packages.
// NOTE: You might need to install @types/three for better type support
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

// --- Configuration Interfaces ---
// Define interfaces for the configuration objects to provide type safety

interface CoreConfig {
    enabled: boolean;
    radius: number;
    color1: string;
    color2: string;
    color3: string;
    noiseScale: number;
    noiseSpeed: number;
    opacityBase: number;
    opacityNoiseInfluence: number;
    fresnelPower: number;
    fresnelOpacity: number;
    lightDirection: [number, number, number];
    ambientLight: number;
    globalRotationSpeed: number;
}

interface InteractionConfig {
    parallaxFactor: number;
    dragRotationSpeed: number;
}

interface SceneConfig {
    cameraFov: number;
    cameraNear: number;
    cameraFar: number;
    cameraInitialZ: number;
    backgroundColor: string;
}

interface PostProcessingConfig {
    bloomThreshold: number;
    bloomStrength: number;
    bloomRadius: number;
    trailDampening: number;
}

// --- Default Configurations ---
// Default settings for the moon's appearance
const DEFAULT_CORE_CONFIG: CoreConfig = {
    enabled: true,
    radius: 20,
    color1: '#333333',
    color2: '#aaaaaa',
    color3: '#ffffff',
    noiseScale: 1.6,
    noiseSpeed: 0.15,
    opacityBase: 0.65,
    opacityNoiseInfluence: 0.35,
    fresnelPower: 2.5,
    fresnelOpacity: 0.5,
    lightDirection: [1.0, 0.3, 0.0],
    ambientLight: 0.05,
    globalRotationSpeed: 0.0003,
};

// Default settings for user interaction
const DEFAULT_INTERACTION_CONFIG: InteractionConfig = {
    parallaxFactor: 0.0005,
    dragRotationSpeed: 0.005,
};

// Default settings for the Three.js scene and camera
const DEFAULT_SCENE_CONFIG: SceneConfig = {
    cameraFov: 50,
    cameraNear: 1,
    cameraFar: 1500,
    cameraInitialZ: 235,
    backgroundColor: '#000005',
};

// Default settings for post-processing effects (bloom and trails)
const DEFAULT_POSTPROCESSING_CONFIG: PostProcessingConfig = {
    bloomThreshold: 0.1,
    bloomStrength: 0.8,
    bloomRadius: 0.6,
    trailDampening: 0.90,
};

// --- Shader Code ---
// (Shader code remains the same as provided)
const coreVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPos.xyz;
    gl_Position = projectionMatrix * viewPos;
  }
`;

const coreFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uNoiseScale;
  uniform float uNoiseSpeed;
  uniform float uOpacityBase;
  uniform float uOpacityNoiseInfluence;
  uniform float uFresnelPower;
  uniform float uFresnelOpacity;
  uniform vec3 uLightDirection;
  uniform float uAmbientLight;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  // --- snoise (Simplex Noise) function ---
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0) ; const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }
  // --- End snoise ---

  // --- fbm (Fractal Brownian Motion) ---
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  // --- End fbm ---

  void main() {
    vec3 timeOffset = vec3(uTime * uNoiseSpeed * 0.7, uTime * uNoiseSpeed * 0.4, uTime * uNoiseSpeed);
    vec3 noisePos = vWorldPosition * uNoiseScale + timeOffset;
    float noiseValue = fbm(noisePos);

    float t = smoothstep(-0.4, 0.4, noiseValue);
    vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.6, t));
    color = mix(color, uColor3, smoothstep(0.5, 1.0, t));

    float noiseOpacityFactor = smoothstep(-0.5, 0.5, noiseValue);
    float noiseOpacity = mix(uOpacityBase - uOpacityNoiseInfluence * 0.5, uOpacityBase + uOpacityNoiseInfluence * 0.5, noiseOpacityFactor);

    vec3 viewDirection = normalize(-vViewPosition);
    float fresnelDot = dot(viewDirection, vNormal);
    float fresnelTerm = pow(1.0 - abs(fresnelDot), uFresnelPower);
    fresnelTerm = clamp(fresnelTerm, 0.0, 1.0);
    float fresnelOpacityFactor = mix(1.0, uFresnelOpacity, fresnelTerm);

    vec3 lightDir = normalize(uLightDirection);
    float dotNL = dot(vNormal, lightDir);
    float diffuseFactor = max(dotNL, 0.0);
    float lightFactor = uAmbientLight + (1.0 - uAmbientLight) * diffuseFactor;

    float finalOpacity = clamp(noiseOpacity * fresnelOpacityFactor * lightFactor, 0.0, 1.0);

    gl_FragColor = vec4(color, finalOpacity);
  }
`;

// --- Component Props Interface ---
interface DarkMoonProps {
    coreConfig?: Partial<CoreConfig>; // Use Partial if you want defaults to apply for missing props
    interactionConfig?: Partial<InteractionConfig>;
    postProcessingConfig?: Partial<PostProcessingConfig>;
    sceneConfig?: Partial<SceneConfig>;
}

// --- DarkMoon React Component ---
const DarkMoon: React.FC<DarkMoonProps> = React.memo(({
    // Merge provided props with defaults
    coreConfig: coreConfigProp = {},
    interactionConfig: interactionConfigProp = {},
    postProcessingConfig: postProcessingConfigProp = {},
    sceneConfig: sceneConfigProp = {}
}) => {

    // --- Merge Props with Defaults ---
    // Ensure all config properties are available by merging partial props with defaults
    const coreConfig = useMemo(() => ({ ...DEFAULT_CORE_CONFIG, ...coreConfigProp }), [coreConfigProp]);
    const interactionConfig = useMemo(() => ({ ...DEFAULT_INTERACTION_CONFIG, ...interactionConfigProp }), [interactionConfigProp]);
    const postProcessingConfig = useMemo(() => ({ ...DEFAULT_POSTPROCESSING_CONFIG, ...postProcessingConfigProp }), [postProcessingConfigProp]);
    const sceneConfig = useMemo(() => ({ ...DEFAULT_SCENE_CONFIG, ...sceneConfigProp }), [sceneConfigProp]);

    // --- Refs with Types ---
    // Provide explicit types for refs and initialize object/class refs with null
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const clockRef = useRef<THREE.Clock | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const moonGroupRef = useRef<THREE.Group | null>(null); // Initialize with null
    const moonCoreRef = useRef<THREE.Mesh | null>(null); // Initialize with null
    const invisibleSphereRef = useRef<THREE.Mesh | null>(null); // Initialize with null
    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingRef = useRef<boolean>(false);
    const previousMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const raycasterRef = useRef(new THREE.Raycaster()); // Type inferred from initial value
    const normalizedMouse = useRef(new THREE.Vector2()); // Type inferred from initial value

    // --- Memoized Uniforms ---
    // Uniforms depend on the merged coreConfig
    const coreUniforms = useMemo(() => ({
        uTime: { value: 0.0 },
        uColor1: { value: new THREE.Color(coreConfig.color1) },
        uColor2: { value: new THREE.Color(coreConfig.color2) },
        uColor3: { value: new THREE.Color(coreConfig.color3) },
        uNoiseScale: { value: coreConfig.noiseScale },
        uNoiseSpeed: { value: coreConfig.noiseSpeed },
        uOpacityBase: { value: coreConfig.opacityBase },
        uOpacityNoiseInfluence: { value: coreConfig.opacityNoiseInfluence },
        uFresnelPower: { value: coreConfig.fresnelPower },
        uFresnelOpacity: { value: coreConfig.fresnelOpacity },
        uLightDirection: { value: new THREE.Vector3().fromArray(coreConfig.lightDirection).normalize() },
        uAmbientLight: { value: coreConfig.ambientLight }
    }), [coreConfig]); // Now depends on the merged coreConfig

    // --- Initialization Effect (useEffect) ---
    useEffect(() => {
        // Check if mount point exists
        if (!mountRef.current) {
            console.error("DarkMoon mount point not found.");
            return;
        }
        const currentMount = mountRef.current; // Now correctly typed as HTMLDivElement

        // --- Basic Three.js Setup ---
        sceneRef.current = new THREE.Scene();

        cameraRef.current = new THREE.PerspectiveCamera(
            sceneConfig.cameraFov,
            currentMount.clientWidth / currentMount.clientHeight, // Accessing properties on HTMLDivElement is safe
            sceneConfig.cameraNear,
            sceneConfig.cameraFar
        );
        cameraRef.current.position.z = sceneConfig.cameraInitialZ;

        try {
             rendererRef.current = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false // Set based on whether you need transparency
            });
        } catch (error) {
            console.error("Failed to initialize WebGLRenderer:", error);
            currentMount.textContent = "WebGL is not supported or enabled in your browser."; // Safe access
            return;
        }

        // Add null check for rendererRef.current
        if (!rendererRef.current) return;

        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight); // Safe access
        rendererRef.current.setClearColor(sceneConfig.backgroundColor, 1);
        rendererRef.current.toneMapping = THREE.ReinhardToneMapping;
        rendererRef.current.toneMappingExposure = 1.0;

        currentMount.appendChild(rendererRef.current.domElement); // Safe access

        clockRef.current = new THREE.Clock();

        // --- Create Moon Objects ---
        const group = new THREE.Group();
        sceneRef.current.add(group); // Add null check for sceneRef.current
        moonGroupRef.current = group;

        if (coreConfig.enabled) {
            const coreGeometry = new THREE.SphereGeometry(coreConfig.radius, 64, 64);
            const coreMaterial = new THREE.ShaderMaterial({
                uniforms: coreUniforms,
                vertexShader: coreVertexShader,
                fragmentShader: coreFragmentShader,
                transparent: true,
                depthWrite: false,
                blending: THREE.NormalBlending,
                side: THREE.FrontSide
            });
            const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
            coreMesh.renderOrder = 0;
            group.add(coreMesh);
            moonCoreRef.current = coreMesh;
        }

        const interactionSphereGeometry = new THREE.SphereGeometry(coreConfig.radius * 1.1, 16, 8);
        const interactionSphereMaterial = new THREE.MeshBasicMaterial({
            visible: false,
            side: THREE.DoubleSide
        });
        const invisibleMesh = new THREE.Mesh(interactionSphereGeometry, interactionSphereMaterial);
        group.add(invisibleMesh);
        invisibleSphereRef.current = invisibleMesh;

        // --- Post-Processing Setup ---
        // Add null checks for renderer, scene, and camera refs
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

        composerRef.current = new EffectComposer(rendererRef.current);
        const renderPass = new RenderPass(sceneRef.current, cameraRef.current);
        composerRef.current.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), // Safe access
            postProcessingConfig.bloomStrength,
            postProcessingConfig.bloomRadius,
            postProcessingConfig.bloomThreshold
        );
        composerRef.current.addPass(bloomPass);

        const afterimagePass = new AfterimagePass(postProcessingConfig.trailDampening);
        composerRef.current.addPass(afterimagePass);

        // --- Resize Handler ---
        const handleResize = () => {
            // Add null checks within the handler as refs might be null during cleanup/unmount
            if (mountRef.current && cameraRef.current && rendererRef.current && composerRef.current) {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;

                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();

                rendererRef.current.setSize(width, height);
                composerRef.current.setSize(width, height);
            }
        };
        window.addEventListener('resize', handleResize);

        // --- Mouse Event Handlers ---
        const handleMouseMove = (event: MouseEvent) => { // Add type to event
            if (!mountRef.current) return; // Check mountRef existence
            const rect = mountRef.current.getBoundingClientRect();

            const currentMouseX = event.clientX - rect.left;
            const currentMouseY = event.clientY - rect.top;

            const windowHalfX = rect.width / 2;
            const windowHalfY = rect.height / 2;
            mousePosRef.current.x = currentMouseX - windowHalfX;
            mousePosRef.current.y = currentMouseY - windowHalfY;

            normalizedMouse.current.x = (currentMouseX / rect.width) * 2 - 1;
            normalizedMouse.current.y = -(currentMouseY / rect.height) * 2 + 1;

            if (isDraggingRef.current) {
                const deltaX = event.clientX - previousMouseRef.current.x;
                const deltaY = event.clientY - previousMouseRef.current.y;

                if (moonGroupRef.current) { // Add null check
                    moonGroupRef.current.rotation.y += deltaX * interactionConfig.dragRotationSpeed;
                    moonGroupRef.current.rotation.x += deltaY * interactionConfig.dragRotationSpeed;

                    const maxVerticalRotation = Math.PI * 0.45;
                    moonGroupRef.current.rotation.x = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, moonGroupRef.current.rotation.x));
                }

                previousMouseRef.current.x = event.clientX;
                previousMouseRef.current.y = event.clientY;
            }
        };

        const handleMouseDown = (event: MouseEvent) => { // Add type to event
             // Add null checks for refs
             if (!cameraRef.current || !invisibleSphereRef.current || !raycasterRef.current || !mountRef.current) return;
             event.preventDefault();

             raycasterRef.current.setFromCamera(normalizedMouse.current, cameraRef.current);
             const intersects = raycasterRef.current.intersectObject(invisibleSphereRef.current, false);

             if (intersects.length > 0) {
                 isDraggingRef.current = true;
                 previousMouseRef.current.x = event.clientX;
                 previousMouseRef.current.y = event.clientY;
                 mountRef.current.style.cursor = 'grabbing'; // Safe access due to check above
             }
        };

        const handleMouseUpOrLeave = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                if (mountRef.current) { // Add null check
                    mountRef.current.style.cursor = 'grab';
                }
            }
        };

        // Add event listeners (ensure currentMount is valid)
        // Use type assertion for event listeners if needed, or ensure correct types
        currentMount.addEventListener('mousemove', handleMouseMove as EventListener);
        currentMount.addEventListener('mousedown', handleMouseDown as EventListener);
        window.addEventListener('mouseup', handleMouseUpOrLeave);
        currentMount.addEventListener('mouseleave', handleMouseUpOrLeave);
        currentMount.style.cursor = 'grab'; // Safe access

        // --- Animation Loop ---
        const animateMoonLoop = () => {
            animationFrameIdRef.current = requestAnimationFrame(animateMoonLoop);

            // Add comprehensive null checks for all refs used in the loop
            if (!clockRef.current || !composerRef.current || !moonGroupRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
                 // console.warn("Skipping animation frame: Refs not ready."); // Optional logging
                 return;
            }

            const delta = clockRef.current.getDelta();
            const elapsedTime = clockRef.current.getElapsedTime();

            // --- Update Logic ---
            if (moonCoreRef.current && coreConfig.enabled) {
                // Check material and uniforms exist (ShaderMaterial type assertion might be needed if @types/three isn't perfect)
                const material = moonCoreRef.current.material as THREE.ShaderMaterial;
                if (material && material.uniforms && material.uniforms.uTime) {
                    material.uniforms.uTime.value = elapsedTime;
                }
            }

            if (!isDraggingRef.current) {
                const targetRotationX = mousePosRef.current.y * interactionConfig.parallaxFactor;
                const targetRotationY = mousePosRef.current.x * interactionConfig.parallaxFactor;
                // moonGroupRef is checked at the start of the loop
                moonGroupRef.current.rotation.x += (targetRotationX - moonGroupRef.current.rotation.x) * 0.02;
                moonGroupRef.current.rotation.y += (targetRotationY - moonGroupRef.current.rotation.y) * 0.02;
            }

             if (moonCoreRef.current && coreConfig.globalRotationSpeed !== 0) {
                 moonCoreRef.current.rotation.y += coreConfig.globalRotationSpeed;
                 moonCoreRef.current.rotation.x += coreConfig.globalRotationSpeed * 0.3;
             }

            // --- Render ---
            // composerRef is checked at the start of the loop
            composerRef.current.render(delta);
        };

        animateMoonLoop();

        // --- Cleanup Function ---
        return () => {
            console.log("Cleaning up DarkMoon component...");
            if (animationFrameIdRef.current) { // Check if ID exists before cancelling
                 cancelAnimationFrame(animationFrameIdRef.current);
            }

            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', handleMouseUpOrLeave);

             // Check mountRef before removing listeners
             if(currentMount) {
                 currentMount.removeEventListener('mousemove', handleMouseMove as EventListener);
                 currentMount.removeEventListener('mousedown', handleMouseDown as EventListener);
                 currentMount.removeEventListener('mouseleave', handleMouseUpOrLeave);
                 currentMount.style.cursor = 'default';
             }

            // Dispose Three.js objects safely with null checks
            if (composerRef.current) {
                composerRef.current.passes.forEach(pass => {
                    if (typeof (pass as any).dispose === 'function') { // Use type assertion or check
                        (pass as any).dispose();
                    }
                });
                 if (composerRef.current.renderTarget1) composerRef.current.renderTarget1.dispose();
                 if (composerRef.current.renderTarget2) composerRef.current.renderTarget2.dispose();
            }

             if (moonCoreRef.current) {
                 if (moonCoreRef.current.geometry) moonCoreRef.current.geometry.dispose();
                 if (moonCoreRef.current.material) {
                     // Handle potential array of materials, though unlikely here
                     if (Array.isArray(moonCoreRef.current.material)) {
                         moonCoreRef.current.material.forEach(mat => mat.dispose());
                     } else {
                         (moonCoreRef.current.material as THREE.Material).dispose(); // Type assertion
                     }
                 }
             }
             if (invisibleSphereRef.current) {
                 if (invisibleSphereRef.current.geometry) invisibleSphereRef.current.geometry.dispose();
                 if (invisibleSphereRef.current.material) {
                      if (Array.isArray(invisibleSphereRef.current.material)) {
                         invisibleSphereRef.current.material.forEach(mat => mat.dispose());
                     } else {
                         (invisibleSphereRef.current.material as THREE.Material).dispose(); // Type assertion
                     }
                 }
             }

             if (sceneRef.current && moonGroupRef.current) {
                 sceneRef.current.remove(moonGroupRef.current);
                 // Consider traversing moonGroupRef.current to dispose children if they weren't handled above
             }

            if (rendererRef.current) {
                rendererRef.current.dispose();
                 if (currentMount && rendererRef.current.domElement) {
                      if (rendererRef.current.domElement.parentNode === currentMount) {
                          currentMount.removeChild(rendererRef.current.domElement);
                      }
                 }
            }

            // Nullify refs after cleanup
            mountRef.current = null; // Although mountRef itself isn't nulled, its reference to the DOM element is gone
            rendererRef.current = null;
            composerRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            clockRef.current = null;
            moonGroupRef.current = null;
            moonCoreRef.current = null;
            invisibleSphereRef.current = null;
            // raycasterRef doesn't need nullifying as it wasn't set to null

            console.log("DarkMoon cleanup complete.");
        };
    // Update dependency array to include the merged config objects
    }, [coreConfig, interactionConfig, postProcessingConfig, sceneConfig, coreUniforms]); // coreUniforms depends on coreConfig

    // --- Render ---
    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                zIndex: 1,
                pointerEvents: 'auto',
                overflow: 'hidden',
                touchAction: 'none'
            }}
            role="img"
            aria-label="Interactive dark moon visualization"
        />
    );
});

DarkMoon.displayName = 'DarkMoon';

export default DarkMoon;

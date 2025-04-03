"use client"; // Required for hooks interacting with DOM/window

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// Import the dynamic hook instead of or alongside the static one
import { useDynamicVariableColor, GetVariableColorOptions } from '../utility/getVariableColor'; // Adjust path as needed

// --- Configuration Interfaces (Unchanged) ---
export interface CoreConfig {
    enabled?: boolean;
    radius?: number;
    color1?: string;
    color2?: string;
    color3?: string;
    noiseScale?: number;
    noiseSpeed?: number;
    opacityBase?: number;
    opacityNoiseInfluence?: number;
    fresnelPower?: number;
    fresnelOpacity?: number;
    lightDirection?: [number, number, number];
    ambientLight?: number;
    globalRotationSpeed?: number;
}

export interface InteractionConfig {
    parallaxFactor?: number;
    dragRotationSpeed?: number;
}

// --- Default Configurations (Unchanged) ---
export const DEFAULT_CORE_CONFIG: Required<CoreConfig> = {
    enabled: true,
    radius: 20,
    color1: 'var(--color-accent1)',
    color2: 'var(--color-accent1)',
    color3: 'var(--color-accent1)',
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

export const DEFAULT_INTERACTION_CONFIG: Required<InteractionConfig> = {
    parallaxFactor: 0.0005,
    dragRotationSpeed: 0.005,
};

// --- Shader Code (Unchanged) ---
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

  // --- snoise (Simplex Noise) function (implementation omitted for brevity) ---
  // ... (snoise code remains the same) ...
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
  // --- fbm (Fractal Brownian Motion) function (implementation omitted for brevity) ---
  // ... (fbm code remains the same) ...
   float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) { // Reduced iterations for potential performance
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

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

// --- Component Props Interface (Unchanged) ---
interface DarkMoonProps {
    coreConfig?: Partial<CoreConfig>;
    interactionConfig?: Partial<InteractionConfig>;
    onDragChange?: (dragging: boolean) => void;
}

const DarkMoon: React.FC<DarkMoonProps> = ({
    coreConfig: coreConfigProp = {},
    interactionConfig: interactionConfigProp = {},
    onDragChange,
}) => {
    // Merge props with defaults
    const coreConfig: Required<CoreConfig> = useMemo(() => ({ ...DEFAULT_CORE_CONFIG, ...coreConfigProp }), [coreConfigProp]);
    const interactionConfig: Required<InteractionConfig> = useMemo(() => ({ ...DEFAULT_INTERACTION_CONFIG, ...interactionConfigProp }), [interactionConfigProp]);

    // --- Refs (Unchanged) ---
    const moonGroupRef = useRef<THREE.Group>(null);
    const moonCoreRef = useRef<THREE.Mesh>(null);
    const invisibleSphereRef = useRef<THREE.Mesh>(null);

    // --- State (Unchanged) ---
    const [isDragging, setIsDragging] = useState(false);
    const [previousMouse, setPreviousMouse] = useState({ x: 0, y: 0 });

    // --- Hooks (Unchanged) ---
    const { camera, mouse, raycaster, gl } = useThree();

    // --- Dynamic Color Resolution ---
    // Define options for the hook, including fallbacks
    const colorOptions: GetVariableColorOptions = useMemo(() => ({
        fallback: '#000000', // Default fallback if resolution fails entirely
        // debug: true // Optional: Enable for console logs from the hook
    }), []);

    // Use the dynamic hook for each color. It returns the *current* resolved value.
    // It will automatically update when the underlying CSS variable changes.
    const resolvedColor1 = useDynamicVariableColor(coreConfig.color1, { ...colorOptions, fallback: DEFAULT_CORE_CONFIG.color1 });
    const resolvedColor2 = useDynamicVariableColor(coreConfig.color2, { ...colorOptions, fallback: DEFAULT_CORE_CONFIG.color2 });
    const resolvedColor3 = useDynamicVariableColor(coreConfig.color3, { ...colorOptions, fallback: DEFAULT_CORE_CONFIG.color3 });

    // --- Memoized Uniforms ---
    // Now depends on the *resolved* color values from useDynamicVariableColor
    const uniforms = useMemo(() => {
        // Note: We no longer need getHexValue here if using useDynamicVariableColor
        // The hook itself handles resolution and provides the computed value.
        // THREE.Color can often parse the computed value directly (e.g., 'rgb(r, g, b)')
        // If THREE.Color fails with the direct computed value, you might need an extra
        // step here to convert rgb() strings from the hook to hex, but try direct first.

        return {
            uTime: { value: 0.0 },
            // Use the stateful, dynamically resolved colors
            uColor1: { value: new THREE.Color(resolvedColor1) },
            uColor2: { value: new THREE.Color(resolvedColor2) },
            uColor3: { value: new THREE.Color(resolvedColor3) },
            // Other uniforms remain the same
            uNoiseScale: { value: coreConfig.noiseScale },
            uNoiseSpeed: { value: coreConfig.noiseSpeed },
            uOpacityBase: { value: coreConfig.opacityBase },
            uOpacityNoiseInfluence: { value: coreConfig.opacityNoiseInfluence },
            uFresnelPower: { value: coreConfig.fresnelPower },
            uFresnelOpacity: { value: coreConfig.fresnelOpacity },
            uLightDirection: {
                value: new THREE.Vector3()
                    .fromArray(coreConfig.lightDirection)
                    .normalize()
            },
            uAmbientLight: { value: coreConfig.ambientLight }
        };
        // Dependencies now include the resolved color values. When they change,
        // this memo re-runs, creating new THREE.Color objects for the material.
    }, [resolvedColor1, resolvedColor2, resolvedColor3, // <-- Key change: depend on resolved values
        coreConfig.noiseScale, coreConfig.noiseSpeed, coreConfig.opacityBase,
        coreConfig.opacityNoiseInfluence, coreConfig.fresnelPower, coreConfig.fresnelOpacity,
        coreConfig.lightDirection, coreConfig.ambientLight]);

    // --- Core Material (Unchanged, uses the updated uniforms) ---
    const coreMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: coreVertexShader,
            fragmentShader: coreFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            side: THREE.FrontSide
        });
    }, [uniforms]);

    // --- Event Handlers (Unchanged, implementation omitted for brevity) ---
    const handlePointerDown = useCallback(/* ... */ (e: PointerEvent) => {
        e.stopPropagation();
        raycaster.setFromCamera(mouse, camera);
        if (invisibleSphereRef.current) {
            const intersects = raycaster.intersectObject(invisibleSphereRef.current);
            if (intersects.length > 0) {
                setIsDragging(true);
                setPreviousMouse({ x: e.clientX, y: e.clientY });
                if (onDragChange) onDragChange(true);
                gl.domElement.style.cursor = 'grabbing';
            }
        }
    }, [raycaster, mouse, camera, onDragChange, gl.domElement]);

    const handlePointerMove = useCallback(/* ... */ (e: PointerEvent) => {
        if (!isDragging || !moonGroupRef.current) return;
        const deltaX = e.clientX - previousMouse.x;
        const deltaY = e.clientY - previousMouse.y;
        moonGroupRef.current.rotation.y += deltaX * interactionConfig.dragRotationSpeed;
        moonGroupRef.current.rotation.x += deltaY * interactionConfig.dragRotationSpeed;
        const maxVerticalRotation = Math.PI * 0.45;
        moonGroupRef.current.rotation.x = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, moonGroupRef.current.rotation.x));
        setPreviousMouse({ x: e.clientX, y: e.clientY });
    }, [isDragging, previousMouse, interactionConfig.dragRotationSpeed]);

    const handlePointerUp = useCallback(/* ... */ () => {
        if (isDragging) {
            setIsDragging(false);
            if (onDragChange) onDragChange(false);
            gl.domElement.style.cursor = 'grab';
        }
    }, [isDragging, onDragChange, gl.domElement]);


    // --- Animation Frame Handler (Unchanged, implementation omitted for brevity) ---
    useFrame((state, delta) => {
        if (coreMaterial) {
            coreMaterial.uniforms.uTime.value += delta;
        }
        if (!isDragging && moonGroupRef.current) {
            const targetRotationX = mouse.y * interactionConfig.parallaxFactor * -1;
            const targetRotationY = mouse.x * interactionConfig.parallaxFactor;
            moonGroupRef.current.rotation.x += (targetRotationX - moonGroupRef.current.rotation.x) * 0.05;
            moonGroupRef.current.rotation.y += (targetRotationY - moonGroupRef.current.rotation.y) * 0.05;
        }
        if (moonCoreRef.current && coreConfig.globalRotationSpeed !== 0) {
            moonCoreRef.current.rotation.y += coreConfig.globalRotationSpeed * delta * 60;
            moonCoreRef.current.rotation.x += coreConfig.globalRotationSpeed * 0.3 * delta * 60;
        }
    });

    // --- Add Event Listeners (Unchanged, implementation omitted for brevity) ---
    useEffect(() => {
        const domElement = gl.domElement;
        domElement.addEventListener('pointerdown', handlePointerDown as EventListener);
        domElement.addEventListener('pointermove', handlePointerMove as EventListener);
        window.addEventListener('pointerup', handlePointerUp as EventListener);
        domElement.style.cursor = 'grab';
        return () => {
            domElement.removeEventListener('pointerdown', handlePointerDown as EventListener);
            domElement.removeEventListener('pointermove', handlePointerMove as EventListener);
            window.removeEventListener('pointerup', handlePointerUp as EventListener);
            domElement.style.cursor = 'default';
        };
    }, [gl.domElement, handlePointerDown, handlePointerMove, handlePointerUp]);

    // --- Render (Unchanged) ---
    return (
        <group ref={moonGroupRef}>
            {coreConfig.enabled && (
                <mesh
                    ref={moonCoreRef}
                    material={coreMaterial}
                    renderOrder={0}
                >
                    <sphereGeometry args={[coreConfig.radius, 64, 64]} />
                </mesh>
            )}
            <mesh
                ref={invisibleSphereRef}
                visible={false}
            >
                <sphereGeometry args={[coreConfig.radius * 1.1, 16, 8]} />
                <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

export default DarkMoon;

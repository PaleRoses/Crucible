<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Moon Background</title>
    <style>
        /* Basic reset and full-screen canvas */
        body { margin: 0; overflow: hidden; background-color: #000005; font-family: 'Inter', sans-serif; color: #fff; }
        canvas { display: block; width: 100%; height: 100%; }
        /* Optional Overlay Styles */
        .overlay-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; text-align: center; pointer-events: none; }
        .overlay-content h1 { font-size: 3rem; margin: 0; font-weight: 700; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/"
            }
        }
    </script>

    <script type="module">
        // Imports
        import * as THREE from 'three';
        import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
        import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
        import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';

        // --- Configuration Constants ---
        const CONFIG = {
            // Moon Shape & Particle Generation
            particleCount: 6000,        // Number of particles composing the moon
            moonRadius: 50,             // Radius of the moon sphere
            moonShellThickness: 2.0,    // How thick the particle shell is around the radius (0 for perfect surface)

            // Particle Appearance
            particleSizeMin: 0.3,       // Smaller size range for moon dust
            particleSizeMax: 1.2,
            // --- Moon Color Palette ---
            colorBase: new THREE.Color(0xcccccc),   // Light grey base
            colorHighlight: new THREE.Color(0xffffff), // White highlights
            colorShadow: new THREE.Color(0x888888),    // Darker grey shadows/variation
            colorVariation: 0.3,        // How much color varies based on position (0-1)

            // Animation & Interaction
            randomDriftFactor: 0.008,   // Very subtle random drift for shimmer
            globalRotationSpeed: 0.0003,// Slow rotation of the moon itself
            parallaxFactor: 0.0005,     // Mouse parallax effect strength
            twinkleSpeed: 0.001,        // Slower twinkle
            twinkleRange: 0.4,          // Less intense twinkle
            velocityDamping: 0.98,      // Damping factor for drift velocity (closer to 1 = less damping)

            // Scene & Camera
            cameraFov: 50,              // Slightly narrower FOV
            cameraNear: 1, cameraFar: 1000, cameraInitialZ: 180, // Camera further back
            fogColor: 0x000005, fogDensity: 0.001, // Less dense fog

            // Post-Processing
            bloomThreshold: 0.2,        // Bloom threshold (adjust based on moon brightness)
            bloomStrength: 0.6,         // Bloom intensity
            bloomRadius: 0.4,           // Bloom radius
            trailDampening: 0.90        // Trail effect strength (adjust for desired subtlety)
        };

        // --- Global Variables ---
        let scene, camera, renderer, composer, moonParticles, afterimagePass;
        let particleVelocities = []; // Represents CURRENT velocity
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;
        let actualParticleCount = 0;
        // Reusable vector
        const particlePos = new THREE.Vector3();

        // --- Helper Functions ---
        function createParticleTexture() { /* ... create texture code (unchanged) ... */
            const canvas = document.createElement('canvas'); const size = 64; canvas.width = size; canvas.height = size;
            const context = canvas.getContext('2d'); const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
            context.fillStyle = gradient; context.fillRect(0, 0, size, size); return new THREE.CanvasTexture(canvas);
         }

        // --- Initialization Function ---
        function init() {
            console.log("Initializing Moon Background...");
            // Scene, Camera, Renderer setup
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(CONFIG.fogColor, CONFIG.fogDensity);
            camera = new THREE.PerspectiveCamera(CONFIG.cameraFov, window.innerWidth/window.innerHeight, CONFIG.cameraNear, CONFIG.cameraFar);
            camera.position.z = CONFIG.cameraInitialZ;
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(CONFIG.fogColor, 1);
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.toneMappingExposure = 1.0; // Adjust exposure if needed
            document.body.appendChild(renderer.domElement);

            // Generate Particle Data for Moon Sphere
            const geometry = new THREE.BufferGeometry();
            const positions = []; const colors = []; const sizes = [];
            particleVelocities = [];
            const tempColor = new THREE.Color();

            console.log(`Generating ${CONFIG.particleCount} particles for the moon...`);
            for (let i = 0; i < CONFIG.particleCount; i++) {
                // Generate point on a sphere surface using uniform distribution
                const phi = Math.acos(-1 + (2 * Math.random())); // Polar angle (latitude)
                const theta = Math.random() * 2 * Math.PI;      // Azimuthal angle (longitude)

                // Calculate base position on the sphere surface
                let x = CONFIG.moonRadius * Math.sin(phi) * Math.cos(theta);
                let y = CONFIG.moonRadius * Math.sin(phi) * Math.sin(theta);
                let z = CONFIG.moonRadius * Math.cos(phi);

                // Add shell thickness / slight random offset from surface
                if (CONFIG.moonShellThickness > 0) {
                    const offsetFactor = 1.0 + (Math.random() - 0.5) * (CONFIG.moonShellThickness / CONFIG.moonRadius) * 2.0;
                    x *= offsetFactor;
                    y *= offsetFactor;
                    z *= offsetFactor;
                }
                positions.push(x, y, z);

                // --- Color Calculation ---
                // Vary color slightly based on position (e.g., Z coordinate for simple lighting)
                const colorFactor = THREE.MathUtils.smoothstep(z, -CONFIG.moonRadius, CONFIG.moonRadius); // Normalize Z to 0-1 range
                tempColor.copy(CONFIG.colorShadow).lerp(CONFIG.colorBase, colorFactor); // Blend shadow to base
                // Add highlights based on another factor (e.g., angle from a light source, or just randomly)
                const highlightFactor = Math.max(0, Math.cos(phi) * 0.5 + Math.cos(theta)*0.2 + Math.random()*0.3); // Example highlight logic
                tempColor.lerp(CONFIG.colorHighlight, highlightFactor * CONFIG.colorVariation);
                colors.push(tempColor.r, tempColor.g, tempColor.b);

                // --- Size Calculation ---
                const baseSize = (Math.random() * (CONFIG.particleSizeMax - CONFIG.particleSizeMin) + CONFIG.particleSizeMin);
                sizes.push(baseSize);

                // --- Initial Velocity (Subtle Random Drift) ---
                particleVelocities.push(
                    (Math.random() - 0.5) * CONFIG.randomDriftFactor,
                    (Math.random() - 0.5) * CONFIG.randomDriftFactor,
                    (Math.random() - 0.5) * CONFIG.randomDriftFactor
                );
            }
            actualParticleCount = positions.length / 3;
            console.log(`Generated ${actualParticleCount} particles.`);

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            // Particle Material
            const particleTexture = createParticleTexture();
            const particleMaterial = new THREE.PointsMaterial({ map: particleTexture, size: 1, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }); // Slightly lower opacity
            particleMaterial.onBeforeCompile = shader => { shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ngl_PointSize *= size;'); };

            // Points Object
            moonParticles = new THREE.Points(geometry, particleMaterial);
            scene.add(moonParticles); // Add moon particles to the scene

            // Post-Processing
            composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.bloomStrength, CONFIG.bloomRadius, CONFIG.bloomThreshold); composer.addPass(bloomPass);
            afterimagePass = new AfterimagePass(CONFIG.trailDampening); composer.addPass(afterimagePass);

            // Event Listeners
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            window.addEventListener('resize', onWindowResize, false);

            console.log("Moon initialization complete.");
        }

        // --- Event Handlers ---
        function onDocumentMouseMove(event) { mouseX = event.clientX - windowHalfX; mouseY = event.clientY - windowHalfY; }
        function onWindowResize() { /* ... resize logic ... */
             windowHalfX = window.innerWidth / 2; windowHalfY = window.innerHeight / 2;
             camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
             renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight);
        }

        // --- Animation Loop Function ---
        function animate(time) {
            requestAnimationFrame(animate);

            // Parallax Effect - Applied to the scene
            const targetRotationX = mouseY * CONFIG.parallaxFactor;
            const targetRotationY = mouseX * CONFIG.parallaxFactor;
            scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.02;
            scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.02;

            // Moon Global Rotation - Applied directly to the Points object
            if (moonParticles && CONFIG.globalRotationSpeed !== 0) {
                moonParticles.rotation.y += CONFIG.globalRotationSpeed;
                moonParticles.rotation.x += CONFIG.globalRotationSpeed * 0.3; // Slight tilt
            }

            // Update Particle Properties (Drift & Twinkle)
            if (moonParticles && actualParticleCount > 0) {
                const positions = moonParticles.geometry.attributes.position.array;
                const sizes = moonParticles.geometry.attributes.size.array;
                const timeFactor = time * CONFIG.twinkleSpeed;

                for (let i = 0; i < actualParticleCount; i++) {
                    const i3 = i * 3; const i1 = i;

                    // --- a) Update Velocity ---
                    // No external forces, just apply damping
                    particleVelocities[i3 + 0] *= CONFIG.velocityDamping;
                    particleVelocities[i3 + 1] *= CONFIG.velocityDamping;
                    particleVelocities[i3 + 2] *= CONFIG.velocityDamping;

                    // --- b) Apply Velocity to Position ---
                    positions[i3 + 0] += particleVelocities[i3 + 0];
                    positions[i3 + 1] += particleVelocities[i3 + 1];
                    positions[i3 + 2] += particleVelocities[i3 + 2];

                    // --- c) Containment (Simple Pull Towards Center) ---
                    // Gently pull particles back towards the moon's radius if they drift too far
                    particlePos.set(positions[i3], positions[i3+1], positions[i3+2]);
                    const distSq = particlePos.lengthSq();
                    const targetRadius = CONFIG.moonRadius; // Target radius
                    const maxDistSq = (targetRadius + CONFIG.moonShellThickness * 2)**2; // A bit beyond the shell

                    if (distSq > maxDistSq) {
                        // Calculate vector towards center and apply a small corrective velocity
                        const pullFactor = 0.01 * (distSq / maxDistSq - 1.0); // Stronger pull further away
                        particleVelocities[i3 + 0] -= particlePos.x * pullFactor;
                        particleVelocities[i3 + 1] -= particlePos.y * pullFactor;
                        particleVelocities[i3 + 2] -= particlePos.z * pullFactor;
                        // Also clamp position slightly
                        particlePos.normalize().multiplyScalar(targetRadius + CONFIG.moonShellThickness);
                        positions[i3+0] = particlePos.x; positions[i3+1] = particlePos.y; positions[i3+2] = particlePos.z;
                    }


                    // --- d) Twinkle ---
                    const currentSize = sizes[i1];
                    sizes[i1] = currentSize * (1 + Math.sin(timeFactor + i1 * 0.5) * (CONFIG.twinkleRange / 15)); // Slower, subtler twinkle
                    sizes[i1] = Math.max(CONFIG.particleSizeMin * 0.8, Math.min(sizes[i1], CONFIG.particleSizeMax * 1.2)); // Clamp size
                }

                // Mark geometry attributes as needing update
                moonParticles.geometry.attributes.position.needsUpdate = true;
                moonParticles.geometry.attributes.size.needsUpdate = true;
            }

            // Render via Composer
            composer.render();
        }

        // --- Start ---
        window.onload = () => {
            try { init(); animate(0); } catch (error) { console.error("Error:", error); /* ... error message ... */ }
        };

    </script>
</body>
</html>

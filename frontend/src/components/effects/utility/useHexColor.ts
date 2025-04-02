"use client"; // Required for hooks interacting with DOM/window

import { useCallback } from 'react';

// --- Helper Functions (kept outside the hook for clarity and potential reuse) ---

/**
 * Converts a decimal number (0-255) to its two-digit hexadecimal representation.
 * @param {number} c - The decimal number.
 * @returns {string} The two-digit hex string.
 */
function componentToHex(c: number): string {
    // Ensure the input is within the valid range 0-255
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    // Convert to hexadecimal
    const hex = clamped.toString(16);
    // Pad with a leading zero if necessary (e.g., 'f' becomes '0f')
    return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Converts an RGB color value to its #RRGGBB hexadecimal representation.
 * @param {number} r - Red component (0-255).
 * @param {number} g - Green component (0-255).
 * @param {number} b - Blue component (0-255).
 * @returns {string} The hex color string (e.g., "#ff0000").
 */
function rgbToHex(r: number, g: number, b: number): string {
    // Convert each component and concatenate with a leading '#'
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// --- Custom Hook Definition ---

/**
 * React hook that provides a memoized function to convert any valid CSS color string
 * into its #RRGGBB hex representation using the browser's computed style.
 *
 * IMPORTANT: This hook relies on browser APIs (DOM, getComputedStyle) and
 * MUST be used in client-side components. Ensure the component using this hook
 * or the hook file itself has the `"use client";` directive in Next.js App Router.
 *
 * @returns {function(colorString: string, targetElement?: Element | null): string | null}
 * A memoized function `getHexValue`.
 * - `colorString`: The CSS color to convert (keyword, hex, rgb(a), hsl(a), var()).
 * - `targetElement` (optional): The DOM element context for resolving relative
 * colors like 'currentColor' or CSS variables. Defaults to document.body if null/undefined.
 * - Returns the hex string (#RRGGBB) or null if invalid/transparent.
 */
export function useHexColor() {

    const getHexValue = useCallback((colorString: string, targetElement: Element | null = null): string | null => {
        // --- Core Logic (adapted from the original getHexColor function) ---

        // 1. Input Validation
        if (typeof colorString !== 'string' || colorString.trim() === '') {
            console.warn(`[useHexColor] Invalid input: Expected a non-empty string, got ${typeof colorString}`);
            return null;
        }

        // Ensure this runs only on the client side where document is available
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.warn("[useHexColor] Cannot execute on the server side.");
            return null;
        }

        // Use provided targetElement or default to document.body
        const effectiveTargetElement = targetElement || document.body;

        // 2. Create Temporary Element
        const tempElement = document.createElement('div');

        // 3. Style Application
        tempElement.style.color = colorString;

        // 4. Append (Temporarily) to DOM
        tempElement.style.position = 'absolute';
        tempElement.style.opacity = '0';
        tempElement.style.pointerEvents = 'none';
        tempElement.style.zIndex = '-1';
        effectiveTargetElement.appendChild(tempElement);

        let computedColor: string | null = null;
        let hexColor: string | null = null;

        try {
            // 5. Get Computed Style
            computedColor = window.getComputedStyle(tempElement).color;

            // 6. Parse Computed Color (rgb/rgba)
            // Regex explanation:
            // rgba?    : matches 'rgb' or 'rgba'
            // \(       : matches the opening parenthesis
            // (\d+)    : captures one or more digits (group 1: red)
            // ,\s* : matches a comma and optional whitespace
            // (\d+)    : captures one or more digits (group 2: green)
            // ,\s* : matches a comma and optional whitespace
            // (\d+)    : captures one or more digits (group 3: blue)
            // (?:      : starts a non-capturing group for the optional alpha
            // ,\s* : matches the comma and optional whitespace for alpha
            // [\d.]+   : matches one or more digits or dots (the alpha value)
            // )?       : makes the alpha group optional
            // \)       : matches the closing parenthesis
            const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);

            // 7. Handle Match & Conversion
            if (match) {
                const r = parseInt(match[1], 10);
                const g = parseInt(match[2], 10);
                const b = parseInt(match[3], 10);

                // Check for transparency (computed style often rgba(0, 0, 0, 0))
                // Need to parse alpha accurately if present
                 const alphaMatch = computedColor.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
                 const alpha = alphaMatch ? parseFloat(alphaMatch[1]) : 1.0; // Default alpha to 1.0 (opaque) if not found

                if (r === 0 && g === 0 && b === 0 && alpha === 0) {
                    // Explicitly handle 'transparent' keyword's computed value
                    hexColor = null; // Indicate transparency explicitly
                    console.info(`[useHexColor] Input "${colorString}" resolved to transparent.`);
                } else {
                    // Convert the extracted R, G, B values to the hex format.
                    hexColor = rgbToHex(r, g, b);
                }
            } else {
                // 8. Handle Failure (parsing)
                console.warn(`[useHexColor] Could not parse computed color "${computedColor}" for input "${colorString}".`);
                hexColor = null;
            }
        } catch (error) {
            // 9. Catch Errors
            console.error(`[useHexColor] Error processing color string "${colorString}":`, error);
            hexColor = null;
        } finally {
            // 10. Cleanup: Always remove the temporary element
            if (tempElement.parentNode === effectiveTargetElement) {
                 effectiveTargetElement.removeChild(tempElement);
            }
        }

        // 11. Return Result
        return hexColor;

    }, []); // Empty dependency array: the function itself doesn't depend on props/state

    // Return the memoized function for components to call
    return getHexValue;
}


// --- Example Usage Component ---

// Assume this component is used within a Next.js project
// where Panda CSS variables like --color-primary are defined globally.

// Example component file: src/components/ColorDisplay.tsx
// Make sure this component or a parent has "use client"

/*
import React, { useState, useMemo } from 'react';
import { useHexColor } from './useHexColor'; // Adjust path as needed

export default function ColorDisplay() {
    "use client"; // Directive needed here or in a parent component/layout

    const [colorInput, setColorInput] = useState<string>('var(--color-primary)'); // Example Panda variable
    const getHexValue = useHexColor(); // Get the conversion function from the hook

    // Calculate the hex value whenever the input changes
    // useMemo ensures we only recalculate when colorInput changes
    const hexOutput = useMemo(() => {
        return getHexValue(colorInput);
    }, [colorInput, getHexValue]);

    // Example styles (inline or using CSS modules/Panda)
    const previewStyle: React.CSSProperties = {
        display: 'inline-block',
        width: '30px',
        height: '30px',
        backgroundColor: hexOutput ?? 'transparent', // Use hex or transparent if null
        border: '1px solid #ccc',
        marginLeft: '10px',
        verticalAlign: 'middle',
        borderRadius: '4px'
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ marginTop: 0 }}>Color to Hex Converter</h2>
            <label htmlFor="colorInput" style={{ marginRight: '10px' }}>
                Enter CSS Color:
            </label>
            <input
                id="colorInput"
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="e.g., blue, #ff00ff, rgba(0,255,0,0.5), var(--color-secondary)"
                style={{ padding: '8px', minWidth: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <div style={{ marginTop: '15px', fontFamily: 'monospace', fontSize: '1.1em' }}>
                <span>Computed Hex: {hexOutput ?? 'N/A (Invalid or Transparent)'}</span>
                <span style={previewStyle}></span>
            </div>
             <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                Try inputs like: <code>red</code>, <code>#3a3</code>, <code>hsl(200, 50%, 50%)</code>, <code>rgba(50, 100, 150, 0.7)</code>, <code>var(--color-primary)</code>, <code>transparent</code>
            </p>
        </div>
    );
}
*/
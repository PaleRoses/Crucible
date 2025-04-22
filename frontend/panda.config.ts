// improved-panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { tokens } from "./moonlight-ui/panda.config/tokens/tokens";
import { themes } from "./moonlight-ui/panda.config/themes";
import { keyframes } from "./moonlight-ui/panda.config/keyframes";
import { breakpoints } from "./moonlight-ui/panda.config/breakpoints"
import { globalCss } from "./moonlight-ui/panda.config/global-css";
import { recipes } from './panda.config/recipes';
import { textStyles } from './moonlight-ui/panda.config/text-styles';
import { defineUtility } from '@pandacss/dev';

export default defineConfig({
  // Basic setup
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  minify: true, // Enable minification for smaller CSS bundles

  staticCss: {
    themes: ['midnight', 'starlight', 'eclipse', 'moonlight', 'nebula']
  },
   
  // Theme configuration - essential parts
  theme: {
    extend: {
      tokens,
      breakpoints,
      textStyles: textStyles,
      // @ts-ignore
      recipes,
      keyframes,
    },
  },

  themes,
  prefix: "",
  
  conditions: {
    extend: {
      starlight: "[data-panda-theme=starlight] &",
      midnight: "[data-panda-theme=midnight] &",
      eclipse: "[data-panda-theme=eclipse] &",
      moonlight: "[data-panda-theme=moonlight] &",
      nebula: "[data-panda-theme=nebula] &",
      // Light/dark mode fallbacks can be handled separately if needed
      light: ".light &",
      dark: ".dark &",
      groupHover: "[role=group]:where(:hover, [data-hover]) &",
    },
  },
  // --- Add your utilities here ---
  utilities: {
    // Wrap each utility definition with defineUtility
    srOnly: defineUtility({
      // className: "sr-only", // className is often inferred, but can be specified
      values: { type: 'boolean' }, // Use type: 'boolean' for simpler boolean utilities
      transform(value) {
        if (value === true) {
          return {
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: "0"
          };
        }
        // It's good practice to return an empty object if the condition isn't met
        return {};
      }
    }), // End of srOnly definition

    textTruncate: defineUtility({
      // className: "text-truncate",
      values: { type: 'boolean' },
      transform(value) {
        if (value === true) {
          return {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          };
        }
        return {};
      }
    }), // End of textTruncate definition

    focusRing: defineUtility({
      // className: "focus-ring",
      values: { type: 'boolean' },
      // Ensure TransformArgs is imported if needed, or rely on inference
      transform(value, { token }) { // Access token function via the second argument
        if (value === true) {
          return {
            outline: `2px solid ${token('colors.primary')}`, // Use template literal or token reference
            // outline: '2px solid {colors.primary}', // Alternative token reference syntax
            outlineOffset: "2px",
            // Optionally add default focus removal if applying directly via focus state
            // '&:focus': {
            //   outline: 'none', // Remove default browser outline if needed
            // }
          };
        }
        return {};
      }
    }), // End of focusRing definition

   // --- Corrected Gradient Border Utility ---
   gradientBorder: defineUtility({
    className: 'gradient-border',
    // description: 'Applies a gradient border using a masked pseudo-element',
    values: { type: 'string' },
    transform(value: string, { token }) { // Destructure token helper

      // Ensure the token exists in your theme. If 'spacing.0.5' isn't defined,
      // you'll get a Panda build error, which is better than a runtime issue.
      // Or, define a variable here like: const defaultWidth = token('spacing.0.5') || '2px';
      // But relying on defined tokens is cleaner.
      const defaultBorderWidth = token('spacing.0.5'); // Get the token value (e.g., '2px')

      return {
        position: 'relative',
        zIndex: 0,
        '--gradient-border-background-image': value,

        // Use the retrieved token value as the fallback for the CSS variable
        '--after-inset':
          `calc(var(--gradient-border-width, ${defaultBorderWidth}) + var(--gradient-border-offset, 0px))`, // FIXED: token() has only 1 arg

        '&::after': {
          content: '""',
          display: 'block',
          position: 'absolute',
          inset: 'calc(var(--after-inset) * -1)',
          pointerEvents: 'none',

          // Use the retrieved token value as the fallback for the CSS variable here too
          padding: `var(--gradient-border-width, ${defaultBorderWidth})`, // FIXED: token() has only 1 arg

          borderRadius: 'var(--gradient-border-radius, inherit)',
          backgroundImage: 'var(--gradient-border-background-image)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          zIndex: -1,
        },
      }
    },
  }), // --- End of corrected gradientBorder ---

  // Keep the other gradient utilities (gradientBorderWidth, etc.) as they were
  gradientBorderWidth: defineUtility({
      // ... (no changes needed here) ...
      className: 'gradient-border-w',
      // description: 'Sets the width of the gradient border',
      values: 'spacing',
      transform(value: string) {
        return { '--gradient-border-width': value };
      },
  }),

  gradientBorderOffset: defineUtility({
      // ... (no changes needed here) ...
       className: 'gradient-border-offset',
       // description: 'Sets an offset for the gradient border from the element edge',
       values: 'spacing', // Or { type: 'string' }
       transform(value: string) {
         return { '--gradient-border-offset': value };
       },
  }),

  gradientBorderRadius: defineUtility({
      // ... (no changes needed here) ...
      className: 'gradient-border-r',
      // description: "Adjusts the border radius of the gradient border pseudo-element (defaults to parent's radius)",
      values: 'radii', // Or { type: 'string' } if you need 'inherit' explicitly
      transform(value: string) {
        return { '--gradient-border-radius': value };
      },
  }),
  },
  globalCss,
});
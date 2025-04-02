# Crucible Frontend Developer Guidelines

## Commands
- Build: `npm run build`
- Dev server: `npm run dev` (uses turbopack)
- Lint: `npm run lint`
- Start production: `npm run start`
- Style generation: `npm run prepare` (runs panda codegen)

## Code Style
- TypeScript with strict mode enabled
- Next.js App Router conventions (/app directory structure)
- ESLint with next/core-web-vitals and next/typescript configs
- Component naming: PascalCase (React components)
- Imports: use absolute imports from baseUrl with @/ alias
- CSS: Use PandaCSS utility classes and theme tokens
- Error handling: Use ErrorBoundary components for React errors

## Project Structure
- Core components in `/src/components/core`
- Layout components in `/src/components/layout`  
- Effects in `/src/components/effects`
- Hooks in `/src/hooks`
- Lib utilities in `/src/lib`

## Types
- TypeScript interfaces/types for component props
- Define shared types in `/src/app/styles/types`
- Use strict type checking
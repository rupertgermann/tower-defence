# Task List

This document enumerates all tasks derived from the improvement plan.

## Phase 1 – Architecture & Code Quality
- [ ] 1.1 Extract common utilities (math, vector ops, pathfinding) into `/src/utils/`
- [ ] 1.2 Convert each Scene and Entity into its own ES6 module
- [ ] 1.3 Introduce a lightweight `EventEmitter` to decouple Scene ↔ Entity communication
- [ ] 1.4 Move configuration data (waves, tower stats, map layouts) into `/assets/config/`

## Phase 2 – Maintainability & Type Safety
- [ ] 2.1 Add ESLint & Prettier with pre-commit hook
- [ ] 2.2 Write Jest unit & integration tests for core logic
- [ ] 2.3 Migrate initial module to TypeScript and add strict typing

## Phase 3 – Performance & UX
- [ ] 3.1 Implement object pooling for bullets, particles, and enemies
- [ ] 3.2 Optimize update loop (spatial hashing/quadtree)
- [ ] 3.3 Abstract UI into a manager and support responsive resizing
- [ ] 3.4 Implement asset loading bar during preload

## Phase 4 – Tooling & Automation
- [ ] 4.1 Set up GitHub Actions (lint, tests, build)
- [ ] 4.2 Configure webpack dev server with hot-reload & integrate `browser_preview`
- [ ] 4.3 Automate deployment to Netlify/Vercel on merge to `main`

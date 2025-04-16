# Improvement Plan

This document outlines a multi‑phase roadmap to refactor, harden, and extend the Tower Defense codebase.

---

## Phase 1 – Architecture & Code Quality
1. **Modularize & DRY**
   - Extract common utilities (math, vector ops, pathfinding) into `/src/utils/`.
   - Convert each Scene and Entity into its own ES6 module.
2. **Event Bus**
   - Introduce a lightweight `EventEmitter` to decouple Scene ↔ Entity communication.
3. **Configuration‑Driven Data**
   - Move wave definitions, tower stats, and map layouts into JSON files under `/assets/config/`.
   - Load and validate them at startup instead of hard‑coding.

## Phase 2 – Maintainability & Type Safety
1. **Linting & Formatting**
   - Add ESLint + Prettier with shared rules; enforce via a pre‑commit hook.
2. **Unit & Integration Tests**
   - Extract pure logic into testable modules; write Jest tests for edge cases.
3. **TypeScript Migration**
   - Renaming one module to `.ts` and progressively add strict typing for key interfaces.

## Phase 3 – Performance & UX
1. **Object Pooling**
   - Pool bullets, particles, and enemies to reduce GC spikes.
2. **Update Loop Optimization**
   - Batch collision and range checks via spatial hashing or quadtrees.
3. **Responsive UI**
   - Abstract UI elements into a manager; support dynamic resizing.
4. **Asset Loader**
   - Implement a loading bar during preloads.

## Phase 4 – Tooling & Automation
1. **CI/CD**
   - Set up GitHub Actions to run lint, tests, and build on PRs.
2. **Dev Server & Preview**
   - Configure webpack dev server with hot‑reload; integrate `browser_preview` for local testing.
3. **Deployment**
   - Automate publishing to Netlify/Vercel on merge to `main`.

---

*Next: Begin Phase 1 by extracting utilities and centralizing configuration.*

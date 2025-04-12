# Phaser 3.60+ Particle API Migration Plan

---

## Migration Status

**Status: Complete**  
All usages of particle effects in the codebase now follow the Phaser 3.60+ API.  
- All `this.add.particles()` calls use a texture key only.
- All emitters are created with `createEmitter()`.
- One-shot effects use `emitter.explode()`.
- Managers are destroyed after the effect.
- No usages of the old pattern remain.

---

## Problem Statement

The game currently triggers warnings in the browser console:

```
ParticleEmitterManager was removed in Phaser 3.60. See documentation for details
```

This is due to using the old pattern of passing emitter configs directly to `this.add.particles()` or instantiating `ParticleEmitterManager` directly. Phaser 3.60+ requires a new approach for creating and managing particle effects.

---

## Core Issue

- **Old Pattern:** Passing emitter configs directly to `this.add.particles()` or using `new ParticleEmitterManager()`.
- **New Pattern (Phaser 3.60+):** 
  - Create a particle manager with a texture key: `const manager = this.add.particles('explosion');`
  - Create emitters with `manager.createEmitter({...emitterConfig...})`
  - For one-shot effects, use `emitter.explode(quantity, x, y)`
  - Destroy the manager after the effect is complete.

---

## Step-by-Step Migration Plan

1. **Identify all uses of `this.add.particles()` where emitter configs are passed directly.**
   - Example (old, incorrect):
     ```js
     const particles = this.add.particles({
         key: 'explosion',
         x: x,
         y: y,
         lifespan: 500,
         speed: { min: 100, max: 220 },
         scale: { start: radius / 120, end: 0 },
         quantity: 20,
         alpha: { start: 0.9, end: 0 },
         angle: { min: 0, max: 360 },
         blendMode: 'ADD'
     });
     ```

2. **Refactor to the new pattern:**
   - Create the manager with just the texture key:
     ```js
     const manager = this.add.particles('explosion');
     ```
   - Create the emitter with the desired config:
     ```js
     const emitter = manager.createEmitter({
         lifespan: 500,
         speed: { min: 100, max: 220 },
         scale: { start: radius / 120, end: 0 },
         quantity: 20,
         alpha: { start: 0.9, end: 0 },
         angle: { min: 0, max: 360 },
         blendMode: 'ADD'
     });
     ```
   - For one-shot bursts, use:
     ```js
     emitter.explode(20, x, y);
     ```
   - Destroy the manager after the effect:
     ```js
     this.time.delayedCall(550, () => {
         manager.destroy();
     });
     ```

3. **Repeat for all similar particle effect methods (e.g., `createHitEffect`, `createExplosionEffect`, `playDeathAnimation`).**

---

## Example Migration

**Before:**
```js
const particles = this.add.particles({
    key: 'explosion',
    x: x,
    y: y,
    lifespan: 500,
    speed: { min: 100, max: 220 },
    scale: { start: radius / 120, end: 0 },
    quantity: 20,
    alpha: { start: 0.9, end: 0 },
    angle: { min: 0, max: 360 },
    blendMode: 'ADD'
});
this.time.delayedCall(550, () => {
    particles.destroy();
});
```

**After:**
```js
const manager = this.add.particles('explosion');
const emitter = manager.createEmitter({
    lifespan: 500,
    speed: { min: 100, max: 220 },
    scale: { start: radius / 120, end: 0 },
    quantity: 20,
    alpha: { start: 0.9, end: 0 },
    angle: { min: 0, max: 360 },
    blendMode: 'ADD'
});
emitter.explode(20, x, y);
this.time.delayedCall(550, () => {
    manager.destroy();
});
```

---

## Summary

- Always create the particle manager with a texture key.
- Always create emitters with `createEmitter()`.
- Use `emitter.explode()` for one-shot effects.
- Destroy the manager after the effect to clean up.
- This approach is required for Phaser 3.60+ and will resolve all related warnings.

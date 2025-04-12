# Bug Fix Plan: Enemy Destruction Error

## Issues

### Issue 1: Enemy Data Destruction Error
When an enemy is killed, the following error occurs:
```
TypeError: this.data.destroy is not a function
    at Enemy.destroy (webpack-internal:///./node_modules/phaser/dist/phaser.js:35311:23)
    at GameScene.updateEnemies (webpack-internal:///./src/scenes/GameScene.js:342:17)
```

### Issue 2: Scene Reference Lost in Tween Callback
After fixing the first issue, a second error occurs:
```
TypeError: Cannot read properties of undefined (reading 'economyManager')
    at Tween.onComplete (webpack-internal:///./src/entities/Enemy.js:246:24)
```

## Root Cause Analysis

### Issue 1: Enemy Data Destruction Error
1. The error occurs in the `Enemy.destroy()` method when Phaser tries to call `this.data.destroy()`.
2. In the `Enemy` class, `this.data` is set as a plain JavaScript object: `this.data = { ...data };` (line 11 in Enemy.js).
3. Plain JavaScript objects don't have a `destroy()` method, which is causing the error.
4. Phaser's GameObject.destroy() method attempts to destroy all properties that have a destroy method.

### Issue 2: Scene Reference Lost in Tween Callback
1. When the enemy is destroyed, the reference to `this.scene` is lost in the tween's onComplete callback.
2. This happens because the callback is executed after the enemy has been destroyed.
3. The `this` context in the callback no longer has access to the scene or its properties.

## Solutions

### Solution for Issue 1
Override the `destroy()` method in the `Enemy` class to properly handle the data property before calling the parent class's destroy method.

### Solution for Issue 2
Store references to the scene and economyManager in local variables before setting up the tween, then use these local variables in the callback instead of accessing them through `this`.

---

# Bug Fix Plan: Hit Effects Not Visible (Phaser Particle System, v3.88.2+)

## Issue

**Hit effects (particle bursts) are not visible when projectiles hit enemies, and the browser console shows:**
```
Uncaught Error: createEmitter removed. See ParticleEmitter docs for info
```

## Root Cause Analysis

1. **Incorrect Phaser Particle API Usage:**  
   - In Phaser 3.60+ (including v3.88.2), `createEmitter` is removed from ParticleEmitterManager.
   - The correct way to create a one-shot burst is to use the `explode` method on the ParticleEmitterManager.
   - The previous code attempted to use `createEmitter`, which is no longer supported.

2. **Asset Availability:**  
   - The code uses the 'explosion' image as a particle.
   - If 'explosion.png' is missing or not loaded, no particles will appear.

## Step-by-Step Solution

1. **Check the browser console for errors** related to `this.add.particles` or missing assets.
2. **Confirm that 'explosion.png' is present** in `public/assets/` and is loaded in `preload()`.
3. **Update the hit effect code to use the correct Phaser 3.60+ API:**
   - Use `this.add.particles('explosion')` to create a ParticleEmitterManager.
   - Call `manager.explode(quantity, x, y)` to create a one-shot burst at the desired location.
   - Use the `tint` property on the manager's default emitter if you want to color the particles.
   - Destroy the manager after a short delay to clean up.
4. **Test again** to confirm hit effects appear.

## Example Fix

```js
// Instead of this (incorrect):
const manager = this.add.particles('explosion');
const emitter = manager.createEmitter({ ... }); // ❌ createEmitter is removed

// Do this (correct):
const manager = this.add.particles('explosion');
manager.defaultEmitter.setTint(tint); // Set color if needed
manager.explode(10, x, y); // One-shot burst
this.time.delayedCall(350, () => {
    manager.destroy();
});
```

## Why This Works

- `this.add.particles('explosion')` creates a ParticleEmitterManager using the 'explosion' image.
- `manager.explode(quantity, x, y)` creates a one-shot burst at the specified location.
- Setting `tint` on the default emitter colors the particles.
- Destroying the manager after the effect prevents memory leaks and keeps the scene clean.

## Testing

1. Start the game and trigger projectile hits.
2. Observe the impact location for the particle burst.
3. Check the browser console for errors or warnings.
4. If the effect is still not visible, verify asset loading and emitter configuration.

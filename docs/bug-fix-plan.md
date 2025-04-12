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

## Implementation Plan
1. For Issue 1: Modify the `Enemy.js` file to add a custom `destroy()` method that:
   - Stores a reference to the data object
   - Sets `this.data = null` to prevent Phaser from trying to destroy it
   - Calls the parent class's destroy method

2. For Issue 2: Modify the `die()` method in the `Enemy` class to:
   - Store references to `this.scene` and `this.scene.economyManager` in local variables
   - Use these local variables in the tween's onComplete callback instead of accessing them through `this`

## Testing
After implementing the fix:
1. Start the game
2. Let enemies spawn
3. Kill an enemy
4. Verify no errors occur in the console

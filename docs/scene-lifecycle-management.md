# Scene Lifecycle Management & Cleanup Plan

## Objective

Ensure robust cleanup and correct lifecycle management for all game entities, graphics, sounds, and effects when restarting a level or returning to the main menu. Special attention is given to SupportTower and its unique effects.

---

## 1. Scope of Cleanup

**Entities to be managed:**
- All Towers (including SupportTower, MultiShotTower, etc.)
- All Enemies (including special types)
- All Projectiles
- All Effects (particles, explosions, etc.)
- All UI elements and overlays
- All Graphics objects (Phaser images, containers, groups, etc.)
- All Sounds and Music (background, SFX)
- All Tweens and Timers
- All Event Listeners (scene, input, custom events)

---

## 2. Cleanup Strategy

### A. Scene Event Hooks

- Add `this.events.on('shutdown', this.cleanup, this);` and `this.events.on('destroy', this.cleanup, this);` to both `GameScene` and `UIScene`.
- Implement a `cleanup()` method in each scene to handle destruction and removal of all managed objects.

### B. Manager and Entity Cleanup

- Ensure all managers (TowerManager, EnemyManager, ProjectileManager, EffectSpawner, etc.) implement a `destroy()` or `shutdown()` method that:
  - Calls `.destroy(fromScene)` on all managed game objects.
  - Removes all event listeners and references.
  - Stops and destroys all tweens and timers.
- For SupportTower, ensure any buffs, auras, or special effects are removed from affected entities and do not persist after restart.

### C. Graphics and UI

- Destroy all Phaser graphics, containers, overlays, and UI elements created in the scene.
- Remove all custom event listeners from UI elements.
- **[Update 2025-04-19]:**  
  - After a scene restart, all Phaser game objects (including Text/UI) are destroyed.  
  - All references to destroyed UI objects (e.g., `this.livesText`, `this.towerButtons`, etc.) **must be cleared or re-initialized** in the scene's `create()` method.  
  - Never call methods like `setFill` or `setText` on UI objects after restart unless they have been re-created.  
  - Defensive: Optionally check for `obj && !obj.destroyed` before updating UI elements.

### D. Sound and Music

- Stop and destroy all sounds and music via the AudioManager.
- Remove any looping or persistent sound effects.

### E. Tweens and Timers

- Stop and destroy all tweens and timers created in the scene or by managers/entities.

### F. Input and Event Listeners

- Remove all custom input handlers (keyboard, pointer, etc.) not managed by Phaser.
- Unsubscribe from all custom and scene events.

---

## 3. Special Case: SupportTower

- Audit SupportTower implementation to ensure:
  - All buffs/effects applied to other entities are removed on tower destruction or scene cleanup.
  - No references to destroyed towers or affected entities persist after restart.
  - Any event listeners or timers created by SupportTower are cleaned up.

---

## 4. Scene Restart and Transition

- Use `scene.restart()` for level restarts to ensure a clean state.
- Use `scene.stop()` for both `GameScene` and `UIScene`, then `scene.start('MapSelectScene')` for returning to the main menu.
- Ensure all persistent data (e.g., registry, global state) is reset as needed.

---

## 5. Testing and Verification

- After implementing cleanup, test:
  - Restarting the level multiple times in a row.
  - Returning to the main menu and starting a new game.
  - That no duplicate objects, lingering sounds, or memory leaks occur.
  - That SupportTower and all other entities behave correctly after restart.
  - **[Update 2025-04-19]:**  
    - Specifically test that UI updates after restart do not throw errors due to destroyed object references.

---

## 6. Minimal Change Principle

- Only add or modify code where necessary for cleanup.
- Avoid refactoring or changing existing logic unless required for correct lifecycle management.
- Double-check all changes to prevent breaking current game functionality.

---

## 7. Documentation

- This plan is documented in `docs/scene-lifecycle-management.md` for future reference and maintenance.
- **[Update 2025-04-19]:**  
  - Added explicit note on UI object reference invalidation after scene restart and the need to re-create or clear all such references in `create()`.

---

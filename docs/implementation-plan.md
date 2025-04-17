# Implementation Plan: Phaser Refactor & Improvements

_Last updated: 17.4.2025_

This plan outlines actionable steps to improve the Tower Defense project based on the implementation analysis and verified best practices from Phaser's official documentation.

## 1. Entity Management Refactor
- Replace manual arrays for towers, enemies, and projectiles with Phaser Groups.
- Begin implementing object pooling for projectiles and enemies (using Groups or a custom pool).

## 2. Scene Transition Improvements
- Replace all uses of `window.location.reload()` with proper scene transitions using `this.scene.start('TargetScene')`.
- Ensure game state resets cleanly on scene change.

## 3. Event System Standardization
- Audit the codebase for mixed use of Phaser’s EventEmitter and custom emitters.
- Refactor to use Phaser’s EventEmitter for all scene/game events.
- Reserve custom emitters for truly global, non-scene events if needed.

## 4. Decouple Entity-Manager Interactions
- Refactor entities to emit events (e.g., 'enemyKilled') instead of directly accessing scene managers.
- Update managers/scenes to listen for these events and handle updates.

## 5. UI/UX Feedback Enhancements
- Make tower/action buttons non-interactive (`disableInteractive()`) when unaffordable.
- Add clear visual feedback for unaffordable actions (e.g., shake animation, tooltip).

## 6. Remove Redundant/Unused Code
- Audit for debug logs and unnecessary comments.
- Remove or wrap debug output in a development flag.

## 7. GameScene Complexity Reduction
- Identify and extract complex logic (e.g., collision handling, effect spawning) from GameScene into helper classes or modules.

## Event System Standardization Plan

### Principle
- All scene, UI, and game events must use Phaser’s built-in EventEmitter (`this.events`, `this.scene.events`, or `scene.events`).
- The custom/global EventEmitter (src/utils/EventEmitter.js) should only be used for events that truly need to be global and not tied to any scene or game object (ideally, none in a typical Phaser project).

### Steps to Standardize

#### 1. Audit and Remove Custom EventEmitter Usage
- Search for all imports and usages of the custom emitter (`import emitter from '../utils/EventEmitter.js'`).
- Replace all `emitter.emit(...)` and `emitter.on(...)` calls with the appropriate Phaser event emitter.

#### 2. Update Event Emission and Listening
- For events between entities and their scenes: use `this.scene.events.emit(...)` and `this.scene.events.on(...)`.
- For events between scenes: use `this.scene.get('OtherScene').events.emit(...)` and `.on(...)`.
- For UI updates, game state changes, and similar: use the relevant scene’s event emitter.

#### 3. Clean Up
- Remove the custom EventEmitter utility if no longer needed.
- Remove all related imports from files.

#### 4. Documentation
- Add comments in code to clarify the event pattern and discourage custom emitter usage for scene/game events.

### Actionable Checklist

1. **Entities (Tower, Enemy, etc.)**
   - [x] showTowerInfo (already migrated)
   - [x] Any other events using the custom emitter? (search and refactor)

2. **UIScene**
   - [x] Listen for showTowerInfo via Phaser events (done)
   - [x] Listen for all other events via Phaser events only

3. **GameScene, WaveManager, EconomyManager, etc.**
   - [x] Ensure all event emission/listening uses Phaser’s event system

4. **Global/Custom Events**
   - [x] Identify if any events truly need to be global; if not, remove custom emitter

5. **Remove Unused Code**
   - [x] Remove src/utils/EventEmitter.js if not needed
   - [x] Remove all imports/usages of the custom emitter

6. **Testing**
   - [x] Test all event flows (UI, game, inter-scene) to ensure correct behavior

---

All events should follow this standard for consistency and maintainability. Progress on this checklist should be tracked as each item is completed.

---

All tasks have been validated against Phaser's official API and are fully supported. This plan ensures maintainability, clarity, and best practices for future development.

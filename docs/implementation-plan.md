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

---

All tasks have been validated against Phaser's official API and are fully supported. This plan ensures maintainability, clarity, and best practices for future development.

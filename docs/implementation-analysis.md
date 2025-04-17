# Implementation Analysis & Refactor Plan

_Last updated: 17.4.2025_

## Overview

This document provides a deep analysis of the current implementation patterns in the Tower Defense project, identifies potential oddities or anti-patterns, and proposes a plan for simple, maintainable improvements. The analysis is based on a thorough review of the Memory Bank, .clinerules, and representative code from all major areas.

---

## 1. General Architecture & Patterns

- **Strengths:**
  - Modular, manager-based architecture as intended.
  - Entities, systems, and scenes are well-separated.
  - ES6 modules and modern JS syntax are used throughout.
  - Event-driven communication is present, especially for UI updates.
  - Config-driven asset loading and game data.

- **No major architectural violations** were found. The codebase is clean and matches the intended design.

---

## 2. Potential Oddities & Areas for Improvement

### A. Manual Array Management for Entities
- **Pattern:** Towers, enemies, and projectiles are managed in arrays, with manual push/splice for add/remove.
- **Risk:** Error-prone and can lead to memory leaks or missed removals, especially as the game scales.
- **Plan:** 
  - Implement object pooling for projectiles and enemies (already planned).
  - Consider using Phaser Groups for entity management, which provides built-in add/remove and iteration.

### B. Scene Transitions & Game Over Handling
- **Pattern:** On victory, the game uses `window.location.reload()` to return to the main menu.
- **Risk:** Heavy-handed approach, breaks the flow, reloads all assets unnecessarily.
- **Plan:** 
  - Replace with a proper scene transition (e.g., `this.scene.start('MapSelectScene')`).
  - Ensure all game state is reset on transition.

### C. Event System Usage
- **Pattern:** Both Phaser's built-in event system and a custom EventEmitter are used.
- **Risk:** Potential confusion or bugs if events are inconsistently handled between the two systems.
- **Plan:** 
  - Standardize on one event system for game-wide events (prefer Phaser's for scene-to-scene, custom emitter for global non-scene events).
  - Audit event usage for consistency.

### D. Direct Scene/Manager Access from Entities
- **Pattern:** Entities (e.g., Enemy) access `this.scene.economyManager` directly.
- **Risk:** Tight coupling between entities and scene managers; makes testing and reuse harder.
- **Plan:** 
  - Prefer event-driven updates (e.g., emit 'enemyKilled' event, let GameScene or EconomyManager handle resource updates).
  - Only allow direct access for critical, performance-sensitive paths.

### E. UI/UX Feedback and Button Interactivity
- **Pattern:** Tower buttons are always interactive, even if the player can't afford the tower; feedback is visual only.
- **Risk:** May confuse users; could allow unnecessary event handling.
- **Plan:** 
  - Disable buttons (using `disableInteractive()`) when unaffordable, or provide clearer feedback (e.g., shake animation, tooltip).
  - Ensure all UI feedback is clear and consistent.

### F. Redundant or Unused Code
- **Pattern:** Some debug logs and comments (e.g., `console.log('Debugging wave start');`) are present in production code.
- **Risk:** Clutters output and may leak information.
- **Plan:** 
  - Remove or guard debug logs with a development flag.

### G. Complexity in GameScene
- **Pattern:** GameScene is large and handles many responsibilities.
- **Risk:** Harder to maintain and extend.
- **Plan:** 
  - Refactor by extracting logic into helper classes or modules (e.g., collision handling, effect spawning).

---

## 3. Summary Table: Issues & Fixes

| Area                | Issue/Pattern                        | Risk/Complexity         | Simple Fix Plan                                 |
|---------------------|--------------------------------------|-------------------------|-------------------------------------------------|
| Entity Arrays       | Manual push/splice                   | Error-prone             | Use Phaser Groups or implement pooling          |
| Game Over           | window.location.reload()             | Breaks flow             | Use scene transitions                           |
| Event System        | Mixed event emitters                 | Inconsistency           | Standardize event system usage                  |
| Entity-Manager Link | Direct manager access from entities  | Tight coupling          | Use events for state changes                    |
| UI Buttons          | Always interactive, visual only      | UX confusion            | Disable/grey out unaffordable buttons           |
| Debug Logs          | Unconditional console.log            | Clutter                 | Remove or guard with dev flag                   |
| GameScene Size      | Large, multi-responsibility          | Maintenance burden      | Extract helpers for collision/effects           |

---

## 4. Next Steps

1. **Refactor entity management** to use Phaser Groups or begin object pooling for projectiles/enemies.
2. **Replace window reloads** with proper scene transitions for game over/victory.
3. **Audit and standardize event usage** across the codebase.
4. **Refactor direct manager access** in entities to use events where possible.
5. **Improve UI feedback** for unaffordable actions and button states.
6. **Remove debug logs** from production code.
7. **Modularize GameScene** by extracting collision and effect logic.

---

_All proposed changes are incremental and favor simplicity and maintainability._

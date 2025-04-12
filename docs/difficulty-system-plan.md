# Difficulty System Implementation Plan

## Overview

This document outlines the plan for implementing a scalable difficulty system with 5 levels for the tower defense game. The system will increase challenge by scaling enemy stats, increasing enemy counts, introducing tougher enemies earlier, and adding extra waves at higher difficulties.

---

## 1. Difficulty Level Representation

- Define 5 difficulty levels: **Easy** (current), **Normal**, **Hard**, **Expert**, **Insane**.
- Each level will have:
  - A scaling factor for enemy count per wave.
  - Multipliers for enemy health, speed, and rewards.
  - Rules for introducing tougher enemy types earlier.
  - A higher total number of waves for harder levels (extra waves are appended at the end).

---

## 2. Difficulty Selection

- Add a difficulty selection UI to the pre-game flow (in `src/scenes/MapSelectScene.js`).
- Store the selected difficulty in Phaser's scene registry for access by all scenes and systems.

---

## 3. WaveManager Integration

- Refactor `WaveManager` (`src/systems/WaveManager.js`) to:
  - Use the selected difficulty for all wave generation logic.
  - Scale the number of enemies per wave and their stats by the difficulty's factors.
  - Introduce tougher enemy types in earlier waves for higher difficulties.
  - Increase the total number of waves for harder levels by appending extra, more challenging waves at the end.

---

## 4. Enemy Stat Scaling

- Update enemy entity classes (`src/entities/Enemy.js` and variants) to accept stat multipliers on spawn.
- Ensure all enemy types can be scaled appropriately by the difficulty system.

---

## 5. Game Flow Integration

- On game start, ensure the selected difficulty is read from the registry and passed to `WaveManager`.
- Optionally, display the current difficulty in the UI (`src/scenes/UIScene.js`).

---

## 6. Documentation

- Document the difficulty system in this file and update the Memory Bank as needed.
- Ensure all config and scaling factors are centralized for easy balancing.

---

## Summary of File Changes

- `src/index.js`: Define difficulty levels and scaling factors.
- `src/scenes/MapSelectScene.js`: Add difficulty selection UI, store selection in registry.
- `src/systems/WaveManager.js`: Refactor to use difficulty for wave/enemy scaling and extra waves.
- `src/entities/Enemy.js` (and variants): Support stat multipliers.
- `src/scenes/GameScene.js`: Ensure difficulty is passed to WaveManager.
- `src/scenes/UIScene.js`: (Optional) Show current difficulty.
- `docs/` and `memory-bank/`: Document the new system.

---

## Notes

- The system is designed for extensibility and future balancing.
- All difficulty logic is centralized for maintainability.
- Extra waves for higher difficulties will be designed to provide a meaningful late-game challenge.

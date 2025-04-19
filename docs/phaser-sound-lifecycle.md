# Phaser Sound & Scene Lifecycle: Best Practices

## Overview
This document outlines best practices for managing sound effects (SFX) and background music in Phaser 3, especially with respect to scene transitions, restarts, and object lifecycles. It includes code examples and links to crucial documentation.

---

## 1. SoundManager and Scene Attachment
- **Sounds are attached to a Scene's SoundManager (`scene.sound`).**
- When you create a sound with `scene.sound.add(key)`, it is attached to that scene's SoundManager.
- **When the scene is destroyed, all its sounds are destroyed.**

**Docs:**
- [GameObject.destroy](https://github.com/phaserjs/phaser/blob/master/changelog/3.13/CHANGELOG-v3.13.md#2025-04-16_snippet_14)
- [destroy(fromScene)](https://github.com/phaserjs/phaser/blob/master/changelog/3.55.1/CHANGELOG-v3.55.1.md#2025-04-16_snippet_0)

---

## 2. Global Sounds
- If you want a sound (like background music) to persist across scenes, create it as a **global sound**:
  ```js
  this.sound.add('bgm', { global: true, loop: true });
  ```
- Global sounds are managed by the game's global SoundManager and **are not destroyed on scene shutdown**.

**Docs:**
- [Sound Management Methods](https://github.com/phaserjs/phaser/blob/master/changelog/3.23/CHANGELOG-v3.23.md#2025-04-16_snippet_3)

---

## 3. References and Memory Management
- **Never keep references to scene-scoped sound objects across scenes.**
- After scene shutdown, those references are invalid.
- Game objects (including sounds) properly remove themselves from the scene's shutdown event handler when destroyed, preventing memory leaks.

**Docs:**
- [GameObject.cleanup](https://github.com/phaserjs/phaser/blob/master/changelog/3.13/CHANGELOG-v3.13.md#2025-04-16_snippet_14)

---

## 4. Manual Sound Destruction
- **You do not need to manually destroy scene-scoped sounds; Phaser does this for you.**
- If you use global sounds, you are responsible for stopping and destroying them when appropriate:
  ```js
  soundManager.removeAll(); // Removes all sounds
  soundManager.stopByKey(key); // Stops sounds by key
  ```

---

## 5. Scene Shutdown and Data Passing
- When a scene is stopped, you can pass data to its shutdown method ([SceneManager.stop](https://github.com/phaserjs/phaser/blob/master/changelog/3.20/CHANGELOG-v3.20.md#2025-04-16_snippet_8)), but this does not affect sound destruction—scene-scoped sounds are always destroyed.

---

# Implementation Plan with Code Examples

## A. SFX (Tower/Enemy Sounds)
```js
// In your AudioManager or scene code:
this.sfx = {
  shoot: this.sound.add('shoot'),
  explode: this.sound.add('explode'),
  // ...
};

// Play SFX
this.sfx.shoot.play();
```
- **Create all SFX with `scene.sound.add('key')` in the current scene.**
- **Do NOT keep SFX references across scenes.**
- **Let Phaser handle their destruction on scene shutdown.**

## B. Background Music
```js
// If you want music to persist across scenes (global):
this.music = this.sound.add('bgm', { global: true, loop: true });
this.music.play();

// If you want music to reset per scene:
this.music = this.sound.add('bgm', { loop: true });
this.music.play();
```
- **Global music persists; you must stop/destroy it manually if needed.**
- **Scene-scoped music is destroyed automatically on scene shutdown.**

## C. AudioManager Design
```js
// Always instantiate a new AudioManager for every scene
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.loadSounds();
  }

  loadSounds() {
    this.sounds.shoot = this.scene.sound.add('shoot');
    this.sounds.explode = this.scene.sound.add('explode');
    // ...
    this.music = this.scene.sound.add('bgm', { loop: true });
  }
}
```
- **Do NOT store or reuse sound objects across scene transitions.**
- **Always use the current scene’s `scene.sound.add`.**

## D. Scene Cleanup
- **Let Phaser destroy scene-scoped sounds automatically.**
- **Only manually destroy global sounds if you want them to stop on scene change.**

---

# Summary Table
| Sound Type      | Created With             | Destroyed On Scene Shutdown | Persist Across Scenes | Manual Cleanup Needed? |
|-----------------|-------------------------|-----------------------------|----------------------|-----------------------|
| SFX (default)   | scene.sound.add(key)    | Yes                         | No                   | No                    |
| Global Music    | scene.sound.add(key, {global: true}) | No              | Yes                  | Yes                   |

---

## References
- [Phaser Sound Management Methods](https://github.com/phaserjs/phaser/blob/master/changelog/3.23/CHANGELOG-v3.23.md#2025-04-16_snippet_3)
- [GameObject.destroy](https://github.com/phaserjs/phaser/blob/master/changelog/3.13/CHANGELOG-v3.13.md#2025-04-16_snippet_14)
- [destroy(fromScene)](https://github.com/phaserjs/phaser/blob/master/changelog/3.55.1/CHANGELOG-v3.55.1.md#2025-04-16_snippet_0)
- [SceneManager.stop](https://github.com/phaserjs/phaser/blob/master/changelog/3.20/CHANGELOG-v3.20.md#2025-04-16_snippet_8)

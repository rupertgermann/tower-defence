# Phaser Scene Restart & Cleanup Checklist

Use this checklist to ensure your Phaser scenes and all their objects, events, and resources are properly cleaned up and reinitialized on restart or stop.

---

## 1. Scene Lifecycle Hooks
- [ ] Register `this.events.on('shutdown', this.shutdown, this);` in your scene's `create()` method.
- [ ] Register `this.events.on('destroy', this.destroy, this);` if you need deeper cleanup when the scene is removed from memory.

## 2. Game Object Management
- [ ] Create all Phaser GameObjects (sprites, text, containers, etc.) in `create()` or later.
- [ ] Store references to all custom objects, containers, and managers for cleanup.
- [ ] Destroy all GameObjects and custom objects in `shutdown()`.
- [ ] Listen for the `destroy` event on custom objects if you need to handle additional teardown.

## 3. Event Listeners
- [ ] Add all input and custom event listeners in `create()`.
- [ ] Remove all event listeners in `shutdown()`:
  - [ ] `this.input.off(...)`
  - [ ] `this.events.off(...)`
  - [ ] Any global or external listeners

## 4. Timers, Tweens, and Emitters
- [ ] Store references to all timers (`this.time.delayedCall`, `setTimeout`, etc.) and tweens.
- [ ] Remove or stop all timers and tweens in `shutdown()`.
- [ ] Stop and destroy all particle emitters.

## 5. Persistent State
- [ ] Do not keep persistent references to scene objects outside the scene (e.g., in global managers).
- [ ] Reset all scene/game state in `create()` or a dedicated `resetState()` method.

## 6. Custom Classes
- [ ] If you extend Phaser.GameObjects, override `destroy()` and call `super.destroy()`.
- [ ] Clean up any resources or listeners in your custom class `destroy()` methods.

## 7. Testing
- [ ] Test by calling `scene.restart()` repeatedly and check for:
  - [ ] Memory leaks (increasing memory usage)
  - [ ] Duplicate event firings
  - [ ] Objects persisting across restarts

## 8. Advanced
- [ ] Use the `fromScene` parameter of the `destroy` event to distinguish between manual and automatic destruction if needed.

---

**Reference:** Based on Phaser official documentation and changelogs (v3.13+).

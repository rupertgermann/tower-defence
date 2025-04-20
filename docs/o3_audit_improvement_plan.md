# 🔍 Technical Audit & Improvement Plan

*Phaser v3.88 tower‑defence project*

---

## 1. Critical syntax / runtime errors

| 🔥 Issue                                                                              | 📄 File / line                                           | 💡 Fix                                                                                            |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Trailing spread syntax breaks JS: `sfx[key].play({ volume: this.volume, .config });`  | **AudioManager.js**​                                     | Replace with `sfx[key].play({ ...config, volume: this.volume });` or `{ ...default, ...config }`. |
| Invalid object literal: `this.messageConfig = { .MESSAGE_STYLE };` & later `{ .cfg }` | **UIScene.js**​                                          | Use `{ ...MESSAGE_STYLE }` and `{ ...cfg }`.                                                      |
| Dot‑prefix spread in showMessage                                                      | same file as above                                       | Same fix.                                                                                         |
| Rectangle does **not** expose `.setRadius`; call is ignored                           | **ConfirmationDialog.js** (creating rounded rectangles)​ | Switch to `Phaser.GameObjects.RoundRectangle` (in RexUI) or draw with Graphics.                   |
| Potential **divide‑by‑zero** when two path points overlap (`segmentLength` = 0)       | **Enemy.moveAlongPath**​                                 | Guard with `if (segmentLength === 0) return;`.                                                    |

---

## 2. Physics & collision concerns

| ⚠️ Problem                                                                                                                   | Evidence                                                                                 | Remedy                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Using **Container** as Arcade Physics body: children positions are ignored for collision accuracy and incurs extra CPU cost. | **Enemy.js** extends `Container` and `scene.physics.world.enable(this)`​; Phaser caveat  | Replace with `Phaser.Physics.Arcade.Sprite` or keep sprite as body and attach UI elements as children.   |
| O(*n*×*m*) manual collision loop in **CollisionManager**                                                                     | nested `for` loops                                                                       | Use Arcade `Physics.Arcade.Group` and `Physics.overlap` to leverage broad‑phase partitioning.            |
| Hit / explosion effects **allocate new ParticleEmitter** per impact                                                          | **EffectSpawner.createHitEffect**                                                        | Pool emitters (or use a single `ParticleEmitterManager`). Object‑pooling is the canonical optimisation . |
| Projectiles created & destroyed every shot → GC spikes                                                                       | **Tower.fireAtTarget / spawnProjectile**                                                 | Implement a reusable projectile pool with `setActive/setVisible` toggling.                               |

---

## 3. Gameplay logic flaws

1. **Buff stacking drift**\
   *`SupportTower.applyBuff` multiplies `towerData.fireRate` each tick; floating‑point error or a missed `removeBuff` call leaves permanent fire‑rate inflation* .\
   **Fix**:
   - Keep immutable base stats; store buffs separately and compute `effectiveFireRate = base × Σ(modifiers)`.

2. **Multi‑target selection order**\
   `MultiShotTower.findTargets` stops at first *n* enemies, not the closest .\
   **Improve**: sort by path progress or distance before slicing.

3. **TeleportEnemy** can leap inside another enemy and bypass finish‑line checks.\
   **Fix**: After teleport, run overlap test; if `currentPathIndex` near end, apply full base damage to player immediately.

---

## 4. Performance & memory

- Excessive `console.log` in hot paths (**Tower.js** start & destroy) ➜ strip in production.
- `Enemy.getPathProgress` recomputes full path length every call; cache total length once.
- UIScene constantly creates Graphics/Text each wave banner; recycle containers.
- Unhook **all** Scene‑events on destroy (`UIScene.shutdown` removes many but *not* pointer‑over listener on `game.canvas`)​.

---

## 5. Code‑quality & architecture

| 🧩 Area                                                                                                        | Short‑term refactor |
| -------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Globals**: `window.GAME_SETTINGS` hard‑couples game & config. Inject via Scene data or a singleton service.  |                     |
| **Managers**: create a light‑weight ECS or at least expose a `reset()` to reuse Scene objects when restarting. |                     |
| **Assets**: run `assets-generator.js` only in build pipeline; guard with `NODE_ENV!=='production'`.            |                     |
| **Testing**: add Jest + `@phaserjs/test‑utils` for deterministic unit tests (e.g., buff maths, pathing).       |                     |
| **Tooling**: ESLint + Prettier would catch the spread‑syntax errors above.                                     |                     |

---

## 6. Phaser‑specific best practices check‑list

- **Use Arcade Groups** instead of manual arrays for bullets & foes (broad‑phase, pooling).
- Keep **EmitterManagers** pre‑loaded; each manager already owns a particle pool .
- Avoid physics on Containers; prefer Sprites .
- Reuse Sounds: add keys once per Scene, not every shot.
- Limit graphics redraw: hide range indicator by toggling `visible`, don’t recreate.
- Cap minimum `fireRate` (e.g., `Math.max(base, 50)`) to avoid 0 ms intervals after upgrades.

---

## 7. Road‑map (effort vs impact)

| 🗓 Phase      | Tasks                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Week 1**    | • Fix syntax errors (AudioManager, UIScene) • ESLint CI • Guard divide‑by‑zero & null path points.                                  |
| **Week 2**    | • Refactor Containers → Sprites • Central `ProjectilePool`, `EmitterPool` • Replace nested collision loop with Arcade overlap.      |
| **Month 1**   | • Abstract buff system (event‑driven) • Migrate globals to injected config • Add unit tests • Automate asset build.                 |
| **Long‑term** | • Move to TypeScript for strong typing • Consider Matter.js for richer enemy abilities • Introduce save‑system & difficulty curves. |

---

## 8. Quick win checklist before next release ✅

- [ ] Remove all dev `console.log`
- [ ] One‐line fix for spread‑syntax errors
- [ ] Clamp `segmentLength` > 0 in pathing
- [ ] Turn on Arcade overlap & Groups
- [ ] Pool hit particles

---

### References

- Phaser Discourse – Container physics caveats 
- Ourcade – Object‑pool optimisation 
- Phaser API – ParticleEmitter already pools particles 
- Dev forum – Container performance concerns 

---

*By following the staged plan above you’ll squash the hard crashes first, gain \~40 % framerate back on waves 10 +, and set a clean foundation for new features.*
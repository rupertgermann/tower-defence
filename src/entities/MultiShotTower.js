import Tower from './Tower.js';

/**
 * MultiShotTower - Attacks multiple targets simultaneously.
 */
export default class MultiShotTower extends Tower {
  constructor(scene, x, y, type, data) {
    super(scene, x, y, type, data);
    this.targetCount = data.targetCount || 3;
  }

  /**
   * Find multiple targets in range.
   * @param {Array} enemies
   * @returns {Array}
   */
  findTargets(enemies) {
    const targets = [];
    for (const enemy of enemies) {
      if (targets.length >= this.targetCount) break;
      if (this.isValidTarget(enemy)) {
        targets.push(enemy);
      }
    }
    return targets;
  }

  /**
   * Fire at multiple targets.
   * @param {number} time
   * @param {Array} targets
   */
  fireAtTargets(time, targets) {
    this.lastFireTime = time;
    for (const target of targets) {
      this.scene.spawnProjectile(this, target, `projectile_${this.type}`, {
        damage: this.data.damage,
        type: this.type,
        speed: this.data.projectileSpeed,
        canHitFlying: this.canTargetFlying(),
      });
    }
    this.playAttackAnimation();
  }

  /**
   * Override update to attack multiple targets.
   */
  update(time, delta, enemies) {
    if (!this.isActive) return;
    const targets = this.findTargets(enemies);
    if (targets.length > 0 && time > this.lastFireTime + this.data.fireRate) {
      this.fireAtTargets(time, targets);
    }
  }
}

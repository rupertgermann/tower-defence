import Enemy from './Enemy.js';
import Phaser from 'phaser';

/**
 * Enemy with a shield that grants temporary invulnerability.
 */
export default class ShieldEnemy extends Enemy {
  constructor(scene, x, y, type, data, path) {
    super(scene, x, y, type, data, path);

    this.shieldDuration = data.shieldDuration || 1500; // ms
    this.shieldCooldown = data.shieldCooldown || 3500; // ms
    this.lastShieldTime = -Infinity;
    this.shieldActive = false;

    // Shield visual
    this.shieldCircle = scene.add.circle(0, 0, 24, 0x3399ff, 0.28);
    this.shieldCircle.setVisible(false);
    this.add(this.shieldCircle);
  }

  update(time, delta) {
    super.update(time, delta);

    if (this.isDying || this.reachedEnd) return;

    // Activate shield if cooldown elapsed
    if (
      !this.shieldActive &&
      time > this.lastShieldTime + this.shieldCooldown
    ) {
      this.activateShield(time);
    }

    // Deactivate shield after duration
    if (this.shieldActive && time > this.lastShieldTime + this.shieldDuration) {
      this.deactivateShield();
    }
  }

  activateShield(time) {
    this.shieldActive = true;
    this.lastShieldTime = time;
    this.shieldCircle.setVisible(true);

    // Optional: visual effect (pulse)
    this.scene.tweens.add({
      targets: this.shieldCircle,
      scale: 1.2,
      yoyo: true,
      duration: 200,
    });
  }

  deactivateShield() {
    this.shieldActive = false;
    this.shieldCircle.setVisible(false);
  }

  takeDamage(amount) {
    if (this.shieldActive) {
      // Optional: flash shield visual
      this.scene.tweens.add({
        targets: this.shieldCircle,
        alpha: 0.6,
        duration: 80,
        yoyo: true,
      });
      return; // Ignore damage
    }
    super.takeDamage(amount);
  }
}

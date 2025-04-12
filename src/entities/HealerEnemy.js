import Enemy from './Enemy.js';
import Phaser from 'phaser';

/**
 * Enemy with a healing aura that heals nearby enemies periodically.
 */
export default class HealerEnemy extends Enemy {
    constructor(scene, x, y, type, data, path) {
        super(scene, x, y, type, data, path);

        this.healRadius = data.healRadius || 100;
        this.healAmount = data.healAmount || 5;
        this.healInterval = data.healInterval || 2000;
        this.lastHealTime = 0;

        // Healing aura visual
        this.healAura = scene.add.circle(0, 0, this.healRadius, 0x00ff00, 0.18);
        this.healAura.setVisible(false);
        this.add(this.healAura);
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isDying || this.reachedEnd) return;

        // Activate healing ability
        if (time > this.lastHealTime + this.healInterval) {
            this.heal(time);
        }
    }

    heal(time) {
        this.lastHealTime = time;

        // Show healing aura
        this.healAura.setVisible(true);
        this.scene.tweens.add({
            targets: this.healAura,
            alpha: 0,
            duration: 700,
            onComplete: () => {
                this.healAura.setAlpha(0.18);
                this.healAura.setVisible(false);
            }
        });

        // Heal nearby enemies
        if (this.scene.enemies) {
            for (const enemy of this.scene.enemies) {
                if (enemy === this || enemy.isDead?.() || enemy.isDying) continue;
                const distance = Phaser.Math.Distance.Between(
                    this.x, this.y,
                    enemy.x, enemy.y
                );
                if (distance <= this.healRadius) {
                    if (typeof enemy.heal === 'function') {
                        enemy.heal(this.healAmount);
                    } else if (typeof enemy.takeDamage === 'function') {
                        // Negative damage = heal
                        enemy.takeDamage(-this.healAmount);
                    }
                }
            }
        }
    }

    /**
     * Heal this enemy by a given amount (used by other healers)
     * @param {number} amount
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }
}

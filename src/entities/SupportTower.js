import Tower from './Tower.js';

/**
 * SupportTower - Buffs nearby towers' fire rate.
 */
export default class SupportTower extends Tower {
    constructor(scene, x, y, type, data) {
        super(scene, x, y, type, data);
        this.buffType = data.buffType || 'fireRate';
        this.buffAmount = data.buffAmount || 0.2;
        this.buffRadius = data.buffRadius || 120;
        this.buffDuration = 1200; // ms, duration of buff effect
        this.lastBuffTime = 0;
        this.activeBuffs = new Set();
        // Hide range indicator by default, show buff radius instead
        this.rangeIndicator.setRadius(this.buffRadius);
    }

    /**
     * Apply buff to nearby towers.
     */
    applyBuff(time) {
        // Only buff every buffDuration
        if (time < this.lastBuffTime + this.buffDuration) return;
        this.lastBuffTime = time;

        // Remove expired buffs
        for (const tower of this.activeBuffs) {
            if (!this.isTowerInBuffRange(tower)) {
                this.removeBuff(tower);
                this.activeBuffs.delete(tower);
            }
        }

        // Buff towers in range
        for (const tower of this.scene.towers) {
            if (tower === this) continue;
            if (this.isTowerInBuffRange(tower)) {
                this.applyBuffToTower(tower);
                this.activeBuffs.add(tower);
            }
        }
    }

    /**
     * Check if a tower is within buff radius.
     */
    isTowerInBuffRange(tower) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, tower.x, tower.y);
        return distance <= this.buffRadius;
    }

    /**
     * Apply the buff to a tower.
     */
    applyBuffToTower(tower) {
        if (!tower._supportBuffs) tower._supportBuffs = {};
        if (!tower._supportBuffs[this]) {
            // Only apply if not already buffed by this support tower
            if (this.buffType === 'fireRate' && tower.data.fireRate > 0) {
                tower.data.fireRate *= (1 - this.buffAmount);
                tower._supportBuffs[this] = true;
            }
        }
    }

    /**
     * Remove the buff from a tower.
     */
    removeBuff(tower) {
        if (tower._supportBuffs && tower._supportBuffs[this]) {
            if (this.buffType === 'fireRate' && tower.data.fireRate > 0) {
                tower.data.fireRate /= (1 - this.buffAmount);
            }
            delete tower._supportBuffs[this];
        }
    }

    /**
     * Override update to apply buffs.
     */
    update(time, delta, enemies) {
        if (!this.isActive) return;
        this.applyBuff(time);
    }
}

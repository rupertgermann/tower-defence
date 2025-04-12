import Enemy from './Enemy.js';
import Phaser from 'phaser';

/**
 * Enemy that splits into smaller enemies when killed.
 */
export default class SplitEnemy extends Enemy {
    constructor(scene, x, y, type, data, path) {
        super(scene, x, y, type, data, path);

        this.splitCount = data.splitCount || 2;
        this.splitType = data.splitType || 'basic'; // Type of enemy to spawn
        this.splitData = data.splitData || {}; // Data for spawned enemies
        this.splitOffset = 18; // Offset for spawn positions
    }

    die() {
        if (this.isDying) return;
        // Spawn smaller enemies at this position
        if (this.scene && typeof this.scene.spawnEnemy === 'function') {
            for (let i = 0; i < this.splitCount; i++) {
                // Offset spawn positions in a circle
                const angle = (2 * Math.PI * i) / this.splitCount;
                const dx = Math.cos(angle) * this.splitOffset;
                const dy = Math.sin(angle) * this.splitOffset;
                this.scene.spawnEnemy(
                    this.splitType,
                    this.x + dx,
                    this.y + dy,
                    this.splitData,
                    this.path,
                    this.currentPathIndex,
                    this.t
                );
            }
        }
        super.die();
    }
}

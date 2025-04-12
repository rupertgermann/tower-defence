import Enemy from './Enemy.js';
import Phaser from 'phaser';

/**
 * Enemy that can teleport forward along the path.
 */
export default class TeleportEnemy extends Enemy {
    constructor(scene, x, y, type, data, path) {
        super(scene, x, y, type, data, path);

        this.teleportInterval = data.teleportInterval || 2500; // ms
        this.teleportDistance = data.teleportDistance || 2; // segments to skip
        this.lastTeleportTime = 0;

        // Teleport visual (flash)
        this.teleportFlash = scene.add.circle(0, 0, 28, 0xffffff, 0.22);
        this.teleportFlash.setVisible(false);
        this.add(this.teleportFlash);
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isDying || this.reachedEnd) return;

        if (time > this.lastTeleportTime + this.teleportInterval) {
            this.teleport();
            this.lastTeleportTime = time;
        }
    }

    teleport() {
        // Show flash effect
        this.teleportFlash.setVisible(true);
        this.scene.tweens.add({
            targets: this.teleportFlash,
            alpha: 0.7,
            duration: 80,
            yoyo: true,
            onComplete: () => {
                this.teleportFlash.setAlpha(0.22);
                this.teleportFlash.setVisible(false);
            }
        });

        // Advance along the path
        let newIndex = this.currentPathIndex + this.teleportDistance;
        if (newIndex >= this.path.length - 1) {
            newIndex = this.path.length - 2;
        }
        this.currentPathIndex = newIndex;
        this.t = 0; // Start at beginning of new segment

        // Instantly update position
        const currentPoint = this.path[this.currentPathIndex];
        const nextPoint = this.path[this.currentPathIndex + 1];
        this.x = Phaser.Math.Linear(currentPoint.x, nextPoint.x, this.t);
        this.y = Phaser.Math.Linear(currentPoint.y, nextPoint.y, this.t);
    }
}

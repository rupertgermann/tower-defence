import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Container {
    /**
     * Override the destroy method to handle the data property correctly
     * @param {boolean} fromScene - Whether this Game Object is being destroyed by the Scene
     */
    destroy(fromScene) {
        // Store a reference to the data
        const dataRef = this.data;
        
        // Set data to null to prevent Phaser from trying to destroy it
        this.data = null;
        
        // Call parent destroy method
        super.destroy(fromScene);
    }
    
    constructor(scene, x, y, type, data, path) {
        super(scene, x, y);
        
        // Add to scene
        scene.add.existing(this);
        
        // Get difficulty multipliers
        this.difficultyMultipliers = this.getDifficultyMultipliers(scene);
        
        // Store enemy data
        this.type = type;
        this.data = { ...data }; // Clone data to avoid modifying original
        this.path = path;
        
        // Apply difficulty multipliers to enemy stats
        this.applyDifficultyMultipliers();
        
        // Enemy state
        this.health = this.data.health;
        this.maxHealth = this.data.health;
        this.currentPathIndex = 0;
        this.t = 0; // Position along current path segment (0-1)
        this.reachedEnd = false;
        this.isDying = false;
        this.slowEffects = []; // Array of active slow effects
        
        // Create enemy sprite
        this.sprite = scene.add.image(0, 0, `enemy_${type}`);
        this.add(this.sprite);
        
        // Create health bar
        this.createHealthBar();
        
        // Set up physics body
        scene.physics.world.enable(this);
        this.body.setCircle(16); // Adjust size as needed
    }

    /**
     * Get difficulty multipliers from the scene registry
     * @param {Phaser.Scene} scene - The scene
     * @returns {Object} Difficulty multipliers
     */
    getDifficultyMultipliers(scene) {
        // Get selected difficulty from registry (default to EASY if not set)
        const difficultyKey = scene.registry.get('selectedDifficulty') || 'EASY';
        return window.GAME_SETTINGS.DIFFICULTY[difficultyKey];
    }
    
    /**
     * Apply difficulty multipliers to enemy stats
     */
    applyDifficultyMultipliers() {
        // Apply health multiplier
        this.data.health = Math.round(this.data.health * this.difficultyMultipliers.enemyHealthMultiplier);
        
        // Apply speed multiplier
        this.data.speed = Math.round(this.data.speed * this.difficultyMultipliers.enemySpeedMultiplier);
        
        // Apply reward multiplier
        this.data.reward = Math.round(this.data.reward * this.difficultyMultipliers.enemyRewardMultiplier);
    }

    /**
     * Create a health bar for the enemy
     */
    createHealthBar() {
        // Health bar background
        this.healthBarBg = this.scene.add.rectangle(0, -20, 32, 5, 0x000000);
        this.healthBarBg.setOrigin(0.5, 0.5);
        this.add(this.healthBarBg);
        
        // Health bar fill
        this.healthBar = this.scene.add.rectangle(0, -20, 32, 5, 0x00ff00);
        this.healthBar.setOrigin(0.5, 0.5);
        this.add(this.healthBar);
    }

    /**
     * Update method called each frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        if (this.isDying || this.reachedEnd) return;
        
        // Update slow effects
        this.updateSlowEffects(time);
        
        // Move along path
        this.moveAlongPath(delta);
        
        // Update health bar
        this.updateHealthBar();
    }

    /**
     * Move the enemy along the path
     * @param {number} delta - Time since last update
     */
    moveAlongPath(delta) {
        // Calculate speed (accounting for slow effects)
        let speed = this.data.speed;
        
        // Apply slow effects
        for (const slowEffect of this.slowEffects) {
            speed *= slowEffect.factor;
        }
        
        // Convert speed from pixels per second to pixels per frame
        const pixelsToMove = (speed * delta) / 1000;
        
        // Calculate path segment length
        const currentPoint = this.path[this.currentPathIndex];
        const nextPoint = this.path[this.currentPathIndex + 1];
        
        if (!nextPoint) {
            // Reached the end of the path
            this.reachedEnd = true;
            return;
        }
        
        const segmentLength = Phaser.Math.Distance.Between(
            currentPoint.x, currentPoint.y,
            nextPoint.x, nextPoint.y
        );
        
        // Calculate how far along the segment to move
        const distanceToMove = pixelsToMove / segmentLength;
        this.t += distanceToMove;
        
        // Check if we've reached the next point
        if (this.t >= 1) {
            // Move to next path segment
            this.currentPathIndex++;
            this.t = this.t - 1; // Carry over any remaining movement
            
            // Check if we've reached the end of the path
            if (this.currentPathIndex >= this.path.length - 1) {
                this.reachedEnd = true;
                return;
            }
        }
        
        // Update position
        const currentPoint2 = this.path[this.currentPathIndex];
        const nextPoint2 = this.path[this.currentPathIndex + 1];
        
        this.x = Phaser.Math.Linear(currentPoint2.x, nextPoint2.x, this.t);
        this.y = Phaser.Math.Linear(currentPoint2.y, nextPoint2.y, this.t);
        
        // Update rotation to face movement direction
        const angle = Phaser.Math.Angle.Between(
            currentPoint2.x, currentPoint2.y,
            nextPoint2.x, nextPoint2.y
        );
        this.rotation = angle;
    }

    /**
     * Update the health bar to reflect current health
     */
    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 32 * healthPercent;
        
        // Update color based on health percentage
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // Yellow
        } else {
            this.healthBar.fillColor = 0xff0000; // Red
        }
    }

    /**
     * Apply damage to the enemy
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        // Reduce health
        this.health -= amount;

        // Particle effect: hit spark at enemy position
        if (!this.hitEmitter) {
            this.hitEmitter = this.scene.add.particles(0, 0, 'explosion', {
                lifespan: 180,
                speed: { min: 40, max: 90 },
                scale: { start: 0.13, end: 0 },
                quantity: 6,
                angle: { min: 0, max: 360 },
                tint: [0xffff00, 0xff8800, 0xffffff],
                blendMode: 'ADD'
            });
            this.add(this.hitEmitter);
        }
        this.hitEmitter.explode(6, 0, 0);

        // Check if dead
        if (this.health <= 0) {
            this.die();
        } else {
            // Visual feedback for taking damage
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true
            });
        }
    }

    /**
     * Kill the enemy
     */
    die() {
        if (this.isDying) return;
        
        this.isDying = true;
        
        // Store a reference to the scene and economyManager
        const scene = this.scene;
        const economyManager = this.scene.economyManager;

        // Enhanced visual effect: particle explosion on death
        if (scene.add && scene.textures.exists('explosion')) {
            const explosion = scene.add.particles(this.x, this.y, 'explosion', {
                lifespan: 800,
                speed: { min: 50, max: 120 },
                scale: { start: 0.5, end: 0 },
                quantity: 18,
                blendMode: 'ADD'
            });
            // Remove particles after effect
            scene.time.delayedCall(900, () => {
                if (explosion) explosion.destroy();
            });
        }
        
        // Play death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => {
                // Add kill to economy manager
                economyManager.addEnemyKill();
                
                // Destroy the enemy
                this.destroy();
            }
        });
    }

    /**
     * Apply a slowing effect to the enemy
     * @param {number} factor - Slow factor (0-1, lower is slower)
     * @param {number} duration - Duration of slow effect in ms
     */
    applySlowEffect(factor, duration) {
        // Create new slow effect
        const slowEffect = {
            factor: factor,
            endTime: this.scene.time.now + duration
        };
        
        // Add to active effects
        this.slowEffects.push(slowEffect);
        
        // Visual feedback
        this.sprite.setTint(0x00ffff);
    }

    /**
     * Update and remove expired slow effects
     * @param {number} time - Current time
     */
    updateSlowEffects(time) {
        // Remove expired slow effects
        this.slowEffects = this.slowEffects.filter(effect => effect.endTime > time);
        
        // Reset tint if no slow effects are active
        if (this.slowEffects.length === 0) {
            this.sprite.clearTint();
        }
    }

    /**
     * Check if the enemy has reached the end of the path
     * @returns {boolean} True if enemy has reached the end
     */
    hasReachedEnd() {
        return this.reachedEnd;
    }

    /**
     * Check if the enemy is dead
     * @returns {boolean} True if enemy is dead
     */
    isDead() {
        return this.health <= 0;
    }

    /**
     * Get the current position along the path (0-1)
     * @returns {number} Position along path
     */
    getPathProgress() {
        // Calculate total path length
        let totalLength = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            totalLength += Phaser.Math.Distance.Between(
                this.path[i].x, this.path[i].y,
                this.path[i + 1].x, this.path[i + 1].y
            );
        }
        
        // Calculate current progress
        let currentProgress = 0;
        
        // Add completed segments
        for (let i = 0; i < this.currentPathIndex; i++) {
            currentProgress += Phaser.Math.Distance.Between(
                this.path[i].x, this.path[i].y,
                this.path[i + 1].x, this.path[i + 1].y
            );
        }
        
        // Add current segment progress
        const currentSegmentLength = Phaser.Math.Distance.Between(
            this.path[this.currentPathIndex].x, this.path[this.currentPathIndex].y,
            this.path[this.currentPathIndex + 1].x, this.path[this.currentPathIndex + 1].y
        );
        currentProgress += currentSegmentLength * this.t;
        
        return currentProgress / totalLength;
    }
}

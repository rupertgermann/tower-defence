import Phaser from 'phaser';

export default class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type, data) {
        super(scene, x, y);
        
        // Add to scene
        scene.add.existing(this);
        
        // Store tower data
        this.type = type;
        this.data = data;
        
        // Tower state
        this.level = 1;
        this.target = null;
        this.lastFireTime = 0;
        this.isActive = true;
        
        // Create tower sprite
        this.sprite = scene.add.image(0, 0, `tower_${type}`);
        this.add(this.sprite);
        
        // Create range indicator (invisible by default)
        this.rangeIndicator = scene.add.circle(0, 0, this.data.range, 0xffffff, 0.2);
        this.rangeIndicator.setVisible(false);
        this.add(this.rangeIndicator);
        
        // Set up input handling
        this.sprite.setInteractive();
        this.setupInteractive();
    }

    /**
     * Set up interactive events for the tower
     */
    setupInteractive() {
        this.sprite.on('pointerover', () => {
            this.showRange();
        });
        
        this.sprite.on('pointerout', () => {
            this.hideRange();
        });
        
        this.sprite.on('pointerdown', () => {
            // Show tower info or upgrade options
            this.scene.events.emit('showTowerInfo', this);
        });
    }

    /**
     * Update method called each frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     * @param {Array} enemies - Array of enemy objects
     */
    update(time, delta, enemies) {
        if (!this.isActive) return;
        
        // Find target if we don't have one or if current target is dead/out of range
        if (!this.target || !this.isValidTarget(this.target)) {
            this.findTarget(enemies);
        }
        
        // Attack if we have a target and cooldown has elapsed
        if (this.target && time > this.lastFireTime + this.data.fireRate) {
            this.fireAtTarget(time);
        }
    }

    /**
     * Check if a target is valid (alive and in range)
     * @param {Enemy} target - Target to check
     * @returns {boolean} True if target is valid
     */
    isValidTarget(target) {
        // Check if target exists and is alive
        if (!target || target.isDead()) {
            return false;
        }
        
        // Check if target is in range
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            target.x, target.y
        );
        
        return distance <= this.data.range;
    }

    /**
     * Find a new target from the enemies array
     * @param {Array} enemies - Array of enemy objects
     */
    findTarget(enemies) {
        // Reset current target
        this.target = null;
        
        // Find closest enemy in range
        let closestDistance = Infinity;
        
        for (const enemy of enemies) {
            // Skip dead enemies
            if (enemy.isDead()) continue;
            
            // Skip flying enemies if tower can't target them
            if (enemy.data.flying && !this.canTargetFlying()) {
                continue;
            }
            
            // Calculate distance
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                enemy.x, enemy.y
            );
            
            // Check if in range and closer than current closest
            if (distance <= this.data.range && distance < closestDistance) {
                this.target = enemy;
                closestDistance = distance;
            }
        }
    }

    /**
     * Fire at the current target
     * @param {number} time - Current time
     */
    fireAtTarget(time) {
        // Update last fire time
        this.lastFireTime = time;
        
        // Create projectile
        const projectileData = {
            damage: this.data.damage,
            type: this.type,
            speed: this.data.projectileSpeed,
            canHitFlying: this.canTargetFlying()
        };
        
        // Add special properties based on tower type
        if (this.type === 'aoe') {
            projectileData.aoeRadius = this.data.aoeRadius;
        } else if (this.type === 'slow') {
            projectileData.slowFactor = this.data.slowFactor;
            projectileData.slowDuration = this.data.slowDuration;
        }
        
        // Spawn projectile
        this.scene.spawnProjectile(this, this.target, `projectile_${this.type}`, projectileData);
        
        // Visual feedback
        this.playAttackAnimation();
    }

    /**
     * Play attack animation
     */
    playAttackAnimation() {
        // Scale up and back down quickly
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    /**
     * Show the tower's range indicator
     */
    showRange() {
        this.rangeIndicator.setVisible(true);
    }

    /**
     * Hide the tower's range indicator
     */
    hideRange() {
        this.rangeIndicator.setVisible(false);
    }

    /**
     * Check if this tower can target flying enemies
     * @returns {boolean} True if tower can target flying enemies
     */
    canTargetFlying() {
        // Basic towers can't hit flying enemies
        // AOE and slow towers can
        return this.type !== 'basic';
    }

    /**
     * Upgrade the tower to the next level
     * @returns {boolean} True if upgrade was successful
     */
    upgrade() {
        // For MVP, we'll keep upgrades simple
        if (this.level >= 3) {
            return false; // Max level reached
        }
        
        // Calculate upgrade cost (50% of base cost per level)
        const upgradeCost = Math.floor(this.data.cost * 0.5);
        
        // Check if player has enough money
        if (this.scene.economyManager.getMoney() >= upgradeCost) {
            // Deduct cost
            this.scene.economyManager.spendMoney(upgradeCost);
            
            // Increase level
            this.level++;
            
            // Improve stats
            this.data.damage *= 1.5;
            this.data.range *= 1.2;
            this.data.fireRate *= 0.8;
            
            // Update range indicator
            this.rangeIndicator.setRadius(this.data.range);
            
            // Visual feedback
            this.sprite.setTint(this.getUpgradeTint());
            
            return true;
        }
        
        return false;
    }

    /**
     * Get the tint color based on tower level
     * @returns {number} Color value
     */
    getUpgradeTint() {
        switch (this.level) {
            case 1:
                return 0xffffff; // No tint
            case 2:
                return 0xffff00; // Yellow tint
            case 3:
                return 0xff0000; // Red tint
            default:
                return 0xffffff;
        }
    }

    /**
     * Sell the tower
     * @returns {number} Amount of money refunded
     */
    sell() {
        // Calculate refund amount (60% of total investment)
        const baseCost = this.data.cost;
        const upgradeCost = Math.floor(baseCost * 0.5) * (this.level - 1);
        const totalInvestment = baseCost + upgradeCost;
        const refundAmount = Math.floor(totalInvestment * 0.6);
        
        // Add money to player
        this.scene.economyManager.addMoney(refundAmount);
        
        // Remove tower
        this.destroy();
        
        return refundAmount;
    }
}

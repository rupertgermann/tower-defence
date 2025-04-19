import Phaser from 'phaser';

export default class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type, data) {
    super(scene, x, y);

    // Add to scene
    scene.add.existing(this);
    this.setDepth(20);

    // Store tower data
    this.type = type;
    this.towerData = data;

    // Log the type and value of this.towerData for debugging
    console.log('[Tower] Constructed. this.towerData:', this.towerData, 'typeof:', typeof this.towerData);

    // Tower state
    this.level = 1;
    this.target = null;
    this.lastFireTime = 0;
    this.isActive = true;

    // Create tower sprite using level-specific asset
    this.sprite = scene.add.image(0, 0, `tower_${type.toLowerCase()}_${this.level}`);
    this.add(this.sprite);

    // Create range indicator (invisible by default)
    this.rangeIndicator = scene.add.circle(
      0,
      0,
      this.towerData.range,
      0xffffff,
      0.2
    );
    this.rangeIndicator.setVisible(false);
    this.add(this.rangeIndicator);

    // Set up input handling
    this.sprite.setInteractive();
    this.setupInteractive();
  }

  /**
   * Clean up all child objects and emitters when destroying the tower
   */
  destroy(fromScene) {
    // Log the type and value of this.towerData for debugging
    console.log('[Tower.destroy] this.towerData:', this.towerData, 'typeof:', typeof this.towerData);
    if (this.sprite && this.sprite.destroy) this.sprite.destroy();
    if (this.rangeIndicator && this.rangeIndicator.destroy)
      this.rangeIndicator.destroy();
    if (this.attackEmitter && this.attackEmitter.destroy)
      this.attackEmitter.destroy();
    if (this.upgradeEffect && this.upgradeEffect.destroy)
      this.upgradeEffect.destroy();
    super.destroy(fromScene);
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
      // Show tower info via Phaser EventEmitter
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
    if (this.target && time > this.lastFireTime + this.towerData.fireRate) {
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
      this.x,
      this.y,
      target.x,
      target.y
    );

    return distance <= this.towerData.range;
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
        this.x,
        this.y,
        enemy.x,
        enemy.y
      );

      // Check if in range and closer than current closest
      if (distance <= this.towerData.range && distance < closestDistance) {
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
      damage: this.towerData.damage,
      type: this.type,
      speed: this.towerData.projectileSpeed,
      canHitFlying: this.canTargetFlying(),
    };

    // Add special properties based on tower type
    if (this.type === 'aoe') {
      projectileData.aoeRadius = this.towerData.aoeRadius;
    } else if (this.type === 'slow') {
      projectileData.slowFactor = this.towerData.slowFactor;
      projectileData.slowDuration = this.towerData.slowDuration;
    }

    // Spawn projectile
    this.scene.spawnProjectile(
      this,
      this.target,
      `projectile_${this.type}`,
      projectileData
    );

    // Visual feedback
    this.playAttackAnimation();
  }

  /**
   * Play attack animation and particle effect
   */
  playAttackAnimation() {
    // Scale up and back down quickly
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    });

    // Particle effect: muzzle flash/spark at tower center
    if (!this.attackEmitter) {
      this.attackEmitter = this.scene.add.particles(0, 0, 'explosion', {
        lifespan: 250,
        speed: { min: 60, max: 120 },
        scale: { start: 0.18, end: 0 },
        quantity: 8,
        angle: { min: 0, max: 360 },
        blendMode: 'ADD',
      });
      this.add(this.attackEmitter);
    }
    this.attackEmitter.explode(8, 0, 0);
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
   * Calculate the upgrade cost for the next level
   * @returns {number} Upgrade cost
   */
  calculateUpgradeCost() {
    // Allow per-tower scaling, fallback to default
    const baseCost = this.towerData.cost;
    const upgradeScaling = this.towerData.upgradeCostScaling || 0.6; // default 60% of base per level
    return Math.floor(baseCost * upgradeScaling * this.level);
  }

  /**
   * Apply stat improvements for an upgrade
   */
  applyUpgradeEffects() {
    // Allow per-tower scaling, fallback to defaults
    const damageScale = this.towerData.upgradeDamageScale || 1.4;
    const rangeScale = this.towerData.upgradeRangeScale || 1.15;
    const fireRateScale = this.towerData.upgradeFireRateScale || 0.85;

    this.towerData.damage = Math.round(this.towerData.damage * damageScale);
    this.towerData.range = Math.round(this.towerData.range * rangeScale);
    this.towerData.fireRate = Math.round(this.towerData.fireRate * fireRateScale);

    // Update range indicator
    this.rangeIndicator.setRadius(this.towerData.range);
  }

  /**
   * Update the tower's appearance based on level
   */
  updateAppearance() {
    // Update texture for current level
    this.sprite.setTexture(`tower_${this.type.toLowerCase()}_${this.level}`);

    // Optionally, add a visual effect for upgrades
    if (!this.upgradeEffect) {
      this.upgradeEffect = this.scene.add.particles(0, 0, 'explosion', {
        lifespan: 400,
        speed: { min: 20, max: 60 },
        scale: { start: 0.2, end: 0 },
        quantity: 6,
        blendMode: 'ADD',
      });
      this.add(this.upgradeEffect);
    }
    this.upgradeEffect.explode(6, 0, 0);
  }

  /**
   * Upgrade the tower to the next level
   * @returns {boolean} True if upgrade was successful
   */
  upgrade() {
    // Use maxLevel from data or default to 3
    this.maxLevel = this.towerData.maxLevel || 3;
    if (this.level >= this.maxLevel) {
      return false; // Max level reached
    }

    const upgradeCost = this.calculateUpgradeCost();

    // Check if player has enough money
    if (this.scene.economyManager.getMoney() >= upgradeCost) {
      // Deduct cost
      this.scene.economyManager.spendMoney(upgradeCost);

      // Increase level
      this.level++;

      // Improve stats
      this.applyUpgradeEffects();

      // Update visuals
      this.updateAppearance();

      return true;
    }

    return false;
  }

  /**
   * Sell the tower
   * @returns {number} Amount of money refunded
   */
  sell() {
    // Calculate refund amount (60% of total investment)
    const baseCost = this.towerData.cost;
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

import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Image {
    constructor(scene, x, y, type, data, target) {
        super(scene, x, y, type);
        
        // Add to scene
        scene.add.existing(this);
        
        // Store projectile data
        this.type = type;
        this.projectileData = data; // Renamed from 'data' to avoid conflict with Phaser
        this.target = target;
        
        // Set up physics body
        scene.physics.world.enable(this);
        
        // Set projectile properties
        this.setScale(0.5);
        
        // Calculate angle to target
        this.updateAngle();
    }
    
    /**
     * Override the destroy method to properly handle cleanup
     * @param {boolean} fromScene - Whether this Game Object is being destroyed by the Scene
     */
    destroy(fromScene) {
        // Clean up our custom properties before calling parent destroy
        this.target = null;
        
        // Call parent destroy method
        super.destroy(fromScene);
    }

    /**
     * Update method called each frame
     * @param {number} time - Current time
     * @param {number} delta - Time since last update
     */
    update(time, delta) {
        // Check if target is valid
        if (!this.target || !this.target.active) {
            // Target is gone, continue in same direction
            this.moveForward(delta);
            return;
        }
        
        // Update angle to target
        this.updateAngle();
        
        // Move toward target
        this.moveToTarget(delta);
    }

    /**
     * Update the projectile's angle to face the target
     */
    updateAngle() {
        if (!this.target || !this.target.active) return;
        
        // Calculate angle to target
        const angle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        // Set rotation
        this.rotation = angle;
        
        // Store angle for movement
        this.moveAngle = angle;
    }

    /**
     * Move the projectile toward the target
     * @param {number} delta - Time since last update
     */
    moveToTarget(delta) {
        // Calculate speed in pixels per frame
        const speed = (this.projectileData.speed * delta) / 1000;
        
        // Calculate velocity components
        const vx = Math.cos(this.moveAngle) * speed;
        const vy = Math.sin(this.moveAngle) * speed;
        
        // Update position
        this.x += vx;
        this.y += vy;
    }

    /**
     * Move the projectile forward in its current direction
     * @param {number} delta - Time since last update
     */
    moveForward(delta) {
        // Calculate speed in pixels per frame
        const speed = (this.projectileData.speed * delta) / 1000;
        
        // Calculate velocity components
        const vx = Math.cos(this.moveAngle) * speed;
        const vy = Math.sin(this.moveAngle) * speed;
        
        // Update position
        this.x += vx;
        this.y += vy;
    }

    /**
     * Check if the projectile is out of bounds
     * @returns {boolean} True if projectile is out of bounds
     */
    isOutOfBounds() {
        const margin = 50; // Extra margin beyond screen bounds
        return (
            this.x < -margin ||
            this.x > this.scene.game.config.width + margin ||
            this.y < -margin ||
            this.y > this.scene.game.config.height + margin
        );
    }

    /**
     * Get the projectile's bounds for collision detection
     * @returns {Phaser.Geom.Rectangle} Bounds rectangle
     */
    getBounds() {
        return new Phaser.Geom.Rectangle(
            this.x - this.displayWidth / 2,
            this.y - this.displayHeight / 2,
            this.displayWidth,
            this.displayHeight
        );
    }
}

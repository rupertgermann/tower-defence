export default class CollisionManager {
  constructor(scene) {
    this.scene = scene;
  }

  checkCollisions() {
    // Use manager accessors to get arrays
    const projectiles = this.scene.projectileManager.getAll();
    const enemies = this.scene.enemyManager.getAll();
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];
        if (enemy.data.flying && !projectile.projectileData.canHitFlying) continue;
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            projectile.getBounds(),
            enemy.getBounds()
          )
        ) {
          // Handle projectile hit logic here
          // 1. Spawn hit effect
          if (this.scene.effectSpawner) {
            this.scene.effectSpawner.createHitEffect(enemy.x, enemy.y);
          }
          // 2. Damage enemy
          if (typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(projectile.projectileData.damage);
          }
          // 3. Play sound
          if (this.scene.audioManager) {
            this.scene.audioManager.playSound('attack');
          }
          // 4. Award money/score if enemy is killed
          if (enemy.isDead && enemy.isDead()) {
            if (this.scene.economyManager) {
              this.scene.economyManager.enemiesKilled++;
              this.scene.economyManager.money += enemy.data.reward || 0;
              this.scene.economyManager.updateScore && this.scene.economyManager.updateScore();
              // Emit UI update event for money and score
              this.scene.events.emit('updateUI', {
                money: this.scene.economyManager.money,
                score: this.scene.economyManager.score,
                lives: this.scene.economyManager.lives
              });
            }
            // Remove enemy from group
            this.scene.enemyManager.removeEnemy(enemy);
            if (this.scene.effectSpawner) {
              this.scene.effectSpawner.createExplosionEffect(enemy.x, enemy.y, 32);
            }
            if (this.scene.audioManager) {
              this.scene.audioManager.playSound('enemy_death');
            }
          }
          // Remove projectile
          projectile.destroy();
          this.scene.projectileManager.removeProjectile(projectile);
          break;
        }
      }
    }
  }
}

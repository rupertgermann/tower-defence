export default class CollisionManager {
  constructor(scene) {
    this.scene = scene;
  }

  checkCollisions() {
    const { projectiles, enemies } = this.scene;
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
          this.scene.handleProjectileHit(projectile, enemy);
          projectile.destroy();
          projectiles.splice(i, 1);
          break;
        }
      }
    }
  }
}

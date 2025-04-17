export default class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
  }

  update(time, delta) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(time, delta);
      if (projectile.isOutOfBounds()) {
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }

  removeProjectile(projectile) {
    const idx = this.projectiles.indexOf(projectile);
    if (idx !== -1) this.projectiles.splice(idx, 1);
  }

  getAll() {
    return this.projectiles;
  }

  clear() {
    this.projectiles = [];
  }
}

export default class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectileGroup = this.scene.add.group();
  }

  update(time, delta) {
    this.projectileGroup.getChildren().forEach(projectile => {
      projectile.update(time, delta);
      if (projectile.isOutOfBounds()) {
        projectile.destroy();
        this.projectileGroup.remove(projectile, true, true);
      }
    });
  }

  addProjectile(projectile) {
    this.projectileGroup.add(projectile);
  }

  removeProjectile(projectile) {
    this.projectileGroup.remove(projectile, true, true);
  }

  getAll() {
    return this.projectileGroup.getChildren();
  }

  clear() {
    this.projectileGroup.clear(true, true);
  }
}

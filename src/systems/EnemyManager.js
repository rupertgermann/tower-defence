export default class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
  }

  update(time, delta) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(time, delta);
      if (enemy.hasReachedEnd()) {
        this.scene.economyManager.takeDamage(enemy.data.damage);
        enemy.destroy();
        this.enemies.splice(i, 1);
        this.scene.events.emit('updateUI', {
          lives: this.scene.economyManager.getLives(),
        });
        if (this.scene.economyManager.getLives() <= 0) {
          this.scene.gameOver(false);
        }
      }
    }
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  removeEnemy(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);
  }

  getAll() {
    return this.enemies;
  }

  clear() {
    this.enemies = [];
  }
}

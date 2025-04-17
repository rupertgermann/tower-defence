export default class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.enemyGroup = this.scene.add.group();
  }

  update(time, delta) {
    this.enemyGroup.getChildren().forEach(enemy => {
      enemy.update(time, delta);
      if (enemy.hasReachedEnd()) {
        this.scene.economyManager.takeDamage(enemy.data.damage);
        enemy.destroy();
        this.enemyGroup.remove(enemy, true, true);
        this.scene.events.emit('updateUI', {
          lives: this.scene.economyManager.getLives(),
        });
        if (this.scene.economyManager.getLives() <= 0) {
          this.scene.gameOver(false);
        }
      }
    });
  }

  addEnemy(enemy) {
    this.enemyGroup.add(enemy);
  }

  removeEnemy(enemy) {
    this.enemyGroup.remove(enemy, true, true);
  }

  getAll() {
    return this.enemyGroup.getChildren();
  }

  clear() {
    this.enemyGroup.clear(true, true);
  }
}

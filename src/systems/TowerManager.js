export default class TowerManager {
  constructor(scene) {
    this.scene = scene;
    this.towerGroup = this.scene.add.group();
  }

  update(time, delta, enemies) {
    this.towerGroup.getChildren().forEach(tower => {
      tower.update(time, delta, enemies);
    });
  }

  addTower(tower) {
    this.towerGroup.add(tower);
  }

  removeTower(tower) {
    this.towerGroup.remove(tower, true, true);
  }

  getAll() {
    return this.towerGroup.getChildren();
  }

  clear() {
    this.towerGroup.clear(true, true);
  }
}

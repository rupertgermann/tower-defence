export default class TowerManager {
  constructor(scene) {
    this.scene = scene;
    this.towers = [];
  }

  update(time, delta, enemies) {
    for (const tower of this.towers) {
      tower.update(time, delta, enemies);
    }
  }

  addTower(tower) {
    this.towers.push(tower);
  }

  removeTower(tower) {
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) this.towers.splice(idx, 1);
  }

  getAll() {
    return this.towers;
  }

  clear() {
    this.towers = [];
  }
}

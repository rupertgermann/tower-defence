export default class EffectSpawner {
  constructor(scene) {
    this.scene = scene;
  }

  createHitEffect(x, y, type = 'basic') {
    let tint = 0xffffff;
    if (type === 'aoe') {
      tint = 0xff6600;
    } else if (type === 'slow') {
      tint = 0x00ffff;
    } else {
      tint = 0xffff00;
    }
    const emitter = this.scene.add.particles(0, 0, 'explosion', {
      tint,
      lifespan: 350,
      speed: { min: 80, max: 160 },
      scale: { start: 0.4, end: 0 },
      quantity: 10,
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      blendMode: 'ADD',
    });
    emitter.explode(10, x, y);
    this.scene.time.delayedCall(350, () => {
      emitter.destroy();
    });
  }

  createExplosionEffect(x, y, radius) {
    const emitter = this.scene.add.particles(0, 0, 'explosion', {
      lifespan: 500,
      speed: { min: 100, max: 220 },
      scale: { start: radius / 120, end: 0 },
      quantity: 20,
      alpha: { start: 0.9, end: 0 },
      angle: { min: 0, max: 360 },
      blendMode: 'ADD',
    });
    emitter.explode(20, x, y);
    this.scene.time.delayedCall(550, () => {
      emitter.destroy();
    });
  }
}

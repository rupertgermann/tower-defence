// Phaser Sound & Scene Lifecycle Best Practices Refactor
import Phaser from 'phaser';

export default class AudioManager {
  /**
   * @param {Phaser.Scene} scene - The scene to attach audio to
   */
  constructor(scene) {
    this.scene = scene;
    this.sfx = {};
    this.music = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    this.loadSounds();
  }

  /**
   * Load and store sound references (scene-scoped)
   * Always creates new sound objects for the current scene
   */
  loadSounds() {
    // SFX (scene-scoped)
    const sfxKeys = [
      'attack',
      'enemy_death',
      'upgrade',
      'wave_start',
      'wave_end',
      'ui_click',
    ];
    for (const key of sfxKeys) {
      this.sfx[key] = this.scene.sound.add(key, { volume: this.volume });
    }
    // Background music (scene-scoped by default)
    this.music = this.scene.sound.add('bgm', {
      volume: this.musicVolume,
      loop: true
      // To make global: add { global: true }
    });
  }

  /**
   * Play a sound effect by key
   * @param {string} key - Sound key
   * @param {object} config - Optional config overrides
   */
  playSound(key, config = {}) {
    if (this.muted || !this.sfx[key]) return;
    this.sfx[key].play({ volume: this.volume, ...config });
  }

  /**
   * Play background music (scene-scoped by default)
   */
  playMusic() {
    if (this.music) {
      this.music.play({ volume: this.musicVolume, loop: true });
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }

  muteAll() {
    this.muted = true;
    if (this.music) this.music.setMute(true);
    for (const key in this.sfx) {
      if (this.sfx[key]) this.sfx[key].setMute(true);
    }
  }

  unmuteAll() {
    this.muted = false;
    if (this.music) this.music.setMute(false);
    for (const key in this.sfx) {
      if (this.sfx[key]) this.sfx[key].setMute(false);
    }
  }

  /**
   * Play global background music (singleton, global)
   */
  static playGlobalMusic(scene, key = 'bgm', volume = 0.3) {
    let bgm = scene.sound.get(key);
    if (!bgm) {
      bgm = scene.sound.add(key, { global: true, loop: true, volume });
    }
    if (!bgm.isPlaying) {
      bgm.play();
    }
    return bgm;
  }

  /**
   * Stop global background music
   */
  static stopGlobalMusic(scene, key = 'bgm') {
    const bgm = scene.sound.get(key);
    if (bgm && bgm.isPlaying) {
      bgm.stop();
    }
  }
}

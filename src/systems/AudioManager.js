import Phaser from 'phaser';

export default class AudioManager {
  /**
   * @param {Phaser.Scene} scene - The scene to attach audio to
   */
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;

    this.loadSounds();
  }

  /**
   * Load and store sound references
   */
  loadSounds() {
    const soundKeys = [
      'attack',
      'enemy_death',
      'upgrade',
      'wave_start',
      'wave_end',
      'ui_click',
    ];
    for (const key of soundKeys) {
      if (this.scene.sound && !this.scene.sound.get(key)) {
        this.sounds[key] = this.scene.sound.add(key, { volume: this.volume });
      }
    }
    // Background music
    if (this.scene.sound && !this.scene.sound.get('bgm')) {
      this.sounds['bgm'] = this.scene.sound.add('bgm', {
        volume: this.musicVolume,
        loop: true,
      });
    }
  }

  /**
   * Play a sound effect by key
   * @param {string} key - Sound key
   * @param {object} config - Optional config overrides
   */
  playSound(key, config = {}) {
    if (this.muted || !this.sounds[key]) return;
    this.sounds[key].play({ volume: this.volume, ...config });
  }

  /**
   * Play background music by key
   * @param {string} key - Music key
   */
  playMusic(key = 'bgm') {
    if (this.music) this.music.stop();
    if (this.sounds[key]) {
      this.music = this.sounds[key];
      this.music.play({ volume: this.musicVolume, loop: true });
    }
  }

  /**
   * Set global sound effect volume
   * @param {number} volume - 0.0 to 1.0
   */
  setVolume(volume) {
    this.volume = volume;
    for (const key in this.sounds) {
      if (key !== 'bgm' && this.sounds[key]) {
        this.sounds[key].setVolume(volume);
      }
    }
  }

  /**
   * Set background music volume
   * @param {number} volume - 0.0 to 1.0
   */
  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.music) {
      this.music.setVolume(volume);
    }
  }

  /**
   * Mute or unmute all sounds
   * @param {boolean} muted
   */
  mute(muted) {
    this.muted = muted;
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        this.sounds[key].setMute(muted);
      }
    }
  }

  /**
   * Stop all currently playing sounds and music
   */
  stopAll() {
    if (this.scene.sound) {
      this.scene.sound.stopAll();
    }
  }

  /**
   * Destroy all sound objects and clear references
   */
  destroyAll() {
    console.log('[AudioManager.destroyAll] Destroying all sounds...');
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        this.sounds[key].destroy();
        this.sounds[key] = null;
      }
    }
    if (this.music) {
      this.music.destroy();
      this.music = null;
    }
    this.sounds = {};
    this.scene = null;
  }
}

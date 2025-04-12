import Phaser from 'phaser';

/**
 * MapManager handles loading, storing, and switching between multiple maps.
 * It loads map data from JSON files in the src/maps/ directory.
 */
export default class MapManager {
  /**
   * @param {Phaser.Scene} scene - The scene using the MapManager
   */
  constructor(scene) {
    this.scene = scene;
    this.maps = {};
    this.currentMapKey = null;
    this.currentMap = null;
  }

  /**
   * Preload all map JSON files. Call this in the scene's preload().
   * @param {Array<string>} mapKeys - List of map keys (filenames without .json)
   */
  preloadMaps(mapKeys) {
    for (const key of mapKeys) {
      this.scene.load.json(key, `maps/${key}.json`);
    }
  }

  /**
   * After preload, call this in scene.create() to store loaded map data.
   * @param {Array<string>} mapKeys
   */
  createMaps(mapKeys) {
    for (const key of mapKeys) {
      this.maps[key] = this.scene.cache.json.get(key);
    }
    // Set default map if not set
    if (!this.currentMapKey && mapKeys.length > 0) {
      this.setCurrentMap(mapKeys[0]);
    }
  }

  /**
   * Set the current map by key.
   * @param {string} mapKey
   */
  setCurrentMap(mapKey) {
    if (this.maps[mapKey]) {
      this.currentMapKey = mapKey;
      this.currentMap = this.maps[mapKey];
    }
  }

  /**
   * Get the current map data.
   * @returns {object|null}
   */
  getCurrentMap() {
    return this.currentMap;
  }

  /**
   * Get all available map keys.
   * @returns {Array<string>}
   */
  getMapKeys() {
    return Object.keys(this.maps);
  }

  /**
   * Get map data by key.
   * @param {string} mapKey
   * @returns {object|null}
   */
  getMap(mapKey) {
    return this.maps[mapKey] || null;
  }
}

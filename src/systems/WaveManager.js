export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.waveInProgress = false;
    this.enemiesRemaining = 0;
    this.spawnTimer = null;
    this.spawnIndex = 0;
    this.waveData = null;

    // Get difficulty settings
    this.difficultyKey = scene.registry.get('selectedDifficulty') || 'EASY';
    this.difficultySettings =
      window.GAME_SETTINGS.DIFFICULTY[this.difficultyKey];

    // Calculate total waves based on difficulty
    this.totalWaves =
      window.GAME_SETTINGS.WAVES.length +
      this.getExtraWavesForDifficulty(this.difficultyKey);

    console.log(
      `WaveManager initialized with difficulty: ${this.difficultyKey}`
    );
    console.log(`Total waves: ${this.totalWaves}`);
  }

  /**
   * Get the number of extra waves to add based on difficulty
   * @param {string} difficultyKey - The difficulty key
   * @returns {number} Number of extra waves
   */
  getExtraWavesForDifficulty(difficultyKey) {
    return window.GAME_SETTINGS.DIFFICULTY[difficultyKey].waveCountAdjustment;
  }

  /**
   * Get wave data for the specified wave number, accounting for difficulty
   * @param {number} waveNumber - The wave number (1-based)
   * @returns {Object} Wave data
   */
  getWaveData(waveNumber) {
    const baseWaveCount = window.GAME_SETTINGS.WAVES.length;

    // If it's a base wave
    if (waveNumber <= baseWaveCount) {
      const baseWaveData = { ...window.GAME_SETTINGS.WAVES[waveNumber - 1] };

      // Apply difficulty scaling to enemy count
      baseWaveData.count = Math.round(
        baseWaveData.count * this.difficultySettings.enemyCountMultiplier
      );

      // For higher difficulties, introduce tougher enemies earlier
      if (this.difficultyKey !== 'EASY' && waveNumber <= 3) {
        // Add more enemy types to early waves based on difficulty
        if (this.difficultyKey === 'NORMAL' && waveNumber === 1) {
          baseWaveData.enemies = ['BASIC', 'FAST'];
        } else if (this.difficultyKey === 'HARD' && waveNumber === 1) {
          baseWaveData.enemies = ['BASIC', 'FAST', 'ARMORED'];
        } else if (this.difficultyKey === 'EXPERT' && waveNumber === 1) {
          baseWaveData.enemies = ['BASIC', 'FAST', 'ARMORED', 'FLYING'];
        } else if (this.difficultyKey === 'INSANE' && waveNumber === 1) {
          baseWaveData.enemies = [
            'BASIC',
            'FAST',
            'ARMORED',
            'FLYING',
            'HEALER',
          ];
        }
      }

      return baseWaveData;
    }
    // If it's an extra wave
    else {
      const extraWaveIndex = waveNumber - baseWaveCount - 1;
      const extraWaveData = {
        ...window.GAME_SETTINGS.EXTRA_WAVES[extraWaveIndex],
      };

      // Apply difficulty scaling to enemy count
      extraWaveData.count = Math.round(
        extraWaveData.count * this.difficultySettings.enemyCountMultiplier
      );

      return extraWaveData;
    }
  }

  /**
   * Start the next wave of enemies
   */
  startNextWave() {
    console.log('startNextWave called');

    // Check if a wave is already in progress
    if (this.waveInProgress) {
      console.log('Wave already in progress, returning');
      return;
    }

    // Check if we've reached the end of all waves
    if (this.currentWave >= this.totalWaves) {
      console.log('Reached end of waves, returning');
      return;
    }

    // Increment wave counter
    this.currentWave++;
    console.log(`Starting wave ${this.currentWave}`);

    // Get wave data with difficulty scaling
    this.waveData = this.getWaveData(this.currentWave);
    console.log('Wave data:', this.waveData);

    // Set up wave
    this.waveInProgress = true;
    this.enemiesRemaining = this.waveData.count;
    this.spawnIndex = 0;

    // Emit wave started event
    this.scene.events.emit('waveStarted', this.currentWave);

    // Start spawning enemies
    this.startSpawning();
  }

  /**
   * Start spawning enemies for the current wave
   */
  startSpawning() {
    // Clear any existing timer
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Set up spawn timer
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.waveData.interval,
      callback: this.spawnEnemy,
      callbackScope: this,
      repeat: this.waveData.count - 1,
    });

    // Spawn first enemy immediately
    this.spawnEnemy();
  }

  /**
   * Spawn a single enemy
   */
  spawnEnemy() {
    // Get enemy type to spawn
    let enemyType;

    if (this.waveData.bossWave) {
      // Boss wave - spawn boss
      enemyType = this.waveData.enemies[0];
    } else {
      // Regular wave - randomly select from available enemy types
      const enemyTypes = this.waveData.enemies;
      enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    }

    // Spawn the enemy
    this.scene.spawnEnemy(enemyType);

    // Increment spawn index
    this.spawnIndex++;

    // Check if all enemies have been spawned
    if (this.spawnIndex >= this.waveData.count) {
      // All enemies spawned, now we wait for them to be defeated
      this.checkWaveCompletion();
    }
  }

  /**
   * Check if the current wave is complete
   */
  checkWaveCompletion() {
    // If there are no enemies left, the wave is complete
    if (
      this.scene.enemies.length === 0 &&
      this.spawnIndex >= this.waveData.count
    ) {
      this.waveInProgress = false;
      this.scene.events.emit('waveCompleted', this.currentWave);
    } else {
      // Check again in a moment
      this.scene.time.delayedCall(1000, this.checkWaveCompletion, [], this);
    }
  }

  /**
   * Update method called each frame
   */
  update(time, delta) {
    // Check for wave completion if all enemies have been spawned
    if (this.waveInProgress && this.spawnIndex >= this.waveData.count) {
      // Only check every second to avoid performance issues
      if (time % 1000 < 20) {
        this.checkWaveCompletion();
      }
    }
  }

  /**
   * Check if a wave is currently in progress
   * @returns {boolean} True if a wave is in progress
   */
  isWaveInProgress() {
    return this.waveInProgress;
  }

  /**
   * Get the current wave number
   * @returns {number} Current wave number
   */
  getCurrentWave() {
    return this.currentWave;
  }

  /**
   * Get the total number of waves
   * @returns {number} Total number of waves
   */
  getTotalWaves() {
    return this.totalWaves;
  }

  /**
   * Get the number of enemies remaining to be spawned
   * @returns {number} Number of enemies remaining
   */
  getEnemiesRemaining() {
    return this.waveData.count - this.spawnIndex;
  }

  /**
   * Skip to the next wave (for debugging)
   */
  skipToNextWave() {
    // Clear any existing enemies
    for (const enemy of this.scene.enemies) {
      enemy.destroy();
    }
    this.scene.enemies = [];

    // Clear any existing timer
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Reset wave state
    this.waveInProgress = false;

    // Start next wave
    this.startNextWave();
  }
}
console.log('Debugging wave manager');

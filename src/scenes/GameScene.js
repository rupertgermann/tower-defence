import Phaser from 'phaser';
import PathManager from '../systems/PathManager.js';
import WaveManager from '../systems/WaveManager.js';
import EconomyManager from '../systems/EconomyManager.js';
import AudioManager from '../systems/AudioManager.js';
import MapManager from '../systems/MapManager.js';
import Tower from '../entities/Tower.js';
import MultiShotTower from '../entities/MultiShotTower.js';
import SupportTower from '../entities/SupportTower.js';
import Enemy from '../entities/Enemy.js';
import HealerEnemy from '../entities/HealerEnemy.js';
import ShieldEnemy from '../entities/ShieldEnemy.js';
import SplitEnemy from '../entities/SplitEnemy.js';
import TeleportEnemy from '../entities/TeleportEnemy.js';
import Projectile from '../entities/Projectile.js';
import CollisionManager from '../systems/CollisionManager.js';
import EffectSpawner from '../systems/EffectSpawner.js';
import TowerManager from '../systems/TowerManager.js';
import EnemyManager from '../systems/EnemyManager.js';
import ProjectileManager from '../systems/ProjectileManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');

    // Map keys for available maps
    this.MAP_KEYS = ['forest', 'desert', 'mountain'];

    // Game state
    this.isGameOver = false;
    this.isPaused = false;
    this.currentWave = 0;
    this.gameEnded = false;

    // Game objects
    this.towerManager = null;
    this.enemyManager = null;
    this.projectileManager = null;
    this.placementTiles = [];

    // New helpers
    this.collisionManager = null;
    this.effectSpawner = null;
  }

  preload() {
    // Load audio assets
    this.load.audio('attack', 'assets/attack.wav');
    this.load.audio('enemy_death', 'assets/enemy_death.wav');
    this.load.audio('upgrade', 'assets/upgrade.wav');
    this.load.audio('wave_start', 'assets/wave_start.mp3');
    this.load.audio('wave_end', 'assets/wave_end.mp3');
    this.load.audio('ui_click', 'assets/ui_click.mp3');
    this.load.audio('bgm', 'assets/bgm.mp3');

    // Load map tiles
    this.load.image('tile', 'assets/tile.png');
    this.load.image('tile_desert', 'assets/tile_desert.png');
    this.load.image('tile_mountain', 'assets/tile_mountain.png');
    this.load.image('path', 'assets/path.png');
    this.load.image('placement', 'assets/placement.png');

    // Dynamically load tower assets per type and upgrade level
    Object.entries(window.GAME_SETTINGS.TOWERS).forEach(([type, data]) => {
      const key = type.toLowerCase();
      for (let lvl = 1; lvl <= data.maxLevel; lvl++) {
        this.load.image(`tower_${key}_${lvl}`, `assets/tower_${key}_${lvl}.png`);
      }
    });

    // Dynamically load enemy assets for all configured types
    Object.keys(window.GAME_SETTINGS.ENEMIES).forEach(type => {
      const key = type.toLowerCase();
      this.load.image(`enemy_${key}`, `assets/enemy_${key}.png`);
    });

    // Load projectile assets
    this.load.image('projectile_basic', 'assets/projectile_basic.png');
    this.load.image('projectile_aoe', 'assets/projectile_aoe.png');
    this.load.image('projectile_slow', 'assets/projectile_slow.png');

    // Load effects
    this.load.image('explosion', 'assets/explosion.png');

    // Preload map JSON files
    this.mapManager = new MapManager(this);
    this.mapManager.preloadMaps(this.MAP_KEYS);
  }

  create() {
    // Initialize systems
    this.pathManager = new PathManager(this);
    this.waveManager = new WaveManager(this);
    this.economyManager = new EconomyManager(this);

    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    // Play background music
    this.audioManager.playMusic('bgm');

    // Initialize MapManager and load maps
    if (!this.mapManager) {
      this.mapManager = new MapManager(this);
    }
    this.mapManager.createMaps(this.MAP_KEYS);

    // Set current map (use selected map from registry if available)
    const selectedMap = this.registry.get('selectedMap');
    if (selectedMap && this.MAP_KEYS.includes(selectedMap)) {
      this.mapManager.setCurrentMap(selectedMap);
    } else {
      this.mapManager.setCurrentMap(this.MAP_KEYS[0]);
    }

    // Create map
    this.createMap();

    // Set up input handlers
    this.setupInputHandlers();

    // Start the game
    this.events.emit('gameStart');

    // Connect to UI scene
    this.scene.launch('UIScene');
    this.events.emit('updateUI', {
      lives: window.GAME_SETTINGS.PLAYER.lives,
      money: window.GAME_SETTINGS.PLAYER.money,
      wave: this.currentWave,
    });

    // Initialize new helpers
    this.collisionManager = new CollisionManager(this);
    this.effectSpawner = new EffectSpawner(this);

    // Initialize managers
    this.towerManager = new TowerManager(this);
    this.enemyManager = new EnemyManager(this);
    this.projectileManager = new ProjectileManager(this);
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // Update all game entities
    this.towerManager.update(time, delta, this.enemyManager.getAll());
    this.enemyManager.update(time, delta);
    this.projectileManager.update(time, delta);

    // Check for collisions
    this.collisionManager.checkCollisions();

    // Update wave manager
    this.waveManager.update(time, delta);
  }

  createMap() {
    // Get current map data from MapManager
    const mapData = this.mapManager.getCurrentMap();
    if (!mapData) {
      console.error('No map data loaded!');
      return;
    }

    // Create the base map
    this.map = this.add.group();

    // Map dimensions (in tiles)
    const mapWidth = mapData.width;
    const mapHeight = mapData.height;
    const tileSize = mapData.tileSize;

    // Prepare sets for restrictions and special tiles
    const restricted = new Set();
    (mapData.placementRestrictions || []).forEach(area => {
      for (let dx = 0; dx < area.width; dx++) {
        for (let dy = 0; dy < area.height; dy++) {
          restricted.add(`${area.x + dx},${area.y + dy}`);
        }
      }
    });
    const specialTiles = {};
    (mapData.specialTiles || []).forEach(tile => {
      specialTiles[`${tile.x},${tile.y}`] = tile.type;
    });

    // Create background tiles
    let tileKey = 'tile';
    if (mapData.theme === 'desert') tileKey = 'tile_desert';
    else if (mapData.theme === 'mountain') tileKey = 'tile_mountain';
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = this.add.image(x * tileSize, y * tileSize, tileKey);
        tile.setOrigin(0, 0);
        this.map.add(tile);

        // Overlay for placement restrictions
        if (restricted.has(`${x},${y}`)) {
          const overlay = this.add.rectangle(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize, tileSize,
            0x000000, 0.15
          );
          overlay.setOrigin(0.5, 0.5);
          overlay.setDepth(2);
          this.map.add(overlay);
        }

        // Overlay/icon for special tiles
        if (specialTiles[`${x},${y}`]) {
          let color = 0x00ffff, alpha = 0.3, icon = null, desc = '';
          switch (specialTiles[`${x},${y}`]) {
            case 'damage_boost':
              color = 0xffff00; alpha = 0.35; desc = 'Damage Boost: Towers here deal more damage.'; break;
            case 'range_boost':
              color = 0xffff00; alpha = 0.35; desc = 'Range Boost: Towers here have increased range.'; break;
            case 'elevation_high':
              color = 0x4444ff; alpha = 0.35; desc = 'High Elevation: Towers here gain bonus vision.'; break;
            default:
              color = 0x00ffff; alpha = 0.3; desc = 'Special Tile';
          }
          const stOverlay = this.add.rectangle(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize * 0.7, tileSize * 0.7,
            color, alpha
          );
          stOverlay.setOrigin(0.5, 0.5);
          stOverlay.setDepth(3);
          this.map.add(stOverlay);

          // Tooltip logic
          const infoZone = this.add.zone(
            x * tileSize,
            y * tileSize,
            tileSize, tileSize
          ).setOrigin(0, 0).setInteractive();
          infoZone.setDepth(10);

          // Lazy tooltip creation
          if (!this.specialTileTooltip) {
            this.specialTileTooltip = this.add.text(0, 0, '', {
              fontSize: '14px',
              fill: '#fff',
              backgroundColor: '#222a',
              padding: { left: 8, right: 8, top: 4, bottom: 4 },
              align: 'center',
              wordWrap: { width: tileSize * 2 },
              fontStyle: 'normal',
            });
            this.specialTileTooltip.setDepth(100);
            this.specialTileTooltip.setVisible(false);
          }

          infoZone.on('pointerover', (pointer) => {
            this.specialTileTooltip.setText(desc);
            this.specialTileTooltip.setPosition(
              x * tileSize + tileSize / 2 - this.specialTileTooltip.width / 2,
              y * tileSize - this.specialTileTooltip.height - 6
            );
            this.specialTileTooltip.setVisible(true);
          });
          infoZone.on('pointerout', () => {
            this.specialTileTooltip.setVisible(false);
          });
        }

        // Create placement tiles (where towers can be placed)
        if (!restricted.has(`${x},${y}`)) {
          const placementTile = this.add.image(
            x * tileSize,
            y * tileSize,
            'placement'
          );
          placementTile.setOrigin(0, 0);
          placementTile.setAlpha(0.3);
          placementTile.setInteractive();

          // Store grid position
          placementTile.gridPosition = { x, y };

          // Add to placement tiles array
          this.placementTiles.push(placementTile);

          // Set up event handlers
          placementTile.on('pointerover', () => {
            if (!placementTile.hasTower) {
              placementTile.setAlpha(0.6);
            }
          });

          placementTile.on('pointerout', () => {
            if (!placementTile.hasTower) {
              placementTile.setAlpha(0.3);
            }
          });

          placementTile.on('pointerdown', () => {
            this.handleTilePlacement(placementTile);
          });
        }
      }
    }

    // Create path tiles for all paths
    for (const path of mapData.paths) {
      for (const coord of path) {
        const pathTile = this.add.image(
          coord.x * tileSize,
          coord.y * tileSize,
          'path'
        );
        pathTile.setOrigin(0, 0);
        this.map.add(pathTile);
      }
    }

    // Set up path for enemies to follow (use first path for now)
    const mainPath = mapData.paths[0];
    this.pathManager.setPath(
      mainPath.map((coord) => ({
        x: coord.x * tileSize + tileSize / 2,
        y: coord.y * tileSize + tileSize / 2,
      }))
    );
  }

  handleTilePlacement(tile) {
    if (tile.hasTower) return;

    // Get the currently selected tower type from UI
    const selectedTower = this.registry.get('selectedTower') || 'BASIC';
    const towerData = window.GAME_SETTINGS.TOWERS[selectedTower];

    // Check if player has enough money
    if (this.economyManager.getMoney() >= towerData.cost) {
      // Deduct cost
      this.economyManager.spendMoney(towerData.cost);

      // Create tower
      let tower;
      if (selectedTower === 'MULTISHOT') {
        tower = new MultiShotTower(
          this,
          tile.x + 32,
          tile.y + 32,
          selectedTower.toLowerCase(),
          towerData
        );
      } else if (selectedTower === 'SUPPORT') {
        tower = new SupportTower(
          this,
          tile.x + 32,
          tile.y + 32,
          selectedTower.toLowerCase(),
          towerData
        );
      } else {
        tower = new Tower(
          this,
          tile.x + 32,
          tile.y + 32,
          selectedTower.toLowerCase(),
          towerData
        );
      }

      // Add to tower manager
      this.towerManager.addTower(tower);

      // Mark tile as occupied
      tile.hasTower = true;
      tile.setAlpha(0.1);

      // Update UI
      this.events.emit('updateUI', {
        money: this.economyManager.getMoney(),
      });
    } else {
      // Not enough money - show feedback
      this.events.emit('showMessage', 'Not enough money!');
    }
  }

  setupInputHandlers() {
    // Pause game
    this.input.keyboard.on('keydown-P', () => {
      this.isPaused = !this.isPaused;
      this.events.emit('gamePaused', this.isPaused);
    });

    // Start next wave manually
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.waveManager.isWaveInProgress()) {
        this.waveManager.startNextWave();
      }
    });

    // Force victory for testing (press V key)
    this.input.keyboard.on('keydown-V', () => {
      console.log('V key pressed - forcing victory');
      this.gameOver(true);
    });

    // Show wave end indicator and check for victory when a wave is completed
    this.events.on('waveCompleted', (waveNumber) => {
      console.log(
        `Wave ${waveNumber} completed. GameScene.currentWave=${
          this.currentWave
        }, WaveManager.currentWave=${this.waveManager.getCurrentWave()}`
      );
      // Robust, single-responsibility victory check
      const totalWaves = this.waveManager.getTotalWaves();
      if (waveNumber >= totalWaves && !this.isGameOver && !this.gameEnded) {
        console.log(
          `Victory condition met: waveNumber=${waveNumber}, totalWaves=${totalWaves}`
        );
        this.gameOver(true);
      }
    });

    // Listen for wave started events to update current wave
    this.events.on('waveStarted', (waveNumber) => {
      this.currentWave = waveNumber;
      console.log(
        `Wave ${waveNumber} started. GameScene.currentWave=${
          this.currentWave
        }, WaveManager.currentWave=${this.waveManager.getCurrentWave()}`
      );
    });
  }

  /**
   * Show a visual indicator for wave start/end
   * @param {string} text - The text to display
   */
  showWaveIndicator(text) {
    const width = this.game.config.width;
    const height = this.game.config.height;
    const banner = this.add.text(width / 2, height / 2, text, {
      fontSize: '48px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
      align: 'center',
    });
    banner.setOrigin(0.5);
    banner.setDepth(1000);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      duration: 1200,
      delay: 800,
      onComplete: () => {
        banner.destroy();
      },
    });
  }

  spawnEnemy(type, x, y, data, path, currentPathIndex, t) {
    const enemyType = type.toLowerCase();
    const enemyData = data || window.GAME_SETTINGS.ENEMIES[type];
    const usePath = path || this.pathManager.getPath();
    let spawnPoint;
    if (typeof x === 'number' && typeof y === 'number') {
      spawnPoint = { x, y };
    } else {
      spawnPoint = this.pathManager.getStartPoint();
    }

    let enemy;
    // Instrumentation: log type and class
    let debugClass = 'Enemy';
    if (enemyType === 'healer') {
      enemy = new HealerEnemy(
        this,
        spawnPoint.x,
        spawnPoint.y,
        enemyType,
        enemyData,
        usePath
      );
      debugClass = 'HealerEnemy';
    } else if (enemyType === 'shield') {
      enemy = new ShieldEnemy(
        this,
        spawnPoint.x,
        spawnPoint.y,
        enemyType,
        enemyData,
        usePath
      );
      debugClass = 'ShieldEnemy';
    } else if (enemyType === 'split') {
      enemy = new SplitEnemy(
        this,
        spawnPoint.x,
        spawnPoint.y,
        enemyType,
        enemyData,
        usePath
      );
      debugClass = 'SplitEnemy';
      // Optionally set path index/t for mid-path spawns
      if (typeof currentPathIndex === 'number')
        enemy.currentPathIndex = currentPathIndex;
      if (typeof t === 'number') enemy.t = t;
    } else if (enemyType === 'teleport') {
      enemy = new TeleportEnemy(
        this,
        spawnPoint.x,
        spawnPoint.y,
        enemyType,
        enemyData,
        usePath
      );
      debugClass = 'TeleportEnemy';
    } else {
      enemy = new Enemy(
        this,
        spawnPoint.x,
        spawnPoint.y,
        enemyType,
        enemyData,
        usePath
      );
    }

    // Debug: log instantiation
    // eslint-disable-next-line no-console
    console.log(
      `[spawnEnemy] type: ${type}, enemyType: ${enemyType}, class: ${debugClass}`
    );

    this.enemyManager.addEnemy(enemy);
  }

  spawnProjectile(tower, target, type, data) {
    const projectile = new Projectile(
      this,
      tower.x,
      tower.y,
      type,
      data,
      target
    );

    this.projectileManager.addProjectile(projectile);
  }

  gameOver(victory) {
    this.isGameOver = true;

    // Emit game over event
    this.events.emit('gameOver', {
      victory,
      wave: this.currentWave,
      score: this.economyManager.getScore(),
    });

    console.log(
      `gameOver called with victory=${victory}, gameEnded=${this.gameEnded}`
    );

    // Show victory banner if player won
    if (victory && !this.gameEnded) {
      console.log('Showing victory banner');
      this.showVictoryBanner();
    } else if (victory) {
      console.log('Victory but gameEnded is true, not showing banner');
    }
  }

  /**
   * Display a victory banner when all waves are successfully defended
   */
  showVictoryBanner() {
    console.log('showVictoryBanner method called');

    // Set flag to prevent multiple banners
    this.gameEnded = true;

    // Create full-screen semi-transparent background
    const width = this.game.config.width;
    const height = this.game.config.height;
    const background = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.8
    );
    background.setOrigin(0.5);
    background.setDepth(1000);

    // Create victory text in gold
    const victoryText = this.add.text(width / 2, height / 2 - 80, 'VICTORY!', {
      fontSize: '96px',
      fontStyle: 'bold',
      fill: '#FFD700', // Gold color
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(1001);

    // Create instruction text
    const instructionText = this.add.text(
      width / 2,
      height / 2 + 60,
      'Click anywhere to return to main menu',
      {
        fontSize: '32px',
        fill: '#FFFFFF',
        align: 'center',
      }
    );
    instructionText.setOrigin(0.5);
    instructionText.setDepth(1001);

    // Add score text
    const score = this.economyManager.getScore();
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${score}`, {
      fontSize: '48px',
      fill: '#00FF00', // Green color
      align: 'center',
    });
    scoreText.setOrigin(0.5);
    scoreText.setDepth(1001);

    // Add click handler to reload the browser window (on the entire screen)
    this.input.once('pointerdown', () => {
      console.log('Victory banner clicked - reloading window');
      if (this.audioManager) {
        this.audioManager.stopAll();
      }
      window.location.reload();
    });

    // Add animation effects
    this.tweens.add({
      targets: victoryText,
      scale: { from: 0.5, to: 1.2, yoyo: true, repeat: -1 },
      duration: 1000,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: instructionText,
      alpha: { from: 0, to: 1 },
      duration: 500,
      delay: 500,
    });

    this.tweens.add({
      targets: scoreText,
      scale: { from: 0.8, to: 1.1 },
      duration: 800,
      ease: 'Back.out',
    });

    // Play victory sound if available
    if (this.audioManager) {
      this.audioManager.playSound('wave_end');
    }

    console.log('Victory banner created and displayed');
  }

  /**
   * Play enemy death animation at (x, y)
   */
  playDeathAnimation(x, y) {
    const emitter = this.add.particles(0, 0, 'explosion', {
      lifespan: 400,
      speed: { min: 60, max: 160 },
      scale: { start: 0.5, end: 0 },
      quantity: 15,
      alpha: { start: 1, end: 0 },
      angle: { min: 0, max: 360 },
      blendMode: 'ADD',
    });
    emitter.explode(15, x, y);
    this.time.delayedCall(420, () => {
      emitter.destroy();
    });
  }
}

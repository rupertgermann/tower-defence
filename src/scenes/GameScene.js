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
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.placementTiles = [];
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
        this.load.image('path', 'assets/path.png');
        this.load.image('placement', 'assets/placement.png');

        // Load tower assets
        this.load.image('tower_basic', 'assets/tower_basic.png');
        this.load.image('tower_aoe', 'assets/tower_aoe.png');
        this.load.image('tower_slow', 'assets/tower_slow.png');

        // Load enemy assets
        this.load.image('enemy_basic', 'assets/enemy_basic.png');
        this.load.image('enemy_fast', 'assets/enemy_fast.png');
        this.load.image('enemy_armored', 'assets/enemy_armored.png');
        this.load.image('enemy_flying', 'assets/enemy_flying.png');
        this.load.image('enemy_boss', 'assets/enemy_boss.png');

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
            wave: this.currentWave
        });
    }

    update(time, delta) {
        if (this.isGameOver || this.isPaused) return;
        
        // Update all game entities
        this.updateTowers(time, delta);
        this.updateEnemies(time, delta);
        this.updateProjectiles(time, delta);
        
        // Check for collisions
        this.checkCollisions();
        
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

        // Create background tiles
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tile = this.add.image(x * tileSize, y * tileSize, 'tile');
                tile.setOrigin(0, 0);
                this.map.add(tile);
            }
        }

        // Create path tiles for all paths
        for (const path of mapData.paths) {
            for (const coord of path) {
                const pathTile = this.add.image(coord.x * tileSize, coord.y * tileSize, 'path');
                pathTile.setOrigin(0, 0);
                this.map.add(pathTile);
            }
        }

        // Set up path for enemies to follow (use first path for now)
        const mainPath = mapData.paths[0];
        this.pathManager.setPath(mainPath.map(coord => ({
            x: coord.x * tileSize + tileSize / 2,
            y: coord.y * tileSize + tileSize / 2
        })));

        // Create tower placement tiles, pass placement restrictions and special tiles
        this.createPlacementTiles(mapWidth, mapHeight, tileSize, mapData.paths, mapData.placementRestrictions || []);
    }

    createPlacementTiles(mapWidth, mapHeight, tileSize, paths, placementRestrictions) {
        // Flatten all path coordinates for easy lookup
        const pathCoords = new Set();
        for (const path of paths) {
            for (const coord of path) {
                pathCoords.add(`${coord.x},${coord.y}`);
            }
        }

        // Build a set of restricted tiles
        const restricted = new Set();
        for (const area of placementRestrictions) {
            for (let dx = 0; dx < area.width; dx++) {
                for (let dy = 0; dy < area.height; dy++) {
                    restricted.add(`${area.x + dx},${area.y + dy}`);
                }
            }
        }

        // Create placement tiles (where towers can be placed)
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                // Skip if this is a path tile or restricted area
                if (pathCoords.has(`${x},${y}`) || restricted.has(`${x},${y}`)) {
                    continue;
                }

                // Create placement tile
                const placementTile = this.add.image(x * tileSize, y * tileSize, 'placement');
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
            
            // Add to towers array
            this.towers.push(tower);
            
            // Mark tile as occupied
            tile.hasTower = true;
            tile.setAlpha(0.1);
            
            // Update UI
            this.events.emit('updateUI', {
                money: this.economyManager.getMoney()
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

        // Show wave start indicator when a new wave begins
        this.events.on('waveStarted', (waveNumber) => {
            this.showWaveIndicator(`Wave ${waveNumber} Start`);
        });

        // Show wave end indicator and check for victory when a wave is completed
        this.events.on('waveCompleted', (waveNumber) => {
            this.showWaveIndicator(`Wave ${waveNumber} Complete`);
            console.log(`Wave ${waveNumber} completed. GameScene.currentWave=${this.currentWave}, WaveManager.currentWave=${this.waveManager.getCurrentWave()}`);
            // Robust, single-responsibility victory check
            const totalWaves = this.waveManager.getTotalWaves();
            if (waveNumber >= totalWaves && !this.isGameOver && !this.gameEnded) {
                console.log(`Victory condition met: waveNumber=${waveNumber}, totalWaves=${totalWaves}`);
                this.gameOver(true);
            }
        });

        // Listen for wave started events to update current wave
        this.events.on('waveStarted', (waveNumber) => {
            this.currentWave = waveNumber;
            console.log(`Wave ${waveNumber} started. GameScene.currentWave=${this.currentWave}, WaveManager.currentWave=${this.waveManager.getCurrentWave()}`);
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
            align: 'center'
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
            }
        });
    }

    updateTowers(time, delta) {
        for (const tower of this.towers) {
            tower.update(time, delta, this.enemies);
        }
    }

    updateEnemies(time, delta) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update enemy
            enemy.update(time, delta);
            
            // Check if enemy reached the end
            if (enemy.hasReachedEnd()) {
                // Damage player
                this.economyManager.takeDamage(enemy.data.damage);
                
                // Remove enemy
                enemy.destroy();
                this.enemies.splice(i, 1);
                
                // Update UI
                this.events.emit('updateUI', {
                    lives: this.economyManager.getLives()
                });
                
                // Check for game over
                if (this.economyManager.getLives() <= 0) {
                    this.gameOver(false);
                }
            }
            
            // Check if enemy is dead
            if (enemy.isDead()) {
                // Add money
                this.economyManager.addMoney(enemy.data.reward);

                // Play enemy death sound
                if (this.audioManager) {
                    this.audioManager.playSound('enemy_death');
                }
                // Play death animation
                this.playDeathAnimation(enemy.x, enemy.y);

                // Remove enemy
                enemy.destroy();
                this.enemies.splice(i, 1);
                
                // Update UI
                this.events.emit('updateUI', {
                    money: this.economyManager.getMoney()
                });
                
                // Check if all enemies are defeated
                if (this.enemies.length === 0 && !this.waveManager.isWaveInProgress()) {
                    this.currentWave = this.waveManager.getCurrentWave(); // Ensure currentWave is up to date
                    this.events.emit('waveCompleted', this.currentWave);
                    
                    // Check for victory
                    const totalWaves = this.waveManager.getTotalWaves();
                    console.log(`Checking victory condition: currentWave=${this.currentWave}, totalWaves=${totalWaves}, comparison result=${this.currentWave >= totalWaves}`);
                    
                    // Force victory for testing if we're on the last wave
                    if (this.currentWave >= totalWaves) {
                        console.log(`Victory condition met: currentWave=${this.currentWave}, totalWaves=${totalWaves}`);
                        this.gameOver(true);
                    } else {
                        console.log(`Not yet victory: need wave ${totalWaves}, current wave is ${this.currentWave}`);
                    }
                }
            }
        }
    }

    updateProjectiles(time, delta) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Update projectile
            projectile.update(time, delta);
            
            // Check if projectile is out of bounds
            if (projectile.isOutOfBounds()) {
                projectile.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // Skip if enemy is flying and projectile can't hit flying enemies
                if (enemy.data.flying && !projectile.projectileData.canHitFlying) {
                    continue;
                }
                
                // Check for collision
                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    enemy.getBounds()
                )) {
                    // Handle hit
                    this.handleProjectileHit(projectile, enemy);
                    
                    // Remove projectile
                    projectile.destroy();
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }

    handleProjectileHit(projectile, enemy) {
        // Play attack sound
        if (this.audioManager) {
            this.audioManager.playSound('attack');
        }
        // Calculate damage (considering armor)
        let damage = projectile.projectileData.damage;
        if (enemy.data.armor) {
            damage *= (1 - enemy.data.armor);
        }
        
        // Apply damage
        enemy.takeDamage(damage);
        
        // Handle special effects
        if (projectile.projectileData.type === 'aoe') {
            // Area of effect damage
            this.applyAreaDamage(projectile, enemy);
        } else if (projectile.projectileData.type === 'slow') {
            // Slow effect
            enemy.applySlowEffect(projectile.projectileData.slowFactor, projectile.projectileData.slowDuration);
        }
        
        // Visual feedback
        this.createHitEffect(projectile.x, projectile.y, projectile.projectileData.type);
    }

    applyAreaDamage(projectile, targetEnemy) {
        const aoeRadius = projectile.projectileData.aoeRadius;
        
        for (const enemy of this.enemies) {
            // Skip the target enemy (already damaged)
            if (enemy === targetEnemy) continue;
            
            // Skip flying enemies if projectile can't hit them
            if (enemy.data.flying && !projectile.projectileData.canHitFlying) {
                continue;
            }
            
            // Calculate distance
            const distance = Phaser.Math.Distance.Between(
                projectile.x, projectile.y,
                enemy.x, enemy.y
            );
            
            // Apply damage if within radius
            if (distance <= aoeRadius) {
                // Calculate damage (considering armor and distance falloff)
                let damage = projectile.projectileData.damage * (1 - (distance / aoeRadius) * 0.5);
                if (enemy.data.armor) {
                    damage *= (1 - enemy.data.armor);
                }
                
                // Apply damage
                enemy.takeDamage(damage);
            }
        }
        
        // Visual feedback
        this.createExplosionEffect(projectile.x, projectile.y, aoeRadius);
    }

    createHitEffect(x, y, type = 'basic') {
        // Choose color based on projectile type
        let tint = 0xffffff;
        if (type === 'aoe') {
            tint = 0xff6600; // orange for AoE
        } else if (type === 'slow') {
            tint = 0x00ffff; // cyan for slow
        } else {
            tint = 0xffff00; // yellow for basic
        }
        // Phaser 3.60+ API: use explode for one-shot burst, pass tint in config
        const emitter = this.add.particles(0, 0, 'explosion', {
            tint,
            lifespan: 350,
            speed: { min: 80, max: 160 },
            scale: { start: 0.4, end: 0 },
            quantity: 10,
            alpha: { start: 1, end: 0 },
            angle: { min: 0, max: 360 },
            blendMode: 'ADD'
        });
        emitter.explode(10, x, y);
        this.time.delayedCall(350, () => {
            emitter.destroy();
        });
    }

    createExplosionEffect(x, y, radius) {
        // Particle burst for explosion effect (Phaser 3.60+ API, one-shot emitter)
        const emitter = this.add.particles(0, 0, 'explosion', {
            lifespan: 500,
            speed: { min: 100, max: 220 },
            scale: { start: radius / 120, end: 0 },
            quantity: 20,
            alpha: { start: 0.9, end: 0 },
            angle: { min: 0, max: 360 },
            blendMode: 'ADD'
        });
        emitter.explode(20, x, y);
        this.time.delayedCall(550, () => {
            emitter.destroy();
        });
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
            blendMode: 'ADD'
        });
        emitter.explode(15, x, y);
        this.time.delayedCall(420, () => {
            emitter.destroy();
        });
    }

    /**
     * Spawn an enemy of the given type.
     * Supports special abilities by selecting the correct class.
     * Optionally accepts x, y, data, path, currentPathIndex, t for advanced spawning (e.g., SplitEnemy).
     */
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
            if (typeof currentPathIndex === 'number') enemy.currentPathIndex = currentPathIndex;
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
        console.log(`[spawnEnemy] type: ${type}, enemyType: ${enemyType}, class: ${debugClass}`);

        this.enemies.push(enemy);
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
        
        this.projectiles.push(projectile);
    }

gameOver(victory) {
    this.isGameOver = true;
    
    // Emit game over event
    this.events.emit('gameOver', {
        victory,
        wave: this.currentWave,
        score: this.economyManager.getScore()
    });
    
    console.log(`gameOver called with victory=${victory}, gameEnded=${this.gameEnded}`);
    
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
    const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    background.setOrigin(0.5);
    background.setDepth(1000);
    
    // Create victory text in gold
    const victoryText = this.add.text(width / 2, height / 2 - 80, 'VICTORY!', {
        fontSize: '96px',
        fontStyle: 'bold',
        fill: '#FFD700', // Gold color
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(1001);
    
    // Create instruction text
    const instructionText = this.add.text(width / 2, height / 2 + 60, 'Click anywhere to return to main menu', {
        fontSize: '32px',
        fill: '#FFFFFF',
        align: 'center'
    });
    instructionText.setOrigin(0.5);
    instructionText.setDepth(1001);
    
    // Add score text
    const score = this.economyManager.getScore();
    const scoreText = this.add.text(width / 2, height / 2, `Score: ${score}`, {
        fontSize: '48px',
        fill: '#00FF00', // Green color
        align: 'center'
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
        ease: 'Sine.easeInOut'
    });
    
    this.tweens.add({
        targets: instructionText,
        alpha: { from: 0, to: 1 },
        duration: 500,
        delay: 500
    });
    
    this.tweens.add({
        targets: scoreText,
        scale: { from: 0.8, to: 1.1 },
        duration: 800,
        ease: 'Back.out'
    });
    
    // Play victory sound if available
    if (this.audioManager) {
        this.audioManager.playSound('wave_end');
    }
    
    console.log('Victory banner created and displayed');
}
}

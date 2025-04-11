import Phaser from 'phaser';
import PathManager from '../systems/PathManager.js';
import WaveManager from '../systems/WaveManager.js';
import EconomyManager from '../systems/EconomyManager.js';
import Tower from '../entities/Tower.js';
import Enemy from '../entities/Enemy.js';
import Projectile from '../entities/Projectile.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Game state
        this.isGameOver = false;
        this.isPaused = false;
        this.currentWave = 0;
        
        // Game objects
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.placementTiles = [];
    }

    preload() {
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
    }

    create() {
        // Initialize systems
        this.pathManager = new PathManager(this);
        this.waveManager = new WaveManager(this);
        this.economyManager = new EconomyManager(this);
        
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
        // Create the base map
        this.map = this.add.group();
        
        // Map dimensions (in tiles)
        const mapWidth = 20;
        const mapHeight = 12;
        const tileSize = 64;
        
        // Create background tiles
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tile = this.add.image(x * tileSize, y * tileSize, 'tile');
                tile.setOrigin(0, 0);
                this.map.add(tile);
            }
        }
        
        // Define path coordinates (will be replaced with actual path data)
        const pathCoordinates = [
            { x: 0, y: 5 },
            { x: 5, y: 5 },
            { x: 5, y: 2 },
            { x: 10, y: 2 },
            { x: 10, y: 8 },
            { x: 15, y: 8 },
            { x: 15, y: 5 },
            { x: 19, y: 5 }
        ];
        
        // Create path tiles
        for (const coord of pathCoordinates) {
            const pathTile = this.add.image(coord.x * tileSize, coord.y * tileSize, 'path');
            pathTile.setOrigin(0, 0);
            this.map.add(pathTile);
        }
        
        // Set up path for enemies to follow
        this.pathManager.setPath(pathCoordinates.map(coord => ({
            x: coord.x * tileSize + tileSize / 2,
            y: coord.y * tileSize + tileSize / 2
        })));
        
        // Create tower placement tiles
        this.createPlacementTiles(mapWidth, mapHeight, tileSize, pathCoordinates);
    }

    createPlacementTiles(mapWidth, mapHeight, tileSize, pathCoordinates) {
        // Create placement tiles (where towers can be placed)
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                // Skip if this is a path tile
                if (pathCoordinates.some(coord => coord.x === x && coord.y === y)) {
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
            const tower = new Tower(
                this,
                tile.x + 32,
                tile.y + 32,
                selectedTower.toLowerCase(),
                towerData
            );
            
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
                
                // Remove enemy
                enemy.destroy();
                this.enemies.splice(i, 1);
                
                // Update UI
                this.events.emit('updateUI', {
                    money: this.economyManager.getMoney()
                });
                
                // Check if all enemies are defeated
                if (this.enemies.length === 0 && !this.waveManager.isWaveInProgress()) {
                    this.events.emit('waveCompleted', this.currentWave);
                    
                    // Check for victory
                    if (this.currentWave >= window.GAME_SETTINGS.WAVES.length) {
                        this.gameOver(true);
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
        this.createHitEffect(projectile.x, projectile.y);
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

    createHitEffect(x, y) {
        const hit = this.add.image(x, y, 'explosion');
        hit.setScale(0.5);
        hit.setAlpha(0.8);
        
        this.tweens.add({
            targets: hit,
            alpha: 0,
            scale: 0.2,
            duration: 200,
            onComplete: () => {
                hit.destroy();
            }
        });
    }

    createExplosionEffect(x, y, radius) {
        const explosion = this.add.image(x, y, 'explosion');
        explosion.setScale(radius / 100);
        explosion.setAlpha(0.8);
        
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: radius / 50,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
    }

    spawnEnemy(type) {
        const enemyData = window.GAME_SETTINGS.ENEMIES[type];
        const startPoint = this.pathManager.getStartPoint();
        
        const enemy = new Enemy(
            this,
            startPoint.x,
            startPoint.y,
            type.toLowerCase(),
            enemyData,
            this.pathManager.getPath()
        );
        
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
    }
}

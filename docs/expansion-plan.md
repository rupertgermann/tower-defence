# Tower Defense Game Expansion Plan

This document outlines the implementation plan for expanding the tower defense game beyond the MVP. The plan is organized into phases, with each phase building upon the previous one to gradually enhance the game's features, depth, and polish.

## Phase 1: Core Enhancement

This phase focuses on enhancing the existing core gameplay with features that provide immediate value and build on the existing codebase.

### 1.1 Tower Upgrade System

**Description:** Allow players to upgrade existing towers to improve their capabilities.

**Implementation Details:**
- Add upgrade UI to tower selection interface
- Implement upgrade logic in Tower class
- Create visual indicators for upgraded towers
- Balance upgrade costs and stat improvements

**Technical Approach:**
```javascript
// Tower.js - Extend with upgrade functionality
upgrade() {
  // Check if max level reached
  if (this.level >= this.maxLevel) return false;
  
  // Calculate upgrade cost
  const upgradeCost = this.calculateUpgradeCost();
  
  // Check if player can afford upgrade
  if (this.scene.economyManager.getMoney() >= upgradeCost) {
    // Deduct cost
    this.scene.economyManager.spendMoney(upgradeCost);
    
    // Increase level
    this.level++;
    
    // Improve stats based on tower type
    this.applyUpgradeEffects();
    
    // Update visuals
    this.updateAppearance();
    
    return true;
  }
  
  return false;
}
```

**UI Changes:**
- Add upgrade button to tower info panel
- Display current level and upgrade benefits
- Show upgrade cost and requirements

**Estimated Effort:** 3 days

### 1.2 Enhanced Visual Effects

**Description:** Improve visual feedback for game events to make the gameplay more satisfying.

**Implementation Details:**
- Add particle effects for tower attacks
- Implement death animations for enemies
- Add hit effects for different damage types
- Create wave start/end visual indicators

**Technical Approach:**
- Use Phaser's particle system for effects
- Create animation spritesheets for more complex animations
- Implement effect manager to handle and pool visual effects

```javascript
// Create a particle emitter for explosions
this.explosionEmitter = this.add.particles(0, 0, 'explosion_particle', {
  lifespan: 800,
  speed: { min: 50, max: 100 },
  scale: { start: 0.5, end: 0 },
  quantity: 15,
  blendMode: 'ADD'
});

// Use when needed
createExplosion(x, y) {
  this.explosionEmitter.explode(15, x, y);
}
```

**Estimated Effort:** 4 days

### 1.3 Sound Effects and Music

**Description:** Add audio feedback to enhance the game experience.

**Implementation Details:**
- Implement sound effects for:
  - Tower attacks
  - Enemy deaths
  - Wave start/end
  - UI interactions
- Add background music with dynamic intensity based on game state

**Technical Approach:**
- Use Phaser's audio system
- Implement audio manager for controlling sound effects and music
- Add volume controls to settings menu

```javascript
// Audio Manager
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = null;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.muted = false;
    
    this.loadSounds();
  }
  
  loadSounds() {
    // Load and store sound references
  }
  
  playSound(key, config = {}) {
    if (this.muted) return;
    this.sounds[key].play({ volume: this.volume, ...config });
  }
  
  playMusic(key) {
    if (this.music) this.music.stop();
    this.music = this.sounds[key];
    this.music.play({ volume: this.musicVolume, loop: true });
  }
}
```

**Estimated Effort:** 3 days

## Phase 2: Content Expansion

This phase focuses on adding more content to increase gameplay variety and replayability.

### 2.1 Additional Tower Types

**Description:** Add new tower types with unique abilities to expand strategic options.

**Implementation Details:**
- Add 3 new tower types:
  - **Sniper Tower**: High damage, slow fire rate, long range
  - **Multi-shot Tower**: Attacks multiple targets simultaneously
  - **Support Tower**: Buffs nearby towers' damage or fire rate

**Technical Approach:**
- Extend Tower class with new tower-specific behaviors
- Add new tower data to GAME_SETTINGS
- Create new tower assets
- Implement special abilities for each tower type

```javascript
// Example of Multi-shot Tower implementation
class MultishotTower extends Tower {
  constructor(scene, x, y, type, data) {
    super(scene, x, y, type, data);
    this.targetCount = data.targetCount || 3;
  }
  
  findTargets(enemies) {
    // Override to find multiple targets
    let targets = [];
    
    for (const enemy of enemies) {
      if (targets.length >= this.targetCount) break;
      
      if (this.isValidTarget(enemy)) {
        targets.push(enemy);
      }
    }
    
    return targets;
  }
  
  fireAtTargets(time, targets) {
    // Fire at multiple targets
    this.lastFireTime = time;
    
    for (const target of targets) {
      this.scene.spawnProjectile(this, target, `projectile_${this.type}`, this.projectileData);
    }
    
    this.playAttackAnimation();
  }
  
  update(time, delta, enemies) {
    if (!this.isActive) return;
    
    // Find multiple targets
    const targets = this.findTargets(enemies);
    
    // Attack if we have targets and cooldown has elapsed
    if (targets.length > 0 && time > this.lastFireTime + this.data.fireRate) {
      this.fireAtTargets(time, targets);
    }
  }
}
```

**Estimated Effort:** 5 days

### 2.2 Multiple Maps

**Description:** Add new maps with different layouts to provide variety and new strategic challenges.

**Implementation Details:**
- Create 3 new maps with different themes and path layouts:
  - Forest map with winding paths
  - Desert map with multiple entry/exit points
  - Mountain map with elevation effects
- Implement map selection screen
- Add map-specific mechanics (e.g., terrain effects)

**Technical Approach:**
- Create MapManager class to handle different map configurations
- Store map data in JSON format
- Implement map loading and rendering system

```javascript
// Map data structure
const mapData = {
  name: "Forest",
  theme: "forest",
  background: "forest_bg",
  width: 20,
  height: 12,
  tileSize: 64,
  paths: [
    [
      { x: 0, y: 5 },
      { x: 5, y: 5 },
      { x: 5, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: 8 },
      { x: 15, y: 8 },
      { x: 15, y: 5 },
      { x: 19, y: 5 }
    ]
  ],
  placementRestrictions: [
    // Areas where towers cannot be placed
    { x: 3, y: 3, width: 2, height: 2 }
  ],
  specialTiles: [
    // Special tiles with effects
    { x: 7, y: 7, type: "damage_boost" }
  ]
};

// MapManager class
class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.maps = {};
    this.currentMap = null;
  }
  
  loadMap(mapKey) {
    this.currentMap = this.maps[mapKey];
    this.createMap();
  }
  
  createMap() {
    // Clear existing map
    if (this.mapGroup) this.mapGroup.clear(true, true);
    
    // Create new map based on current map data
    this.mapGroup = this.scene.add.group();
    
    // Create background
    // Create path tiles
    // Create placement tiles
    // Create special tiles
    
    // Set up path for enemies to follow
    this.scene.pathManager.setPath(this.currentMap.paths[0].map(coord => ({
      x: coord.x * this.currentMap.tileSize + this.currentMap.tileSize / 2,
      y: coord.y * this.currentMap.tileSize + this.currentMap.tileSize / 2
    })));
  }
}
```

**Estimated Effort:** 6 days

### 2.3 Enemy Special Abilities

**Description:** Enhance enemies with special abilities to create more diverse challenges.

**Implementation Details:**
- Add special abilities to existing enemy types:
  - **Healing Aura**: Heals nearby enemies
  - **Shield**: Temporary invulnerability
  - **Split**: Divides into smaller enemies when killed
  - **Teleport**: Can skip portions of the path

**Technical Approach:**
- Extend Enemy class with ability-specific behaviors
- Implement visual indicators for special abilities
- Add ability activation logic

```javascript
// Example of enemy with healing ability
class HealerEnemy extends Enemy {
  constructor(scene, x, y, type, data, path) {
    super(scene, x, y, type, data, path);
    
    this.healRadius = data.healRadius || 100;
    this.healAmount = data.healAmount || 5;
    this.healInterval = data.healInterval || 2000;
    this.lastHealTime = 0;
    
    // Create healing aura visual
    this.healAura = scene.add.circle(0, 0, this.healRadius, 0x00ff00, 0.2);
    this.healAura.setVisible(false);
    this.add(this.healAura);
  }
  
  update(time, delta) {
    super.update(time, delta);
    
    // Activate healing ability
    if (time > this.lastHealTime + this.healInterval) {
      this.heal(time);
    }
  }
  
  heal(time) {
    this.lastHealTime = time;
    
    // Show healing aura
    this.healAura.setVisible(true);
    this.scene.tweens.add({
      targets: this.healAura,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.healAura.setAlpha(0.2);
        this.healAura.setVisible(false);
      }
    });
    
    // Heal nearby enemies
    for (const enemy of this.scene.enemies) {
      if (enemy === this) continue;
      
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      );
      
      if (distance <= this.healRadius) {
        enemy.heal(this.healAmount);
      }
    }
  }
}
```

**Estimated Effort:** 4 days

## Phase 3: Meta Features

This phase focuses on features that enhance the overall game experience and provide long-term engagement.

### 3.1 Meta-progression System

**Description:** Implement a progression system that persists between games, allowing players to unlock permanent upgrades.

**Implementation Details:**
- Add experience points earned from completing waves
- Create player level system
- Implement permanent upgrade tree with unlockable abilities
- Add persistent currency for meta-upgrades

**Technical Approach:**
- Create ProgressionManager class to handle meta-progression
- Implement local storage for saving progression data
- Create UI for displaying and selecting upgrades

```javascript
// Progression Manager
class ProgressionManager {
  constructor() {
    this.playerLevel = 1;
    this.experience = 0;
    this.experienceToNextLevel = 100;
    this.metaCurrency = 0;
    this.unlockedUpgrades = [];
    
    this.loadProgress();
  }
  
  loadProgress() {
    const savedData = localStorage.getItem('towerDefenseProgress');
    if (savedData) {
      const data = JSON.parse(savedData);
      this.playerLevel = data.playerLevel || 1;
      this.experience = data.experience || 0;
      this.experienceToNextLevel = data.experienceToNextLevel || 100;
      this.metaCurrency = data.metaCurrency || 0;
      this.unlockedUpgrades = data.unlockedUpgrades || [];
    }
  }
  
  saveProgress() {
    const data = {
      playerLevel: this.playerLevel,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      metaCurrency: this.metaCurrency,
      unlockedUpgrades: this.unlockedUpgrades
    };
    
    localStorage.setItem('towerDefenseProgress', JSON.stringify(data));
  }
  
  addExperience(amount) {
    this.experience += amount;
    
    // Check for level up
    while (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
    
    this.saveProgress();
  }
  
  levelUp() {
    this.playerLevel++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
    this.metaCurrency += 10;
    
    // Trigger level up event
    // Show level up notification
  }
  
  unlockUpgrade(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    
    if (this.metaCurrency >= upgrade.cost && !this.unlockedUpgrades.includes(upgradeId)) {
      this.metaCurrency -= upgrade.cost;
      this.unlockedUpgrades.push(upgradeId);
      this.saveProgress();
      return true;
    }
    
    return false;
  }
  
  getUpgradeEffect(category) {
    let effect = 0;
    
    for (const upgradeId of this.unlockedUpgrades) {
      const upgrade = UPGRADES[upgradeId];
      if (upgrade.category === category) {
        effect += upgrade.effect;
      }
    }
    
    return effect;
  }
}

// Example usage in game
// Apply tower damage boost from meta-progression
const damageBoost = 1 + game.progressionManager.getUpgradeEffect('tower_damage') / 100;
tower.data.damage *= damageBoost;
```

**Estimated Effort:** 7 days

### 3.2 Save/Load System

**Description:** Allow players to save their game progress and continue later.

**Implementation Details:**
- Save current game state (towers, resources, wave)
- Implement auto-save feature
- Create save/load UI
- Support multiple save slots

**Technical Approach:**
- Create SaveManager class to handle saving and loading
- Use localStorage for web or file system for desktop
- Implement serialization/deserialization of game state

```javascript
// Save Manager
class SaveManager {
  constructor(scene) {
    this.scene = scene;
    this.saveSlots = 3;
  }
  
  saveGame(slot = 0) {
    // Gather game state
    const gameState = {
      wave: this.scene.currentWave,
      lives: this.scene.economyManager.getLives(),
      money: this.scene.economyManager.getMoney(),
      score: this.scene.economyManager.getScore(),
      towers: this.scene.towers.map(tower => ({
        x: tower.x,
        y: tower.y,
        type: tower.type,
        level: tower.level
      })),
      timestamp: Date.now()
    };
    
    // Save to storage
    localStorage.setItem(`towerDefenseSave_${slot}`, JSON.stringify(gameState));
    
    return true;
  }
  
  loadGame(slot = 0) {
    const savedData = localStorage.getItem(`towerDefenseSave_${slot}`);
    
    if (!savedData) return false;
    
    // Parse saved game
    const gameState = JSON.parse(savedData);
    
    // Reset current game state
    this.scene.resetGame();
    
    // Restore game state
    this.scene.currentWave = gameState.wave;
    this.scene.economyManager.setLives(gameState.lives);
    this.scene.economyManager.setMoney(gameState.money);
    this.scene.economyManager.setScore(gameState.score);
    
    // Recreate towers
    for (const towerData of gameState.towers) {
      const tower = this.scene.createTower(
        towerData.x,
        towerData.y,
        towerData.type
      );
      
      // Upgrade tower to saved level
      for (let i = 1; i < towerData.level; i++) {
        tower.upgrade();
      }
    }
    
    return true;
  }
  
  getSaveInfo(slot = 0) {
    const savedData = localStorage.getItem(`towerDefenseSave_${slot}`);
    
    if (!savedData) return null;
    
    const gameState = JSON.parse(savedData);
    
    return {
      wave: gameState.wave,
      score: gameState.score,
      towers: gameState.towers.length,
      timestamp: gameState.timestamp,
      date: new Date(gameState.timestamp).toLocaleString()
    };
  }
  
  deleteSave(slot = 0) {
    localStorage.removeItem(`towerDefenseSave_${slot}`);
    return true;
  }
}
```

**Estimated Effort:** 4 days

### 3.3 Tutorial System

**Description:** Create an interactive tutorial to help new players learn the game.

**Implementation Details:**
- Implement step-by-step tutorial for first-time players
- Add tooltips for UI elements
- Create help section with game mechanics explanation
- Add contextual hints during gameplay

**Technical Approach:**
- Create TutorialManager class to handle tutorial flow
- Implement highlight and focus system for UI elements
- Add tutorial-specific dialogue and instructions

```javascript
// Tutorial Manager
class TutorialManager {
  constructor(scene) {
    this.scene = scene;
    this.steps = TUTORIAL_STEPS;
    this.currentStep = 0;
    this.active = false;
    this.completed = false;
    
    // Check if tutorial has been completed before
    this.completed = localStorage.getItem('tutorialCompleted') === 'true';
  }
  
  start() {
    if (this.completed) return;
    
    this.active = true;
    this.currentStep = 0;
    this.showStep();
  }
  
  showStep() {
    const step = this.steps[this.currentStep];
    
    // Create tutorial UI
    this.tutorialBox = this.scene.add.container(640, 360);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
    this.tutorialBox.add(bg);
    
    // Title
    const title = this.scene.add.text(0, -70, step.title, {
      fontSize: '24px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    this.tutorialBox.add(title);
    
    // Content
    const content = this.scene.add.text(0, 0, step.content, {
      fontSize: '18px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 350 }
    });
    content.setOrigin(0.5);
    this.tutorialBox.add(content);
    
    // Next button
    const nextButton = this.scene.add.rectangle(0, 80, 120, 40, 0x00aa00);
    nextButton.setInteractive();
    nextButton.on('pointerdown', () => this.nextStep());
    this.tutorialBox.add(nextButton);
    
    const nextText = this.scene.add.text(0, 80, 'Next', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    nextText.setOrigin(0.5);
    this.tutorialBox.add(nextText);
    
    // Highlight target element if specified
    if (step.highlight) {
      this.highlightElement(step.highlight);
    }
    
    // Pause game if needed
    if (step.pauseGame) {
      this.scene.isPaused = true;
    }
  }
  
  highlightElement(elementId) {
    // Find element in the scene
    const element = this.scene.getElementByID(elementId);
    
    if (!element) return;
    
    // Create highlight effect
    const bounds = element.getBounds();
    const highlight = this.scene.add.rectangle(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width + 10,
      bounds.height + 10,
      0xffff00,
      0.3
    );
    
    this.tutorialBox.add(highlight);
    
    // Animate highlight
    this.scene.tweens.add({
      targets: highlight,
      alpha: 0.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  nextStep() {
    // Clean up current step
    this.tutorialBox.destroy();
    
    // Move to next step
    this.currentStep++;
    
    // Check if tutorial is complete
    if (this.currentStep >= this.steps.length) {
      this.complete();
      return;
    }
    
    // Show next step
    this.showStep();
  }
  
  complete() {
    this.active = false;
    this.completed = true;
    
    // Save completion status
    localStorage.setItem('tutorialCompleted', 'true');
    
    // Unpause game if needed
    this.scene.isPaused = false;
    
    // Show completion message
    this.scene.events.emit('showMessage', 'Tutorial completed!');
  }
}
```

**Estimated Effort:** 5 days

## Phase 4: Polish and Refinement

This phase focuses on overall polish, performance optimization, and quality-of-life improvements.

### 4.1 Performance Optimization

**Description:** Optimize the game for better performance, especially with many entities on screen.

**Implementation Details:**
- Implement object pooling for frequently created/destroyed objects
- Add spatial partitioning for collision detection
- Optimize rendering with culling and batching
- Add quality settings for different devices

**Technical Approach:**
- Create ObjectPool class for reusing game objects
- Implement quadtree for spatial partitioning
- Add performance monitoring and adaptive quality settings

```javascript
// Object Pool
class ObjectPool {
  constructor(scene, type, factory, initialSize = 10) {
    this.scene = scene;
    this.type = type;
    this.factory = factory;
    this.pool = [];
    
    // Initialize pool
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      obj.active = false;
      this.pool.push(obj);
    }
  }
  
  get() {
    // Find inactive object in pool
    let obj = this.pool.find(obj => !obj.active);
    
    // If no inactive objects, create a new one
    if (!obj) {
      obj = this.factory();
      this.pool.push(obj);
    }
    
    // Activate object
    obj.active = true;
    
    return obj;
  }
  
  release(obj) {
    // Deactivate object and return to pool
    obj.active = false;
    
    // Reset object state
    if (obj.reset) {
      obj.reset();
    }
  }
}

// Example usage for projectiles
this.projectilePool = new ObjectPool(
  this,
  'projectile',
  () => new Projectile(this, 0, 0, 'projectile_basic', {})
);

// Get projectile from pool
const projectile = this.projectilePool.get();
projectile.init(tower.x, tower.y, type, data, target);

// Release projectile back to pool when done
this.projectilePool.release(projectile);
```

**Estimated Effort:** 6 days

### 4.2 Special Abilities and Power-ups

**Description:** Add special abilities and power-ups that players can use during gameplay.

**Implementation Details:**
- Implement global special abilities (e.g., slow all enemies, damage all enemies)
- Add power-up items that drop from defeated enemies
- Create cooldown and resource systems for abilities
- Add visual effects for abilities

**Technical Approach:**
- Create AbilityManager class to handle special abilities
- Implement UI for ability selection and activation
- Add power-up spawning and collection logic

```javascript
// Ability Manager
class AbilityManager {
  constructor(scene) {
    this.scene = scene;
    this.abilities = {};
    this.cooldowns = {};
    
    this.initializeAbilities();
  }
  
  initializeAbilities() {
    // Define abilities
    this.abilities = {
      freezeTime: {
        name: 'Freeze Time',
        description: 'Slow all enemies for 5 seconds',
        cooldown: 30000,
        cost: 50,
        icon: 'freeze_icon',
        execute: () => this.freezeTime()
      },
      airstrike: {
        name: 'Airstrike',
        description: 'Deal damage to all enemies on screen',
        cooldown: 45000,
        cost: 100,
        icon: 'airstrike_icon',
        execute: () => this.airstrike()
      },
      rapidFire: {
        name: 'Rapid Fire',
        description: 'Increase fire rate of all towers for 10 seconds',
        cooldown: 60000,
        cost: 75,
        icon: 'rapid_fire_icon',
        execute: () => this.rapidFire()
      }
    };
    
    // Initialize cooldowns
    for (const key in this.abilities) {
      this.cooldowns[key] = 0;
    }
  }
  
  useAbility(abilityKey) {
    const ability = this.abilities[abilityKey];
    const currentTime = this.scene.time.now;
    
    // Check cooldown
    if (currentTime < this.cooldowns[abilityKey]) {
      return false;
    }
    
    // Check cost
    if (this.scene.economyManager.getMoney() < ability.cost) {
      return false;
    }
    
    // Deduct cost
    this.scene.economyManager.spendMoney(ability.cost);
    
    // Set cooldown
    this.cooldowns[abilityKey] = currentTime + ability.cooldown;
    
    // Execute ability
    ability.execute();
    
    return true;
  }
  
  freezeTime() {
    // Apply slow effect to all enemies
    for (const enemy of this.scene.enemies) {
      enemy.applySlowEffect(0.3, 5000);
    }
    
    // Visual effect
    this.scene.cameras.main.flash(500, 0, 200, 255);
  }
  
  airstrike() {
    // Deal damage to all enemies
    for (const enemy of this.scene.enemies) {
      enemy.takeDamage(50);
    }
    
    // Visual effect
    this.scene.cameras.main.shake(500, 0.01);
    
    // Create explosion effects
    for (const enemy of this.scene.enemies) {
      this.scene.createExplosionEffect(enemy.x, enemy.y, 30);
    }
  }
  
  rapidFire() {
    // Increase fire rate of all towers
    for (const tower of this.scene.towers) {
      tower.applyFireRateBoost(0.5, 10000);
    }
    
    // Visual effect
    this.scene.cameras.main.flash(500, 255, 255, 0);
  }
  
  getCooldownPercent(abilityKey) {
    const ability = this.abilities[abilityKey];
    const currentTime = this.scene.time.now;
    const cooldownEnd = this.cooldowns[abilityKey];
    
    if (currentTime >= cooldownEnd) {
      return 1;
    }
    
    return 1 - ((cooldownEnd - currentTime) / ability.cooldown);
  }
}
```

**Estimated Effort:** 5 days

### 4.3 Settings and Accessibility

**Description:** Add settings menu and accessibility features to make the game more inclusive.

**Implementation Details:**
- Implement settings menu with options for:
  - Sound volume
  - Music volume
  - Visual effects quality
  - Game speed
- Add accessibility features:
  - Colorblind mode
  - Text size options
  - Control customization
  - Difficulty settings

**Technical Approach:**
- Create SettingsManager class to handle game settings
- Implement UI for settings menu
- Add local storage for saving settings

```javascript
// Settings Manager
class SettingsManager {
  constructor() {
    this.settings = {
      soundVolume: 0.7,
      musicVolume: 0.5,
      effectsQuality: 'high',
      gameSpeed: 1,
      colorblindMode: false,
      textSize: 'medium',
      difficulty: 'normal'
    };
    
    this.loadSettings();
  }
  
  loadSettings() {
    const savedSettings = localStorage.getItem('towerDefenseSettings');
    
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }
  
  saveSettings() {
    localStorage.setItem('towerDefenseSettings', JSON.stringify(this.settings));
  }
  
  setSetting(key, value) {
    if (key in this.settings) {
      this.settings[key] = value;
      this.saveSettings();
      
      // Apply setting immediately
      this.applySettings();
      
      return true;
    }
    
    return false;
  }
  
  getSetting(key) {
    return this.settings[key];
  }
  
  applySettings() {
    // Apply sound volume
    if (game.audioManager) {
      game.audioManager.setVolume(this.settings.soundVolume);
      game.audioManager.setMusicVolume(this.settings.musicVolume);
    }
    
    // Apply game speed
    if (game.scene.scenes) {
      for (const scene of game.scene.scenes) {
        if (scene.active) {
          scene.time.timeScale = this.settings.gameSpeed;
        }
      }
    }
    
    // Apply colorblind mode
    document.body.classList.toggle('colorblind', this.settings.colorblindMode);
    
    // Apply text size
    document.body.classList.remove('text-small', 'text-medium', 'text-large');

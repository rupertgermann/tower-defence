import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');

    // UI state
    this.lives = 0;
    this.money = 0;
    this.wave = 0;
    this.selectedTower = 'BASIC';

    // UI elements
    this.livesText = null;
    this.moneyText = null;
    this.waveText = null;
    this.messageText = null;
    this.towerButtons = [];
    this.lowerBarContainer = null;
    this.lowerBarVisible = false;
    this.isGameStopped = true;
  }

  /**
   * Show tower info panel when a tower is selected
   * @param {Tower} tower - The selected tower instance
   */
  showTowerInfo(tower) {
    // Remove existing panel if present
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy(true);
    }

    // Panel background
    const panelWidth = 320;
    const panelHeight = 220;
    const panelX = 1280 - panelWidth - 30;
    const panelY = 100;
    this.towerInfoPanel = this.add.container(panelX, panelY);

    const bg = this.add.rectangle(
      0,
      0,
      panelWidth,
      panelHeight,
      0x222244,
      0.95
    );
    bg.setOrigin(0, 0);
    this.towerInfoPanel.add(bg);

    // Tower name
    const nameText = this.add.text(
      20,
      15,
      `Tower: ${tower.data.name || tower.type}`,
      {
        fontSize: '20px',
        fill: '#ffffff',
      }
    );
    this.towerInfoPanel.add(nameText);

    // Tower level
    const levelText = this.add.text(
      20,
      50,
      `Level: ${tower.level} / ${tower.maxLevel || 3}`,
      {
        fontSize: '18px',
        fill: '#ffff00',
      }
    );
    this.towerInfoPanel.add(levelText);

    // Tower stats
    const statsText = this.add.text(
      20,
      80,
      `Damage: ${Math.round(tower.data.damage)}\nRange: ${Math.round(
        tower.data.range
      )}\nFire Rate: ${Math.round(tower.data.fireRate)}ms`,
      { fontSize: '16px', fill: '#ffffff' }
    );
    this.towerInfoPanel.add(statsText);

    // Upgrade info
    let canUpgrade =
      typeof tower.upgrade === 'function' &&
      (!tower.maxLevel || tower.level < tower.maxLevel);
    let upgradeCost = 0;
    if (canUpgrade) {
      // Calculate upgrade cost using tower's method or fallback
      if (typeof tower.calculateUpgradeCost === 'function') {
        upgradeCost = tower.calculateUpgradeCost();
      } else {
        upgradeCost = Math.floor(tower.data.cost * 0.5);
      }
    }

    const upgradeText = this.add.text(
      20,
      140,
      canUpgrade ? `Upgrade Cost: ${upgradeCost}g` : `Max Level Reached`,
      { fontSize: '16px', fill: canUpgrade ? '#00ff00' : '#ff4444' }
    );
    this.towerInfoPanel.add(upgradeText);

    // Upgrade button
    if (canUpgrade) {
      const upgradeBtn = this.add.rectangle(
        panelWidth - 120,
        panelHeight - 50,
        100,
        40,
        0x00aa00
      );
      upgradeBtn.setOrigin(0, 0);
      upgradeBtn.setInteractive();

      const btnText = this.add.text(
        panelWidth - 70,
        panelHeight - 30,
        'Upgrade',
        {
          fontSize: '18px',
          fill: '#ffffff',
        }
      );
      btnText.setOrigin(0.5, 0.5);

      this.towerInfoPanel.add(upgradeBtn);
      this.towerInfoPanel.add(btnText);

      upgradeBtn.on('pointerover', () => {
        upgradeBtn.setFillStyle(0x00cc00);
      });
      upgradeBtn.on('pointerout', () => {
        upgradeBtn.setFillStyle(0x00aa00);
      });
      upgradeBtn.on('pointerdown', () => {
        const audioManager = this.scene.get('GameScene').audioManager;
        if (audioManager) audioManager.playSound('ui_click');
        if (tower.upgrade()) {
          // Play upgrade sound if available
          if (audioManager && typeof audioManager.playSound === 'function') {
            audioManager.playSound('upgrade');
          }
          // Refresh panel with new stats
          this.showTowerInfo(tower);
          // Update UI money
          this.scene
            .get('GameScene')
            .events.emit('updateUI', {
              money: this.scene.get('GameScene').economyManager.getMoney(),
            });
        } else {
          this.showMessage(
            'Cannot upgrade: insufficient funds or max level reached.',
            1500
          );
        }
      });
    }

    // Close button
    const closeBtn = this.add.rectangle(panelWidth - 40, 10, 30, 30, 0x444444);
    closeBtn.setOrigin(0, 0);
    closeBtn.setInteractive();
    const closeX = this.add.text(panelWidth - 25, 25, 'X', {
      fontSize: '18px',
      fill: '#ffffff',
    });
    closeX.setOrigin(0.5, 0.5);
    this.towerInfoPanel.add(closeBtn);
    this.towerInfoPanel.add(closeX);
    closeBtn.on('pointerdown', () => {
      const audioManager = this.scene.get('GameScene').audioManager;
      if (audioManager) audioManager.playSound('ui_click');
      this.towerInfoPanel.destroy(true);
    });

    this.uiContainer.add(this.towerInfoPanel);
  }

  /**
   * Remove tower info panel if present
   */
  hideTowerInfo() {
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy(true);
      this.towerInfoPanel = null;
    }
  }

  create() {
    // Get initial values
    this.lives = window.GAME_SETTINGS.PLAYER.lives;
    this.money = window.GAME_SETTINGS.PLAYER.money;
    this.wave = 0;

    // Create UI container
    this.uiContainer = this.add.container(0, 0);

    // --- Lower bar container for fade effect ---
    this.lowerBarContainer = this.add.container(0, 0);
    this.lowerBarContainer.setAlpha(0); // Start hidden
    this.lowerBarVisible = false;
    this.uiContainer.add(this.lowerBarContainer);

    // Create UI background
    this.createUIBackground();

    // Create status displays
    this.createStatusDisplays();

    // Create tower selection buttons
    this.createTowerButtons();

    // Create wave control button
    this.createWaveButton();

    // Create message display
    this.createMessageDisplay();

    // Listen for game events
    this.setupEventListeners();

    // Add mute/unmute button (top right)
    const audioManager = this.scene.get('GameScene').audioManager;
    this.isMuted = false;
    this.muteButton = this.add.rectangle(1240, 20, 32, 32, 0x444444);
    this.muteButton.setOrigin(0, 0);
    this.muteButton.setInteractive();
    this.muteIcon = this.add.text(1256, 36, '🔊', {
      fontSize: '20px',
      fill: '#ffffff',
    });
    this.muteIcon.setOrigin(0.5, 0.5);
    this.uiContainer.add(this.muteButton);
    this.uiContainer.add(this.muteIcon);
    this.muteButton.on('pointerdown', () => {
      this.isMuted = !this.isMuted;
      if (audioManager) audioManager.mute(this.isMuted);
      this.muteIcon.setText(this.isMuted ? '🔇' : '🔊');
      if (audioManager) audioManager.playSound('ui_click');
    });

    // Show lower bar on game start or if game is stopped
    this.showLowerBar(true);

    // Pointer events for fade in/out on hover
    this.input.on('pointermove', (pointer) => {
      if (!this.isWaveActive()) return; // Only apply hover effect during running waves
      const y = pointer.y;
      if (y >= 620 && !this.lowerBarVisible) {
        this.showLowerBar();
      } else if (y < 620 && this.lowerBarVisible) {
        this.hideLowerBar();
      }
    });
    // Also fade out if mouse leaves the game canvas completely during an active wave
    this.game.canvas.addEventListener('mouseleave', () => {
      if (this.lowerBarVisible && this.isWaveActive()) {
        this.hideLowerBar();
      }
    });
  }

  createUIBackground() {
    // Top bar background
    const topBar = this.add.rectangle(0, 0, 1280, 80, 0x222222);
    topBar.setOrigin(0, 0);
    topBar.setAlpha(0.8);
    this.uiContainer.add(topBar);

    // Bottom bar background
    const bottomBar = this.add.rectangle(0, 720 - 100, 1280, 100, 0x222222);
    bottomBar.setOrigin(0, 0);
    bottomBar.setAlpha(0.8);
    this.lowerBarContainer.add(bottomBar);
  }

  createStatusDisplays() {
    // Lives display
    const livesIcon = this.add.circle(30, 40, 15, 0xff0000);
    this.uiContainer.add(livesIcon);

    this.livesText = this.add.text(55, 30, `Lives: ${this.lives}`, {
      fontSize: '24px',
      fill: '#ffffff',
    });
    this.uiContainer.add(this.livesText);

    // Money display
    const moneyIcon = this.add.circle(210, 40, 15, 0xffff00);
    this.uiContainer.add(moneyIcon);

    this.moneyText = this.add.text(235, 30, `Gold: ${this.money}`, {
      fontSize: '24px',
      fill: '#ffffff',
    });
    this.uiContainer.add(this.moneyText);

    // Wave display
    const waveIcon = this.add.circle(410, 40, 15, 0x00ffff);
    this.uiContainer.add(waveIcon);

    // Get total waves from WaveManager if available, otherwise use base waves
    const totalWaves = this.scene.get('GameScene').waveManager
      ? this.scene.get('GameScene').waveManager.getTotalWaves()
      : window.GAME_SETTINGS.WAVES.length;

    this.waveText = this.add.text(435, 30, `Wave: ${this.wave}/${totalWaves}`, {
      fontSize: '24px',
      fill: '#ffffff',
    });
    this.uiContainer.add(this.waveText);

    // Difficulty display
    const difficultyKey = this.registry.get('selectedDifficulty') || 'EASY';
    const difficultyData = window.GAME_SETTINGS.DIFFICULTY[difficultyKey];

    // Get color based on difficulty
    let difficultyColor;
    switch (difficultyKey) {
      case 'EASY':
        difficultyColor = '#00aa00';
        break; // Green
      case 'NORMAL':
        difficultyColor = '#0088cc';
        break; // Blue
      case 'HARD':
        difficultyColor = '#aaaa00';
        break; // Yellow
      case 'EXPERT':
        difficultyColor = '#dd6600';
        break; // Orange
      case 'INSANE':
        difficultyColor = '#cc0000';
        break; // Red
      default:
        difficultyColor = '#ffffff';
    }

    const difficultyIcon = this.add.circle(610, 40, 15, 0xffffff);
    this.uiContainer.add(difficultyIcon);

    this.difficultyText = this.add.text(
      635,
      30,
      `Difficulty: ${difficultyData.name}`,
      {
        fontSize: '24px',
        fill: difficultyColor,
      }
    );
    this.uiContainer.add(this.difficultyText);
  }

  createTowerButtons() {
    const buttonWidth = 155;
    const buttonHeight = 85;
    const padding = 10;
    const startX = 30;
    const startY = 720 - 93;

    // Create buttons for each tower type
    const towerTypes = Object.keys(window.GAME_SETTINGS.TOWERS);

    towerTypes.forEach((type, index) => {
      const towerData = window.GAME_SETTINGS.TOWERS[type];
      const x = startX + (buttonWidth + padding) * index;

      // Button background
      const button = this.add.rectangle(
        x,
        startY,
        buttonWidth,
        buttonHeight,
        0x444444
      );
      button.setOrigin(0, 0);
      button.setInteractive();
      button.towerType = type;

      // Tower icon using level-1 sprite
      const icon = this.add.image(
        x + buttonWidth / 2,
        startY + 25,
        `tower_${type.toLowerCase()}_1`
      );
      icon.setOrigin(0.5, 0.5);
      icon.setDisplaySize(30, 30);

      // Tower name
      const nameText = this.add.text(
        x + buttonWidth / 2,
        startY + 50,
        towerData.name,
        {
          fontSize: '14px',
          fill: '#ffffff',
        }
      );
      nameText.setOrigin(0.5, 0);

      // Tower cost
      const costText = this.add.text(
        x + buttonWidth / 2,
        startY + 70,
        `${towerData.cost}g`,
        {
          fontSize: '12px',
          fill: '#ffff00',
        }
      );
      costText.setOrigin(0.5, 0);

      // Add to lower bar container
      this.lowerBarContainer.add(button);
      this.lowerBarContainer.add(icon);
      this.lowerBarContainer.add(nameText);
      this.lowerBarContainer.add(costText);

      // Store button reference
      this.towerButtons.push({
        button,
        icon,
        nameText,
        costText,
        type,
      });

      // Set up event handlers
      button.on('pointerover', () => {
        button.setFillStyle(0x666666);
      });

      button.on('pointerout', () => {
        if (this.selectedTower !== type) {
          button.setFillStyle(0x444444);
        }
      });

      button.on('pointerdown', () => {
        const audioManager = this.scene.get('GameScene').audioManager;
        if (audioManager) audioManager.playSound('ui_click');
        this.selectTower(type);
      });

      // Set initial selection
      if (type === this.selectedTower) {
        button.setFillStyle(0x888888);
      }
    });
  }

  createWaveButton() {
    const buttonWidth = 200;
    const buttonHeight = 60;
    const x = 1280 - buttonWidth - 50;
    const y = 720 - 80;

    // Button background
    this.waveButton = this.add.rectangle(
      x,
      y,
      buttonWidth,
      buttonHeight,
      0x00aa00
    );
    this.waveButton.setOrigin(0, 0);
    this.waveButton.setInteractive();

    // Button text
    this.waveButtonText = this.add.text(
      x + buttonWidth / 2,
      y + buttonHeight / 2,
      'Start Wave',
      {
        fontSize: '20px',
        fill: '#ffffff',
      }
    );
    this.waveButtonText.setOrigin(0.5, 0.5);

    // Add to lower bar container
    this.lowerBarContainer.add(this.waveButton);
    this.lowerBarContainer.add(this.waveButtonText);

    // Set up event handlers
    this.waveButton.on('pointerover', () => {
      this.waveButton.setFillStyle(0x00cc00);
    });

    this.waveButton.on('pointerout', () => {
      this.waveButton.setFillStyle(0x00aa00);
    });

    this.waveButton.on('pointerdown', () => {
      const audioManager = this.scene.get('GameScene').audioManager;
      if (audioManager) audioManager.playSound('ui_click');
      // Notify game scene to start next wave
      this.scene.get('GameScene').waveManager.startNextWave();

      // Disable button during wave
      this.setWaveButtonEnabled(false);
    });
  }

  createMessageDisplay() {
    // Message background
    this.messageBackground = this.add.rectangle(640, 360, 400, 100, 0x000000);
    this.messageBackground.setOrigin(0.5, 0.5);
    this.messageBackground.setAlpha(0.8);
    this.messageBackground.setVisible(false);
    this.uiContainer.add(this.messageBackground);

    // Message text
    this.messageText = this.add.text(640, 360, '', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center',
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.messageText.setVisible(false);
    this.uiContainer.add(this.messageText);
  }

  setupEventListeners() {
    // Listen for UI update events from game scene
    this.scene.get('GameScene').events.on('updateUI', this.updateUI, this);

    // Listen for wave events
    this.scene
      .get('GameScene')
      .events.on('waveStarted', this.onWaveStarted, this);
    this.scene
      .get('GameScene')
      .events.on('waveCompleted', this.onWaveCompleted, this);

    // Listen for game over
    this.scene.get('GameScene').events.on('gameOver', this.onGameOver, this);

    // Listen for messages
    this.scene
      .get('GameScene')
      .events.on('showMessage', this.showMessage, this);

    // Listen for tower info display
    this.scene.get('GameScene').events.on('showTowerInfo', this.showTowerInfo, this);

    // Hide tower info when clicking elsewhere (optional: could be improved)
    this.input.on('pointerdown', (pointer, currentlyOver) => {
      // If click is not on a UI element or tower info panel, hide it
      if (!currentlyOver.some((obj) => obj === this.towerInfoPanel)) {
        this.hideTowerInfo();
      }
    });

    // On game start, show lower bar
    this.scene.get('GameScene').events.on('gameStart', () => {
      this.isGameStopped = false;
      this.showLowerBar(true);
    });
  }

  updateUI(data) {
    // Update lives
    if (data.lives !== undefined) {
      this.lives = data.lives;
      this.livesText.setText(`Lives: ${this.lives}`);
    }

    // Update money
    if (data.money !== undefined) {
      this.money = data.money;
      this.moneyText.setText(`Gold: ${this.money}`);

      // Update tower button states based on affordability
      this.updateTowerButtonStates();
    }

    // Update wave
    if (data.wave !== undefined) {
      this.wave = data.wave;

      // Get total waves from WaveManager
      const totalWaves = this.scene
        .get('GameScene')
        .waveManager.getTotalWaves();
      this.waveText.setText(`Wave: ${this.wave}/${totalWaves}`);
    }
  }

  updateTowerButtonStates() {
    // Update tower buttons based on whether player can afford them
    for (const towerButton of this.towerButtons) {
      const towerCost = window.GAME_SETTINGS.TOWERS[towerButton.type].cost;

      // Check if player can afford this tower
      if (this.money >= towerCost) {
        towerButton.costText.setFill('#ffff00');
        towerButton.button.setInteractive();
      } else {
        towerButton.costText.setFill('#ff0000');

        // Keep button interactive but show feedback when clicked
        if (!towerButton.button.input) {
          towerButton.button.setInteractive();
        }
      }
    }
  }

  selectTower(type) {
    // Update selected tower
    this.selectedTower = type;

    // Update button appearances
    for (const towerButton of this.towerButtons) {
      if (towerButton.type === type) {
        towerButton.button.setFillStyle(0x888888);
      } else {
        towerButton.button.setFillStyle(0x444444);
      }
    }

    // Update game registry so GameScene knows which tower is selected
    this.registry.set('selectedTower', type);
  }

  /**
   * Show a large animated banner for wave events
   */
  showWaveBanner(text, color = '#ffff00') {
    // Remove existing banner if present
    if (this.waveBanner) {
      this.waveBanner.destroy();
    }
    const banner = this.add.text(640, 120, text, {
      fontSize: '56px',
      fill: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
    });
    banner.setOrigin(0.5, 0.5);
    banner.setAlpha(0);
    this.waveBanner = banner;

    // Animate in, hold, then out
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 350,
      yoyo: false,
      onComplete: () => {
        this.time.delayedCall(1100, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            duration: 400,
            onComplete: () => {
              banner.destroy();
            },
          });
        });
      },
    });
  }

  onWaveStarted(waveNumber) {
    if (this.lowerBarVisible) this.hideLowerBar();
    // Update wave number
    this.wave = waveNumber;
    this.waveText.setText(
      `Wave: ${this.wave}/${window.GAME_SETTINGS.WAVES.length}`
    );

    // Disable wave button during wave
    this.setWaveButtonEnabled(false);
    this.waveButtonText.setText('Wave in Progress');

    // Show animated wave start banner
    this.showWaveBanner(`Wave ${this.wave} Start!`, '#00ff88');
  }

  onWaveCompleted(waveNumber) {
    this.showLowerBar(true); // Always show after wave
    // Enable wave button for next wave
    this.setWaveButtonEnabled(true);
    this.waveButtonText.setText('Start Next Wave');

    // Show animated wave completed banner
    this.showWaveBanner(`Wave ${waveNumber} Complete!`, '#ffff00');
  }

  onGameOver(data) {
    this.isGameStopped = true;
    this.showLowerBar(true); // Always show on game over
    // Show game over message only for defeat
    if (!data.victory) {
      this.showMessage('Game Over!\nYour base was destroyed!', 0);
    }

    // Disable wave button
    this.setWaveButtonEnabled(false);
    this.waveButtonText.setText(data.victory ? 'Victory!' : 'Game Over');

    console.log(`UIScene.onGameOver called with victory=${data.victory}`);
  }

  showMessage(message, duration = 2000) {
    // Show message
    this.messageText.setText(message);
    this.messageText.setVisible(true);
    this.messageBackground.setVisible(true);

    // Clear any existing timer
    if (this.messageTimer) {
      this.messageTimer.remove();
    }

    // Hide message after duration (if not permanent)
    if (duration > 0) {
      this.messageTimer = this.time.delayedCall(duration, () => {
        this.messageText.setVisible(false);
        this.messageBackground.setVisible(false);
      });
    }
  }

  setWaveButtonEnabled(enabled) {
    if (enabled) {
      this.waveButton.setFillStyle(0x00aa00);
      this.waveButton.setInteractive();
    } else {
      this.waveButton.setFillStyle(0x555555);
      this.waveButton.disableInteractive();
    }
  }

  getTowerColor(type) {
    // Return a color based on tower type
    switch (type) {
      case 'BASIC':
        return 0x0000ff;
      case 'AOE':
        return 0xff0000;
      case 'SLOW':
        return 0x00ffff;
      case 'SNIPER':
        return 0xaa00ff;
      case 'MULTISHOT':
        return 0xff8800;
      case 'SUPPORT':
        return 0x00ff00;
      default:
        return 0xffffff;
    }
  }

  // Helper to determine if a wave is currently active (in progress)
  isWaveActive() {
    const gameScene = this.scene.get('GameScene');
    return !this.isGameStopped && gameScene.waveManager && gameScene.waveManager.isWaveInProgress();
  }

  // Helper to determine if wave is paused or stopped
  isWavePausedOrStopped() {
    // Returns true if the game is paused, stopped, or between waves
    const gameScene = this.scene.get('GameScene');
    return this.isGameStopped || gameScene.isPaused || !gameScene.waveManager.isWaveInProgress();
  }

  // --- Lower bar fade logic ---
  showLowerBar(force = false) {
    if (this.lowerBarVisible && !force) return;
    this.lowerBarVisible = true;
    this.tweens.add({
      targets: this.lowerBarContainer,
      alpha: 1,
      duration: 250,
      ease: 'Sine.easeInOut',
    });
  }
  hideLowerBar(force = false) {
    // Only hide if a wave is running
    if (!this.isWaveActive() && !force) return;
    if (!this.lowerBarVisible && !force) return;
    this.lowerBarVisible = false;
    this.tweens.add({
      targets: this.lowerBarContainer,
      alpha: 0,
      duration: 250,
      ease: 'Sine.easeInOut',
    });
  }
}

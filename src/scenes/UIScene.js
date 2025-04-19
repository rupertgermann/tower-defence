import Phaser from 'phaser';
import UIButton from '../helpers/UIButton.js';
import ConfirmationDialog from '../helpers/ConfirmationDialog.js';
import UIHelpers, { getPriceColor, setButtonAffordability } from '../helpers/UIHelpers.js';

// General dialog style config for confirmation dialogs
const DIALOG_STYLE = {
  width: 420,
  height: 210,
  backgroundColor: 0x000000,
  backgroundAlpha: 0.6,
  borderColor: 0xffd700,
  borderThickness: 0,
  borderRadius: 16,
  padding: 32,
  fontFamily: 'courier',
  fontSize: 17,
  fontColor: '#fffbe7',
  buttonStyle: {
    backgroundColor: 0x009900, // MATCH Start Wave button
    backgroundAlpha: 1,
    borderColor: 0xffffff,
    borderThickness: 0,
    borderRadius: 10,
    fontFamily: 'courier',
    fontSize: 20,
    fontColor: '#fffbe7',
    hoverColor: 0x00aa00 // Lighter green for hover, matches pointerover in wave button
  }
};

// Centralized style config for all in-game messages (edit here for global changes)
const MESSAGE_STYLE = {
  fontSize: '22px',
  fontFamily: 'courier',
  color: '#fffbe7',
  backgroundColor: 0x000000,
  backgroundAlpha: 0.6,
  borderRadius: 8,
  padding: 16,
  width: 400,
  height: 100,
};

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
    this.lowerBarVisible = true;
    this.isGameStopped = true;

    // Store the current tower for live updates in the upgrade panel
    this.currentTowerForUpgradePanel = null;
    this._boundUpgradePanelGoldListener = null;
  }

  /**
   * Preload UI assets
   */
  preload() {
    // Load UI button images
    this.load.image('mute', 'assets/ui/mute.png');
    this.load.image('unmute', 'assets/ui/unmute.png');
    this.load.image('restart', 'assets/ui/restart.png');
    this.load.image('mainmenu', 'assets/ui/mainmenu.png');
  }

  /**
   * Show tower info panel when a tower is selected
   * @param {Tower} tower - The selected tower instance
   */
  showTowerInfo(tower) {
    // Defensive: skip if tower or tower.towerData is null
    if (!tower || !tower.towerData) {
      console.warn('[UIScene] showTowerInfo called with null/invalid tower:', tower);
      return;
    }
    // Remove existing panel if present
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy(true);
    }

    // Store the current tower for live updates
    this.currentTowerForUpgradePanel = tower;

    // Panel background
    const panelWidth = 320;
    const panelHeight = 220;
    const panelX = 1280 - panelWidth - 30;
    const panelY = 100;
    const panelBg = this.add.rectangle(
      0,
      0,
      panelWidth,
      panelHeight,
      0x222244,
      0.95
    );
    panelBg.setOrigin(0, 0);
    console.log('[TowerInfoPanel] Creating panelBg, calling setInteractive');
    panelBg.setInteractive();
    panelBg.on('pointerdown', (pointer) => {
      console.log('[TowerInfoPanel] panelBg pointerdown', pointer);
    });
    console.log('[TowerInfoPanel] panelBg depth:', panelBg.depth, 'input:', panelBg.input);

    // Create the panel container
    this.towerInfoPanel = this.add.container(panelX, panelY);
    this.towerInfoPanel.add(panelBg);
    console.log('[TowerInfoPanel] towerInfoPanel depth:', this.towerInfoPanel.depth);

    // Tower name
    const nameText = this.add.text(
      20,
      15,
      `Tower: ${tower.towerData.name || tower.type}`,
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
      `Damage: ${Math.round(tower.towerData.damage)}\nRange: ${Math.round(
        tower.towerData.range
      )}\nFire Rate: ${Math.round(tower.towerData.fireRate)}ms`,
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
        upgradeCost = Math.floor(tower.towerData.cost * 0.5);
      }
    }

    const canAffordUpgrade = this.money >= upgradeCost;
    const upgradeText = this.add.text(
      20,
      140,
      canUpgrade ? `Upgrade Cost: ${upgradeCost}g` : `Max Level Reached`,
      { fontSize: '16px', fill: getPriceColor(canUpgrade && canAffordUpgrade) }
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
      setButtonAffordability(upgradeBtn, canAffordUpgrade, 0x00aa00, 0x888888);

      const btnText = this.add.text(
        panelWidth - 70,
        panelHeight - 30,
        'Upgrade',
        {
          fontSize: '18px',
          fill: '#ffffff',
        }
      );
      btnText.setOrigin(0.5);
      this.towerInfoPanel.add(upgradeBtn);
      this.towerInfoPanel.add(btnText);

      // --- Always attach handler, check state inside ---
      upgradeBtn.on('pointerdown', () => {
        // Defensive: check if still interactive
        if (!upgradeBtn.input || !upgradeBtn.input.enabled) return;

        // LOG: Recalculate live state at click time
        const currentMoney = this.scene.get('GameScene').economyManager.getMoney();
        let canUpgrade = typeof tower.upgrade === 'function' && (!tower.maxLevel || tower.level < tower.maxLevel);
        let upgradeCost = 0;
        if (canUpgrade) {
          if (typeof tower.calculateUpgradeCost === 'function') {
            upgradeCost = tower.calculateUpgradeCost();
          } else {
            upgradeCost = Math.floor(tower.towerData.cost * 0.5);
          }
        }
        const canAffordUpgrade = currentMoney >= upgradeCost;
        console.log('[UpgradeBtn] Clicked. Gold:', currentMoney, 'UpgradeCost:', upgradeCost, 'canUpgrade:', canUpgrade, 'canAffordUpgrade:', canAffordUpgrade);

        // Check if can upgrade and can afford
        if (canUpgrade && canAffordUpgrade) {
          const audioManager = this.scene.get('GameScene').audioManager;
          if (audioManager) audioManager.playSound('upgrade');
          const upgraded = tower.upgrade();
          this.scene.get('GameScene').events.emit('updateUI', {
            money: this.scene.get('GameScene').economyManager.getMoney(),
          });
          this.hideTowerInfo();
        } else if (!canAffordUpgrade) {
          this.showMessage('Not enough gold to upgrade!', 1800);
        } else {
          this.showMessage('Cannot upgrade: \ninsufficient funds\nor max level reached.', 3000);
        }
      });
      console.log('[UpgradeBtn] Handler attached to upgradeBtn');
      // Optionally store references if you want to update on gold change
      this.upgradeBtn = upgradeBtn;
      this.upgradeText = upgradeText;
      this.upgradeCost = upgradeCost;
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

    // --- Listen for gold changes to update upgrade button state live ---
    const gameScene = this.scene.get('GameScene');
    if (!this._boundUpgradePanelGoldListener) {
      this._boundUpgradePanelGoldListener = this._onUpgradePanelGoldChanged.bind(this);
    }
    gameScene.events.on('updateUI', this._boundUpgradePanelGoldListener);
  }

  /**
   * Remove tower info panel if present
   */
  hideTowerInfo() {
    if (this.towerInfoPanel) {
      this.towerInfoPanel.destroy(true);
      this.towerInfoPanel = null;
    }
    // Remove gold change listener for upgrade panel
    const gameScene = this.scene.get('GameScene');
    if (this._boundUpgradePanelGoldListener) {
      gameScene.events.off('updateUI', this._boundUpgradePanelGoldListener);
    }
    // Remove all pointer events from upgradeBtn if present
    if (this.upgradeBtn) {
      this.upgradeBtn.removeAllListeners && this.upgradeBtn.removeAllListeners();
      this.upgradeBtn = null;
    }
    this.currentTowerForUpgradePanel = null;
  }

  /**
   * Live-update the upgrade button and price color if the panel is open and money changes
   */
  _onUpgradePanelGoldChanged(data) {
    if (!this.towerInfoPanel || !this.upgradeBtn || !this.upgradeText || !this.currentTowerForUpgradePanel) return;
    if (data.money === undefined) return;

    // Recalculate upgrade cost and affordability
    const tower = this.currentTowerForUpgradePanel;
    let canUpgrade = typeof tower.upgrade === 'function' && (!tower.maxLevel || tower.level < tower.maxLevel);
    let upgradeCost = 0;
    if (canUpgrade) {
      if (typeof tower.calculateUpgradeCost === 'function') {
        upgradeCost = tower.calculateUpgradeCost();
      } else {
        upgradeCost = Math.floor(tower.towerData.cost * 0.5);
      }
    }
    const canAffordUpgrade = data.money >= upgradeCost;

    // Update price color
    this.upgradeText.setFill(getPriceColor(canUpgrade && canAffordUpgrade));
    // Update button state
    setButtonAffordability(this.upgradeBtn, canAffordUpgrade, 0x00aa00, 0x888888);
  }

  create() {
    // Register shutdown handler for cleanup
    this.events.on('shutdown', this.shutdown, this);

    // Get initial values
    this.lives = window.GAME_SETTINGS.PLAYER.lives;
    this.money = window.GAME_SETTINGS.PLAYER.money;
    this.wave = 0;

    // Create UI container
    this.uiContainer = this.add.container(0, 0);

    // --- Top bar background ---
    this.topBarBackground = this.add.rectangle(0, 0, 1280, 80, 0x222222);
    this.topBarBackground.setOrigin(0, 0);
    this.topBarBackground.setAlpha(0.8);
    this.topBarBackground.setDepth(10);
    this.uiContainer.add(this.topBarBackground);

    // Create top-right buttons container (always new)
    this.topRightButtonsContainer = this.add.container(0, 0);
    this.topRightButtonsContainer.setDepth(20);
    this.uiContainer.add(this.topRightButtonsContainer);

    // --- Lower bar container for fade effect ---
    this.lowerBarContainer = this.add.container(0, 0);
    this.lowerBarContainer.setAlpha(1);
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
    // Create UI buttons (mute, restart, main menu)
    this.createUIButtons();
    // Listen for game events
    this.setupEventListeners();
    // Always show lower bar
    this.lowerBarVisible = true;
    if (this.lowerBarContainer) this.lowerBarContainer.setAlpha(1);

    // Pointer events for fade in/out on hover
    // this.input.on('pointermove', (pointer) => {
    //   if (!this.isWaveActive()) return;
    //   const y = pointer.y;
    //   if (y >= 620 && !this.lowerBarVisible) {
    //     this.showLowerBar();
    //   } else if (y < 620 && this.lowerBarVisible) {
    //     this.hideLowerBar();
    //   }
    // });
    // Fade out if mouse leaves the game canvas completely during an active wave
    // this.game.canvas.addEventListener('mouseleave', () => {
    //   if (this.lowerBarVisible && this.isWaveActive()) {
    //     this.hideLowerBar();
    //   }
    // });
  }

  createUIBackground() {
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
      0x009900
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
      this.waveButton.setFillStyle(0x00aa00);
    });

    this.waveButton.on('pointerout', () => {
      this.waveButton.setFillStyle(0x009900);
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
    // Use centralized MESSAGE_STYLE config
    this.messageConfig = { ...MESSAGE_STYLE };
    // Message background
    this.messageBackground = this.add.graphics();
    this.messageBackground.setDepth(100);
    this.messageBackground.setVisible(false);
    this.uiContainer.add(this.messageBackground);

    // Message text
    this.messageText = this.add.text(640, 360, '', {
      fontSize: this.messageConfig.fontSize,
      fontFamily: this.messageConfig.fontFamily,
      color: this.messageConfig.color,
      align: 'center',
      wordWrap: { width: this.messageConfig.width - 2 * this.messageConfig.padding }
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.messageText.setDepth(101);
    this.messageText.setVisible(false);
    this.uiContainer.add(this.messageText);
  }

  // --- Show message with custom style ---
  showMessage(message, duration = 2000, options = {}) {
    // Always merge MESSAGE_STYLE as the base config
    const cfg = { ...MESSAGE_STYLE, ...options };
    this.messageConfig = { ...cfg }; // Keep current config in sync
    // Set text and style
    this.messageText.setText(message);
    this.messageText.setStyle({
      fontSize: cfg.fontSize,
      fontFamily: cfg.fontFamily,
      color: cfg.color,
      align: 'center',
      wordWrap: { width: cfg.width - 2 * cfg.padding }
    });
    this.messageText.setVisible(true);

    // Calculate background size based on text
    const textBounds = this.messageText.getBounds();
    const bgWidth = Math.max(cfg.width, textBounds.width + 2 * cfg.padding);
    const bgHeight = Math.max(cfg.height, textBounds.height + 2 * cfg.padding);
    this.messageBackground.clear();
    this.messageBackground.fillStyle(cfg.backgroundColor, cfg.backgroundAlpha);
    // Draw rounded rectangle
    this.messageBackground.fillRoundedRect(
      640 - bgWidth / 2,
      360 - bgHeight / 2,
      bgWidth,
      bgHeight,
      cfg.borderRadius
    );
    this.messageBackground.setVisible(true);

    // Bring to top
    this.messageBackground.setDepth(100);
    this.messageText.setDepth(101);

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
      console.log('[UIScene] Scene pointerdown', pointer, 'currentlyOver:', currentlyOver);
      // If the tower info panel is open
      if (this.towerInfoPanel) {
        // Gather all objects that are part of the panel (panel + children)
        const panelObjects = [this.towerInfoPanel];
        if (this.towerInfoPanel.getAll) {
          panelObjects.push(...this.towerInfoPanel.getAll());
        } else if (this.towerInfoPanel.list) {
          panelObjects.push(...this.towerInfoPanel.list);
        }
        // If click is NOT on the panel or any of its children, hide it
        if (!currentlyOver.some(obj => panelObjects.includes(obj))) {
          this.hideTowerInfo();
        }
      } else {
        // If no panel, old logic (optional: could skip)
        if (!currentlyOver.some(obj => obj === this.towerInfoPanel)) {
          this.hideTowerInfo();
        }
      }
    });

    // On game start, show lower bar
    this.scene.get('GameScene').events.on('gameStart', () => {
      this.isGameStopped = false;
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
      // Defensive: Check for destroyed/null buttons and texts
      if (!towerButton || !towerButton.button || !towerButton.costText) {
        console.warn('[updateTowerButtonStates] Skipping invalid towerButton:', towerButton);
        continue;
      }
      if (towerButton.button.destroyed || towerButton.costText.destroyed) {
        console.warn('[updateTowerButtonStates] Skipping destroyed button or costText:', towerButton);
        continue;
      }
      const towerCost = window.GAME_SETTINGS.TOWERS[towerButton.type].cost;
      const canAfford = this.money >= towerCost;
      towerButton.costText.setFill(getPriceColor(canAfford));
      setButtonAffordability(towerButton.button, canAfford, 0x444444, 0x888888);
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
    // Enable wave button for next wave
    this.setWaveButtonEnabled(true);
    this.waveButtonText.setText('Start Next Wave');

    // Show animated wave completed banner
    this.showWaveBanner(`Wave ${waveNumber} Complete!`, '#ffff00');
  }

  onGameOver(data) {
    this.isGameStopped = true;
    // Show game over message only for defeat
    if (!data.victory) {
      this.showMessage('Game Over!\nYour base was destroyed!', 0);
    }

    // Disable wave button
    this.setWaveButtonEnabled(false);
    this.waveButtonText.setText(data.victory ? 'Victory!' : 'Game Over');
    
    // Update UI button states for game over
    this.updateUIButtonStates(true);

    console.log(`UIScene.onGameOver called with victory=${data.victory}`);
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
    // Deprecated: Lower bar is always visible now
  }

  hideLowerBar(force = false) {
    // Deprecated: Lower bar is always visible now
  }

  /**
   * Create UI buttons (mute, restart, main menu)
   */
  createUIButtons() {
    // Use Phaser's global sound mute for robust, best-practice muting
    this.isMuted = this.sound.mute;

    // Button spacing
    const buttonSize = 40;
    const buttonPadding = 10;
    const startX = 1280 - buttonSize - 10;
    const buttonY = 30; // Move buttons down slightly
    
    // Create top-right buttons container with higher depth
    this.topRightButtonsContainer.setDepth(100); // Ensure buttons appear above other UI elements
    
    // Create mute button
    this.muteButton = new UIButton(this, startX, buttonY, {
      image: 'mute',
      toggleImage: 'unmute',
      isToggle: true,
      initialState: this.isMuted,
      tooltip: 'Mute',
      width: buttonSize,
      height: buttonSize,
      callback: (isToggled) => {
        this.isMuted = isToggled;
        this.sound.mute = this.isMuted; // Phaser best practice: mute all audio globally
        this.muteButton.setTooltip(this.isMuted ? 'Unmute' : 'Mute');
      }
    });
    
    this.topRightButtonsContainer.add(this.muteButton.container);

    // Create restart button
    this.restartButton = new UIButton(this, startX - (buttonSize + buttonPadding), buttonY, {
      image: 'restart',
      tooltip: 'Restart Game',
      width: buttonSize,
      height: buttonSize,
      callback: () => {
        // Create confirmation dialog
        if (!this.restartDialog) {
          this.restartDialog = new ConfirmationDialog(this, {
            message: 'Are you sure you want to\nrestart the game?\n\nAll progress will be lost.',
            onConfirm: () => {
              // Restart the current game
              const gameScene = this.scene.get('GameScene');
              gameScene.scene.restart();
              this.scene.restart();
            },
            ...DIALOG_STYLE
          });
        }
        
        this.restartDialog.show();
      }
    });
    
    this.topRightButtonsContainer.add(this.restartButton.container);

    // Create main menu button
    this.mainMenuButton = new UIButton(this, startX - 2 * (buttonSize + buttonPadding), buttonY, {
      image: 'mainmenu',
      tooltip: 'Quit to Main Menu',
      width: buttonSize,
      height: buttonSize,
      callback: () => {
        // Create confirmation dialog
        if (!this.mainMenuDialog) {
          this.mainMenuDialog = new ConfirmationDialog(this, {
            message: 'Are you sure you want to\nquit to the main menu?\n\nAll progress will be lost.',
            onConfirm: () => {
              // Return to map select scene
              this.scene.stop('GameScene');
              this.scene.stop('UIScene');
              this.scene.start('MapSelectScene');
            },
            ...DIALOG_STYLE
          });
        }
        
        this.mainMenuDialog.show();
      }
    });
    
    this.topRightButtonsContainer.add(this.mainMenuButton.container);
    
    // Set initial button states
    this.updateUIButtonStates(false);
  }
  
  /**
   * Update UI button states based on game state
   * @param {boolean} isGameOver - Whether the game is in an end state
   */
  updateUIButtonStates(isGameOver) {
    // Mute button is always enabled
    
    // Restart and main menu buttons are always visible but may be disabled in certain states
    if (isGameOver) {
      // During victory/defeat, enable restart and main menu buttons after a short delay
      // to prevent accidental clicks
      this.time.delayedCall(1000, () => {
        if (this.restartButton) this.restartButton.setEnabled(true);
        if (this.mainMenuButton) this.mainMenuButton.setEnabled(true);
      });
    } else {
      // During normal gameplay, enable restart and main menu buttons
      if (this.restartButton) this.restartButton.setEnabled(true);
      if (this.mainMenuButton) this.mainMenuButton.setEnabled(true);
    }
  }

  shutdown() {
    // Destroy UI buttons if they exist
    if (this.muteButton) {
      this.muteButton.destroy();
      this.muteButton = null;
    }
    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
    }
    if (this.mainMenuButton) {
      this.mainMenuButton.destroy();
      this.mainMenuButton = null;
    }
    // Destroy top-right buttons container (always)
    if (this.topRightButtonsContainer) {
      this.topRightButtonsContainer.destroy(true);
      this.topRightButtonsContainer = null;
    }
    // Destroy dialogs if they exist
    if (this.restartDialog) {
      this.restartDialog.destroy();
      this.restartDialog = null;
    }
    if (this.mainMenuDialog) {
      this.mainMenuDialog.destroy();
      this.mainMenuDialog = null;
    }
    // Destroy all tower buttons and their text objects
    if (this.towerButtons && Array.isArray(this.towerButtons)) {
      for (const towerButton of this.towerButtons) {
        if (towerButton.button && towerButton.button.destroy) towerButton.button.destroy();
        if (towerButton.costText && towerButton.costText.destroy) towerButton.costText.destroy();
        if (towerButton.nameText && towerButton.nameText.destroy) towerButton.nameText.destroy();
      }
      this.towerButtons = [];
    }
    // Remove event listeners from GameScene
    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.events) {
      gameScene.events.off('updateUI', this.updateUI, this);
      gameScene.events.off('waveStarted', this.onWaveStarted, this);
      gameScene.events.off('waveCompleted', this.onWaveCompleted, this);
      gameScene.events.off('gameOver', this.onGameOver, this);
      gameScene.events.off('showMessage', this.showMessage, this);
      gameScene.events.off('showTowerInfo', this.showTowerInfo, this);
      gameScene.events.off('gameStart');
    }

    // Remove pointer event listeners
    this.input.off('pointerdown');
    // Remove canvas event listener
    this.game.canvas.removeEventListener('mouseleave', this.hideLowerBar);
  }
}

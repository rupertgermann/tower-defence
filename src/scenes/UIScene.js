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
    }

    create() {
        // Get initial values
        this.lives = window.GAME_SETTINGS.PLAYER.lives;
        this.money = window.GAME_SETTINGS.PLAYER.money;
        this.wave = 0;
        
        // Create UI container
        this.uiContainer = this.add.container(0, 0);
        
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
        this.uiContainer.add(bottomBar);
    }

    createStatusDisplays() {
        // Lives display
        const livesIcon = this.add.circle(30, 40, 15, 0xff0000);
        this.uiContainer.add(livesIcon);
        
        this.livesText = this.add.text(55, 30, `Lives: ${this.lives}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        this.uiContainer.add(this.livesText);
        
        // Money display
        const moneyIcon = this.add.circle(200, 40, 15, 0xffff00);
        this.uiContainer.add(moneyIcon);
        
        this.moneyText = this.add.text(225, 30, `Gold: ${this.money}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        this.uiContainer.add(this.moneyText);
        
        // Wave display
        const waveIcon = this.add.circle(400, 40, 15, 0x00ffff);
        this.uiContainer.add(waveIcon);
        
        this.waveText = this.add.text(425, 30, `Wave: ${this.wave}/${window.GAME_SETTINGS.WAVES.length}`, {
            fontSize: '24px',
            fill: '#ffffff'
        });
        this.uiContainer.add(this.waveText);
    }

    createTowerButtons() {
        const buttonWidth = 120;
        const buttonHeight = 80;
        const padding = 20;
        const startX = 100;
        const startY = 720 - 90;
        
        // Create buttons for each tower type
        const towerTypes = Object.keys(window.GAME_SETTINGS.TOWERS);
        
        towerTypes.forEach((type, index) => {
            const towerData = window.GAME_SETTINGS.TOWERS[type];
            const x = startX + (buttonWidth + padding) * index;
            
            // Button background
            const button = this.add.rectangle(x, startY, buttonWidth, buttonHeight, 0x444444);
            button.setOrigin(0, 0);
            button.setInteractive();
            button.towerType = type;
            
            // Tower icon
            const icon = this.add.circle(x + buttonWidth / 2, startY + 25, 15, this.getTowerColor(type));
            
            // Tower name
            const nameText = this.add.text(x + buttonWidth / 2, startY + 50, towerData.name, {
                fontSize: '14px',
                fill: '#ffffff'
            });
            nameText.setOrigin(0.5, 0);
            
            // Tower cost
            const costText = this.add.text(x + buttonWidth / 2, startY + 70, `${towerData.cost}g`, {
                fontSize: '12px',
                fill: '#ffff00'
            });
            costText.setOrigin(0.5, 0);
            
            // Add to container
            this.uiContainer.add(button);
            this.uiContainer.add(icon);
            this.uiContainer.add(nameText);
            this.uiContainer.add(costText);
            
            // Store button reference
            this.towerButtons.push({
                button,
                icon,
                nameText,
                costText,
                type
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
        this.waveButton = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x00aa00);
        this.waveButton.setOrigin(0, 0);
        this.waveButton.setInteractive();
        
        // Button text
        this.waveButtonText = this.add.text(x + buttonWidth / 2, y + buttonHeight / 2, 'Start Wave', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.waveButtonText.setOrigin(0.5, 0.5);
        
        // Add to container
        this.uiContainer.add(this.waveButton);
        this.uiContainer.add(this.waveButtonText);
        
        // Set up event handlers
        this.waveButton.on('pointerover', () => {
            this.waveButton.setFillStyle(0x00cc00);
        });
        
        this.waveButton.on('pointerout', () => {
            this.waveButton.setFillStyle(0x00aa00);
        });
        
        this.waveButton.on('pointerdown', () => {
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
            align: 'center'
        });
        this.messageText.setOrigin(0.5, 0.5);
        this.messageText.setVisible(false);
        this.uiContainer.add(this.messageText);
    }

    setupEventListeners() {
        // Listen for UI update events from game scene
        this.scene.get('GameScene').events.on('updateUI', this.updateUI, this);
        
        // Listen for wave events
        this.scene.get('GameScene').events.on('waveStarted', this.onWaveStarted, this);
        this.scene.get('GameScene').events.on('waveCompleted', this.onWaveCompleted, this);
        
        // Listen for game over
        this.scene.get('GameScene').events.on('gameOver', this.onGameOver, this);
        
        // Listen for messages
        this.scene.get('GameScene').events.on('showMessage', this.showMessage, this);
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
            this.waveText.setText(`Wave: ${this.wave}/${window.GAME_SETTINGS.WAVES.length}`);
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

    onWaveStarted(waveNumber) {
        // Update wave number
        this.wave = waveNumber;
        this.waveText.setText(`Wave: ${this.wave}/${window.GAME_SETTINGS.WAVES.length}`);
        
        // Disable wave button during wave
        this.setWaveButtonEnabled(false);
        this.waveButtonText.setText('Wave in Progress');
    }

    onWaveCompleted(waveNumber) {
        // Enable wave button for next wave
        this.setWaveButtonEnabled(true);
        this.waveButtonText.setText('Start Next Wave');
        
        // Show wave completed message
        this.showMessage(`Wave ${waveNumber} Completed!`);
    }

    onGameOver(data) {
        // Show game over message
        if (data.victory) {
            this.showMessage('Victory!\nAll waves defeated!', 0);
        } else {
            this.showMessage('Game Over!\nYour base was destroyed!', 0);
        }
        
        // Disable wave button
        this.setWaveButtonEnabled(false);
        this.waveButtonText.setText('Game Over');
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
            default:
                return 0xffffff;
        }
    }
}
console.log('Debugging wave start');

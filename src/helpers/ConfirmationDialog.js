/**
 * ConfirmationDialog.js - A reusable confirmation dialog for Phaser games
 * 
 * This class creates a modal dialog with a message and Yes/No buttons.
 * It's designed to be used for confirming potentially destructive actions
 * like restarting a game or returning to the main menu.
 */

import Phaser from 'phaser';

export default class ConfirmationDialog {
  /**
   * Create a new confirmation dialog
   * @param {Phaser.Scene} scene - The scene this dialog belongs to
   * @param {Object} config - Dialog configuration
   * @param {string} config.message - Message to display in the dialog
   * @param {Function} config.onConfirm - Function to call when 'Yes' is clicked
   * @param {Function} [config.onCancel] - Function to call when 'No' is clicked
   * @param {number} [config.width=400] - Width of the dialog
   * @param {number} [config.height=200] - Height of the dialog
   * @param {number} [config.backgroundColor=0x333333] - Background color of the dialog
   * @param {number} [config.backgroundAlpha=0.95] - Background alpha of the dialog
   * @param {number} [config.borderColor=0xffffff] - Border color of the dialog
   * @param {number} [config.borderThickness=2] - Border thickness of the dialog
   * @param {number} [config.borderRadius=0] - Border radius of the dialog
   * @param {number} [config.padding=24] - Padding of the dialog
   * @param {string} [config.fontFamily='Arial'] - Font family of the dialog text
   * @param {number} [config.fontSize=24] - Font size of the dialog text
   * @param {string} [config.fontColor='#ffffff'] - Font color of the dialog text
   * @param {Object} [config.buttonStyle] - Style configuration for the buttons
   * @param {number} [config.buttonStyle.backgroundColor=0x4444aa] - Background color of the buttons
   * @param {number} [config.buttonStyle.backgroundAlpha=1] - Background alpha of the buttons
   * @param {number} [config.buttonStyle.borderColor=0xffffff] - Border color of the buttons
   * @param {number} [config.buttonStyle.borderThickness=2] - Border thickness of the buttons
   * @param {number} [config.buttonStyle.borderRadius=6] - Border radius of the buttons
   * @param {string} [config.buttonStyle.fontFamily='Arial'] - Font family of the button text
   * @param {number} [config.buttonStyle.fontSize=20] - Font size of the button text
   * @param {string} [config.buttonStyle.fontColor='#ffffff'] - Font color of the button text
   * @param {number} [config.buttonStyle.hoverColor=0x8888ff] - Hover color of the buttons
   */
  constructor(scene, config) {
    this.scene = scene;
    this.config = {
      message: config.message,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || (() => {}),
      width: config.width || 400,
      height: config.height || 200,
      backgroundColor: config.backgroundColor || 0x333333,
      backgroundAlpha: typeof config.backgroundAlpha === 'number' ? config.backgroundAlpha : 0.95,
      borderColor: config.borderColor || 0xffffff,
      borderThickness: typeof config.borderThickness === 'number' ? config.borderThickness : 2,
      borderRadius: typeof config.borderRadius === 'number' ? config.borderRadius : 0,
      padding: typeof config.padding === 'number' ? config.padding : 24,
      fontFamily: config.fontFamily || 'Arial',
      fontSize: config.fontSize || 24,
      fontColor: config.fontColor || '#ffffff',
      buttonStyle: {
        backgroundColor: config.buttonStyle?.backgroundColor || 0x4444aa,
        backgroundAlpha: typeof config.buttonStyle?.backgroundAlpha === 'number' ? config.buttonStyle.backgroundAlpha : 1,
        borderColor: config.buttonStyle?.borderColor || 0xffffff,
        borderThickness: typeof config.buttonStyle?.borderThickness === 'number' ? config.buttonStyle.borderThickness : 2,
        borderRadius: typeof config.buttonStyle?.borderRadius === 'number' ? config.buttonStyle.borderRadius : 6,
        fontFamily: config.buttonStyle?.fontFamily || 'Arial',
        fontSize: config.buttonStyle?.fontSize || 20,
        fontColor: config.buttonStyle?.fontColor || '#ffffff',
        hoverColor: config.buttonStyle?.hoverColor || 0x8888ff
      }
    };

    // Merge style config
    const style = {
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      backgroundAlpha: this.config.backgroundAlpha,
      borderColor: this.config.borderColor,
      borderThickness: this.config.borderThickness,
      borderRadius: this.config.borderRadius,
      padding: this.config.padding,
      fontFamily: this.config.fontFamily,
      fontSize: this.config.fontSize,
      fontColor: this.config.fontColor,
      buttonStyle: this.config.buttonStyle
    };
    this.style = style;

    // Create container for all dialog elements
    this.container = scene.add.container(640, 360); // Center of screen (assuming 1280x720)
    this.container.setDepth(1000); // Ensure it's above other UI elements
    this.container.setVisible(false); // Start hidden

    // Create semi-transparent background overlay (covers entire screen)
    this.overlay = scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7);
    this.overlay.setOrigin(0.5, 0.5);
    this.overlay.x = -640; // Adjust for container position
    this.overlay.y = -360; // Adjust for container position
    this.container.add(this.overlay);

    // Create dialog background with styling
    this.background = scene.add.rectangle(
      0, 0,
      style.width,
      style.height,
      style.backgroundColor,
      style.backgroundAlpha
    );
    this.background.setOrigin(0.5, 0.5);
    this.background.setStrokeStyle(style.borderThickness, style.borderColor);
    if (style.borderRadius > 0 && this.background.setRadius) {
      this.background.setRadius(style.borderRadius);
    }
    this.container.add(this.background);

    // Create message text with styling
    this.messageText = scene.add.text(0, -40, this.config.message, {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize + 'px',
      fill: style.fontColor,
      align: 'center',
      wordWrap: { width: style.width - 2 * style.padding }
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.container.add(this.messageText);

    // Create 'Yes' button with styling
    this.yesButton = scene.add.rectangle(-80, 50, 100, 40, style.buttonStyle.backgroundColor, style.buttonStyle.backgroundAlpha);
    this.yesButton.setOrigin(0.5, 0.5);
    this.yesButton.setInteractive({ useHandCursor: true });
    this.container.add(this.yesButton);

    this.yesText = scene.add.text(-80, 50, 'Yes', {
      fontFamily: style.buttonStyle.fontFamily,
      fontSize: style.buttonStyle.fontSize + 'px',
      fill: style.buttonStyle.fontColor
    });
    this.yesText.setOrigin(0.5, 0.5);
    this.container.add(this.yesText);

    // Create 'No' button with styling
    this.noButton = scene.add.rectangle(80, 50, 100, 40, style.buttonStyle.backgroundColor, style.buttonStyle.backgroundAlpha);
    this.noButton.setOrigin(0.5, 0.5);
    this.noButton.setInteractive({ useHandCursor: true });
    this.container.add(this.noButton);

    this.noText = scene.add.text(80, 50, 'No', {
      fontFamily: style.buttonStyle.fontFamily,
      fontSize: style.buttonStyle.fontSize + 'px',
      fill: style.buttonStyle.fontColor
    });
    this.noText.setOrigin(0.5, 0.5);
    this.container.add(this.noText);

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up all event handlers for the dialog
   * @private
   */
  setupEventHandlers() {
    // 'Yes' button events
    this.yesButton.on('pointerover', () => {
      this.yesButton.setFillStyle(this.style.buttonStyle.hoverColor);
    });

    this.yesButton.on('pointerout', () => {
      this.yesButton.setFillStyle(this.style.buttonStyle.backgroundColor);
    });

    this.yesButton.on('pointerdown', () => {
      // Play UI click sound if available
      const audioManager = this.scene.scene.get('GameScene').audioManager;
      if (audioManager && typeof audioManager.playSound === 'function') {
        audioManager.playSound('ui_click');
      }
      
      this.hide();
      if (typeof this.config.onConfirm === 'function') {
        this.config.onConfirm();
      }
    });

    // 'No' button events
    this.noButton.on('pointerover', () => {
      this.noButton.setFillStyle(this.style.buttonStyle.hoverColor);
    });

    this.noButton.on('pointerout', () => {
      this.noButton.setFillStyle(this.style.buttonStyle.backgroundColor);
    });

    this.noButton.on('pointerdown', () => {
      // Play UI click sound if available
      const audioManager = this.scene.scene.get('GameScene').audioManager;
      if (audioManager && typeof audioManager.playSound === 'function') {
        audioManager.playSound('ui_click');
      }
      
      this.hide();
      if (typeof this.config.onCancel === 'function') {
        this.config.onCancel();
      }
    });

    // Prevent clicks on the overlay from closing the dialog
    this.overlay.setInteractive();
    this.overlay.on('pointerdown', (pointer) => {
      // Stop event propagation
      pointer.event.stopPropagation();
    });
  }

  /**
   * Show the dialog
   */
  show() {
    this.container.setVisible(true);
    
    // Add a small animation for better UX
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.8, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Hide the dialog
   */
  hide() {
    // Animate out
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 1, to: 0.8 },
      alpha: { from: 1, to: 0 },
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
        this.container.setScale(1);
        this.container.setAlpha(1);
      }
    });
  }

  /**
   * Update the dialog message
   * @param {string} message - New message text
   */
  setMessage(message) {
    this.config.message = message;
    this.messageText.setText(message);
  }

  /**
   * Clean up and destroy the dialog
   */
  destroy() {
    this.yesButton.removeAllListeners();
    this.noButton.removeAllListeners();
    this.overlay.removeAllListeners();
    this.container.destroy(true);
  }
}

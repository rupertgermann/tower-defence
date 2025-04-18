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
   */
  constructor(scene, config) {
    this.scene = scene;
    this.config = {
      message: config.message,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel || (() => {}),
      width: config.width || 400,
      height: config.height || 200
    };

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

    // Create dialog background
    this.background = scene.add.rectangle(
      0, 0, 
      this.config.width, 
      this.config.height, 
      0x333333, 
      0.95
    );
    this.background.setOrigin(0.5, 0.5);
    this.background.setStrokeStyle(2, 0xffffff);
    this.container.add(this.background);

    // Create message text
    this.messageText = scene.add.text(0, -40, this.config.message, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: this.config.width - 40 }
    });
    this.messageText.setOrigin(0.5, 0.5);
    this.container.add(this.messageText);

    // Create 'Yes' button
    this.yesButton = scene.add.rectangle(-80, 50, 100, 40, 0x00aa00);
    this.yesButton.setOrigin(0.5, 0.5);
    this.yesButton.setInteractive({ useHandCursor: true });
    this.container.add(this.yesButton);

    this.yesText = scene.add.text(-80, 50, 'Yes', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.yesText.setOrigin(0.5, 0.5);
    this.container.add(this.yesText);

    // Create 'No' button
    this.noButton = scene.add.rectangle(80, 50, 100, 40, 0xaa0000);
    this.noButton.setOrigin(0.5, 0.5);
    this.noButton.setInteractive({ useHandCursor: true });
    this.container.add(this.noButton);

    this.noText = scene.add.text(80, 50, 'No', {
      fontSize: '20px',
      fill: '#ffffff'
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
      this.yesButton.setFillStyle(0x00cc00);
    });

    this.yesButton.on('pointerout', () => {
      this.yesButton.setFillStyle(0x00aa00);
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
      this.noButton.setFillStyle(0xcc0000);
    });

    this.noButton.on('pointerout', () => {
      this.noButton.setFillStyle(0xaa0000);
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

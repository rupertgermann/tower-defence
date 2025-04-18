import Phaser from 'phaser';

/**
 * Reusable modal confirmation dialog overlay
 * Blocks input to the main game while open
 * Calls onConfirm if user clicks Yes, onCancel otherwise
 */
export default class ConfirmationDialog extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {string} message
   * @param {function} onConfirm
   * @param {function} onCancel
   */
  constructor(scene, message, onConfirm, onCancel) {
    super(scene, 640, 360);
    this.scene = scene;
    this.setDepth(10000);
    // Fullscreen overlay
    this.overlay = scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7);
    this.overlay.setOrigin(0.5);
    this.add(this.overlay);
    // Dialog box
    this.box = scene.add.rectangle(0, 0, 420, 200, 0x222244, 0.98);
    this.box.setOrigin(0.5);
    this.add(this.box);
    // Message
    this.msgText = scene.add.text(0, -40, message, {
      fontSize: '26px', fill: '#fff', align: 'center', wordWrap: { width: 380 }
    });
    this.msgText.setOrigin(0.5);
    this.add(this.msgText);
    // Yes button
    this.yesBtn = scene.add.rectangle(-70, 50, 110, 48, 0x00aa00);
    this.yesBtn.setOrigin(0.5);
    this.yesBtn.setInteractive();
    this.yesText = scene.add.text(-70, 50, 'Yes', { fontSize: '22px', fill: '#fff' });
    this.yesText.setOrigin(0.5);
    this.add(this.yesBtn);
    this.add(this.yesText);
    // No button
    this.noBtn = scene.add.rectangle(70, 50, 110, 48, 0xaa0000);
    this.noBtn.setOrigin(0.5);
    this.noBtn.setInteractive();
    this.noText = scene.add.text(70, 50, 'No', { fontSize: '22px', fill: '#fff' });
    this.noText.setOrigin(0.5);
    this.add(this.noBtn);
    this.add(this.noText);
    // Button events
    this.yesBtn.on('pointerdown', () => { this.destroy(); if (onConfirm) onConfirm(); });
    this.noBtn.on('pointerdown', () => { this.destroy(); if (onCancel) onCancel(); });
    // Prevent pointer events to game
    scene.input.once('gameobjectdown', (pointer, gameObject) => {
      if (gameObject === this.overlay) {
        // Click outside does nothing
      }
    });
    scene.add.existing(this);
  }
}

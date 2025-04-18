// UIButton.js
// Generic UI button class for Phaser 3

import Phaser from 'phaser';

/**
 * Generic UI Button for Phaser 3
 * Handles icon/image, position, interactivity, tooltips, and visual feedback.
 * Supports toggling, enabling/disabling, layering, and callback actions.
 */
export default class UIButton extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - The scene this button belongs to.
   * @param {number} x - X position.
   * @param {number} y - Y position.
   * @param {object} config - { icon, tooltip, onClick, toggle, enabled, size, layer }
   */
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.scene = scene;
    this.iconKey = config.icon;
    this.tooltipText = config.tooltip || '';
    this.onClick = config.onClick || (() => {});
    this.toggle = !!config.toggle;
    this.toggled = false;
    this.enabled = config.enabled !== undefined ? config.enabled : true;
    this.size = config.size || 48;
    this.layer = config.layer || 0;

    // Icon image
    this.icon = scene.add.image(0, 0, this.iconKey)
      .setDisplaySize(this.size, this.size)
      .setInteractive({ useHandCursor: true })
      .setAlpha(this.enabled ? 1 : 0.5);
    this.add(this.icon);

    // Tooltip (hidden by default)
    this.tooltip = scene.add.text(0, this.size / 2 + 8, this.tooltipText, {
      font: '16px Arial',
      fill: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
    }).setOrigin(0.5, 0).setAlpha(0);
    this.add(this.tooltip);

    // Interactivity
    this.icon.on('pointerover', () => {
      if (!this.enabled) return;
      this.icon.setScale(1.1);
      this.tooltip.setAlpha(1);
    });
    this.icon.on('pointerout', () => {
      this.icon.setScale(1);
      this.tooltip.setAlpha(0);
    });
    this.icon.on('pointerdown', () => {
      if (!this.enabled) return;
      this.icon.setScale(0.95);
    });
    this.icon.on('pointerup', () => {
      if (!this.enabled) return;
      this.icon.setScale(1.1);
      if (this.toggle) this.setToggled(!this.toggled);
      this.onClick(this.toggled);
    });

    // Set layering
    this.setDepth(this.layer);

    // Add to scene
    scene.add.existing(this);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.icon.setAlpha(enabled ? 1 : 0.5);
    this.icon.disableInteractive();
    if (enabled) this.icon.setInteractive({ useHandCursor: true });
  }

  setToggled(toggled) {
    this.toggled = toggled;
    // Optionally switch icon or tint for toggled state
    if (this.toggle) {
      this.icon.setTint(toggled ? 0xaaaaaa : 0xffffff);
    }
  }

  setIcon(iconKey) {
    this.iconKey = iconKey;
    this.icon.setTexture(iconKey);
  }

  setTooltip(text) {
    this.tooltipText = text;
    this.tooltip.setText(text);
  }
}

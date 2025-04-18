import Phaser from 'phaser';

/**
 * Generic UIButton for all UI buttons (mute, restart, main menu, etc.)
 * Handles icon, position, interactivity, tooltips, feedback, toggling, enabling/disabling.
 */
export default class UIButton extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene - The scene this button belongs to
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {object} config - { iconKey, tooltip, onClick, toggle, initialState, enabled, size }
   */
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.scene = scene;
    this.iconKey = config.iconKey;
    this.tooltip = config.tooltip || '';
    this.onClick = config.onClick;
    this.toggle = !!config.toggle;
    this.enabled = config.enabled !== false;
    this.size = config.size || 64;
    this.state = config.initialState || false;
    this.icons = config.icons || null; // {on: 'mute', off: 'unmute'} for toggle

    // Button background
    this.bg = scene.add.rectangle(0, 0, this.size, this.size, 0x222222, 0.8);
    this.bg.setOrigin(0.5);
    this.add(this.bg);

    // Button icon
    this.icon = scene.add.image(0, 0, this.iconKey);
    this.icon.setDisplaySize(this.size * 0.6, this.size * 0.6);
    this.icon.setOrigin(0.5);
    this.add(this.icon);

    // Tooltip text (hidden by default)
    this.tooltipText = scene.add.text(0, -this.size * 0.7, this.tooltip, {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#222',
      padding: { x: 8, y: 4 },
      alpha: 0.95,
    });
    this.tooltipText.setOrigin(0.5, 1);
    this.tooltipText.setVisible(false);
    this.add(this.tooltipText);

    // Interactivity
    this.setSize(this.size, this.size);
    this.setInteractive(new Phaser.Geom.Rectangle(-this.size/2, -this.size/2, this.size, this.size), Phaser.Geom.Rectangle.Contains);
    this.input.cursor = 'pointer';
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);

    if (!this.enabled) this.disable();
    scene.add.existing(this);
  }

  onPointerOver() {
    if (!this.enabled) return;
    this.bg.setFillStyle(0x444444, 1);
    this.setScale(1.08);
    this.tooltipText.setVisible(true);
  }
  onPointerOut() {
    this.bg.setFillStyle(0x222222, 0.8);
    this.setScale(1);
    this.tooltipText.setVisible(false);
  }
  onPointerDown() {
    if (!this.enabled) return;
    this.setScale(0.95);
    this.bg.setFillStyle(0x111111, 1);
  }
  onPointerUp() {
    if (!this.enabled) return;
    this.setScale(1.08);
    this.bg.setFillStyle(0x444444, 1);
    if (this.toggle) {
      this.state = !this.state;
      if (this.icons) {
        this.icon.setTexture(this.state ? this.icons.on : this.icons.off);
      }
    }
    if (this.onClick) this.onClick(this.state);
  }
  enable() {
    this.enabled = true;
    this.bg.setAlpha(0.8);
    this.icon.setAlpha(1);
    this.setInteractive();
  }
  disable() {
    this.enabled = false;
    this.bg.setAlpha(0.4);
    this.icon.setAlpha(0.4);
    this.disableInteractive();
    this.tooltipText.setVisible(false);
  }
  setTooltip(text) {
    this.tooltip = text;
    this.tooltipText.setText(text);
  }
  setIcon(key) {
    this.iconKey = key;
    this.icon.setTexture(key);
  }
  setToggleState(state) {
    this.state = !!state;
    if (this.icons) {
      this.icon.setTexture(this.state ? this.icons.on : this.icons.off);
    }
  }
}

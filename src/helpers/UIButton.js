/**
 * UIButton.js - A reusable UI button component for Phaser games
 * 
 * This class creates a standardized button with hover/press effects, tooltips,
 * and support for toggle functionality. It's designed to be used across the game
 * for a consistent UI experience.
 */

import Phaser from 'phaser';

export default class UIButton {
  /**
   * Create a new UI button
   * @param {Phaser.Scene} scene - The scene this button belongs to
   * @param {number} x - X position of the button
   * @param {number} y - Y position of the button
   * @param {Object} config - Button configuration
   * @param {string} config.image - Key of the image to use for the button
   * @param {string} [config.toggleImage] - Key of the image to use when toggled (for toggle buttons)
   * @param {Function} config.callback - Function to call when button is clicked
   * @param {string} config.tooltip - Text to display as tooltip on hover
   * @param {boolean} [config.isToggle=false] - Whether this is a toggle button
   * @param {boolean} [config.initialState=false] - Initial toggle state (for toggle buttons)
   * @param {number} [config.scale=1] - Scale of the button
   * @param {number} [config.hoverScale=1.1] - Scale of the button when hovered
   * @param {number} [config.pressedScale=0.9] - Scale of the button when pressed
   * @param {number} [config.width=40] - Width of the button in pixels
   * @param {number} [config.height=40] - Height of the button in pixels
   */
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.config = {
      image: config.image,
      toggleImage: config.toggleImage,
      callback: config.callback,
      tooltip: config.tooltip,
      isToggle: config.isToggle || false,
      initialState: config.initialState || false,
      scale: config.scale || 1,
      hoverScale: config.hoverScale || 1.1,
      pressedScale: config.pressedScale || 0.9,
      width: config.width || 40,
      height: config.height || 40
    };

    // State
    this.isToggled = this.config.initialState;
    this.isEnabled = true;
    this.isHovered = false;
    this.isPressed = false;

    // Create container for all button elements
    this.container = scene.add.container(x, y);
    
    // Create button image
    this.buttonImage = scene.add.image(
      0, 0, 
      this.isToggled && this.config.toggleImage ? this.config.toggleImage : this.config.image
    );
    
    // Set the display size to the specified width and height
    this.buttonImage.setDisplaySize(this.config.width, this.config.height);
    
    // Don't apply additional scale after setting display size
    // this.buttonImage.setScale(this.config.scale);
    
    this.buttonImage.setInteractive({ useHandCursor: true });
    this.container.add(this.buttonImage);

    // Create tooltip (hidden by default)
    // Use text height to vertically center the background exactly with the text
    this.tooltipText = scene.add.text(0, 55, this.config.tooltip, {
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.tooltipText.setOrigin(0.5, 0.5);
    this.tooltipText.setVisible(false);
    
    // Now that tooltipText is created, use its height for background centering
    const tooltipBgHeight = this.tooltipText.height + 8; // 4px padding top/bottom
    this.tooltipBackground = scene.add.rectangle(0, 55, this.tooltipText.width + 20, tooltipBgHeight, 0x000000, 0.8);
    this.tooltipBackground.setOrigin(0.5, 0.5);
    this.tooltipBackground.setVisible(false);
    
    this.container.add(this.tooltipBackground);
    this.container.add(this.tooltipText);

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up all event handlers for the button
   * @private
   */
  setupEventHandlers() {
    // Pointer over (hover)
    this.buttonImage.on('pointerover', () => {
      if (!this.isEnabled) return;
      
      this.isHovered = true;
      // Scale relative to the display size
      this.buttonImage.setDisplaySize(
        this.config.width * this.config.hoverScale,
        this.config.height * this.config.hoverScale
      );
      this.showTooltip();
    });

    // Pointer out
    this.buttonImage.on('pointerout', () => {
      if (!this.isEnabled) return;
      
      this.isHovered = false;
      this.isPressed = false;
      // Reset to original display size
      this.buttonImage.setDisplaySize(this.config.width, this.config.height);
      this.hideTooltip();
    });

    // Pointer down
    this.buttonImage.on('pointerdown', () => {
      if (!this.isEnabled) return;
      
      this.isPressed = true;
      // Scale down relative to the display size
      this.buttonImage.setDisplaySize(
        this.config.width * this.config.pressedScale,
        this.config.height * this.config.pressedScale
      );
      
      // Play UI click sound if available
      const audioManager = this.scene.scene.get('GameScene').audioManager;
      if (audioManager && typeof audioManager.playSound === 'function') {
        audioManager.playSound('ui_click');
      }
    });

    // Pointer up
    this.buttonImage.on('pointerup', () => {
      if (!this.isEnabled || !this.isPressed) return;
      
      this.isPressed = false;
      
      // Return to hover scale if still hovered, otherwise reset
      if (this.isHovered) {
        this.buttonImage.setDisplaySize(
          this.config.width * this.config.hoverScale,
          this.config.height * this.config.hoverScale
        );
      } else {
        this.buttonImage.setDisplaySize(this.config.width, this.config.height);
      }
      
      // Handle toggle state for toggle buttons
      if (this.config.isToggle) {
        this.isToggled = !this.isToggled;
        this.updateButtonImage();
      }
      
      // Execute callback
      if (typeof this.config.callback === 'function') {
        this.config.callback(this.isToggled);
      }
    });
  }

  /**
   * Update the button image based on toggle state
   * @private
   */
  updateButtonImage() {
    if (this.config.isToggle && this.config.toggleImage) {
      this.buttonImage.setTexture(
        this.isToggled ? this.config.toggleImage : this.config.image
      );
      // Maintain the display size when changing textures
      if (this.isHovered) {
        this.buttonImage.setDisplaySize(
          this.config.width * this.config.hoverScale,
          this.config.height * this.config.hoverScale
        );
      } else if (this.isPressed) {
        this.buttonImage.setDisplaySize(
          this.config.width * this.config.pressedScale,
          this.config.height * this.config.pressedScale
        );
      } else {
        this.buttonImage.setDisplaySize(this.config.width, this.config.height);
      }
    }
  }

  /**
   * Show the tooltip
   * @private
   */
  showTooltip() {
    this.tooltipBackground.setVisible(true);
    this.tooltipText.setVisible(true);
  }

  /**
   * Hide the tooltip
   * @private
   */
  hideTooltip() {
    this.tooltipBackground.setVisible(false);
    this.tooltipText.setVisible(false);
  }

  /**
   * Set the enabled state of the button
   * @param {boolean} enabled - Whether the button should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.buttonImage.setAlpha(1);
      this.buttonImage.setInteractive({ useHandCursor: true });
    } else {
      this.buttonImage.setAlpha(0.5);
      this.buttonImage.disableInteractive();
      this.hideTooltip();
    }
  }

  /**
   * Set the visibility of the button
   * @param {boolean} visible - Whether the button should be visible
   */
  setVisible(visible) {
    this.container.setVisible(visible);
  }

  /**
   * Set the toggle state of the button (for toggle buttons)
   * @param {boolean} isOn - The new toggle state
   */
  setToggleState(isOn) {
    if (!this.config.isToggle) return;
    
    this.isToggled = isOn;
    this.updateButtonImage();
  }

  /**
   * Update the tooltip text
   * @param {string} text - New tooltip text
   */
  setTooltip(text) {
    this.config.tooltip = text;
    this.tooltipText.setText(text);
    
    // Adjust tooltip background width based on new text width
    this.tooltipBackground.width = this.tooltipText.width + 20;
  }

  /**
   * Set the display size of the button
   * @param {number} width - New width in pixels
   * @param {number} height - New height in pixels
   */
  setSize(width, height) {
    this.config.width = width;
    this.config.height = height;
    
    // Update the display size based on current state
    if (this.isHovered) {
      this.buttonImage.setDisplaySize(
        width * this.config.hoverScale,
        height * this.config.hoverScale
      );
    } else if (this.isPressed) {
      this.buttonImage.setDisplaySize(
        width * this.config.pressedScale,
        height * this.config.pressedScale
      );
    } else {
      this.buttonImage.setDisplaySize(width, height);
    }
  }

  /**
   * Clean up and destroy the button
   */
  destroy() {
    // Remove all pointer listeners from the button image
    this.buttonImage.removeAllListeners();
    // Remove tooltip listeners if any
    if (this.buttonImage.off) {
      this.buttonImage.off('pointerover');
      this.buttonImage.off('pointerout');
      this.buttonImage.off('pointerdown');
      this.buttonImage.off('pointerup');
    }
    // Destroy tooltip if present
    if (this.tooltipBackground && this.tooltipBackground.destroy) {
      this.tooltipBackground.destroy();
      this.tooltipBackground = null;
    }
    if (this.tooltipText && this.tooltipText.destroy) {
      this.tooltipText.destroy();
      this.tooltipText = null;
    }
    // Destroy the container and all children
    if (this.container && this.container.destroy) {
      this.container.destroy(true);
      this.container = null;
    }
    // Null all references
    this.buttonImage = null;
    this.scene = null;
    this.config = null;
    this.callback = null;
  }
}

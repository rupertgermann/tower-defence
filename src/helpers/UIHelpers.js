// UIHelpers.js - Shared UI helper functions for UIScene and other UI code

/**
 * Returns the color string for price text based on affordability.
 * @param {boolean} canAfford
 * @returns {string} Hex color string
 */
export function getPriceColor(canAfford) {
  return canAfford ? '#ffff00' : '#ff0000';
}

/**
 * Sets button interactive state and fill style based on affordability.
 * @param {Phaser.GameObjects.Rectangle} button - The button to update
 * @param {boolean} canAfford
 * @param {number} enabledColor - Fill color when enabled (default: green)
 * @param {number} disabledColor - Fill color when disabled (default: gray)
 */
export function setButtonAffordability(button, canAfford, enabledColor = 0x00aa00, disabledColor = 0x888888) {
  if (canAfford) {
    button.setFillStyle(enabledColor);
    button.setInteractive();
  } else {
    button.setFillStyle(disabledColor);
    button.disableInteractive();
  }
}

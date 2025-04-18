# Button Refactoring Tasks

## Overview
This document outlines the specific tasks needed to implement the unified button system as described in the button refactoring plan. The goal is to create a consistent, maintainable, and scalable UI button system for the tower defense game.

## 1. Create UIButton Helper Class

- [ ] Create a new file `src/helpers/UIButton.js` with the following functionality:
  - [ ] Constructor that accepts parameters for position, image/icon, callback, tooltip text, and toggle state
  - [ ] Methods for enabling/disabling the button
  - [ ] Methods for handling hover and press visual feedback
  - [ ] Methods for showing/hiding tooltips
  - [ ] Support for toggle buttons (like mute/unmute)
  - [ ] Proper layering and z-index management

```javascript
// Example structure
export default class UIButton {
  constructor(scene, x, y, config) {
    // Config includes: image, callback, tooltip, isToggle, initialState, etc.
  }
  
  setEnabled(enabled) { /* ... */ }
  setVisible(visible) { /* ... */ }
  setToggleState(isOn) { /* ... */ }
  destroy() { /* ... */ }
}
```

## 2. Create Confirmation Dialog Helper

- [ ] Create a new file `src/helpers/ConfirmationDialog.js` with the following functionality:
  - [ ] Semi-transparent overlay background
  - [ ] Message text display
  - [ ] "Yes" and "No" buttons
  - [ ] Callback handling for both options
  - [ ] Methods to show/hide the dialog

```javascript
// Example structure
export default class ConfirmationDialog {
  constructor(scene, config) {
    // Config includes: message, onConfirm, onCancel, etc.
  }
  
  show() { /* ... */ }
  hide() { /* ... */ }
  destroy() { /* ... */ }
}
```

## 3. Refactor UIScene.js

- [ ] Add imports for the new helper classes
- [ ] Create a button container in the top-right corner
- [ ] Replace the current mute button implementation with the new UIButton class
- [ ] Add restart and main menu buttons using the UIButton class
- [ ] Implement confirmation dialogs for restart and main menu actions
- [ ] Update event listeners and game state awareness

```javascript
// Example button container setup
this.topRightButtonsContainer = this.add.container(0, 0);
this.uiContainer.add(this.topRightButtonsContainer);
```

## 4. Button-Specific Implementation Tasks

### Mute Button
- [ ] Replace current emoji-based mute button with image-based button using `mute.png` and `unmute.png`
- [ ] Implement toggle functionality to switch between muted and unmuted states
- [ ] Add tooltip displaying "Mute" or "Unmute" based on current state
- [ ] Ensure proper visual feedback on hover and press
- [ ] Connect to existing audio manager functionality

### Restart Button
- [ ] Create restart button using `restart.png`
- [ ] Add tooltip displaying "Restart Game"
- [ ] Implement confirmation dialog when clicked
- [ ] Connect to game restart functionality
- [ ] Add visual feedback on hover and press

### Main Menu Button
- [ ] Create main menu button using `mainmenu.png`
- [ ] Add tooltip displaying "Quit to Main Menu"
- [ ] Implement confirmation dialog when clicked
- [ ] Connect to scene transition back to MapSelectScene
- [ ] Add visual feedback on hover and press

## 5. Game State Integration

- [ ] Ensure buttons are properly hidden or disabled during:
  - [ ] Victory/defeat screens
  - [ ] Scene transitions
  - [ ] When confirmation dialogs are open
- [ ] Update button visibility based on game state changes
- [ ] Implement proper cleanup when scenes change

## 6. Testing Checklist

- [ ] Verify all buttons display correctly
- [ ] Test hover and press visual feedback
- [ ] Confirm tooltips appear correctly
- [ ] Test mute button toggle functionality
- [ ] Test restart confirmation and functionality
- [ ] Test main menu confirmation and functionality
- [ ] Verify buttons work correctly in all game states
- [ ] Test on different screen resolutions
- [ ] Ensure no memory leaks when scenes change

## 7. Code Quality and Documentation

- [ ] Add JSDoc comments to all new classes and methods
- [ ] Ensure code follows project style and conventions
- [ ] Remove any redundant or deprecated code
- [ ] Update any related documentation

## Implementation Order

1. Create the UIButton helper class
2. Create the ConfirmationDialog helper class
3. Refactor the mute button to use the new system
4. Add restart button with confirmation
5. Add main menu button with confirmation
6. Test and refine all functionality
7. Clean up code and add documentation

# Button Refactoring Tasks

## Overview
This document outlines the specific tasks needed to implement the unified button system as described in the button refactoring plan. The goal is to create a consistent, maintainable, and scalable UI button system for the tower defense game.

## 1. Create UIButton Helper Class

- [x] Create a new file `src/helpers/UIButton.js` with the following functionality:
  - [x] Constructor that accepts parameters for position, image/icon, callback, tooltip text, and toggle state
  - [x] Methods for enabling/disabling the button
  - [x] Methods for handling hover and press visual feedback
  - [x] Methods for showing/hiding tooltips
  - [x] Support for toggle buttons (like mute/unmute)
  - [x] Proper layering and z-index management

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

- [x] Create a new file `src/helpers/ConfirmationDialog.js` with the following functionality:
  - [x] Semi-transparent overlay background
  - [x] Message text display
  - [x] "Yes" and "No" buttons
  - [x] Callback handling for both options
  - [x] Methods to show/hide the dialog

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

- [x] Add imports for the new helper classes
- [x] Create a button container in the top-right corner
- [x] Replace the current mute button implementation with the new UIButton class
- [x] Add restart and main menu buttons using the UIButton class
- [x] Implement confirmation dialogs for restart and main menu actions
- [x] Update event listeners and game state awareness

```javascript
// Example button container setup
this.topRightButtonsContainer = this.add.container(0, 0);
this.uiContainer.add(this.topRightButtonsContainer);
```

## 4. Button-Specific Implementation Tasks

### Mute Button
- [x] Replace current emoji-based mute button with image-based button using `mute.png` and `unmute.png`
- [x] Implement toggle functionality to switch between muted and unmuted states
- [x] Add tooltip displaying "Mute" or "Unmute" based on current state
- [x] Ensure proper visual feedback on hover and press
- [x] Connect to existing audio manager functionality

### Restart Button
- [x] Create restart button using `restart.png`
- [x] Add tooltip displaying "Restart Game"
- [x] Implement confirmation dialog when clicked
- [x] Connect to game restart functionality
- [x] Add visual feedback on hover and press

### Main Menu Button
- [x] Create main menu button using `mainmenu.png`
- [x] Add tooltip displaying "Quit to Main Menu"
- [x] Implement confirmation dialog when clicked
- [x] Connect to scene transition back to MapSelectScene
- [x] Add visual feedback on hover and press

## 5. Game State Integration

- [x] Ensure buttons are properly hidden or disabled during:
  - [x] Victory/defeat screens
  - [x] Scene transitions
  - [x] When confirmation dialogs are open
- [x] Update button visibility based on game state changes
- [x] Implement proper cleanup when scenes change

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

- [x] Add JSDoc comments to all new classes and methods
- [x] Ensure code follows project style and conventions
- [x] Remove any redundant or deprecated code
- [x] Update any related documentation

## Implementation Order

1. Create the UIButton helper class
2. Create the ConfirmationDialog helper class
3. Refactor the mute button to use the new system
4. Add restart button with confirmation
5. Add main menu button with confirmation
6. Test and refine all functionality
7. Clean up code and add documentation

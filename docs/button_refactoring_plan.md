# Unified UI Button Refactoring & Implementation Plan

## 1. Button Componentization
- Create a generic UIButton helper/class for all UI buttons (mute, restart, main menu).
- Handles icon/image, position, interactivity, tooltips, and visual feedback (hover/pressed).
- Accepts callbacks for click actions, supports toggling (e.g., mute), enabling/disabling, and proper layering.

## 2. Asset Management
- Store all button icons in `public/assets/ui/` (e.g., `mute.png`, `unmute.png`, `restart.png`, `mainmenu.png`).
- Use SVG or high-res PNGs for crisp visuals.

## 3. Button Layout & Grouping
- Group buttons in a single UI container (e.g., `topRightButtonsContainer`).
- Place in the top-right corner, spaced evenly, responsive to resolution.
- All buttons share the same size and style.

## 4. Interactivity & Feedback
- Hover: Slight scale up or glow/tint.
- Pressed: Scale down or darken.
- Tooltip: Show on hover (e.g., "Mute", "Restart Game", "Quit to Main Menu").
- Ensure accessibility: large enough, high-contrast icons.

## 5. Functional Integration
- **Mute Button:** Toggles mute state and icon, plays UI sound, uses helper for all logic.
- **Restart Button:** Shows confirmation dialog, calls `restartGame()` in `GameScene` on confirm.
- **Main Menu Button:** Shows confirmation dialog, transitions to `MapSelectScene` or main menu on confirm.

## 6. Confirmation Dialog
- Reusable modal overlay for both "Restart" and "Quit" actions.
- Semi-transparent background, clear message, "Yes"/"No" buttons.
- Blocks input to the main game while open.

## 7. Game State Awareness
- Buttons are hidden or disabled during game end states (victory/defeat), transitions, or dialogs.
- Prevents accidental presses at inappropriate times.

## 8. Code Organization
- All button creation/management code is encapsulated in dedicated methods or a helper class.
- DRY logic, easy to extend (future settings/help buttons).
- Document all methods and state transitions.

## 9. Testing
- Verify all buttons work in all game states, including edge cases.
- Confirm tooltips, feedback, and dialogs function as intended.
- Test responsiveness and appearance on various resolutions.

---

### Button Summary Table

| Button      | Icon           | Action                      | Tooltip                  | Confirmation? |
|-------------|----------------|-----------------------------|--------------------------|--------------|
| Mute        | mute/unmute    | Toggle sound                | "Mute"/"Unmute"          | No           |
| Restart     | restart        | Restart game                | "Restart Game"           | Yes          |
| Main Menu   | mainmenu/home  | Quit to main menu           | "Quit to Main Menu"      | Yes          |

---

**Benefits:**
- Consistency, maintainability, and scalability for all UI buttons.
- Prevents accidental actions and provides clear feedback.
- Easy to add more buttons or features in the future.

---

**Next Steps:**
- Implement this unified button system in `UIScene.js` and supporting files.
- Add/replace assets as needed in `public/assets/ui/`.
- Refactor mute button and add restart/main menu buttons using the new system.
- Add and wire up confirmation dialogs.
- Test thoroughly in all relevant game states.

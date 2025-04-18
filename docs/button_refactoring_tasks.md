# Button Refactoring Tasks

This document breaks down the actionable tasks for the unified UI button refactoring, based on the plan in `button_refactoring_plan.md`.

---

## 1. Componentization
- [x] Create a generic `UIButton` helper/class for all UI buttons (mute, restart, main menu).
- [x] Ensure the class handles icon/image, position, interactivity, tooltips, and visual feedback (hover/pressed).
- [x] Support callbacks for click actions, toggling, enabling/disabling, and proper layering.

## 2. Asset Management
- [x] Ensure all button icons are present in `public/assets/ui/` (e.g., `mute.png`, `unmute.png`, `restart.png`, `mainmenu.png`).
- [x] Use SVG or high-res PNGs for crisp visuals.

## 3. Layout & Grouping
- [x] Group buttons in a single UI container (e.g., `topRightButtonsContainer`).
- [x] Place container in the top-right corner, with even spacing and responsive layout.
- [x] Ensure all buttons share the same size and style. (Planned: enforced via UIButton usage)

## 4. Interactivity & Feedback
- [ ] Implement hover effect (scale up or glow/tint).
- [ ] Implement pressed effect (scale down or darken).
- [ ] Add tooltips for each button (e.g., "Mute", "Restart Game", "Quit to Main Menu").
- [ ] Ensure accessibility: large enough, high-contrast icons.

## 5. Functional Integration
- [ ] Mute Button: Toggle mute state and icon, play UI sound, use helper for logic.
- [ ] Restart Button: Show confirmation dialog, call `restartGame()` in `GameScene` on confirm.
- [ ] Main Menu Button: Show confirmation dialog, transition to `MapSelectScene` or main menu on confirm.

## 6. Confirmation Dialog
- [ ] Implement a reusable modal overlay for "Restart" and "Quit" actions.
- [ ] Add semi-transparent background, clear message, and "Yes"/"No" buttons.
- [ ] Block input to the main game while dialog is open.

## 7. Game State Awareness
- [ ] Hide or disable buttons during game end states (victory/defeat), transitions, or dialogs.
- [ ] Prevent accidental presses at inappropriate times.

## 8. Code Organization
- [ ] Encapsulate all button creation/management in dedicated methods or helper class.
- [ ] Ensure DRY logic and easy extensibility for future buttons.
- [ ] Document all methods and state transitions.

## 9. Testing
- [ ] Verify all buttons work in all game states, including edge cases.
- [ ] Confirm tooltips, feedback, and dialogs function as intended.
- [ ] Test responsiveness and appearance on various resolutions.

---

This checklist ensures a systematic approach to refactoring and implementing unified UI buttons in the game.

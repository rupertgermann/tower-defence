# todo

- main menu transparency
- lower tower select bar and "start next wave" button only visible when game is stopped or on mouse hover

## Preventing Tower Placement on Enemy Paths & Using Correct Path Tiles

### 1. Path Representation & Data Structure

- **Explicit Tilemap Path Definition**:  
  - Store the enemy path as a list of tile coordinates (grid positions) in the map data.  
  - Each map (forest, desert, scify) should define its path as an array of `{x, y}` tile indices, not just pixel positions.  
  - Path data should be loaded with the map, either from a JSON file, Tiled map editor, or a hardcoded array.

- **Path Tile Layering**:  
  - Use a dedicated tilemap layer for the path.  
  - Assign a unique tile index or tileset for path tiles (distinct from buildable terrain).

### 2. Rendering the Correct Path Tiles

- **Path Tile Assignment**:  
  - During map initialization, iterate over the path coordinates and set the corresponding tile in the path layer to the correct path tile index.
  - For curved paths, use tile variants (straight, corner, T-junction, etc.) based on the direction of adjacent path tiles.  
  - Optionally, implement an auto-tiling algorithm to select the correct variant for each path segment for visual polish.

- **Layer Order**:  
  - Ensure the path layer is rendered above the base terrain but below towers and enemies.

### 3. Preventing Tower Placement on Paths

- **Placement Validation Logic**:  
  - When the player attempts to place a tower, convert the pointer/cursor position to tile coordinates.
  - Check if the target tile coordinate exists in the path array.
  - If so, block placement and provide visual feedback (e.g., red highlight, error sound).

- **UI Feedback**:  
  - When hovering over a path tile, show a "not allowed" cursor or tint the tile red.
  - Optionally, display a tooltip explaining why placement is blocked.

### 4. Robustness & Edge Cases

- **Sync with Enemy Movement**:  
  - Ensure the enemy movement logic uses the same path data as the placement restriction logic to avoid desync bugs.
- **Multiple Paths**:  
  - If supporting maps with multiple paths, generalize the path data structure to handle multiple arrays.
- **Map Editing**:  
  - If using a map editor (like Tiled), enforce that path tiles are marked with a property or layer that can be programmatically detected.

### 5. Testing & Verification

- **Unit Tests**:  
  - Test that all path tiles block tower placement.
  - Test that non-path tiles allow placement.
- **Visual Tests**:  
  - Manually verify that path tiles are rendered correctly and match enemy movement.
- **Edge Cases**:  
  - Test corners, junctions, and maps with unusual path shapes.

---

This plan ensures a robust, visually clear, and bug-resistant implementation of path-based placement restrictions and correct path tile rendering, with a focus on maintainability and scalability for future map features.

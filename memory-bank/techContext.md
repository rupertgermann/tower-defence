# Tower Defense Game Technical Context

## Technology Stack

### Core Technologies
- **Game Engine**: Phaser 3.88.2
- **Language**: JavaScript (ES6+)
- **Build System**: Webpack 5
- **Module Format**: ES Modules
- **Asset Pipeline**: Custom asset generator script

### Development Environment
- **Package Manager**: npm
- **Transpiler**: Babel
- **Development Server**: Webpack Dev Server
- **Asset Handling**: Copy Webpack Plugin, HTML Webpack Plugin

## Technical Architecture

### Project Structure
```
tower-defence/
├── docs/                 # Documentation
│   ├── concept.md        # Original game concept
│   ├── mvp-plan.md       # MVP implementation plan
│   ├── progress.md       # Development progress tracking
│   └── bug-fix-plan.md   # Bug fix documentation
├── memory-bank/          # Memory bank for project context
├── public/               # Static assets
│   ├── index.html        # Main HTML entry point
│   └── assets/           # Game assets (images)
└── src/                  # Source code
    ├── entities/         # Game entity classes
    │   ├── Enemy.js      # Enemy implementation
    │   ├── Projectile.js # Projectile implementation
    │   └── Tower.js      # Tower implementation
    ├── scenes/           # Phaser scene classes
    │   ├── GameScene.js  # Main game scene
    │   └── UIScene.js    # User interface scene
    ├── systems/          # Game system managers
    │   ├── EconomyManager.js # Resource management
    │   ├── PathManager.js    # Path definition and calculations
    │   └── WaveManager.js    # Enemy wave spawning
    ├── index.js          # Main entry point
    └── assets-generator.js # Asset generation utility
```

### Build Pipeline
1. Webpack processes the entry point (src/index.js)
2. Babel transpiles ES6+ code to browser-compatible JavaScript
3. Assets are copied to the build directory
4. HTML is generated with proper script references
5. Development server serves the built files with hot reloading

## Key Technical Components

### Phaser Game Engine
The game leverages Phaser 3's key features:
- **Scene Management**: Multiple scenes for game and UI
- **Physics System**: Arcade physics for movement and collisions
- **Game Objects**: Sprites, containers, and graphics primitives
- **Animation System**: For visual effects and entity animations
- **Event System**: For communication between components
- **Input Handling**: Mouse/touch input for tower placement and UI

### Rendering Approach
- Canvas-based rendering via Phaser's WebGL renderer
- Sprite-based entities with dynamic transformations
- Layered rendering with z-index management
- Particle effects for visual feedback

### Game Loop Implementation
The game uses Phaser's built-in game loop with:
- Fixed time step updates
- Delta-time based movement calculations
- Scene-specific update methods
- Entity-level update methods

## Asset Management

### Asset Types
- **Sprites**: PNG images for towers, enemies, projectiles
- **Tiles**: Map tiles for background, path, and placement areas
- **UI Elements**: Buttons, panels, and indicators
- **Effects**: Explosion and hit effects

### Asset Generation
The project includes a custom asset generator script (`assets-generator.js`) that:
- Creates placeholder assets during development
- Ensures consistent sizing and formatting
- Generates variations of base assets

## Game Configuration

### Global Settings
The game uses a global configuration object (`GAME_SETTINGS`) that defines:
- Tower types and properties
- Enemy types and properties
- Wave configurations
- Player starting stats

This centralized configuration makes it easy to balance and tune the game.

## Error Handling

### Custom Destroy Methods
To handle Phaser's automatic destruction of object properties:
- Custom destroy methods are implemented in entity classes
- References to plain objects are nullified before calling parent destroy
- Local variables are used to store references needed in callbacks

### Event-Based Error Recovery
The game uses events to handle and recover from errors:
- Critical errors are broadcast as events
- Error handlers can respond appropriately
- The game can continue running even if some components fail

## Performance Considerations

### Optimization Techniques
- **Object Pooling**: Planned for projectiles and effects
- **Render Culling**: Only rendering on-screen entities
- **Efficient Collision Detection**: Using spatial partitioning (planned)
- **Asset Optimization**: Properly sized and compressed images

### Performance Targets
- **Desktop**: 60 FPS with full visual effects
- **Mobile**: 30 FPS with potential reduction in particle effects
- **Memory Usage**: <100MB for core game assets and logic

## Browser Compatibility

### Target Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers with WebGL support

### Fallbacks
- Canvas renderer fallback when WebGL is unavailable
- Reduced particle effects on lower-end devices
- Responsive layout for different screen sizes

## Development Workflow

### Build Commands
- `npm start`: Start development server
- `npm run build`: Create production build
- `npm run generate-assets`: Run asset generation script

### Development Practices
- Modular code organization
- Clear separation of concerns
- Consistent naming conventions
- JSDoc comments for API documentation
- Encapsulation of game systems in manager classes

## Future Technical Considerations

### Planned Enhancements
- **Asset Loading Optimization**: Progressive loading and caching
- **Mobile Touch Controls**: Enhanced touch input for mobile devices
- **Performance Profiling**: Identifying and addressing bottlenecks
- **Code Splitting**: Lazy loading of non-critical game components
- **Automated Testing**: Unit tests for core game systems

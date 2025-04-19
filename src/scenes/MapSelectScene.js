import Phaser from 'phaser';
import MapManager from '../systems/MapManager.js';

export default class MapSelectScene extends Phaser.Scene {
  constructor() {
    super('MapSelectScene');
    this.MAP_KEYS = ['forest', 'desert', 'mountain'];
    this.DIFFICULTY_KEYS = ['EASY', 'NORMAL', 'HARD', 'EXPERT', 'INSANE'];
    this.selectedDifficulty = 'EASY'; // Default difficulty
  }

  preload() {
    // Preload map JSONs for preview
    this.mapManager = new MapManager(this);
    this.mapManager.preloadMaps(this.MAP_KEYS);
  }

  create() {
    // Stop global background music if playing when entering map select/home
    import('../systems/AudioManager.js').then(({ default: AudioManager }) => {
      AudioManager.stopGlobalMusic(this, 'bgm');
    });

    this.mapManager.createMaps(this.MAP_KEYS);

    // Set intro background when entering map select
    if (window.setIntroBackground) window.setIntroBackground();

    // Game Title
    this.add
      .text(640, 65, 'Tower Defense', {
        fontSize: '80px',
        fill: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Title
    this.add
      .text(640, 160, 'Select a Map', {
        fontSize: '22px',
        fill: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Map selection
    const mapStartY = 210;
    const mapSpacing = 70;
    this.mapButtons = [];

    this.MAP_KEYS.forEach((key, idx) => {
      const mapData = this.mapManager.getMap(key);
      const y = mapStartY + idx * mapSpacing;

      // Map name
      this.add
        .text(200, y, mapData ? mapData.name : key, {
          fontSize: '22px',
          fill: '#fff',
        })
        .setOrigin(0, 0.5);

      // Simple preview (theme)
      this.add
        .text(600, y, mapData ? `Theme: ${mapData.theme}` : '', {
          fontSize: '22px',
          fill: '#ddd',
        })
        .setOrigin(0, 0.5);

      // Select button
      const btn = this.add
        .rectangle(1100, y, 160, 60, 0x008800, 0.7)
        .setInteractive()
        .setOrigin(0.5);
      this.add
        .text(1100, y, 'Select', {
          fontSize: '22px',
          fill: '#fff',
        })
        .setOrigin(0.5);
      if (key == 'forest') {
        btn.setStrokeStyle(2, 0xffffff);
      }
      btn.on('pointerdown', () => {
        this.selectMap(key);
      });

      this.mapButtons.push(btn);
    });

    // Difficulty selection title
    this.add
      .text(640, 440, 'Select Difficulty', {
        fontSize: '22px',
        fill: '#fff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Difficulty buttons
    const difficultyStartX = 240;
    const difficultySpacing = 200;
    this.difficultyButtons = [];

    this.DIFFICULTY_KEYS.forEach((key, idx) => {
      const difficultyData = window.GAME_SETTINGS.DIFFICULTY[key];
      const x = difficultyStartX + idx * difficultySpacing;

      // Get color based on difficulty
      let btnColor;
      switch (key) {
        case 'EASY':
          btnColor = 0x00aa00;
          break; // Green
        case 'NORMAL':
          btnColor = 0x0088cc;
          break; // Blue
        case 'HARD':
          btnColor = 0xaaaa00;
          break; // Yellow
        case 'EXPERT':
          btnColor = 0xdd6600;
          break; // Orange
        case 'INSANE':
          btnColor = 0xcc0000;
          break; // Red
        default:
          btnColor = 0x888888;
      }

      // Difficulty button
      const btn = this.add
      .rectangle(x, 510, 160, 60, btnColor, 0.7)
        .setInteractive()
        .setOrigin(0.5);

      // Difficulty name
      this.add
        .text(x, 510, difficultyData.name, {
          fontSize: '24px',
          fill: '#fff',
        })
        .setOrigin(0.5);

      // Highlight selected difficulty
      if (key === this.selectedDifficulty) {
        btn.setStrokeStyle(2, 0xffffff);
      }

      btn.on('pointerdown', () => {
        this.selectDifficulty(key);
      });

      this.difficultyButtons.push({ button: btn, key: key });
    });

    // Start game button
    this.startButton = this.add
      .rectangle(640, 630, 240, 80, 0x008800, 0.8)
      .setInteractive()
      .setOrigin(0.5);

    this.add
      .text(640, 630, 'Start Game', {
        fontSize: '32px',
        fill: '#fff',
      })
      .setOrigin(0.5);

    this.startButton.on('pointerdown', () => {
      this.startGame();
    });

    // Keyboard navigation (1/2/3 for maps)
    this.input.keyboard.on('keydown-ONE', () =>
      this.selectMap(this.MAP_KEYS[0])
    );
    this.input.keyboard.on('keydown-TWO', () =>
      this.selectMap(this.MAP_KEYS[1])
    );
    this.input.keyboard.on('keydown-THREE', () =>
      this.selectMap(this.MAP_KEYS[2])
    );
  }

  selectMap(mapKey) {
    this.registry.set('selectedMap', mapKey);
    // Highlight the selected map button
    this.mapButtons.forEach((btn, idx) => {
      if (this.MAP_KEYS[idx] === mapKey) {
        btn.setFillStyle(0x00aa00, 0.9);
        btn.setStrokeStyle(2, 0xffffff);
      } else {
        btn.setFillStyle(0x008800, 0.7);
        btn.setStrokeStyle(0);
      }
    });
  }

  selectDifficulty(difficultyKey) {
    this.selectedDifficulty = difficultyKey;
    this.registry.set('selectedDifficulty', difficultyKey);

    // Update button appearances
    this.difficultyButtons.forEach((item) => {
      if (item.key === difficultyKey) {
        item.button.setStrokeStyle(2, 0xffffff);
      } else {
        item.button.setStrokeStyle(0);
      }
    });
  }

  startGame() {
    // Ensure we have both map and difficulty selected
    if (!this.registry.get('selectedMap')) {
      this.selectMap(this.MAP_KEYS[0]); // Default to first map
    }

    if (!this.registry.get('selectedDifficulty')) {
      this.registry.set('selectedDifficulty', this.selectedDifficulty);
    }

    // Set game background based on selected map
    if (window.setGameBackground) {
      const selectedMap = this.registry.get('selectedMap');
      // Use 'forest', 'desert', or 'mountain'
      let bgKey = selectedMap;
      window.setGameBackground(bgKey);
    }

    this.scene.start('GameScene');
  }
}

import Phaser from 'phaser';
import MapManager from '../systems/MapManager.js';

export default class MapSelectScene extends Phaser.Scene {
    constructor() {
        super('MapSelectScene');
        this.MAP_KEYS = ['forest', 'desert', 'mountain'];
    }

    preload() {
        // Preload map JSONs for preview
        this.mapManager = new MapManager(this);
        this.mapManager.preloadMaps(this.MAP_KEYS);
    }

    create() {
        this.mapManager.createMaps(this.MAP_KEYS);

        this.add.text(640, 80, 'Select a Map', {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startY = 200;
        const spacing = 120;
        this.buttons = [];

        this.MAP_KEYS.forEach((key, idx) => {
            const mapData = this.mapManager.getMap(key);
            const y = startY + idx * spacing;

            // Map name
            this.add.text(400, y, mapData ? mapData.name : key, {
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0, 0.5);

            // Simple preview (theme)
            this.add.text(700, y, mapData ? `Theme: ${mapData.theme}` : '', {
                fontSize: '24px',
                fill: '#aaa'
            }).setOrigin(0, 0.5);

            // Select button
            const btn = this.add.rectangle(1100, y, 160, 60, 0x008800, 0.7)
                .setInteractive()
                .setOrigin(0.5);
            this.add.text(1100, y, 'Select', {
                fontSize: '28px',
                fill: '#fff'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                this.selectMap(key);
            });

            this.buttons.push(btn);
        });

        // Keyboard navigation (1/2/3)
        this.input.keyboard.on('keydown-ONE', () => this.selectMap(this.MAP_KEYS[0]));
        this.input.keyboard.on('keydown-TWO', () => this.selectMap(this.MAP_KEYS[1]));
        this.input.keyboard.on('keydown-THREE', () => this.selectMap(this.MAP_KEYS[2]));
    }

    selectMap(mapKey) {
        this.registry.set('selectedMap', mapKey);
        this.scene.start('GameScene');
    }
}

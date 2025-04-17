import Phaser from 'phaser';
import MapSelectScene from './scenes/MapSelectScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import wavesConfig from './assets/config/waves.json';
import towersConfig from './assets/config/towers.json';
import extraWavesConfig from './assets/config/extra-waves.json';

// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MapSelectScene, GameScene, UIScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game settings
window.GAME_SETTINGS = {
    // Difficulty levels
    DIFFICULTY: {
        EASY: {
            name: 'Easy',
            enemyHealthMultiplier: 1.0,
            enemySpeedMultiplier: 1.0,
            enemyRewardMultiplier: 1.0,
            enemyCountMultiplier: 1.0,
            waveCountAdjustment: 0 // No extra waves
        },
        NORMAL: {
            name: 'Normal',
            enemyHealthMultiplier: 1.2,
            enemySpeedMultiplier: 1.1,
            enemyRewardMultiplier: 1.1,
            enemyCountMultiplier: 1.2,
            waveCountAdjustment: 2 // 2 extra waves
        },
        HARD: {
            name: 'Hard',
            enemyHealthMultiplier: 1.5,
            enemySpeedMultiplier: 1.2,
            enemyRewardMultiplier: 1.2,
            enemyCountMultiplier: 1.4,
            waveCountAdjustment: 3 // 3 extra waves
        },
        EXPERT: {
            name: 'Expert',
            enemyHealthMultiplier: 1.8,
            enemySpeedMultiplier: 1.3,
            enemyRewardMultiplier: 1.3,
            enemyCountMultiplier: 1.6,
            waveCountAdjustment: 4 // 4 extra waves
        },
        INSANE: {
            name: 'Insane',
            enemyHealthMultiplier: 2.2,
            enemySpeedMultiplier: 1.4,
            enemyRewardMultiplier: 1.4,
            enemyCountMultiplier: 1.8,
            waveCountAdjustment: 5 // 5 extra waves
        }
    },
    // Tower types
    TOWERS: towersConfig,
    // Enemy types
    ENEMIES: {
        BASIC: {
            name: 'Basic Enemy',
            health: 100,
            speed: 100,
            reward: 20,
            damage: 1 // damage to player's life
        },
        FAST: {
            name: 'Fast Enemy',
            health: 60,
            speed: 180,
            reward: 15,
            damage: 1
        },
        ARMORED: {
            name: 'Armored Enemy',
            health: 250,
            speed: 70,
            reward: 30,
            damage: 1,
            armor: 0.3 // 30% damage reduction
        },
        FLYING: {
            name: 'Flying Enemy',
            health: 80,
            speed: 120,
            reward: 25,
            damage: 1,
            flying: true // can fly over obstacles
        },
        BOSS: {
            name: 'Boss Enemy',
            health: 1000,
            speed: 50,
            reward: 100,
            damage: 5,
            armor: 0.5
        },
        HEALER: {
            name: 'Healer Enemy',
            health: 120,
            speed: 90,
            reward: 30,
            damage: 1,
            healRadius: 100,
            healAmount: 10,
            healInterval: 2000
        },
        SHIELD: {
            name: 'Shield Enemy',
            health: 140,
            speed: 80,
            reward: 35,
            damage: 1,
            shieldDuration: 1500,
            shieldCooldown: 3500
        },
        SPLIT: {
            name: 'Split Enemy',
            health: 90,
            speed: 110,
            reward: 18,
            damage: 1,
            splitCount: 2,
            splitType: 'BASIC',
            splitData: { health: 40, speed: 120, reward: 8, damage: 1 }
        },
        TELEPORT: {
            name: 'Teleport Enemy',
            health: 100,
            speed: 105,
            reward: 28,
            damage: 1,
            teleportInterval: 2500,
            teleportDistance: 2
        }
    },
    // Wave configuration
    WAVES: wavesConfig,
    // Extra waves for higher difficulties
    EXTRA_WAVES: extraWavesConfig,
    // Player starting stats
    PLAYER: {
        lives: 20,
        money: 300
    }
};

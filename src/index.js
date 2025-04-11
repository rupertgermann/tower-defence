import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

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
    scene: [GameScene, UIScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game settings
window.GAME_SETTINGS = {
    // Tower types
    TOWERS: {
        BASIC: {
            name: 'Basic Tower',
            cost: 100,
            damage: 20,
            range: 150,
            fireRate: 1000, // ms between shots
            projectileSpeed: 300
        },
        AOE: {
            name: 'Area Effect Tower',
            cost: 200,
            damage: 15,
            range: 120,
            fireRate: 1500,
            projectileSpeed: 250,
            aoeRadius: 50
        },
        SLOW: {
            name: 'Slowing Tower',
            cost: 150,
            damage: 10,
            range: 180,
            fireRate: 1200,
            projectileSpeed: 350,
            slowFactor: 0.5, // 50% speed reduction
            slowDuration: 2000 // 2 seconds
        }
    },
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
        }
    },
    // Wave configuration
    WAVES: [
        { enemies: ['BASIC'], count: 10, interval: 1500 },
        { enemies: ['BASIC', 'FAST'], count: 15, interval: 1200 },
        { enemies: ['BASIC', 'FAST', 'ARMORED'], count: 20, interval: 1000 },
        { enemies: ['FAST', 'ARMORED'], count: 15, interval: 900 },
        { enemies: ['ARMORED', 'FLYING'], count: 15, interval: 1000 },
        { enemies: ['FAST', 'FLYING'], count: 20, interval: 800 },
        { enemies: ['BASIC', 'FAST', 'ARMORED', 'FLYING'], count: 25, interval: 700 },
        { enemies: ['ARMORED', 'FLYING'], count: 20, interval: 600 },
        { enemies: ['FAST', 'ARMORED', 'FLYING'], count: 30, interval: 500 },
        { enemies: ['BOSS'], count: 1, interval: 0, bossWave: true }
    ],
    // Player starting stats
    PLAYER: {
        lives: 20,
        money: 300
    }
};

import Phaser from 'phaser';
import MapSelectScene from './scenes/MapSelectScene.js';
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
    TOWERS: {
        BASIC: {
            name: 'Basic Tower',
            cost: 100,
            damage: 20,
            range: 150,
            fireRate: 1000, // ms between shots
            projectileSpeed: 300,
            maxLevel: 3,
            upgradeCostScaling: 0.6,
            upgradeDamageScale: 1.4,
            upgradeRangeScale: 1.15,
            upgradeFireRateScale: 0.85
        },
        AOE: {
            name: 'Area Effect Tower',
            cost: 200,
            damage: 15,
            range: 120,
            fireRate: 1500,
            projectileSpeed: 250,
            aoeRadius: 50,
            maxLevel: 3,
            upgradeCostScaling: 0.65,
            upgradeDamageScale: 1.35,
            upgradeRangeScale: 1.12,
            upgradeFireRateScale: 0.88
        },
        SLOW: {
            name: 'Slowing Tower',
            cost: 150,
            damage: 10,
            range: 180,
            fireRate: 1200,
            projectileSpeed: 350,
            slowFactor: 0.5, // 50% speed reduction
            slowDuration: 2000, // 2 seconds
            maxLevel: 3,
            upgradeCostScaling: 0.55,
            upgradeDamageScale: 1.3,
            upgradeRangeScale: 1.10,
            upgradeFireRateScale: 0.9
        },
        SNIPER: {
            name: 'Sniper Tower',
            cost: 250,
            damage: 80,
            range: 350,
            fireRate: 2500,
            projectileSpeed: 600,
            maxLevel: 3,
            upgradeCostScaling: 0.7,
            upgradeDamageScale: 1.5,
            upgradeRangeScale: 1.10,
            upgradeFireRateScale: 0.85
        },
        MULTISHOT: {
            name: 'Multi-shot Tower',
            cost: 220,
            damage: 18,
            range: 170,
            fireRate: 1300,
            projectileSpeed: 320,
            targetCount: 3,
            maxLevel: 3,
            upgradeCostScaling: 0.65,
            upgradeDamageScale: 1.35,
            upgradeRangeScale: 1.10,
            upgradeFireRateScale: 0.88
        },
        SUPPORT: {
            name: 'Support Tower',
            cost: 180,
            damage: 0,
            range: 120,
            fireRate: 0,
            buffType: 'fireRate',
            buffAmount: 0.2, // 20% faster fire rate
            buffRadius: 120,
            maxLevel: 3,
            upgradeCostScaling: 0.6,
            upgradeDamageScale: 1.0,
            upgradeRangeScale: 1.15,
            upgradeFireRateScale: 1.0
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
    WAVES: [
        { enemies: ['BASIC'], count: 10, interval: 1500 },
        { enemies: ['BASIC', 'FAST'], count: 15, interval: 1200 },
        { enemies: ['BASIC', 'FAST', 'ARMORED'], count: 20, interval: 1000 },
        { enemies: ['FAST', 'ARMORED'], count: 15, interval: 900 },
        { enemies: ['ARMORED', 'FLYING'], count: 15, interval: 1000 },
        { enemies: ['FAST', 'FLYING'], count: 20, interval: 800 },
        { enemies: ['BASIC', 'FAST', 'ARMORED', 'FLYING'], count: 25, interval: 700 },
        { enemies: ['ARMORED', 'FLYING', 'HEALER'], count: 20, interval: 600 },
        { enemies: ['FAST', 'ARMORED', 'FLYING', 'SHIELD', 'SPLIT', 'TELEPORT'], count: 30, interval: 500 },
        { enemies: ['BOSS', 'HEALER', 'SHIELD', 'SPLIT', 'TELEPORT'], count: 5, interval: 800, bossWave: true }
    ],
    
    // Extra waves for higher difficulties
    EXTRA_WAVES: [
        // Extra wave 1 (for Normal+)
        { 
            enemies: ['FAST', 'ARMORED', 'FLYING', 'HEALER', 'SHIELD'], 
            count: 35, 
            interval: 450 
        },
        // Extra wave 2 (for Normal+)
        { 
            enemies: ['ARMORED', 'FLYING', 'HEALER', 'SHIELD', 'SPLIT', 'TELEPORT'], 
            count: 8, 
            interval: 700, 
            bossWave: true 
        },
        // Extra wave 3 (for Hard+)
        { 
            enemies: ['FAST', 'ARMORED', 'FLYING', 'HEALER', 'SHIELD', 'SPLIT', 'TELEPORT'], 
            count: 40, 
            interval: 400 
        },
        // Extra wave 4 (for Expert+)
        { 
            enemies: ['ARMORED', 'FLYING', 'HEALER', 'SHIELD', 'SPLIT', 'TELEPORT'], 
            count: 45, 
            interval: 350 
        },
        // Extra wave 5 (for Insane)
        { 
            enemies: ['BOSS', 'HEALER', 'SHIELD', 'SPLIT', 'TELEPORT'], 
            count: 10, 
            interval: 600, 
            bossWave: true 
        }
    ],
    // Player starting stats
    PLAYER: {
        lives: 20,
        money: 300
    }
};

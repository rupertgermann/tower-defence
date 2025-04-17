/**
 * This script generates placeholder assets for the tower defense game.
 * Run this script with Node.js to generate the assets.
 */

// Use CommonJS syntax for Node.js script
// Add "type": "commonjs" to package.json to run this script
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../public/assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Load tower definitions for dynamic asset generation
const towersConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'assets/config/towers.json'), 'utf-8')
);
// Base colors for tower types
const towerColors = {
  BASIC: '#2196F3',
  AOE: '#F44336',
  SLOW: '#00BCD4',
  SNIPER: '#8E24AA',
  MULTISHOT: '#FF9800',
  SUPPORT: '#4CAF50',
};

// Function to create a simple colored rectangle
function createRectangle(width, height, color, filename, label) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill with color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  // Draw label if provided
  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, width / 2, height / 2);
  }

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);

  console.log(`Created ${filename}`);
}

// Function to create a simple colored circle
function createCircle(radius, color, filename) {
  const size = radius * 2;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill with color
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
  ctx.fill();

  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);

  console.log(`Created ${filename}`);
}

// Create map tiles
createRectangle(64, 64, '#8BC34A', 'tile.png'); // Green grass
createRectangle(64, 64, '#795548', 'path.png'); // Brown path
createRectangle(64, 64, '#BBDEFB', 'placement.png'); // Light blue placement tile

// Create tower assets for each type and upgrade level
for (const [key, data] of Object.entries(towersConfig)) {
  const baseColor = towerColors[key] || '#888888';
  for (let lvl = 1; lvl <= data.maxLevel; lvl++) {
    const filename = `tower_${key.toLowerCase()}_${lvl}.png`;
    createRectangle(32, 32, baseColor, filename, `${lvl}`);
  }
}

// Create enemy assets
createCircle(16, '#FF9800', 'enemy_basic.png'); // Orange basic enemy
createCircle(16, '#FFEB3B', 'enemy_fast.png'); // Yellow fast enemy
createCircle(16, '#9C27B0', 'enemy_armored.png'); // Purple armored enemy
createCircle(16, '#4CAF50', 'enemy_flying.png'); // Green flying enemy
createCircle(32, '#E91E63', 'enemy_boss.png'); // Pink boss enemy

// Create projectile assets
createCircle(8, '#2196F3', 'projectile_basic.png'); // Blue basic projectile
createCircle(8, '#F44336', 'projectile_aoe.png'); // Red AOE projectile
createCircle(8, '#00BCD4', 'projectile_slow.png'); // Cyan slow projectile

// Create effect assets
createCircle(16, '#FFEB3B', 'explosion.png'); // Yellow explosion

console.log('All assets generated successfully!');

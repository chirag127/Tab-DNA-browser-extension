const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

/**
 * Create a canvas with the Tab DNA icon
 * @param {number} size - The size of the icon
 * @returns {Canvas} - The canvas with the icon
 */
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0078ff';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // DNA helix
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size / 10;
  
  // First strand
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.2);
  ctx.bezierCurveTo(
    size * 0.3, size * 0.4,
    size * 0.7, size * 0.6,
    size * 0.7, size * 0.8
  );
  ctx.stroke();
  
  // Second strand
  ctx.beginPath();
  ctx.moveTo(size * 0.7, size * 0.2);
  ctx.bezierCurveTo(
    size * 0.7, size * 0.4,
    size * 0.3, size * 0.6,
    size * 0.3, size * 0.8
  );
  ctx.stroke();
  
  // Connecting lines
  ctx.lineWidth = size / 20;
  
  // Top connection
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.2);
  ctx.lineTo(size * 0.7, size * 0.2);
  ctx.stroke();
  
  // Middle connections
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.4);
  ctx.lineTo(size * 0.5, size * 0.4);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.6);
  ctx.lineTo(size * 0.5, size * 0.6);
  ctx.stroke();
  
  // Bottom connection
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size * 0.8);
  ctx.lineTo(size * 0.7, size * 0.8);
  ctx.stroke();
  
  return canvas;
}

/**
 * Save the canvas as a PNG file
 * @param {Canvas} canvas - The canvas to save
 * @param {string} filename - The filename to save to
 */
function saveCanvasAsPng(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Created icon: ${filename}`);
}

// Generate icons of different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createIcon(size);
  const filename = path.join(iconsDir, `icon${size}.png`);
  saveCanvasAsPng(canvas, filename);
});

console.log('Icon generation complete!');

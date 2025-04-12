// This file creates placeholder icons for development
// In a production environment, you would use actual icon files

/**
 * Create a canvas with the Tab DNA icon
 * @param {number} size - The size of the icon
 * @returns {string} - The data URL of the icon
 */
export function createPlaceholderIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
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
  
  return canvas.toDataURL();
}

/**
 * Create and save placeholder icons
 * This would be used in a build script to generate actual icon files
 */
export function createAndSaveIcons() {
  const sizes = [16, 48, 128];
  
  sizes.forEach(size => {
    const iconDataUrl = createPlaceholderIcon(size);
    
    // In a build script, you would save these to files
    console.log(`Created icon of size ${size}px`);
  });
}

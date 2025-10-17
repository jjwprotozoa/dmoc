// scripts/generate-icons.js
const fs = require('fs');
const path = require('path');

// Simple SVG icon generator for PWA icons
const generateIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#3B82F6"/>
  <path d="M${size * 0.2} ${size * 0.3}H${size * 0.8}V${size * 0.4}H${size * 0.2}V${size * 0.3}Z" fill="white"/>
  <path d="M${size * 0.2} ${size * 0.5}H${size * 0.8}V${size * 0.6}H${size * 0.2}V${size * 0.5}Z" fill="white"/>
  <path d="M${size * 0.2} ${size * 0.7}H${size * 0.6}V${size * 0.8}H${size * 0.2}V${size * 0.7}Z" fill="white"/>
  <circle cx="${size * 0.7}" cy="${size * 0.7}" r="${size * 0.1}" fill="white"/>
</svg>`;
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach((size) => {
  const svg = generateIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Generated icon-${size}x${size}.svg`);
});

console.log('✅ All PWA icons generated successfully!');
console.log(
  'Note: In production, convert these SVG files to PNG format for better compatibility.'
);

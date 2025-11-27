#!/usr/bin/env node

/**
 * Post-build script for Parcel
 *
 * Copies necessary files to dist folder after Parcel build
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Post-build: Copying additional files...\n');

// Copy manifest.json
console.log('✓ Copying manifest.json...');
fs.copyFileSync(
  path.join(__dirname, '../manifest.json'),
  path.join(__dirname, '../dist/manifest.json')
);

// Copy icons
console.log('✓ Copying icons...');
const iconsDir = path.join(__dirname, '../dist/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.copyFileSync(
  path.join(__dirname, '../public/icons/icon16.png'),
  path.join(iconsDir, 'icon16.png')
);
fs.copyFileSync(
  path.join(__dirname, '../public/icons/icon32.png'),
  path.join(iconsDir, 'icon32.png')
);
fs.copyFileSync(
  path.join(__dirname, '../public/icons/icon48.png'),
  path.join(iconsDir, 'icon48.png')
);
fs.copyFileSync(
  path.join(__dirname, '../public/icons/icon128.png'),
  path.join(iconsDir, 'icon128.png')
);
fs.copyFileSync(
  path.join(__dirname, '../public/icons/zipher_logo.png'),
  path.join(iconsDir, 'zipher_logo.png')
);
fs.copyFileSync(
  path.join(__dirname, '../public/icons/zcash-logo.svg'),
  path.join(iconsDir, 'zcash-logo.svg')
);

console.log('\n✅ Post-build complete!\n');
console.log('Build output:');
console.log('  dist/');
console.log('  ├── index.html');
console.log('  ├── service-worker.js (bundled by Parcel with WebZjs!)');
console.log('  ├── manifest.json');
console.log('  └── icons/');
console.log('\n🎉 Extension ready to load in Chrome!');

// scripts/copy-schema.js
// Cross-platform schema file copying utility

const fs = require('fs');
const path = require('path');

const sourceFile = process.argv[2];
const targetFile = process.argv[3];

if (!sourceFile || !targetFile) {
  console.error('Usage: node copy-schema.js <source> <target>');
  process.exit(1);
}

try {
  // Ensure target directory exists
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Copied ${sourceFile} to ${targetFile}`);
} catch (error) {
  console.error(`❌ Error copying file: ${error.message}`);
  process.exit(1);
}

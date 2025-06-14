const fs = require('fs');
const path = require('path');

// Read the current sw.js file
const swPath = path.join(__dirname, 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

// Generate a new version number based on timestamp (YYYY.MM.DD.HHMM)
const now = new Date();
const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

// Update the version in the file
const updatedContent = swContent.replace(
  /const CACHE_VERSION = ['"](.*?)['"]/,
  `const CACHE_VERSION = '${version}'`
);

// Write the updated content back to the file
fs.writeFileSync(swPath, updatedContent);

console.log(`Cache version bumped to ${version}`); 
const fs = require('fs');
const path = require('path');

// Read the template
const templatePath = path.join(__dirname, '..', 'moments', 'index.html.template');
const template = fs.readFileSync(templatePath, 'utf8');

// Function to find all moment directories (city/date folders)
function findMomentDirectories(dir) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'index.html.template') {
        const fullPath = path.join(dir, entry.name);
        // Check if this is a date folder (YYYY-MM-DD format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
          results.push(fullPath);
        } else {
          // It's a city folder, recurse into it
          results.push(...findMomentDirectories(fullPath));
        }
      }
    }
  } catch (err) {
    // Skip if directory doesn't exist or can't be read
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return results;
}

// Find all moment directories
const momentsDir = path.join(__dirname, '..', 'moments');
const momentDirs = findMomentDirectories(momentsDir);

let updated = 0;
let created = 0;

// Copy template to each moment directory
momentDirs.forEach(dir => {
  const indexPath = path.join(dir, 'index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    // Read existing file to check if it's the old format
    const existing = fs.readFileSync(indexPath, 'utf8');
    if (existing.includes('window.location.replace') && !existing.includes('window.location.pathname')) {
      // Old format, update it
      fs.writeFileSync(indexPath, template);
      updated++;
      console.log(`Updated: ${path.relative(momentsDir, indexPath)}`);
    } else {
      // Already generic or different format, skip
      console.log(`Skipped (already generic): ${path.relative(momentsDir, indexPath)}`);
    }
  } else {
    // Create new index.html
    fs.writeFileSync(indexPath, template);
    created++;
    console.log(`Created: ${path.relative(momentsDir, indexPath)}`);
  }
});

console.log(`\nSummary:`);
console.log(`  Updated: ${updated}`);
console.log(`  Created: ${created}`);
console.log(`  Total: ${momentDirs.length}`);


const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'node_modules', 'pdf-parse', 'index.js');
let content = fs.readFileSync(indexPath, 'utf8');

// Force isDebugMode to false
content = content.replace(
  'let isDebugMode = !module.parent;',
  'let isDebugMode = false; // patched to disable debug mode'
);

fs.writeFileSync(indexPath, content);
console.log('pdf-parse patched successfully');

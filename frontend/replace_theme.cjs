const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace text, bg, border, ring with purple equivalent
  // Note: blue-50 -> purple-50, blue-600 -> purple-600, etc.
  content = content.replace(/text-blue-/g, 'text-purple-');
  content = content.replace(/bg-blue-/g, 'bg-purple-');
  content = content.replace(/border-blue-/g, 'border-purple-');
  content = content.replace(/ring-blue-/g, 'ring-purple-');

  content = content.replace(/text-indigo-/g, 'text-purple-');
  content = content.replace(/bg-indigo-/g, 'bg-purple-');
  content = content.replace(/border-indigo-/g, 'border-purple-');
  content = content.replace(/ring-indigo-/g, 'ring-purple-');

  // Specific custom color if they meant #7e57c2 for primary buttons
  content = content.replace(/bg-purple-600/g, 'bg-[#7e57c2]');
  content = content.replace(/hover:bg-purple-700/g, 'hover:bg-[#6a48a3]');
  content = content.replace(/text-purple-600/g, 'text-[#7e57c2]');
  content = content.replace(/text-purple-500/g, 'text-[#7e57c2]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(srcDir);
console.log('Done.');

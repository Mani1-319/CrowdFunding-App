const fs = require('fs');
const path = require('path');

const traverseDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Global Tailwind replacements for brand theme overhaul
      let updated = content
        .replace(/bg-indigo-/g, 'bg-emerald-')
        .replace(/text-indigo-/g, 'text-emerald-')
        .replace(/border-indigo-/g, 'border-emerald-')
        .replace(/ring-indigo-/g, 'ring-emerald-')
        .replace(/shadow-indigo-/g, 'shadow-emerald-')
        .replace(/from-indigo-/g, 'from-emerald-')
        .replace(/to-indigo-/g, 'to-emerald-')
        .replace(/via-indigo-/g, 'via-emerald-')
        .replace(/bg-purple-/g, 'bg-teal-')
        .replace(/text-purple-/g, 'text-teal-')
        .replace(/border-purple-/g, 'border-teal-')
        .replace(/from-purple-/g, 'from-teal-')
        .replace(/to-purple-/g, 'to-teal-')
        .replace(/via-purple-/g, 'via-teal-');

      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
      }
    }
  });
};

traverseDir(path.join(__dirname, 'src'));
console.log('UI Theme swapped successfully!');

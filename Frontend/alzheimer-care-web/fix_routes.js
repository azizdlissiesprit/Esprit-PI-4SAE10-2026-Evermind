const fs = require('fs');
const path = require('path');

const basePath = 'd:\\Documents\\myProjects\\Evermind\\EverMind\\Frontend\\alzheimer-care-web\\src\\app\\features';

const routeReplacements = [
  // Must do longer paths first to avoid partial replacements
  ['/admin/categories/modifier/', '/admin/stock/categories/modifier/'],
  ['/admin/categories/ajouter', '/admin/stock/categories/ajouter'],
  ['/admin/categories', '/admin/stock/categories'],
  ['/admin/produits/modifier/', '/admin/stock/produits/modifier/'],
  ['/admin/produits/ajouter', '/admin/stock/produits/ajouter'],
  ['/admin/produits', '/admin/stock/produits'],
  ['/admin/commandes', '/admin/stock/commandes'],
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (filePath.endsWith('.component.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const stockAdminPath = path.join(basePath, 'admin', 'stock-admin');
const stockFrontPath = path.join(basePath, 'stock-front');

let files = [];
if (fs.existsSync(stockAdminPath)) files = files.concat(walkDir(stockAdminPath));
if (fs.existsSync(stockFrontPath)) files = files.concat(walkDir(stockFrontPath));

console.log('Found ' + files.length + ' component files');

let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  for (const [oldPath, newPath] of routeReplacements) {
    if (content.includes(oldPath)) {
      content = content.split(oldPath).join(newPath);
      modified = true;
      totalReplacements++;
      console.log('  Fixed route: ' + oldPath + ' -> ' + newPath + ' in ' + path.basename(file));
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ' + file);
  }
}

console.log('\nTotal route fixes: ' + totalReplacements);

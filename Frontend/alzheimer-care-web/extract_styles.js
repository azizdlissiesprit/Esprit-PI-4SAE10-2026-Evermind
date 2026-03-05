const fs = require('fs');
const path = require('path');

const sourcePath = 'd:\\Documents\\myProjects\\Evermind\\EverMind\\Frontend\\alzheimer-app\\src\\styles.css';
const targetPath = 'd:\\Documents\\myProjects\\Evermind\\EverMind\\Frontend\\alzheimer-care-web\\src\\stock-styles.scss';
const appendTarget = 'd:\\Documents\\myProjects\\Evermind\\EverMind\\Frontend\\alzheimer-care-web\\src\\styles.scss';

let css = fs.readFileSync(sourcePath, 'utf8');

// 1. Remove :root { ... } from source
css = css.replace(/:root\s*\{[^}]+\}/g, '');

// 2. Remove html[data-theme="dark"] variables definition
const darkThemeVarsRegex = /html\[data-theme="dark"\]\s*\{([^}]+)\}/g;
css = css.replace(darkThemeVarsRegex, '');

// 3. Remove sidebar, topbar, main-content sections to avoid breaking the new app layout
css = css.replace(/\/\* ==================== SIDEBAR ==================== \*\/[\s\S]*?\/\* ==================== TOPBAR ==================== \*\//g, '/* Removed Sidebar */\n\n');
css = css.replace(/\/\* ==================== TOPBAR ==================== \*\/[\s\S]*?\/\* ==================== MAIN CONTENT ==================== \*\//g, '/* Removed Topbar */\n\n');
css = css.replace(/\/\* ==================== MAIN CONTENT ==================== \*\/[\s\S]*?\/\* ==================== DASHBOARD ==================== \*\//g, '/* Removed Main Content Layout */\n\n');

// 4. Adapt variables to match the new app's theme based on alzheimer-care-web's styles.scss
// New app uses: --bg-main, --bg-card, --text-primary, --text-secondary, --accent-color
css = css.replace(/var\(--primary\)/g, 'var(--accent-color)');
css = css.replace(/var\(--bg\)/g, 'var(--bg-main)');
// Ensure we handle transitions smoothly by appending our styles to stock-styles.scss

// Save the adapted styles
fs.writeFileSync(targetPath, css, 'utf8');
console.log('Saved stock-styles.scss');

// Append to main styles.scss if not already imported
let mainScss = fs.readFileSync(appendTarget, 'utf8');
if (!mainScss.includes('@import "stock-styles";') && !mainScss.includes('@import \'stock-styles\';')) {
  mainScss += '\n\n/* Stock Module Styles */\n@import "stock-styles";\n';
  fs.writeFileSync(appendTarget, mainScss, 'utf8');
  console.log('Appended import to styles.scss');
} else {
  console.log('styles.scss already imports stock-styles.scss');
}

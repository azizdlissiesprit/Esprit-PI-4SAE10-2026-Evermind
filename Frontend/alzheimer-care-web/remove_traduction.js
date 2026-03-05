const fs = require('fs');
const path = require('path');

const adminDir = 'd:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/features/admin/stock-admin';
const frontDir = 'd:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/features/stock-front';

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fp = path.join(dir, file);
        if (fs.statSync(fp).isDirectory()) {
            processDir(fp);
        } else if (fp.endsWith('.component.ts') || fp.endsWith('.html')) {
            let content = fs.readFileSync(fp, 'utf8');
            let originalContent = content;
            
            // Replace {{ t.tr('key') }} or {{ t.tr("key") }} with just the key (simplistic, just to get it compiling)
            // Or better, just hardcode generic fallbacks or use the key name to be safe
            content = content.replace(/\{\{\s*t\.tr\(['"]([^'"]+)['"](?:,\s*\{[^}]+\})?\)\s*\}\}/g, '$1');
            content = content.replace(/\[\w+\]="t\.tr\(['"]([^'"]+)['"]\)"/g, 'title="$1"');

            // Replace 't' property access if it's left on any elements like placeholders
            content = content.replace(/t\.tr\(['"]([^'"]+)['"]\)/g, "'$1'");

            if (content !== originalContent) {
                fs.writeFileSync(fp, content);
                console.log('Processed translations in', fp);
            }
        }
    }
}

processDir(adminDir);
processDir(frontDir);

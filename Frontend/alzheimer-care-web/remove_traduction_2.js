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
            
            // Fix instances where it got replaced with this.'string'
            content = content.replace(/this\.\s*['"]([^'"]+)['"]/g, "'$1'");
            
            // Fix any remaining t.tr
            content = content.replace(/t\.tr\(['"]([^'"]+)['"](?:,\s*\{[^}]+\})?\)/g, "'$1'");
            content = content.replace(/this\.t\.tr\(['"]([^'"]+)['"](?:,\s*\{[^}]+\})?\)/g, "'$1'");

            // Fix empty bindings like [title]="'string'" if they cause issues, but they shouldn't usually.
            
            if (content !== originalContent) {
                fs.writeFileSync(fp, content);
                console.log('Fixed translation syntax in', fp);
            }
        }
    }
}

processDir(adminDir);
processDir(frontDir);

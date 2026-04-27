const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'Frontend', 'alzheimer-care-web', 'src', 'app', 'features');

const replacements = [
    // SCSS Map Variable replacements (e.g. $bg-body: #FFF; -> $bg-body: var(--bg-main);)
    { regex: /(\$bg-body|\$bg-page|\$bg-main|\$background-base|\$bg-light):\s*(#F[0-9A-Fa-f]{2,5}|#E[0-9A-Fa-f]{2,5}|#fff[fF]*|white)[\s;]*/g, replace: '$1: var(--bg-main);\n' },
    { regex: /(\$bg-white|\$bg-card|\$card-bg):\s*(#F[0-9A-Fa-f]{2,5}|#fff[fF]*|white)[\s;]*/gi, replace: '$1: var(--bg-card);\n' },
    
    { regex: /(\$text-dark|\$text-primary|\$primary-text|\$text-main):\s*(#[0-2][0-9A-Fa-f]{2,5})[\s;]*/g, replace: '$1: var(--text-primary);\n' },
    { regex: /(\$text-grey|\$text-secondary|\$secondary-text):\s*(#[3-7][0-9A-Fa-f]{2,5})[\s;]*/g, replace: '$1: var(--text-secondary);\n' },
    { regex: /(\$text-light|\$text-muted|\$muted-text):\s*(#[8-B][0-9A-Fa-f]{2,5})[\s;]*/g, replace: '$1: var(--text-muted);\n' },
    
    { regex: /(\$border-color|\$border-light|\$border-main):\s*(#[D-F][0-9A-Fa-f]{2,5})[\s;]*/g, replace: '$1: var(--border-color);\n' },

    // Hardcoded color replacements inside classes
    // Replace hardcoded white or light grey backgrounds with var(--bg-card) or var(--bg-inset)
    // Be careful with replacing 'white' globally, target specific properties
    { regex: /background(-color)?:\s*(#ffffff|#fff|white)\s*;/gi, replace: 'background$1: var(--bg-card);' },
    { regex: /background(-color)?:\s*(#F[8-9A-Fa-f][8-9A-Fa-f][8-9A-Fa-f][8-9A-Fa-f][8-9A-Fa-f]|#F[4-7][4-7][4-7][4-7][4-7]|#f8fafc|#f4f7fc|#f1f5f9|#f0f4f8)\s*;/gi, replace: 'background$1: var(--bg-inset);' },
    
    { regex: /background(-color)?:\s*(rgba\(255,\s*255,\s*255,\s*1\))\s*;/gi, replace: 'background$1: var(--bg-card);' },
    
    // Replace text colors
    { regex: /color:\s*(#0f172a|#1e293b|#111827|#1f2937|#0[0-9a-f]{5}|#1[0-9a-f]{5})\s*;/gi, replace: 'color: var(--text-primary);' },
    { regex: /color:\s*(#475569|#64748b|#4b5563|#374151|#3[0-9a-f]{5}|#4[0-9a-f]{5}|#5[0-9a-f]{5}|#6[0-9a-f]{5})\s*;/gi, replace: 'color: var(--text-secondary);' },
    { regex: /color:\s*(#94a3b8|#cbd5e1|#9ca3af|#d1d5db|#7[0-9a-f]{5}|#8[0-9a-f]{5}|#9[0-9a-f]{5})\s*;/gi, replace: 'color: var(--text-muted);' },

    // Replace border colors
    { regex: /border(-color)?:\s*([0-9]+px\s+(solid|dashed|dotted)\s+)?(#e2e8f0|#f1f5f9|#e5e7eb|#f3f4f6|#[c-f][0-9a-f]{5})\s*;/gi, replace: 'border$1: $2 var(--border-color);' },
];

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.scss')) {
            processFile(fullPath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(({ regex, replace }) => {
        content = content.replace(regex, replace);
    });

    // Also wrap with host-context auto theme inversion for some specific things if needed, 
    // but standard vars should now handle it since styles.scss has the global scope.
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log('Starting SCSS refactor...');
processDirectory(targetDir);
console.log('Complete.');

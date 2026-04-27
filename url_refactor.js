const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'Frontend', 'alzheimer-care-web', 'src', 'app', 'core', 'services');

// The replacement regex
// 1. Regex to inject the import statement
// 2. Regex to replace http://localhost:[Port]/ with `${environment.apiUrl}/` and change quotes to ticks if necessary.

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fast check
    if (!content.includes('http://localhost:')) {
        return;
    }

    // Add import statement if not present
    if (!content.includes('import { environment }')) {
        // Calculate relative path to environments. Assuming services are 3 or 4 levels deep from src
        // src/environments/environment
        const envPath = "import { environment } from '../../../../environments/environment';"; // from src/app/core/services (3 levels deep) -> actually from src is 3 levels: ../../../environments/environment
        // Wait, app/core/services is 3 levels deep from `src`:
        // src -> app -> core -> services
        // so back out: ../../../environments/environment
        const correctEnvPath = "import { environment } from '../../../environments/environment';";
        
        // Insert it after the last import
        const match = content.match(/import .*?;/g);
        if (match) {
            const lastImportPos = content.lastIndexOf(match[match.length - 1]) + match[match.length - 1].length;
            content = content.slice(0, lastImportPos) + '\n' + correctEnvPath + content.slice(lastImportPos);
        } else {
            content = correctEnvPath + '\n' + content;
        }
    }

    // Replace literal strings with template literals using environment.apiUrl
    
    // Pattern 1: 'http://localhost:8090/alert' -> `${environment.apiUrl}/alert`
    // Match any 'http://localhost:80??
    content = content.replace(/'http:\/\/localhost:[0-9]+\/(.*?)'/g, '`${environment.apiUrl}/$1`');
    content = content.replace(/"http:\/\/localhost:[0-9]+\/(.*?)"/g, '`${environment.apiUrl}/$1`');
    
    // Pattern 2: Without trailing slash (e.g. 'http://localhost:8090')
    content = content.replace(/'http:\/\/localhost:[0-9]+'/g, 'environment.apiUrl');
    content = content.replace(/"http:\/\/localhost:[0-9]+"/g, 'environment.apiUrl');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log('Starting Service URL refactor...');
processDirectory(targetDir);
console.log('Complete.');

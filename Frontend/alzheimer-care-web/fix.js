const fs = require('fs');
const path = require('path');

const coreServicesDir = 'd:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/core/services';
const coreModelsDir = 'd:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/core/models';

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      replaceInDir(fp);
    } else if (fp.endsWith('.ts')) {
      let content = fs.readFileSync(fp, 'utf8');
      
      const relativeToServices = path.relative(path.dirname(fp), coreServicesDir).replace(/\\/g, '/');
      const relativeToModels = path.relative(path.dirname(fp), coreModelsDir).replace(/\\/g, '/');
      
      content = content.replace(/from\s+['"](?:\.\.\/)+services\/([^'"]+)['"]/g, `from '${relativeToServices}/$1'`);
      content = content.replace(/from\s+['"](?:\.\.\/)+modeles\/([^'"]+)['"]/g, `from '${relativeToModels}/$1'`);
      
      fs.writeFileSync(fp, content);
      console.log('Fixed imports in', f);
    }
  }
}

replaceInDir('d:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/features/admin/stock-admin');
replaceInDir('d:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/features/stock-front');

const serviceFiles = fs.readdirSync(coreServicesDir).filter(f => f.endsWith('.service.ts'));
for(const f of serviceFiles) {
  const fp = path.join(coreServicesDir, f);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/import\s+\{\s*environment\s*\}\s*from\s*['"][^'"]+environments\/environment['"];\r?\n?/g, '');
  content = content.replace(/`\$\{environment\.apiUrl\}/g, "'http://localhost:8090/stock/api");
  content = content.replace(/\.\.\/modeles\//g, '../models/');
  fs.writeFileSync(fp, content);
  console.log('Fixed service', f);
}

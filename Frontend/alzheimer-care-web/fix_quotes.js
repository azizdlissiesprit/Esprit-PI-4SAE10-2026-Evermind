const fs = require('fs');
const path = require('path');

const coreServicesDir = 'd:/Documents/myProjects/Evermind/EverMind/Frontend/alzheimer-care-web/src/app/core/services';
const serviceFiles = fs.readdirSync(coreServicesDir).filter(f => f.endsWith('.service.ts'));

for(const f of serviceFiles) {
  const fp = path.join(coreServicesDir, f);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/'http:\/\/localhost:8090\/stock\/api\/([^`]+)`/g, "'http://localhost:8090/stock/api/$1'");
  fs.writeFileSync(fp, content);
  console.log('Fixed quotes in', f);
}

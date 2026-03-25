const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/admin/Desktop/12-02/Frontend/src';
const configPath = path.join(srcDir, 'config', 'apiConfig');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let fixedCount = 0;

files.forEach(file => {
    file = file.replace(/\\/g, '/');
    if (file.includes('apiConfig.js')) return;

    let content = fs.readFileSync(file, 'utf8');
    
    // If it relies on GLOBAL_API_URL but does not IMPORT apiConfig
    if ((content.includes('GLOBAL_API_URL') || content.includes('GLOBAL_DOMAIN_URL')) && !content.includes('apiConfig')) {
        let relativeConfigPath = path.relative(path.dirname(file), configPath).replace(/\\/g, '/');
        if (!relativeConfigPath.startsWith('.')) relativeConfigPath = './' + relativeConfigPath;
        
        let imports = [];
        if (content.includes('GLOBAL_API_URL')) imports.push('API_URL as GLOBAL_API_URL');
        if (content.includes('GLOBAL_DOMAIN_URL')) imports.push('DOMAIN_URL as GLOBAL_DOMAIN_URL');
        
        const importStatement = `import { ${imports.join(', ')} } from '${relativeConfigPath}';\n`;
        
        const match = content.match(/import /);
        const injectIndex = match ? match.index : 0;
        content = content.substring(0, injectIndex) + importStatement + content.substring(injectIndex);
        
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('Fixed missing import:', file);
    }
});

console.log('Total files repaired:', fixedCount);

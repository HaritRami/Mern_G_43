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
let updatedCount = 0;

files.forEach(file => {
    file = file.replace(/\\/g, '/');
    if (file.includes('apiConfig.js')) return;

    let content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('http://localhost:5000')) {
        let relativeConfigPath = path.relative(path.dirname(file), configPath).replace(/\\/g, '/');
        if (!relativeConfigPath.startsWith('.')) relativeConfigPath = './' + relativeConfigPath;
        
        let needsApiUrl = false;
        let needsDomainUrl = false;

        // Replace http://localhost:5000/api
        if (content.match(/['"`]http:\/\/localhost:5000\/api([^'"`]*)['"`]/)) {
            content = content.replace(/['"`]http:\/\/localhost:5000\/api([^'"`]*)['"`]/g, '`${GLOBAL_API_URL}$1`');
            needsApiUrl = true;
        }
        
        // Replace remaining http://localhost:5000
        if (content.match(/['"`]http:\/\/localhost:5000([^'"`]*)['"`]/)) {
            content = content.replace(/['"`]http:\/\/localhost:5000([^'"`]*)['"`]/g, '`${GLOBAL_DOMAIN_URL}$1`');
            needsDomainUrl = true;
        }

        if (needsApiUrl || needsDomainUrl) {
            let imports = [];
            if (needsApiUrl) imports.push('API_URL as GLOBAL_API_URL');
            if (needsDomainUrl) imports.push('DOMAIN_URL as GLOBAL_DOMAIN_URL');
            
            const importStatement = `import { ${imports.join(', ')} } from '${relativeConfigPath}';\n`;
            
            if (!content.includes('GLOBAL_API_URL') && !content.includes('GLOBAL_DOMAIN_URL') && !content.includes('apiConfig')) {
                // Find first import index or 0
                const match = content.match(/import /);
                const injectIndex = match ? match.index : 0;
                content = content.substring(0, injectIndex) + importStatement + content.substring(injectIndex);
                
                fs.writeFileSync(file, content, 'utf8');
                updatedCount++;
                console.log('Updated:', file);
            } else if (content.includes('GLOBAL_API_URL') || content.includes('apiConfig')) {
                 fs.writeFileSync(file, content, 'utf8'); // Just save the replacements
                 updatedCount++;
                 console.log('Updated (Import already existed):', file);
            }
        }
    }
});

console.log('Total files updated:', updatedCount);

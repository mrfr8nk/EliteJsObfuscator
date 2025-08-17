const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const excludeFiles = ['settings.js', 'config.js', '.env'];

function obfuscateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      obfuscateDirectory(fullPath);
    } else if (
      fullPath.endsWith('.js') && 
      !excludeFiles.includes(path.basename(fullPath))  // Fixed: Added missing parenthesis
    ) {  // This closing parenthesis was missing
      try {
        let code = fs.readFileSync(fullPath, 'utf8');
        
        // Add MR FRANK comment if not already present
        if (!code.includes('// MR FRANK')) {
          code = `// MR FRANK\n${code}`;
        }

        const isHeavyObfuscation = fullPath.includes('data') || 
                                  fullPath.includes(path.join('plugins', 'lib'));

        const obfuscationOptions = {
          compact: true,
          controlFlowFlattening: isHeavyObfuscation,
          controlFlowFlatteningThreshold: isHeavyObfuscation ? 0.75 : 0.5,
          deadCodeInjection: isHeavyObfuscation,
          deadCodeInjectionThreshold: isHeavyObfuscation ? 0.4 : 0.2,
          stringArray: true,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          selfDefending: true,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          reservedNames: ['MR FRANK'],
          transformObjectKeys: false,
          renameGlobals: true,
          unicodeEscapeSequence: true
        };

        const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscationOptions)
          .getObfuscatedCode();
        
        fs.writeFileSync(fullPath, obfuscatedCode, 'utf8');
        console.log(`Obfuscated: ${path.relative(dirPath, fullPath)}`);
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  });
}

module.exports = obfuscateDirectory;

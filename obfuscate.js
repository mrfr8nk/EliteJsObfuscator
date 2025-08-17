const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const excludeFiles = ['settings.js', 'config.js'];

function obfuscateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      obfuscateDirectory(fullPath);
    } else if (fullPath.endsWith('.js') && !excludeFiles.includes(path.basename(fullPath))) {

      const code = fs.readFileSync(fullPath, 'utf8');

      // Heavy obfuscation for data and plugins/lib
      const heavy = fullPath.includes('data') || fullPath.includes(path.join('plugins','lib'));

      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: heavy,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: heavy,
        deadCodeInjectionThreshold: 0.4,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        selfDefending: heavy,
        disableConsoleOutput: true
      }).getObfuscatedCode();

      fs.writeFileSync(fullPath, obfuscatedCode, 'utf8');
      console.log(`Obfuscated: ${fullPath}`);
    }
  });
}

module.exports = obfuscateDirectory;

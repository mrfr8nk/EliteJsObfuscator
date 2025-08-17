/*const fs = require('fs');
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
*/

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

/**
 * Recursively obfuscates all JS files in a directory.
 * Skips `settings.js` and `config.js`.
 * Adds a custom banner at the top of each file.
 *
 * @param {string} dir - Directory to obfuscate
 * @param {object} options - { banner: string }
 */
function obfuscateDirectory(dir, options = {}) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      obfuscateDirectory(filePath, options);
    } else if (file.endsWith('.js')) {
      // Skip settings.js and config.js
      if (file === 'settings.js' || file === 'config.js') {
        console.log(`Skipping ${file}`);
        continue;
      }

      try {
        let code = fs.readFileSync(filePath, 'utf8');

        // Obfuscate the code
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          stringArray: true,
          stringArrayEncoding: ['rc4'],
          stringArrayThreshold: 0.75,
        });

        // Add banner if provided
        const obfuscatedCode =
          (options.banner || '// Powered by MR FRANK 😎\n') +
          obfuscationResult.getObfuscatedCode();

        // Write back to the file
        fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
        console.log(`Obfuscated: ${filePath}`);
      } catch (err) {
        console.error(`❌ Failed to obfuscate ${filePath}:`, err.message);
      }
    }
  }
}

module.exports = obfuscateDirectory;

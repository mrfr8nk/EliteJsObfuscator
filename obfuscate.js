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
  const results = {
    total: 0,
    obfuscated: 0,
    skipped: 0,
    failed: 0,
    files: []
  };

  function processDirectory(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      
      // Skip if path doesn't exist (safety check)
      if (!fs.existsSync(filePath)) continue;
      
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and .git folders
        if (file !== 'node_modules' && file !== '.git') {
          processDirectory(filePath);
        }
        continue;
      } 
      
      if (file.endsWith('.js')) {
        results.total++;
        
        // Skip settings.js and config.js
        if (file === 'settings.js' || file === 'config.js') {
          console.log(`⏭️  Skipping ${filePath}`);
          results.skipped++;
          continue;
        }

        try {
          console.log(`📝 Processing: ${filePath}`);
          let code = fs.readFileSync(filePath, 'utf8');

          // Obfuscate the code
          const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            selfDefending: true,
            disableConsoleOutput: false,
            transformObjectKeys: true,
            identifierNamesGenerator: 'hexadecimal',
            rotateStringArray: true
          });

          // Add banner if provided
          const banner = options.banner || '// Obfuscated by MR FRANK\n';
          const obfuscatedCode = banner + obfuscationResult.getObfuscatedCode();

          // Write back to the file
          fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
          console.log(`✅ Obfuscated: ${filePath}`);
          results.obfuscated++;
          results.files.push({ path: filePath, status: 'success' });
        } catch (err) {
          console.error(`❌ Failed to obfuscate ${filePath}:`, err.message);
          results.failed++;
          results.files.push({ path: filePath, status: 'failed', error: err.message });
        }
      }
    }
  }

  // Start processing
  console.log(`\n🔍 Starting obfuscation in: ${dir}`);
  processDirectory(dir);
  
  // Print summary
  console.log('\n📊 Obfuscation Summary:');
  console.log(`   Total files: ${results.total}`);
  console.log(`   ✅ Obfuscated: ${results.obfuscated}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('');
  
  return results;
}

// Make sure we're exporting the function correctly
module.exports = obfuscateDirectory;

// Also export as default for ES modules compatibility
module.exports.default = obfuscateDirectory;

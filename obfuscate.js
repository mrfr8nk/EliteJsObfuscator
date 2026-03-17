const fs = require('fs-extra');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Configuration
const inputDir = './'; // Current directory (your repo root)
const outputDir = './obfuscated_output'; // Where all files will go
const excludeFiles = ['settings.js', 'config.js', 'obfuscate-all.js']; // Files to skip
const excludeDirs = ['node_modules', '.git', 'obfuscated_output']; // Directories to skip

// File extensions to process
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'];

// Ensure output directory exists and is empty
fs.emptyDirSync(outputDir);

/**
 * Process all files recursively
 */
async function processDirectory(dir) {
  const files = await fs.readdir(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    
    // Skip excluded directories
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file) && !file.startsWith('.')) {
        await processDirectory(fullPath);
      }
      continue;
    }
    
    // Check if file should be processed
    const ext = path.extname(file).toLowerCase();
    if (!extensions.includes(ext)) continue;
    if (excludeFiles.includes(file)) {
      console.log(`Skipping excluded file: ${file}`);
      continue;
    }
    
    try {
      // Read file content
      const code = await fs.readFile(fullPath, 'utf8');
      
      // Determine obfuscation intensity based on path
      const isSensitive = fullPath.includes('data') || 
                         fullPath.includes('plugins') || 
                         fullPath.includes('lib') ||
                         fullPath.includes('core') ||
                         fullPath.includes('utils');
      
      // Obfuscation options
      const obfuscationOptions = {
        compact: true,
        controlFlowFlattening: isSensitive,
        controlFlowFlatteningThreshold: isSensitive ? 0.75 : 0.5,
        deadCodeInjection: isSensitive,
        deadCodeInjectionThreshold: isSensitive ? 0.4 : 0.2,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        selfDefending: isSensitive,
        disableConsoleOutput: false, // Set to true to disable console logs
        transformObjectKeys: isSensitive,
        unicodeEscapeSequence: false,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false, // Set to true to rename global variables (may break code)
        rotateStringArray: true,
        splitStrings: isSensitive,
        splitStringsChunkLength: 10
      };
      
      // Obfuscate the code
      const obfuscated = JavaScriptObfuscator.obfuscate(code, obfuscationOptions).getObfuscatedCode();
      
      // Create output filename (include original path structure in filename)
      const relativePath = path.relative(inputDir, fullPath);
      const safeFilename = relativePath.replace(/[/\\]/g, '_');
      const outputFilePath = path.join(outputDir, safeFilename);
      
      // Add banner
      const banner = `// Obfuscated with MR FRANK's tool\n// Original: ${relativePath}\n// Date: ${new Date().toISOString()}\n\n`;
      const finalCode = banner + obfuscated;
      
      // Write to output directory
      await fs.writeFile(outputFilePath, finalCode, 'utf8');
      
      console.log(`✅ Obfuscated: ${relativePath} -> ${safeFilename}`);
    } catch (err) {
      console.error(`❌ Failed to obfuscate ${fullPath}:`, err.message);
    }
  }
}

// Start the process
(async () => {
  console.log('🚀 Starting obfuscation of all JS/TS files...');
  console.log(`📁 Input directory: ${path.resolve(inputDir)}`);
  console.log(`📁 Output directory: ${path.resolve(outputDir)}`);
  console.log('---');
  
  try {
    await processDirectory(inputDir);
    
    // Create an index file with mapping
    const mappingFile = path.join(outputDir, '_file_mapping.txt');
    const files = await fs.readdir(outputDir);
    const mapping = files
      .filter(f => !f.startsWith('_'))
      .map(f => {
        const original = f.replace(/_/g, '/');
        return `${f} -> ${original}`;
      })
      .join('\n');
    
    await fs.writeFile(mappingFile, `File Mapping:\n${mapping}\n`, 'utf8');
    
    console.log('---');
    console.log(`✨ Done! Obfuscated files are in: ${outputDir}`);
    console.log(`📋 File mapping saved to: ${mappingFile}`);
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();

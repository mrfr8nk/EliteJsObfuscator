const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs-extra'); // Use fs-extra for better promise support
const path = require('path');
const obfuscateDirectory = require('./obfuscate');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON parser
app.use(express.static('public'));

// Test endpoint to verify obfuscation is working
app.get('/test-obfuscate', async (req, res) => {
  try {
    // Create a test directory
    const testDir = '/tmp/test_obfuscate';
    await fs.ensureDir(testDir);
    
    // Create a test JS file
    const testFile = path.join(testDir, 'test.js');
    await fs.writeFile(testFile, 'console.log("Hello World");');
    
    console.log('Testing obfuscation function...');
    const result = obfuscateDirectory(testDir, {
      banner: '// Test obfuscation\n'
    });
    
    // Read the obfuscated file
    const obfuscated = await fs.readFile(testFile, 'utf8');
    
    // Cleanup
    await fs.remove(testDir);
    
    res.json({ 
      success: true, 
      message: 'Obfuscation test passed',
      result: result,
      obfuscated_preview: obfuscated.substring(0, 200) + '...'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

app.post('/obfuscate', async (req, res) => {
  const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;
  
  // Validate inputs
  if (!sourceRepo || !destRepo || !token || !gitUser || !gitEmail) {
    return res.json({ 
      success: false, 
      message: 'All fields are required.',
      received: { sourceRepo: !!sourceRepo, destRepo: !!destRepo, token: !!token, gitUser: !!gitUser, gitEmail: !!gitEmail }
    });
  }

  // Always use ephemeral storage
  const tmpDir = '/tmp/tmp_repo';
  
  try {
    // Clean up any existing directory
    if (await fs.pathExists(tmpDir)) {
      console.log('🧹 Cleaning up existing temp directory...');
      await fs.remove(tmpDir);
    }

    // Create URLs with token
    const sourceUrl = sourceRepo.replace('https://', `https://${token}@`);
    const destUrl = destRepo.replace('https://', `https://${token}@`);

    const git = simpleGit();

    // Clone source repo
    console.log('📦 Cloning source repo...');
    await git.clone(sourceUrl, tmpDir);
    console.log('✅ Source repo cloned');

    // Verify the clone worked
    const files = await fs.readdir(tmpDir);
    console.log(`📁 Found ${files.length} items in cloned repo`);

    // Count JS files before obfuscation
    const jsFilesBefore = await findJsFiles(tmpDir);
    console.log(`📊 Found ${jsFilesBefore.length} JS files to obfuscate`);

    // Run obfuscation
    console.log('🔒 Starting obfuscation...');
    
    // Check if obfuscateDirectory is a function
    if (typeof obfuscateDirectory !== 'function') {
      throw new Error('obfuscateDirectory is not a function. Type: ' + typeof obfuscateDirectory);
    }
    
    const obfuscationResults = obfuscateDirectory(tmpDir, {
      banner: '// Obfuscated by MR FRANK - https://github.com/mrfrank\n'
    });
    
    console.log('✅ Obfuscation complete!');
    console.log(`   Obfuscated: ${obfuscationResults.obfuscated} files`);
    console.log(`   Failed: ${obfuscationResults.failed} files`);

    // Initialize git in the cloned repo
    const destGit = simpleGit(tmpDir);

    // Set git identity dynamically
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    // Check if there are changes to commit
    const status = await destGit.status();
    
    if (status.files.length === 0) {
      console.log('⚠️  No changes to commit');
      return res.json({ 
        success: true, 
        message: 'No changes to commit - files may already be obfuscated',
        obfuscationResults 
      });
    }

    console.log('📝 Adding files to git...');
    await destGit.add('.');

    console.log('💾 Committing changes...');
    await destGit.commit('Obfuscated JS files - Powered by MR FRANK');

    console.log('🚀 Pushing to destination repo (force overwrite)...');
    await destGit.push(destUrl, 'main', ['--force']);

    // Get commit info
    const log = await destGit.log();
    
    console.log('✅ Done! Obfuscated files pushed to destination repo.');
    
    res.json({ 
      success: true, 
      message: 'Obfuscation complete and pushed to destination repo!',
      details: {
        filesProcessed: obfuscationResults.total,
        filesObfuscated: obfuscationResults.obfuscated,
        filesSkipped: obfuscationResults.skipped,
        filesFailed: obfuscationResults.failed,
        commitHash: log.latest?.hash,
        commitMessage: log.latest?.message
      }
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.json({ 
      success: false, 
      message: 'Error: ' + err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    // Cleanup temp directory
    try {
      if (await fs.pathExists(tmpDir)) {
        await fs.remove(tmpDir);
        console.log('🧹 Cleaned up temp directory');
      }
    } catch (cleanupError) {
      console.error('⚠️  Cleanup error:', cleanupError);
    }
  }
});

// Helper function to find all JS files
async function findJsFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules' && item !== '.git') {
      const subFiles = await findJsFiles(fullPath);
      files.push(...subFiles);
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const PORT = process.env.PORT || 7860;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test obfuscation at: http://localhost:${PORT}/test-obfuscate`);
});

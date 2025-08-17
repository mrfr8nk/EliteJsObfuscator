const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const obfuscateDirectory = require('./obfuscate');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.post('/obfuscate', async (req, res, next) => {
  try {
    const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;
    
    // Validate inputs
    if (!sourceRepo || !destRepo || !gitUser || !gitEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use environment variable if available
    const authToken = process.env.GIT_TOKEN || token;
    if (!authToken) {
      return res.status(400).json({ error: 'No GitHub token provided' });
    }

    const tmpDir = path.join(__dirname, 'tmp_repo');
    
    // Cleanup previous runs if they exist
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    // Create temporary directory
    fs.mkdirSync(tmpDir);

    const git = simpleGit();
    const sourceUrl = `https://${authToken}@${sourceRepo.replace('https://', '').replace('github.com/', '')}`;
    const destUrl = `https://${authToken}@${destRepo.replace('https://', '').replace('github.com/', '')}`;

    console.log('Cloning source repository...');
    await git.clone(sourceUrl, tmpDir);

    console.log('Starting obfuscation process...');
    obfuscateDirectory(tmpDir);

    const destGit = simpleGit(tmpDir);
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    console.log('Staging files...');
    await destGit.add('.');

    console.log('Creating commit...');
    await destGit.commit('Obfuscated JS files - // MR FRANK');

    console.log('Pushing to destination repository...');
    await destGit.push(destUrl, 'main');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
    
    console.log('Obfuscation completed successfully');
    res.json({ 
      success: true, 
      message: 'Obfuscation complete and pushed to destination repository!'
    });
  } catch (err) {
    console.error('Process failed:', err);
    next(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

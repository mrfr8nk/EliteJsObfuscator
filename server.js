const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const obfuscateDirectory = require('./obfuscate');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

app.post('/obfuscate', async (req, res) => {
  try {
    const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;

    // Validate inputs
    if (!sourceRepo || !destRepo || !gitUser || !gitEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['sourceRepo', 'destRepo', 'gitUser', 'gitEmail']
      });
    }

    if (!sourceRepo.includes('github.com') || !destRepo.includes('github.com')) {
      return res.status(400).json({ 
        error: 'Invalid GitHub URL',
        example: 'https://github.com/username/repo'
      });
    }

    const authToken = process.env.GIT_TOKEN || token;
    if (!authToken) {
      return res.status(400).json({ error: 'GitHub token is required' });
    }

    const tmpDir = path.join(__dirname, 'tmp_repo');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    const git = simpleGit();
    const sourceUrl = `https://${authToken}@${sourceRepo.replace('https://', '').replace('github.com/', '')}`;
    const destUrl = `https://${authToken}@${destRepo.replace('https://', '').replace('github.com/', '')}`;

    console.log('Cloning repository...');
    await git.clone(sourceUrl, tmpDir);

    console.log('Obfuscating files...');
    obfuscateDirectory(tmpDir);

    const destGit = simpleGit(tmpDir);
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    console.log('Committing changes...');
    await destGit.add('.');
    await destGit.commit('Obfuscated files - // MR FRANK');

    console.log('Pushing to destination...');
    await destGit.push(destUrl, 'main');

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });

    res.json({ 
      success: true,
      message: 'Successfully obfuscated and pushed to destination repository'
    });

  } catch (err) {
    console.error('Obfuscation failed:', err);
    res.status(500).json({ 
      error: 'Obfuscation failed',
      message: err.message.includes('remote:') ? 
        err.message.split('remote:')[1].trim() : 
        err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

app.post('/obfuscate', async (req, res) => {
  const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;
  if (!sourceRepo || !destRepo || !gitUser || !gitEmail) {
    return res.status(400).json({ error: 'All fields except token are required' });
  }

  // Use environment variable if available, otherwise use provided token
  const authToken = process.env.GIT_TOKEN || token;
  if (!authToken) {
    return res.status(400).json({ error: 'No GitHub token provided' });
  }

  const tmpDir = path.join(__dirname, 'tmp_repo');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

  try {
    const git = simpleGit();
    const sourceUrl = `https://${authToken}@${sourceRepo.replace('https://', '').replace('github.com/', '')}`;
    const destUrl = `https://${authToken}@${destRepo.replace('https://', '').replace('github.com/', '')}`;

    console.log('Cloning source repo...');
    await git.clone(sourceUrl, tmpDir);

    console.log('Starting obfuscation...');
    obfuscateDirectory(tmpDir);

    const destGit = simpleGit(tmpDir);
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    console.log('Adding files to git...');
    await destGit.add('.');

    console.log('Committing changes...');
    await destGit.commit('Obfuscated JS files - // MR FRANK');

    console.log('Pushing to destination repo...');
    await destGit.push(destUrl, 'main');

    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('Success!');
    res.json({ success: true, message: 'Obfuscation complete and pushed to destination repo!' });
  } catch (err) {
    console.error('Error:', err);
    fs.rmSync(tmpDir, { recursive: true, force: true }).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

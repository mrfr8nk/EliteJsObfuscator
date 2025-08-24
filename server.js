const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const obfuscateDirectory = require('./obfuscate');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- Helper to log & (later) send progress ---
function sendProgress(message) {
  console.log(`[PROGRESS] ${message}`);
  // Later you can also push updates to frontend via SSE/WebSocket here
}

app.post('/obfuscate', async (req, res) => {
  const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;
  if (!sourceRepo || !destRepo || !token || !gitUser || !gitEmail) {
    return res.send('All fields are required.');
  }

  // Always use ephemeral storage on Render
  const tmpDir = '/tmp/tmp_repo';
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    sendProgress('Old repo removed from /tmp.');
  }

  const sourceUrl = sourceRepo.replace('https://', `https://${token}@`);
  const destUrl = destRepo.replace('https://', `https://${token}@`);

  const git = simpleGit();

  try {
    sendProgress('Cloning source repo...');
    await git.clone(sourceUrl, tmpDir);

    sendProgress('Starting obfuscation...');
    obfuscateDirectory(tmpDir, {
      banner: '// Powered by MR FRANK\n'
    });
    sendProgress('Obfuscation complete!');

    const destGit = simpleGit(tmpDir);

    // Set git identity dynamically
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    sendProgress('Adding files to git...');
    await destGit.add('.');

    sendProgress('Committing changes...');
    await destGit.commit('Obfuscated JS files - Powered by MR FRANK');

    sendProgress('Pushing to destination repo (force overwrite)...');
    await destGit.push(destUrl, 'main', ['--force']);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });

    sendProgress('✅ Done! Obfuscated files pushed to destination repo.');
    res.send('Obfuscation complete and pushed to destination repo!');
  } catch (err) {
    console.error(err);
    res.send('Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

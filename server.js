const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const obfuscateDirectory = require('./obfuscate');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// SSE clients storage
let sseClients = [];

// SSE endpoint for progress updates
app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  sseClients.push(res);
  
  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// --- Helper to log & send progress ---
function sendProgress(message, status = 'active') {
  console.log(`[PROGRESS] ${message}`);
  
  sseClients.forEach(client => {
    client.write(`data: ${JSON.stringify({ message, status })}\n\n`);
  });
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

    sendProgress('✅ Done! Obfuscated files pushed to destination repo.', 'complete');
    res.send('Obfuscation complete and pushed to destination repo!');
  } catch (err) {
    console.error(err);
    sendProgress('❌ Error: ' + err.message, 'error');
    res.send('Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

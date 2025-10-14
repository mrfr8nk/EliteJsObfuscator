const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const obfuscateDirectory = require('./obfuscate');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/obfuscate', async (req, res) => {
  const { sourceRepo, destRepo, token, gitUser, gitEmail } = req.body;
  if (!sourceRepo || !destRepo || !token || !gitUser || !gitEmail) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  // Always use ephemeral storage
  const tmpDir = '/tmp/tmp_repo';
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const sourceUrl = sourceRepo.replace('https://', `https://${token}@`);
  const destUrl = destRepo.replace('https://', `https://${token}@`);

  const git = simpleGit();

  try {
    console.log('Cloning source repo...');
    await git.clone(sourceUrl, tmpDir);

    console.log('Starting obfuscation...');
    obfuscateDirectory(tmpDir, {
      banner: '// Powered by MR FRANK\n'
    });
    console.log('Obfuscation complete!');

    const destGit = simpleGit(tmpDir);

    // Set git identity dynamically
    await destGit.addConfig('user.name', gitUser);
    await destGit.addConfig('user.email', gitEmail);

    console.log('Adding files to git...');
    await destGit.add('.');

    console.log('Committing changes...');
    await destGit.commit('Obfuscated JS files - Powered by MR FRANK');

    console.log('Pushing to destination repo (force overwrite)...');
    await destGit.push(destUrl, 'main', ['--force']);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });

    console.log('✅ Done! Obfuscated files pushed to destination repo.');
    res.json({ success: true, message: 'Obfuscation complete and pushed to destination repo!' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

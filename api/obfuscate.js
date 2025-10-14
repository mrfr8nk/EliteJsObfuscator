const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const obfuscateDirectory = require('../obfuscate');

module.exports.config = {
  runtime: 'nodejs20.x',
  maxDuration: 60,
  memory: 1024,
};

async function parseUrlEncodedBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const bodyStr = Buffer.concat(chunks).toString('utf8');
  // Handles application/x-www-form-urlencoded
  const params = new URLSearchParams(bodyStr);
  return Object.fromEntries(params.entries());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await parseUrlEncodedBody(req);
    const { sourceRepo, destRepo, token, gitUser, gitEmail } = body;

    if (!sourceRepo || !destRepo || !token || !gitUser || !gitEmail) {
      res.statusCode = 400;
      res.end('All fields are required.');
      return;
    }

    const tmpDir = '/tmp/tmp_repo';
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    const onAuth = () => ({ username: token, password: '' });

    // Clone source repository (shallow for speed)
    await git.clone({
      fs,
      http,
      dir: tmpDir,
      url: sourceRepo,
      singleBranch: false,
      depth: 1,
      onAuth,
    });

    // Obfuscate JavaScript files in-place
    obfuscateDirectory(tmpDir, { banner: '// Powered by MR FRANK\n' });

    // Stage changes: add all tracked files (sufficient since we only modify)
    const trackedFiles = await git.listFiles({ fs, dir: tmpDir });
    for (const filepath of trackedFiles) {
      await git.add({ fs, dir: tmpDir, filepath });
    }

    // Commit changes
    await git.commit({
      fs,
      dir: tmpDir,
      message: 'Obfuscated JS files - Powered by MR FRANK',
      author: { name: gitUser, email: gitEmail },
      committer: { name: gitUser, email: gitEmail },
    });

    // Determine current branch; fallback to main
    let currentBranch = await git.currentBranch({ fs, dir: tmpDir, fullname: false });
    if (!currentBranch) currentBranch = 'main';

    // Push to destination repository (force overwrite)
    await git.push({
      fs,
      http,
      dir: tmpDir,
      url: destRepo,
      ref: currentBranch,
      force: true,
      onAuth,
    });

    // Cleanup
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Obfuscation complete and pushed to destination repo!');
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Error: ' + (err && err.message ? err.message : String(err)));
  }
};

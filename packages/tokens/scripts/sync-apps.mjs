// Copies the built package into web-next and mobile-react without a full reinstall.
//
// The apps install @app/tokens as a copy (`install-links=true`). `npm install` skips the
// copy when the version did not change, so edits to this package never reach the apps.
// This script replaces node_modules/@app/tokens in each app with the current files
// (package.json + the "files" list), exactly what an install would copy.
//
// Usage (from packages/tokens):  npm run sync
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageDir, '..', '..');
const manifest = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const entries = ['package.json', ...manifest.files];
const apps = ['web-next', 'mobile-react'];

let failed = false;
for (const app of apps) {
  const appDir = path.join(repoRoot, app);
  if (!existsSync(appDir)) {
    console.log(`- ${app}: not found, skipped`);
    continue;
  }

  if (!existsSync(path.join(appDir, 'node_modules'))) {
    console.log(`- ${app}: no node_modules yet, running npm install ...`);
    const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: appDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    if (result.status !== 0) {
      console.error(`  npm install failed in ${app}`);
      failed = true;
    }
    continue;
  }

  const target = path.join(appDir, 'node_modules', '@app', 'tokens');
  // Removes a copied folder, or only the link itself if an older install left a symlink/junction.
  rmSync(target, { recursive: true, force: true });
  for (const entry of entries) {
    const source = path.join(packageDir, entry);
    if (existsSync(source)) cpSync(source, path.join(target, entry), { recursive: true });
  }
  console.log(`- ${app}: node_modules/@app/tokens updated`);
}

if (failed) process.exit(1);
console.log('\nDone. Restart the dev servers: web `npm run dev`, mobile `npx expo start -c`.');

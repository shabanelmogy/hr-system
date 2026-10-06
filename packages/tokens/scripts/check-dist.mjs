// Fails when the committed build output (dist/) is older than src/ or missing.
// Consumers install this package as a local file dependency, which does not run a build,
// so dist/ must be committed and kept current: run `npm run build` after any src change.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const lib = join(root, 'dist', 'lib');
const problems = [];

for (const file of readdirSync(src).filter((f) => f.endsWith('.ts'))) {
  const base = file.replace(/\.ts$/, '');
  for (const out of [`${base}.js`, `${base}.d.ts`]) {
    if (!existsSync(join(lib, out))) problems.push(`missing dist/lib/${out}`);
  }
}

// Rebuild into a temp folder and compare byte-for-byte, so stale output is caught even
// when file timestamps were reset by git checkout.
if (problems.length === 0) {
  const tmp = join(root, 'node_modules', '.check-dist');
  execFileSync(process.execPath, [
    createRequire(import.meta.url).resolve('typescript/bin/tsc'),
    '-p', join(root, 'tsconfig.build.json'), '--outDir', tmp,
  ], { stdio: 'inherit' });
  for (const file of readdirSync(tmp)) {
    const a = readFileSync(join(tmp, file), 'utf8');
    const b = existsSync(join(lib, file)) ? readFileSync(join(lib, file), 'utf8') : null;
    if (a !== b) problems.push(`dist/lib/${file} is stale`);
  }
}

if (problems.length) {
  console.error('dist check failed:\n  ' + problems.join('\n  ') + '\nRun: npm run build');
  process.exit(1);
}
console.log('dist is current');

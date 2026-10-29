import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(app, '../packages/tokens');
const target = path.join(app, 'node_modules/@app/tokens');
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json'), 'utf8'));
function verify(relative) {
  const from = path.join(source, relative);
  const to = path.join(target, relative);
  if (fs.statSync(from).isDirectory()) {
    for (const name of fs.readdirSync(from)) verify(path.join(relative, name));
  } else if (!fs.existsSync(to) || !fs.readFileSync(from).equals(fs.readFileSync(to))) throw new Error('Stale installed @app/tokens: ' + relative + '; run the canonical token sync.');
}
for (const entry of ['package.json', ...manifest.files]) verify(entry);
process.stdout.write('Angular consumes the current compiled shared token package.\n');

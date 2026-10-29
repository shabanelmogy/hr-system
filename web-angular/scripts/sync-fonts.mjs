import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(app, '..');
const source = path.join(root, 'web-next/public/fonts/ibm-plex-sans-arabic');
const target = path.join(app, 'public/fonts/ibm-plex-sans-arabic');
const pairs = fs.readdirSync(source).map(name => [path.join(source, name), path.join(target, name)]);
pairs.push([path.join(root, 'web-next/src/fonts.css'), path.join(app, 'src/theme/_fonts.scss')]);
const check = process.argv.includes('--check');
for (const [from, to] of pairs) {
  const bytes = fs.readFileSync(from);
  if (check) {
    if (!fs.existsSync(to) || !bytes.equals(fs.readFileSync(to))) throw new Error('Stale self-hosted font asset: ' + path.relative(app, to));
  } else { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.writeFileSync(to, bytes); }
}
process.stdout.write(`Self-hosted font assets and OFL: ${pairs.length} files ${check ? 'verified' : 'synchronized'}.\n`);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectSource } from './architecture-rules.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const violations = [];
for (const file of walk(path.join(root, 'src')).filter(file => file.endsWith('.ts'))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const source = fs.readFileSync(file, 'utf8');
  violations.push(...inspectSource(relative, source).map(reason => `${relative}: ${reason}`));
}
if (violations.length) throw new Error(violations.join('\n'));
process.stdout.write('Angular foundation boundaries checked.\n');

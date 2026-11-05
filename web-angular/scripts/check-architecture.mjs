import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectSource, inspectTemplate } from './architecture-rules.mjs';
import { inspectProject } from './dependency-graph.mjs';
import ts from 'typescript';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const violations = [];
const sources = new Map();
for (const file of walk(path.join(root, 'src')).filter(file => /\.(?:ts|html)$/.test(file))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.ts')) sources.set(relative, source);
  const findings=file.endsWith('.html')?inspectTemplate(source,relative):inspectSource(relative, source);
  violations.push(...findings.map(reason => `${relative}: ${reason}`));
}
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
violations.push(...inspectProject(sources, parsed.options, root));
if (violations.length) throw new Error(violations.join('\n'));
process.stdout.write('Angular foundation boundaries checked.\n');

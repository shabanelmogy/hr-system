import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectSource, inspectTemplate } from './architecture-rules.mjs';
import ts from 'typescript';
import { sourceImports, inspectDependency, staticDependencyCycles } from './dependency-rules.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
const violations = [];
const edges = [];
const configPath = path.join(root, 'tsconfig.app.json');
const config = ts.parseJsonConfigFileContent(
  ts.readConfigFile(configPath, ts.sys.readFile).config,
  ts.sys,
  root,
);
for (const file of walk(path.join(root, 'src')).filter((file) => /\.(?:ts|html)$/.test(file))) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  const source = fs.readFileSync(file, 'utf8');
  const findings = file.endsWith('.html')
    ? inspectTemplate(source, relative)
    : inspectSource(relative, source);
  violations.push(...findings.map((reason) => `${relative}: ${reason}`));
  if (file.endsWith('.ts') && !relative.endsWith('.spec.ts') && !relative.includes('.generated.')) {
    for (const item of sourceImports(source, relative)) {
      const resolved = ts.resolveModuleName(item.name, file, config.options, ts.sys).resolvedModule;
      if (!resolved) continue;
      const target = path.relative(root, resolved.resolvedFileName).replaceAll('\\', '/');
      if (!target.startsWith('src/')) continue;
      edges.push({ source: relative, target, kind: item.kind });
      violations.push(
        ...inspectDependency(relative, target).map(
          (reason) => `${relative} -> ${target}: ${reason}`,
        ),
      );
    }
  }
}
for (const cycle of staticDependencyCycles(edges))
  violations.push(`Static runtime dependency cycle: ${cycle.join(' -> ')}`);
if (violations.length) throw new Error(violations.join('\n'));
process.stdout.write('Angular foundation boundaries checked.\n');

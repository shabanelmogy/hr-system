import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, mkdtemp, readdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { projectSpec, proofTags, stableJson } from './projection.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const angular = resolve(root, '../..');
const repo = resolve(angular, '..');
const require = createRequire(resolve(angular, 'package.json'));
const hash = value => createHash('sha256').update(value).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const flags = new Set(process.argv.slice(2));
for (const flag of flags) if (!['--capture', '--live'].includes(flag)) throw new Error(`Unknown flag ${flag}`);
const sourceUrl = 'https://shabanhrms.runasp.net/swagger/v1/swagger.json';
const snapshotPath = resolve(root, 'host-v1.subset.json');
const provenancePath = resolve(root, 'provenance.json');

if (flags.has('--capture') || flags.has('--live')) {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(40_000), redirect: 'error' });
  assert.equal(response.status, 200, 'Actual versioned hosted Swagger must be available');
  assert.match(response.headers.get('content-type') ?? '', /application\/json/i);
  const bytes = Buffer.from(await response.arrayBuffer());
  const source = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  // Preserve observed media-map order: this generator's colliding variants use the last entry.
  // Sorting an OpenAPI object's keys here changes which media type its output chooses.
  const projected = JSON.stringify(projectSpec(source), null, 2) + '\n';
  if (flags.has('--capture')) {
    await writeFile(snapshotPath, projected);
    await writeFile(provenancePath, stableJson({
      sourceUrl, retrievedAtUtc: new Date().toISOString(), rawSha256: hash(bytes),
      rawByteLength: bytes.length, openapi: source.openapi, apiVersion: source.info.version,
      totalPaths: Object.keys(source.paths).length, totalSchemas: Object.keys(source.components.schemas).length,
      proofTags, projectionSha256: hash(projected),
      warning: 'Observed public schema projection; no schema repair, source-build identity or whole-API adoption claim',
    }));
    console.log('Captured observed public spec and provenance; review metadata changes before acceptance.');
  } else {
    assert.equal(hash(projected), (await json(provenancePath)).projectionSha256,
      'Hosted scoped contracts changed; review and explicitly recapture, never silently rewrite');
    console.log('Live hosted scoped schema matches the reviewed projection.');
  }
}

const provenance = await json(provenancePath);
const snapshot = await readFile(snapshotPath, 'utf8');
assert.equal(hash(snapshot), provenance.projectionSha256, 'Observed snapshot/provenance drift');
const spec = JSON.parse(snapshot);
assert.deepEqual(projectSpec(spec), spec, 'Projection must contain its complete unchanged local reference closure');
const generatorPackage = await json(resolve(root, 'node_modules/ng-openapi-gen/package.json'));
assert.equal(generatorPackage.version, '1.1.0', 'Generator exact pin');
const cache = resolve(angular, '.angular/cache/api-contract-proof');
await mkdir(cache, { recursive: true });
const work = await mkdtemp(resolve(cache, 'run-'));
function run(executable, args) {
  const result = spawnSync(executable, args, { cwd: angular, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${args[0]} failed (${result.status})\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
const config = await json(resolve(root, 'generator.json'));
const generator = resolve(root, 'node_modules/ng-openapi-gen/lib/index.js');
async function generate(name) {
  const output = resolve(work, name);
  const configPath = resolve(work, `${name}.json`);
  await writeFile(configPath, JSON.stringify({ ...config, input: snapshotPath, output }));
  run(process.execPath, [generator, '--config', configPath]);
  return output;
}
const generated = await generate('generated');
const repeated = await generate('repeated');
async function inventory(path) {
  const files = {};
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const target = resolve(folder, entry.name);
      if (entry.isDirectory()) await walk(target);
      else files[relative(path, target).replaceAll('\\', '/')] = hash(await readFile(target));
    }
  }
  await walk(path);
  return files;
}
const files = await inventory(generated);
assert.deepEqual(await inventory(repeated), files, 'Identical pinned input/config must produce identical generated output');
await copyFile(resolve(root, 'transport-probe.ts'), resolve(work, 'transport-probe.ts'));
const tsconfig = resolve(work, 'tsconfig.json');
await writeFile(tsconfig, JSON.stringify({
  extends: resolve(angular, 'tsconfig.json'),
  compilerOptions: { module: 'ES2022', moduleResolution: 'bundler', types: ['node'],
    typeRoots: [resolve(root, 'node_modules/@types')],
    noEmit: true, importHelpers: false, rootDir: work },
  files: ['transport-probe.ts'], include: ['generated/**/*.ts'], references: [],
}));
const ngc = resolve(angular, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js');
run(process.execPath, [ngc, '-p', tsconfig]);
const esbuild = require('esbuild');
await esbuild.build({ entryPoints: [resolve(work, 'transport-probe.ts')], outfile: resolve(work, 'probe.mjs'),
  bundle: true, platform: 'node', format: 'esm', target: 'node22', packages: 'external', logLevel: 'silent' });
await import(pathToFileURL(require.resolve('@angular/compiler')));
const { runProbe } = await import(pathToFileURL(resolve(work, 'probe.mjs')));
const transport = await runProbe();
const { inspectSource } = await import(pathToFileURL(resolve(angular, 'scripts/architecture-rules.mjs')));
let untypedFiles = 0;
for (const path of Object.keys(files).filter(path => path.endsWith('.ts'))) {
  const violations = inspectSource(`src/app/generated/${path}`, await readFile(resolve(generated, path), 'utf8'));
  if (violations.includes('untyped any')) untypedFiles++;
}
const report = {
  phase06: 'Verified assessment; unadapted runtime adoption rejected',
  sourceUrl, projectionSha256: provenance.projectionSha256, rawSha256: provenance.rawSha256,
  generator: 'ng-openapi-gen@1.1.0', angular: (await json(resolve(angular, 'node_modules/@angular/core/package.json'))).version,
  typescript: (await json(resolve(angular, 'node_modules/typescript/package.json'))).version,
  paths: Object.keys(spec.paths).length, schemas: Object.keys(spec.components.schemas).length,
  generatedFiles: Object.keys(files).length, deterministicGeneration: true, strictAngularCompilation: true,
  transport, rawGeneratedFilesRejectedByAnyPolicy: untypedFiles,
  findings: ['Schema optional/nullability lacks required source guarantees', 'No typed ProblemDetails extension/validation contract',
    'Missing binary response metadata', 'Default transport lacks cross-origin Cookie/CSRF policy',
    'JSON media aliases collide to a wildcard request type', 'Generated any violates current architecture policy'],
  fallback: 'Keep typed owner services with unknown-to-runtime-schema validation and focused contract/transport tests; assess each business contract before adoption',
  liveSchemaChecked: flags.has('--live') || flags.has('--capture'),
};
await writeFile(resolve(cache, 'latest-results.json'), stableJson(report));
console.log(JSON.stringify(report, null, 2));
console.log(`Portable result source: ${relative(repo, resolve(cache, 'latest-results.json'))}`);

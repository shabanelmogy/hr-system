import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const sourceRoots = ['app', 'src'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const importPattern = /\b(?:from\s*|import\s*)['"]([^'"]+)['"]/g;
const violations = [];

for (const sourceRoot of sourceRoots) {
  const absoluteRoot = path.join(projectRoot, sourceRoot);
  for (const file of await walk(absoluteRoot)) {
    inspectFile(file, await readFile(file, 'utf8'));
  }
}

if (violations.length > 0) {
  console.error('Mobile architecture boundary check failed:\n');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Mobile architecture boundaries passed.');
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolutePath));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }
  return files;
}

function inspectFile(absoluteFile, source) {
  const relativeFile = normalize(path.relative(projectRoot, absoluteFile));
  let match;
  while ((match = importPattern.exec(source)) !== null) {
    inspectImport(relativeFile, match[1]);
  }
}

function inspectImport(sourceFile, importPath) {
  const sourceSegments = sourceFile.split('/');
  const targetFile = resolveProjectImport(sourceFile, importPath);
  if (!targetFile) return;

  const targetSegments = targetFile.split('/');
  const sourceArea = sourceSegments[0] === 'src' ? sourceSegments[1] : sourceSegments[0];
  const targetArea = targetSegments[0] === 'src' ? targetSegments[1] : targetSegments[0];

  if (sourceArea === 'shared' && ['features', 'layouts', 'app'].includes(targetArea)) {
    addViolation(sourceFile, importPath, 'shared must stay domain-neutral');
    return;
  }

  if (sourceArea === 'core' && ['features', 'layouts', 'app'].includes(targetArea)) {
    addViolation(sourceFile, importPath, 'core cannot depend on application or feature layers');
    return;
  }

  if ((sourceArea === 'app' || sourceArea === 'layouts') && targetArea === 'features') {
    const publicDepth = targetSegments.length - 3;
    if (publicDepth > 1) {
      addViolation(
        sourceFile,
        importPath,
        'routes and layouts must use a feature or subdomain public API',
      );
    }
    return;
  }

  if (sourceArea !== 'features' || targetArea !== 'features') return;

  const sourceFeature = sourceSegments[2];
  const targetFeature = targetSegments[2];
  const reachesFeatureInternals = targetSegments.length > 3;
  if (sourceFeature !== targetFeature && reachesFeatureInternals) {
    addViolation(sourceFile, importPath, 'cross-feature imports must use the target feature public API');
  }
}

function resolveProjectImport(sourceFile, importPath) {
  if (importPath.startsWith('@/src/')) {
    return `src/${importPath.slice('@/src/'.length)}`;
  }

  if (!importPath.startsWith('.')) return null;

  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), importPath));
  return resolved === 'src' || resolved.startsWith('src/') ? resolved : null;
}

function addViolation(sourceFile, importPath, reason) {
  violations.push(`${sourceFile} -> ${importPath}: ${reason}`);
}

function normalize(value) {
  return value.replaceAll(path.sep, '/');
}

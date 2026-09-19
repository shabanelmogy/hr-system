import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

import { allowedOwnerDependencies, moduleDirectories } from './module-boundaries.mjs';

const projectRoot = process.cwd();
const sourceRoots = ['app', 'src'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const cleanLayers = new Set(['domain', 'application', 'data', 'presentation', 'composition']);
const frameworkImports = [
  'react',
  'react-native',
  'expo',
  'axios',
  '@tanstack/react-query',
  'expo-sqlite',
];
const violations = [];

runSelfTests();

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
  if (!existsSync(directory)) return [];
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
  if (relativeFile.startsWith('src/features/') || relativeFile.startsWith('src/layouts/')) {
    violations.push(`${relativeFile}: legacy ownership root is forbidden; use src/modules, src/platform, or src/shell`);
    return;
  }

  for (const importedModule of extractModuleSpecifiers(source, relativeFile)) {
    inspectImport(relativeFile, importedModule);
  }
}

function inspectImport(sourceFile, importedModule) {
  const { importPath, importedNames } = importedModule;
  const sourceSegments = sourceFile.split('/');
  const sourceOwner = getOwnerInfo(sourceSegments);
  const sourceLayerInfo = getCleanLayerInfo(sourceSegments);
  const sourceLayer = sourceLayerInfo?.layer ?? null;

  if (isForbiddenTransportImport(sourceFile, importPath, importedNames)) {
    addViolation(sourceFile, importPath, 'presentation and route files must call feature use cases, not apiService or axiosClient');
    return;
  }

  if (sourceLayer === 'domain' && isExternalImport(importPath)) {
    addViolation(sourceFile, importPath, 'domain must stay framework- and infrastructure-free');
    return;
  }

  if (
    sourceLayer === 'application' &&
    frameworkImports.some((prefix) => importPath === prefix || importPath.startsWith(`${prefix}/`))
  ) {
    addViolation(sourceFile, importPath, 'application must stay UI- and infrastructure-neutral');
    return;
  }

  const targetFile = resolveProjectImport(sourceFile, importPath);
  if (!targetFile) return;

  const targetSegments = targetFile.split('/');
  const targetOwner = getOwnerInfo(targetSegments);
  const targetLayerInfo = getCleanLayerInfo(targetSegments);
  const targetLayer = targetLayerInfo?.layer ?? null;

  if (targetFile.startsWith('src/features/') || targetFile.startsWith('src/layouts/')) {
    addViolation(sourceFile, importPath, 'legacy ownership roots are forbidden');
    return;
  }

  if (sourceLayer === 'domain') {
    if (!targetLayerInfo || sourceLayerInfo.root !== targetLayerInfo.root || targetLayer !== 'domain') {
      addViolation(sourceFile, importPath, 'domain can depend only on its own domain layer');
    }
    return;
  }

  if (sourceLayer === 'application') {
    if (
      !targetLayerInfo ||
      sourceLayerInfo.root !== targetLayerInfo.root ||
      !['application', 'domain'].includes(targetLayer)
    ) {
      addViolation(sourceFile, importPath, 'application can depend only on its own application/domain layers');
    }
    return;
  }

  if (sourceOwner && targetOwner && sourceOwner.key !== targetOwner.key) {
    const allowed = allowedOwnerDependencies[sourceOwner.key] ?? [];
    if (!allowed.includes(targetOwner.key)) {
      addViolation(
        sourceFile,
        importPath,
        `${sourceOwner.key} cannot depend on ${targetOwner.key}`,
      );
      return;
    }

    if (requiresPublicApi(targetOwner) && !isPublicApiTarget(targetFile)) {
      addViolation(sourceFile, importPath, 'cross-owner imports must use the target public index API');
      return;
    }
  }

  if (
    sourceOwner?.kind === 'platform' &&
    targetOwner?.kind === 'platform' &&
    sourceOwner.feature &&
    targetOwner.feature &&
    sourceOwner.feature !== targetOwner.feature &&
    !isPublicApiTarget(targetFile)
  ) {
    addViolation(sourceFile, importPath, 'cross-platform-feature imports must use the target public index API');
    return;
  }

  if (
    sourceOwner?.kind === 'module' &&
    targetOwner?.kind === 'module' &&
    sourceOwner.key === targetOwner.key &&
    crossesCleanBoundary(sourceLayerInfo, targetLayerInfo) &&
    !isPublicApiTarget(targetFile)
  ) {
    addViolation(sourceFile, importPath, 'cross-subdomain imports must use the target public index API');
    return;
  }

  if (
    sourceLayerInfo &&
    targetLayerInfo &&
    sourceLayerInfo.root === targetLayerInfo.root
  ) {
    if (sourceLayer === 'data' && ['presentation', 'composition'].includes(targetLayer)) {
      addViolation(sourceFile, importPath, 'data cannot depend on presentation/composition');
      return;
    }
    if (sourceLayer === 'presentation' && targetLayer === 'data') {
      addViolation(sourceFile, importPath, 'presentation must use application/composition, not data adapters');
    }
  }
}

function getOwnerInfo(segments) {
  if (segments[0] === 'app') return { key: 'app', kind: 'app' };
  if (segments[0] !== 'src') return null;

  if (segments[1] === 'core') return { key: 'core', kind: 'core' };
  if (segments[1] === 'shared') return { key: 'shared', kind: 'shared' };
  if (segments[1] === 'platform') {
    return { key: 'platform', kind: 'platform', feature: segments[2] ?? null };
  }
  if (segments[1] === 'shell') {
    return { key: 'shell', kind: 'shell', feature: segments[2] ?? null };
  }
  if (segments[1] === 'modules') {
    const moduleDirectory = segments[2];
    const moduleKey = Object.entries(moduleDirectories).find(([, directory]) =>
      directory === `src/modules/${moduleDirectory}`,
    )?.[0];
    return moduleKey
      ? { key: moduleKey, kind: 'module', moduleDirectory, feature: segments[3] ?? null }
      : { key: moduleDirectory ?? 'unknown-module', kind: 'module', moduleDirectory, feature: segments[3] ?? null };
  }
  return null;
}

function getCleanLayerInfo(segments) {
  if (segments[0] !== 'src') return null;
  const layerIndex = segments.findIndex((segment, index) => index >= 2 && cleanLayers.has(segment));
  if (layerIndex < 0) return null;
  return {
    layer: segments[layerIndex],
    root: segments.slice(0, layerIndex).join('/'),
  };
}

function crossesCleanBoundary(sourceLayerInfo, targetLayerInfo) {
  return Boolean(
    sourceLayerInfo &&
    targetLayerInfo &&
    sourceLayerInfo.root !== targetLayerInfo.root,
  );
}

function requiresPublicApi(owner) {
  return owner.kind === 'platform' || owner.kind === 'module' || owner.kind === 'shell';
}

function isPublicApiTarget(targetFile) {
  const normalized = targetFile.split(path.sep).join('/').replace(/\/$/, '');
  if (normalized.endsWith('/index')) return true;
  const absolute = path.join(projectRoot, ...normalized.split('/'));
  return ['index.ts', 'index.tsx', 'index.js', 'index.jsx']
    .some((fileName) => existsSync(path.join(absolute, fileName)));
}

function resolveProjectImport(sourceFile, importPath) {
  if (importPath.startsWith('@/src/')) {
    return `src/${importPath.slice('@/src/'.length)}`;
  }

  if (!importPath.startsWith('.')) return null;

  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), importPath));
  return resolved === 'src' || resolved.startsWith('src/') || resolved === 'app' || resolved.startsWith('app/')
    ? resolved
    : null;
}

function addViolation(sourceFile, importPath, reason) {
  violations.push(`${sourceFile} -> ${importPath}: ${reason}`);
}

function extractModuleSpecifiers(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers = [];

  const visit = (node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      const names = [];
      if (clause?.name) names.push('default');
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) names.push('*');
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        names.push(...clause.namedBindings.elements.map((element) => element.propertyName?.text ?? element.name.text));
      }
      specifiers.push({
        position: node.moduleSpecifier.getStart(sourceFile),
        importPath: node.moduleSpecifier.text,
        importedNames: names,
      });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const names = node.exportClause && ts.isNamedExports(node.exportClause)
        ? node.exportClause.elements.map((element) => element.propertyName?.text ?? element.name.text)
        : node.exportClause && ts.isNamespaceExport(node.exportClause)
          ? ['*']
          : [];
      specifiers.push({
        position: node.moduleSpecifier.getStart(sourceFile),
        importPath: node.moduleSpecifier.text,
        importedNames: names,
      });
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push({
        position: node.arguments[0].getStart(sourceFile),
        importPath: node.arguments[0].text,
        importedNames: ['*'],
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specifiers
    .sort((left, right) => left.position - right.position)
    .map(({ importPath, importedNames }) => ({ importPath, importedNames }));
}

function isForbiddenTransportImport(sourceFile, importPath, importedNames) {
  const segments = sourceFile.split('/');
  const inPresentationOrRoute = segments[0] === 'app' || getCleanLayerInfo(segments)?.layer === 'presentation';
  if (!inPresentationOrRoute) return false;

  const targetFile = resolveProjectImport(sourceFile, importPath);
  const isTransportModule = targetFile === 'src/core/api/api-service' || targetFile === 'src/core/api/axios-client';
  const importsTransport = importedNames.includes('apiService') || importedNames.includes('axiosClient');
  const importsUnknownTransportSurface = importedNames.includes('*') &&
    (targetFile === 'src/core/api' || isTransportModule);
  return importsTransport || (isTransportModule && importedNames.length === 0) || importsUnknownTransportSurface;
}

function isExternalImport(importPath) {
  return !importPath.startsWith('.') && !importPath.startsWith('@/src/');
}

function runSelfTests() {
  assert.deepEqual(
    extractModuleSpecifiers(
      [
        "import value from './static-import';",
        "export { value as renamed } from './named-reexport';",
        "export * from './star-reexport';",
        "const lazy = import('./dynamic-import');",
        'const computed = import(moduleName);',
      ].join('\n'),
      'architecture-self-test.ts',
    ),
    [
      { importPath: './static-import', importedNames: ['default'] },
      { importPath: './named-reexport', importedNames: ['value'] },
      { importPath: './star-reexport', importedNames: [] },
      { importPath: './dynamic-import', importedNames: ['*'] },
    ],
    'module specifier detection must cover static imports, re-exports, and literal dynamic imports only',
  );

  assert.equal(
    isForbiddenTransportImport('app/(main)/index.tsx', '@/src/core/api', ['apiService']),
    true,
    'route files may not import the API service from its public barrel',
  );
  assert.equal(
    isForbiddenTransportImport('app/(main)/index.tsx', '@/src/core/api', ['*']),
    true,
    'route files may not dynamically import the API barrel and access its transport',
  );
  assert.equal(
    isForbiddenTransportImport('src/modules/hr/people/presentation/PeopleScreen.tsx', '@/src/core/api/axios-client', ['axiosClient']),
    true,
    'presentation files may not import the raw Axios client',
  );
  assert.equal(
    isForbiddenTransportImport('src/modules/hr/people/presentation/PeopleScreen.tsx', '@/src/core/api', ['ApiError', 'toApiError']),
    false,
    'presentation files may use transport error types and helpers',
  );
  assert.equal(
    isForbiddenTransportImport('src/platform/auth/presentation/Auth.tsx', '@/src/core/api/axios-client', ['configureAxiosAuthentication']),
    false,
    'auth provider plumbing may configure the shared transport',
  );

  assert.deepEqual(
    getOwnerInfo('src/modules/hr/workforce-planning/presentation/screens/X.tsx'.split('/')),
    { key: 'hr', kind: 'module', moduleDirectory: 'hr', feature: 'workforce-planning' },
    'HR module ownership must be detected',
  );
  assert.deepEqual(
    getOwnerInfo('src/platform/auth/presentation/login/Login.tsx'.split('/')),
    { key: 'platform', kind: 'platform', feature: 'auth' },
    'Platform feature ownership must be detected',
  );
  assert.equal(
    getCleanLayerInfo('src/modules/reference-data/geography/countries/domain/models/country.ts'.split('/')).root,
    'src/modules/reference-data/geography/countries',
    'nested clean subdomain roots must be detected',
  );
}

function normalize(value) {
  return value.replaceAll(path.sep, '/');
}

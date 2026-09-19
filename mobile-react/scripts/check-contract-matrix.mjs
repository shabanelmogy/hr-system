import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

const mobileRoot = path.resolve(import.meta.dirname, '..');
const matrixPath = path.resolve(mobileRoot, '..', 'documentation', 'mobile-react', 'MOBILE_API_COMPATIBILITY_MATRIX.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const errors = [];
const routeKinds = new Set(['public', 'auth', 'layout', 'dynamic']);
const statuses = new Set(['aligned', 'mismatch', 'deferred']);
const offlineModes = new Set(Object.keys(matrix.definitions?.offlineModes ?? {}));
const httpVerbs = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.expo' || entry.name === '.jest-cache') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(mobileRoot, file).split(path.sep).join('/');
}

function expectedRoutePath(source) {
  const parts = source.replace(/^app\//, '').split('/').filter((part) => !/^\([^/]+\)$/.test(part));
  if (parts.at(-1) === '_layout.tsx') return `layout:/${parts.slice(0, -1).join('/')}`;
  if (parts.at(-1) === '+not-found.tsx') return 'system:+not-found';
  const last = parts.pop()?.replace(/\.tsx$/, '');
  if (last && last !== 'index') parts.push(last);
  const normalized = parts.map((part) => part.replace(/^\[([^\]]+)\]$/, ':$1'));
  const result = `/${normalized.join('/')}`;
  return result === '/' ? '/' : result.replace(/\/$/, '');
}

function unique(items, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item)) errors.push(`${label} is duplicated: ${item}`);
    seen.add(item);
  }
  return seen;
}

function readEndpointMembers(source, file) {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const unwrap = (node) => {
    let current = node;
    while (current && (ts.isAsExpression(current) || ts.isParenthesizedExpression(current) || ts.isTypeAssertionExpression(current))) current = current.expression;
    return current;
  };
  const declaration = sourceFile.statements
    .filter((statement) => ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((candidate) => candidate.initializer && ts.isObjectLiteralExpression(unwrap(candidate.initializer)));
  const root = unwrap(declaration?.initializer);
  if (!root || !ts.isObjectLiteralExpression(root)) return [];

  const nameOf = (name) => {
    if (!name) throw new Error(`${file}: endpoint property without a name`);
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
    if (ts.isComputedPropertyName(name)) throw new Error(`${file}: computed endpoint properties are not supported (${name.getText(sourceFile)})`);
    throw new Error(`${file}: unsupported endpoint property name (${name.getText(sourceFile)})`);
  };
  const members = [];
  const walkObject = (object, prefix) => {
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) throw new Error(`${file}: endpoint spreads are not supported (${property.getText(sourceFile)})`);
      const key = nameOf(property.name);
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const initializer = ts.isPropertyAssignment(property) ? property.initializer : undefined;
      if (initializer && ts.isObjectLiteralExpression(initializer)) walkObject(initializer, fullPath);
      else members.push(fullPath);
    }
  };
  walkObject(root, '');
  return members;
}

function requireFields(entry, fields, label) {
  for (const field of fields) {
    if (typeof entry[field] !== 'string' || entry[field].trim() === '') errors.push(`${label} is missing ${field}`);
  }
}

const routeEntries = Array.isArray(matrix.routes) ? matrix.routes : [];
const endpointEntries = Array.isArray(matrix.endpointFiles) ? matrix.endpointFiles : [];
const routeSources = unique(routeEntries.map((entry) => entry.source), 'route source');
const endpointSources = unique(endpointEntries.map((entry) => entry.source), 'endpoint source');

for (const route of routeEntries) {
  const label = `route ${route.source}`;
  requireFields(route, ['source', 'path', 'kind', 'currentOwner', 'targetOwner', 'routePolicy', 'moduleRequirement', 'scope', 'offlineMode', 'apiSurface', 'status', 'note'], label);
  if (route.path !== expectedRoutePath(route.source)) errors.push(`${label} has invalid URL/layout path ${route.path}; expected ${expectedRoutePath(route.source)}`);
  if (!route.currentRoutePolicy || !route.targetRoutePolicy) errors.push(`${label} must record currentRoutePolicy and targetRoutePolicy`);
  if (!Object.prototype.hasOwnProperty.call(route, 'currentModuleRequirement') || !Object.prototype.hasOwnProperty.call(route, 'targetModuleRequirement')) errors.push(`${label} must record currentModuleRequirement and targetModuleRequirement`);
  if (!routeKinds.has(route.kind)) errors.push(`${label} has invalid kind ${route.kind}`);
  if (!statuses.has(route.status)) errors.push(`${label} has invalid status ${route.status}`);
  if (!offlineModes.has(route.offlineMode)) errors.push(`${label} has invalid offlineMode ${route.offlineMode}`);
}

for (const endpointFile of endpointEntries) {
  const label = `endpoint file ${endpointFile.source}`;
  requireFields(endpointFile, ['source', 'family'], label);
  if (!Array.isArray(endpointFile.members) || endpointFile.members.length === 0) errors.push(`${label} must list members`);
  const members = Array.isArray(endpointFile.members) ? endpointFile.members : [];
  const memberKeys = unique(members.map((member) => member.key), `${label} member`);
  for (const member of members) {
    const memberLabel = `${label} member ${member.key}`;
    requireFields(member, ['key', 'pattern', 'currentOwner', 'targetOwner', 'permissionAuthority', 'scope', 'offlineMode', 'status', 'note'], memberLabel);
    if (!Array.isArray(member.verb) || member.verb.length === 0) errors.push(`${memberLabel} must declare at least one HTTP verb or UNUSED`);
    if (!Array.isArray(member.operations)) errors.push(`${memberLabel} must declare traced operations`);
    const operations = Array.isArray(member.operations) ? member.operations : [];
    if (member.verb.includes('UNUSED')) {
      if (member.verb.length !== 1 || operations.length !== 0 || member.status !== 'deferred' || !/unwired endpoint constant/i.test(member.note ?? '')) errors.push(`${memberLabel} UNUSED must be deferred, unwired, and have no operations`);
    } else if (operations.length === 0) errors.push(`${memberLabel} has no traced non-test caller; use UNUSED only for an unwired member`);
    for (const verb of member.verb) if (verb !== 'UNUSED' && !httpVerbs.has(verb)) errors.push(`${memberLabel} has invalid verb ${verb}`);
    for (const operation of operations) {
      requireFields(operation, ['caller', 'requestBoundary', 'responseBoundary', 'permissionAuthority'], `${memberLabel} operation`);
      if (!Array.isArray(operation.verb) || operation.verb.length === 0 || operation.verb.some((verb) => !httpVerbs.has(verb))) errors.push(`${memberLabel} operation has invalid HTTP verbs`);
    }
    if (JSON.stringify(member).includes('caller DTO/path/query') || JSON.stringify(member).includes('caller response adapter')) errors.push(`${memberLabel} contains a stale placeholder boundary`);
    if (!statuses.has(member.status)) errors.push(`${memberLabel} has invalid status ${member.status}`);
    if (!offlineModes.has(member.offlineMode)) errors.push(`${memberLabel} has invalid offlineMode ${member.offlineMode}`);
  }
  if (!memberKeys.size) errors.push(`${label} has no usable member keys`);
}

const physicalRoutes = walk(path.join(mobileRoot, 'app')).filter((file) => file.endsWith('.tsx')).map(relative);
for (const file of physicalRoutes) if (!routeSources.has(file)) errors.push(`physical route is not in matrix: ${file}`);
for (const source of routeSources) if (!physicalRoutes.includes(source)) errors.push(`matrix route does not exist: ${source}`);

const physicalEndpointFiles = walk(path.join(mobileRoot, 'src')).filter((file) => file.endsWith('endpoints.ts'));
for (const file of physicalEndpointFiles) {
  const source = relative(file);
  const entry = endpointEntries.find((candidate) => candidate.source === source);
  if (!entry) { errors.push(`endpoint file is not in matrix: ${source}`); continue; }
  let expectedMemberPaths;
  try {
    expectedMemberPaths = readEndpointMembers(fs.readFileSync(file, 'utf8'), source);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    continue;
  }
  const expectedMembers = new Set(expectedMemberPaths);
  const actualMembers = new Set((entry.members ?? []).map((member) => member.key));
  for (const member of expectedMembers) if (!actualMembers.has(member)) errors.push(`endpoint member is not in matrix: ${source}#${member}`);
  for (const member of actualMembers) if (!expectedMembers.has(member)) errors.push(`matrix endpoint member does not exist: ${source}#${member}`);
}
for (const source of endpointSources) if (!physicalEndpointFiles.map(relative).includes(source)) errors.push(`matrix endpoint file does not exist: ${source}`);

const pagePaths = new Map();
for (const route of routeEntries.filter((entry) => entry.kind !== 'layout' && !entry.path.startsWith('system:'))) {
  const prior = pagePaths.get(route.path);
  if (prior) errors.push(`navigable route path is duplicated: ${route.path} (${prior} and ${route.source})`);
  pagePaths.set(route.path, route.source);
}

const endpointMemberCount = endpointEntries.reduce((total, entry) => total + (entry.members?.length ?? 0), 0);
if (errors.length > 0) {
  console.error(`Contract matrix failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Contract matrix passed: ${physicalRoutes.length} routes, ${physicalEndpointFiles.length} endpoint files, and ${endpointMemberCount} endpoint members are covered.`);
}

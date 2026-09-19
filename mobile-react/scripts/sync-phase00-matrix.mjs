import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

const mobileRoot = path.resolve(import.meta.dirname, '..');
const matrixPath = path.resolve(mobileRoot, '..', 'documentation', 'mobile-react', 'MOBILE_API_COMPATIBILITY_MATRIX.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const verbNames = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const wrapperVerbs = new Map([
  ['getParsed', 'GET'], ['postParsed', 'POST'], ['putParsed', 'PUT'],
  ['patchParsed', 'PATCH'], ['deleteParsed', 'DELETE'],
]);

function walk(directory) {
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.expo' || entry.name === '.jest-cache') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(absolute));
    else result.push(absolute);
  }
  return result;
}

function rel(file) { return path.relative(mobileRoot, file).split(path.sep).join('/'); }
function compact(text) { return text.replace(/\s+/g, ' ').trim().slice(0, 220); }

function endpointObject(source, file) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const unwrap = (node) => {
    let current = node;
    while (current && (ts.isAsExpression(current) || ts.isParenthesizedExpression(current) || ts.isTypeAssertionExpression(current))) current = current.expression;
    return current;
  };
  const declaration = sf.statements
    .filter((statement) => ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((candidate) => candidate.initializer && ts.isObjectLiteralExpression(unwrap(candidate.initializer)));
  const root = unwrap(declaration?.initializer);
  if (!root || !ts.isObjectLiteralExpression(root)) throw new Error(`${file}: no exported endpoint object`);
  const variable = declaration.name.getText(sf);
  const members = [];
  const nameOf = (name) => {
    if (!name) throw new Error(`${file}: unnamed endpoint property`);
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
    throw new Error(`${file}: computed endpoint properties are not supported (${name.getText(sf)})`);
  };
  const walkObject = (object, prefix) => {
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) throw new Error(`${file}: endpoint spreads are not supported (${property.getText(sf)})`);
      const key = nameOf(property.name);
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const initializer = ts.isPropertyAssignment(property) ? property.initializer : undefined;
      if (initializer && ts.isObjectLiteralExpression(initializer)) walkObject(initializer, fullPath);
      else members.push(fullPath);
    }
  };
  walkObject(root, '');
  return { sf, variable, members };
}

function memberExpression(variable, member) { return `${variable}.${member}`; }
function endpointImports(sf, endpointSource, variable) {
  const aliases = new Set([variable]);
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!statement.moduleSpecifier.text.endsWith(path.basename(endpointSource, '.ts'))) continue;
    const named = statement.importClause?.namedBindings;
    if (!named || !ts.isNamedImports(named)) continue;
    for (const element of named.elements) {
      if (element.propertyName?.text === variable || element.name.text === variable) aliases.add(element.name.text);
    }
  }
  return [...aliases];
}

function calleeVerb(call) {
  if (ts.isPropertyAccessExpression(call.expression)) {
    const name = call.expression.name.text;
    if (ts.isIdentifier(call.expression.expression) && call.expression.expression.text === 'apiService' && verbNames.has(name.toUpperCase())) return name.toUpperCase();
    return wrapperVerbs.get(name);
  }
  if (ts.isIdentifier(call.expression)) return wrapperVerbs.get(call.expression.text);
  return undefined;
}

function functionName(node, sf) {
  let current = node.parent;
  while (current) {
    if (ts.isFunctionDeclaration(current) && current.name) return current.name.text;
    if (ts.isMethodDeclaration(current) && current.name) return current.name.getText(sf);
    if (ts.isPropertyAssignment(current) && current.name) return current.name.getText(sf);
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) return current.name.text;
    current = current.parent;
  }
  return '<module scope>';
}

function responseBoundary(call, verb, sf) {
  const parent = call.parent;
  const wrapperName = ts.isIdentifier(call.expression) ? call.expression.text : undefined;
  if (wrapperName && wrapperVerbs.has(wrapperName)) {
    const schema = call.arguments[wrapperName === 'getParsed' ? 1 : 2];
    if (schema) return compact(schema.getText(sf));
  }
  let current = parent;
  for (let depth = 0; current && depth < 5; depth += 1, current = current.parent) {
    if (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression) && current.expression.name.text === 'parse') {
      return compact(current.expression.expression.getText(sf));
    }
  }
  const typeArgument = call.typeArguments?.[0];
  if (typeArgument) return compact(typeArgument.getText(sf));
  return 'API response (unparsed at caller)';
}

function requestBoundary(call, verb, sf) {
  const method = verb?.toLowerCase();
  const wrapperName = ts.isIdentifier(call.expression) ? call.expression.text : undefined;
  if (wrapperName && wrapperVerbs.has(wrapperName)) {
    const body = call.arguments[wrapperName === 'postParsed' || wrapperName === 'putParsed' || wrapperName === 'patchParsed' ? 1 : -1];
    return body ? compact(body.getText(sf)) : 'none';
  }
  if (method === 'post' || method === 'put' || method === 'patch') return call.arguments[1] ? compact(call.arguments[1].getText(sf)) : 'none';
  return call.arguments[1] ? `request config: ${compact(call.arguments[1].getText(sf))}` : 'none';
}

function operationsFor(endpointSource, variable, members) {
  const expressionFiles = walk(path.join(mobileRoot, 'src')).filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.spec.ts'));
  const operations = new Map(members.map((member) => [member, []]));
  const endpointBase = path.basename(endpointSource);
  for (const file of expressionFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const aliases = endpointImports(sf, endpointSource, variable);
    if (!aliases.some((alias) => source.includes(`${alias}.`))) continue;
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const verb = calleeVerb(node);
        if (verb) {
          const first = node.arguments[0]?.getText(sf) ?? '';
          for (const member of members) {
            if (aliases.some((alias) => first.includes(memberExpression(alias, member)))) {
              const operation = {
                verb: [verb],
                caller: `${rel(file)}#${functionName(node, sf)}`,
                requestBoundary: requestBoundary(node, verb, sf),
                responseBoundary: responseBoundary(node, verb, sf),
                permissionAuthority: `API module catalog/endpoint policy; caller ${rel(file)}`,
              };
              const key = JSON.stringify(operation);
              const current = operations.get(member);
              if (current && !current.some((item) => JSON.stringify(item) === key)) current.push(operation);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    // Dynamic selectors (for example fiscalYearEndpoints[action]) are real
    // callers, but cannot prove a leaf/action mapping from static source.
    if (aliases.some((alias) => source.includes(`${alias}[`))) {
      const calls = [];
      const collect = (node) => { if (ts.isCallExpression(node) && calleeVerb(node) && node.arguments[0]?.getText(sf).includes(`${aliases.find((alias) => source.includes(`${alias}[`))}[`)) calls.push(node); ts.forEachChild(node, collect); };
      collect(sf);
      for (const member of members) for (const call of calls) {
        const verb = calleeVerb(call);
        const operation = { verb: [verb], caller: `${rel(file)}#${functionName(call, sf)} (dynamic endpoint selector)`, requestBoundary: requestBoundary(call, verb, sf), responseBoundary: responseBoundary(call, verb, sf), permissionAuthority: `API module catalog/endpoint policy; caller ${rel(file)}` };
        const current = operations.get(member);
        if (current && !current.some((item) => JSON.stringify(item) === JSON.stringify(operation))) current.push(operation);
      }
    }
  }
  return operations;
}

function policy(pathname) {
  if (pathname === 'public' || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/confirm-email') || pathname.startsWith('/accept-invitation') || pathname.startsWith('/resend-confirmation')) return { kind: 'public' };
  const role = (roles) => ({ kind: 'roles', roles });
  const permission = (permissions) => ({ kind: 'permissions', permissions });
  const anyOf = (requirements) => ({ kind: 'anyOf', anyOf: requirements });
  if (pathname === '/super-admin-dashboard' || pathname === '/tenant-management' || pathname === '/tenant-admin-management') return role(['superAdmin']);
  if (pathname.startsWith('/administration/role-permissions')) return permission(['ViewRoles']);
  if (pathname === '/administration/offline-operations') return permission(['ManageOfflineOperations']);
  if (pathname === '/administration/roles') return permission(['ViewRoles']);
  if (pathname === '/administration/invitations') return permission(['ViewUsers']);
  if (pathname === '/administration') return anyOf([{ permissions: ['ViewUsers'] }, { permissions: ['ViewRoles'] }, { permissions: ['ManageOfflineOperations'] }]);
  if (/^\/basic-data\/geographical-information\/(countries|states|districts)$/.test(pathname)) return role(['superAdmin']);
  if (pathname === '/basic-data/geographical-information/address-types') return permission(['ViewAddressTypes']);
  if (pathname === '/basic-data/organizational-structure/geographic-scope') return permission(['ViewCompanyGeographicScope']);
  if (pathname.startsWith('/basic-data/organizational-structure/')) return permission(['ViewOrganizationalStructure']);
  if (pathname === '/basic-data/geographical-information') return anyOf([{ roles: ['superAdmin'] }, { permissions: ['ViewAddressTypes'] }]);
  if (pathname === '/basic-data/organizational-structure') return anyOf([{ permissions: ['ViewCompanyGeographicScope'] }, { permissions: ['ViewOrganizationalStructure'] }]);
  if (pathname === '/basic-data') return anyOf([{ permissions: ['ViewAddressTypes', 'ViewCompanyGeographicScope', 'ViewOrganizationalStructure'] }, { roles: ['superAdmin'] }]);
  if (pathname === '/extras/files') return role(['admin']);
  if (pathname === '/extras/appointments') return permission(['ViewUsers']);
  if (pathname === '/extras') return anyOf([{ roles: ['admin'] }, { permissions: ['ViewUsers'] }]);
  if (pathname === '/advanced-tools/track-changes') return permission(['ViewChangeLogs']);
  if (pathname === '/advanced-tools/localization-api') return permission(['ViewLocalizations']);
  if (pathname === '/advanced-tools/health-check' || pathname === '/advanced-tools/api-endpoints') return role(['admin']);
  if (pathname === '/advanced-tools/hangfire-dashboard') return permission(['ViewHangfireDashboard']);
  if (pathname === '/advanced-tools') return anyOf([{ permissions: ['ViewChangeLogs'] }, { permissions: ['ViewLocalizations'] }, { roles: ['admin'] }, { permissions: ['ViewHangfireDashboard'] }]);
  if (pathname === '/recruitment') return permission(['ViewRecruitment']);
  if (pathname === '/finance/fiscal-years' || pathname === '/finance') return permission(['ViewFiscalYears']);
  const workforce = new Map([['/workforce-planning/plans', 'ViewWorkforcePlans'], ['/workforce-planning/budgets', 'ViewWorkforceBudgets'], ['/workforce-planning/position-envelopes', 'ViewPositionEnvelopes'], ['/workforce-planning/staffing-requests', 'ViewStaffingRequests'], ['/workforce-planning/envelope-amendments', 'ViewEnvelopeAmendments'], ['/workforce-planning/trace', 'ViewWorkforceTrace']]);
  if (workforce.has(pathname)) return permission([workforce.get(pathname)]);
  if (pathname === '/workforce-planning') return anyOf([...workforce.values()].map((item) => ({ permissions: [item] })));
  if (pathname === '/notifications') return role(['admin', 'user']);
  if (pathname === '/settings') return role(['admin', 'superAdmin']);
  return { kind: 'authenticated' };
}

function routePath(source) {
  const parts = source.replace(/^app\//, '').split('/').filter((part) => !/^\([^/]+\)$/.test(part));
  if (parts.at(-1) === '_layout.tsx') return `layout:/${parts.slice(0, -1).join('/')}`.replace(/:\/$/, ':/');
  if (parts.at(-1) === '+not-found.tsx') return 'system:+not-found';
  const last = parts.pop()?.replace(/\.tsx$/, '');
  if (last && last !== 'index') parts.push(last);
  return `/${parts.map((part) => part.replace(/^\[([^\]]+)\]$/, ':$1')).join('/')}`.replace(/\/$/, '') || '/';
}

function moduleRequirement(pathname) {
  if (!pathname.startsWith('/')) return null;
  if (pathname === '/apps') return null;
  if (pathname.startsWith('/apps/')) return { status: 'dynamic', moduleCode: ':moduleCode', submoduleCode: ':submoduleCode' };
  if (pathname.startsWith('/basic-data')) return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  if (pathname.startsWith('/recruitment')) return { moduleCode: 'hr', submoduleCode: 'recruitment' };
  if (pathname.startsWith('/workforce-planning') || pathname.startsWith('/finance')) return { moduleCode: 'hr', submoduleCode: 'workforce' };
  if (pathname.startsWith('/advanced-tools/localization-api')) return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  if (pathname.startsWith('/advanced-tools/track-changes') || pathname.startsWith('/advanced-tools/hangfire-dashboard')) return { moduleCode: 'hr', submoduleCode: 'analytics' };
  if (pathname.startsWith('/advanced-tools') || pathname.startsWith('/administration') || pathname.startsWith('/extras')) return { moduleCode: 'hr', submoduleCode: 'administration' };
  return null;
}

function targetPolicy(pathname, current, targetOwner, status) {
  if (status === 'mismatch' || status === 'deferred') return { status: 'deferred', owner: targetOwner, reason: 'Exact API permission/module policy is owned by Phase 01.' };
  return current;
}

for (const route of matrix.routes) {
  const pathname = routePath(route.source);
  const current = pathname.startsWith('layout:') || pathname.startsWith('system:') ? { kind: 'inherited' } : policy(pathname);
  const currentModule = pathname.startsWith('layout:') || pathname.startsWith('system:') ? { status: 'inherited' } : moduleRequirement(pathname);
  route.path = pathname;
  route.currentRoutePolicy = current;
  route.targetRoutePolicy = targetPolicy(pathname, current, route.targetOwner, route.status);
  route.currentModuleRequirement = currentModule;
  route.targetModuleRequirement = route.status === 'aligned' ? currentModule : { status: 'deferred', owner: route.targetOwner, reason: 'Phase 01 API catalog alignment.' };
  route.routePolicy = current.kind;
  route.moduleRequirement = typeof route.targetModuleRequirement === 'object' && route.targetModuleRequirement?.moduleCode ? `${route.targetModuleRequirement.moduleCode}:${route.targetModuleRequirement.submoduleCode ?? ''}` : (route.targetOwner ?? 'none');
}

for (const endpointFile of matrix.endpointFiles) {
  const absolute = path.join(mobileRoot, endpointFile.source);
  const source = fs.readFileSync(absolute, 'utf8');
  const parsed = endpointObject(source, endpointFile.source);
  const operations = operationsFor(endpointFile.source, parsed.variable, parsed.members);
  const fileMetadata = endpointFile.members[0] ?? {};
  endpointFile.members = parsed.members.map((key) => {
    const ops = operations.get(key) ?? [];
    const first = ops[0];
    const prior = endpointFile.members.find((member) => member.key === key || member.key?.split('.').at(-1) === key) ?? fileMetadata;
    return {
      key,
      pattern: `endpoint member ${key}`,
      verb: ops.length ? [...new Set(ops.flatMap((operation) => operation.verb))] : ['UNUSED'],
      operations: ops,
      currentOwner: prior?.currentOwner ?? 'Platform',
      targetOwner: prior?.targetOwner ?? 'Platform',
      permissionAuthority: first?.permissionAuthority ?? 'No non-test caller found; API module catalog remains authoritative.',
      scope: prior?.scope ?? 'tenant/company',
      offlineMode: prior?.offlineMode ?? 'online-only',
      status: ops.length ? (prior?.status ?? 'aligned') : 'deferred',
      note: ops.length ? 'Verb and caller boundaries were traced from non-test remote data sources; server permission claims remain API-owned.' : 'Unwired endpoint constant; no non-test caller was found.',
    };
  });
}

fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
console.log(`Synchronized ${matrix.routes.length} routes and ${matrix.endpointFiles.reduce((sum, file) => sum + file.members.length, 0)} endpoint leaf members.`);

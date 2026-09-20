import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

const mobileRoot = path.resolve(import.meta.dirname, '..');
const matrixPath = path.resolve(mobileRoot, '..', 'documentation', 'mobile-react', 'MOBILE_API_COMPATIBILITY_MATRIX.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const sourceRenames = new Map([
  ['src/modules/hr/basic-data/address-types/', 'src/modules/reference-data/addresses/address-types/'],
  ['src/modules/hr/basic-data/countries/', 'src/modules/reference-data/geography/countries/'],
  ['src/modules/hr/basic-data/states/', 'src/modules/reference-data/geography/states/'],
  ['src/modules/hr/basic-data/districts/', 'src/modules/reference-data/geography/districts/'],
  ['src/modules/hr/basic-data/company-geographic-scope/', 'src/platform/tenant-administration/company-geographic-scope/'],
  ['src/modules/hr/finance/fiscal-years/', 'src/modules/accounting/fiscal-years/'],
  ['src/platform/tools/appointments/', 'src/modules/crm/appointments/'],
]);
const renameSource = (source) => [...sourceRenames.entries()].reduce(
  (value, [from, to]) => value.replace(from, to), source,
);
for (const route of matrix.routes) route.source = renameSource(route.source);
for (const endpointFile of matrix.endpointFiles) endpointFile.source = renameSource(endpointFile.source);
const verbNames = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const wrapperVerbs = new Map([
  ['getParsed', 'GET'], ['postParsed', 'POST'], ['putParsed', 'PUT'],
  ['patchParsed', 'PATCH'], ['deleteParsed', 'DELETE'],
]);

const referencedEndpointOperations = new Map([
  ['src/core/realtime/realtime-endpoints.ts#companyHub', {
    verb: ['CONNECT'],
    caller: 'src/core/realtime/realtime-service.ts#getConnection',
    requestBoundary: 'SignalR access token factory',
    responseBoundary: 'SignalR company hub events',
  }],
  ['src/platform/tools/file-manager/data/remote/file-manager-endpoints.ts#download', {
    verb: ['GET'],
    caller: 'src/platform/tools/file-manager/data/remote/file-manager-remote-data-source.ts#prepareFilePreview',
    requestBoundary: 'storedFileName path parameter',
    responseBoundary: 'authenticated Blob/native file download',
  }],
  ['src/platform/tools/file-manager/data/remote/file-manager-endpoints.ts#stream', {
    verb: ['GET'],
    caller: 'src/platform/tools/file-manager/data/remote/file-manager-remote-data-source.ts#getAuthenticatedFileSource',
    requestBoundary: 'file id path parameter',
    responseBoundary: 'authenticated file stream',
  }],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#swagger', {
    verb: ['GET'],
    caller: 'src/platform/tools/operations/data/remote/operations-remote-data-source.ts#getSwaggerUrl',
    requestBoundary: 'none',
    responseBoundary: 'Swagger HTML document',
  }],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#hangfireDashboard', {
    verb: ['GET'],
    caller: 'src/platform/tools/operations/data/remote/operations-remote-data-source.ts#getHangfireUrl',
    requestBoundary: 'none',
    responseBoundary: 'Hangfire dashboard HTML document',
  }],
]);

const endpointPermissionOverrides = new Map([
  ['src/core/realtime/realtime-endpoints.ts#token', 'Platform AuthController.RealtimeToken with an authenticated session'],
  ['src/core/realtime/realtime-endpoints.ts#companyHub', 'Platform authenticated SignalR hub connection and tenant/company claims'],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#health', 'Authenticated host readiness health endpoint'],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#backgroundJobs', 'Platform BackgroundJobsController and PlatformPermissions.ViewHangfireDashboard'],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#swagger', 'Host OpenAPI exposure policy for the active environment'],
  ['src/platform/tools/operations/data/remote/operations-endpoints.ts#hangfireDashboard', 'Platform Hangfire dashboard and PlatformPermissions.ViewHangfireDashboard'],
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
      else members.push({
        key: fullPath,
        pattern: initializer ? initializer.getText(sf) : property.getText(sf),
      });
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
    if (ts.isIdentifier(call.expression.expression)) {
      const owner = call.expression.expression.text;
      if (owner === 'apiService' && name === 'upload') return 'POST';
      if ((owner === 'apiService' || owner === 'axiosClient') && verbNames.has(name.toUpperCase())) return name.toUpperCase();
    }
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
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name) && current.initializer &&
      (ts.isArrowFunction(current.initializer) || ts.isFunctionExpression(current.initializer))) return current.name.text;
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
  const operations = new Map(members.map((member) => [member.key, []]));
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
            const memberKey = member.key;
            if (aliases.some((alias) => first.includes(memberExpression(alias, memberKey)))) {
              const operation = {
                verb: [verb],
                caller: `${rel(file)}#${functionName(node, sf)}`,
                requestBoundary: requestBoundary(node, verb, sf),
                responseBoundary: responseBoundary(node, verb, sf),
                permissionAuthority: `API module catalog/endpoint policy; caller ${rel(file)}`,
              };
              const key = JSON.stringify(operation);
              const current = operations.get(memberKey);
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
      // A computed selector can only account for leaves that were not already
      // traced through a concrete property access. This avoids falsely adding
      // the lifecycle POST to unrelated leaves such as base, lookup, or byId.
      for (const member of members.filter((candidate) => (operations.get(candidate.key)?.length ?? 0) === 0)) for (const call of calls) {
        const verb = calleeVerb(call);
        const operation = { verb: [verb], caller: `${rel(file)}#${functionName(call, sf)} (dynamic endpoint selector)`, requestBoundary: requestBoundary(call, verb, sf), responseBoundary: responseBoundary(call, verb, sf), permissionAuthority: `API module catalog/endpoint policy; caller ${rel(file)}` };
        const current = operations.get(member.key);
        if (current && !current.some((item) => JSON.stringify(item) === JSON.stringify(operation))) current.push(operation);
      }
    }
  }

  for (const member of members) {
    const referenced = referencedEndpointOperations.get(`${endpointSource}#${member.key}`);
    const current = operations.get(member.key);
    if (referenced && current && !current.some((item) => item.caller === referenced.caller)) {
      current.push({
        ...referenced,
        permissionAuthority: `API module catalog/endpoint policy; caller ${referenced.caller.split('#')[0]}`,
      });
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
  if (pathname === '/extras/appointments') return permission(['ViewAppointments']);
  if (pathname === '/extras') return anyOf([
    { roles: ['admin'] },
    { permissions: ['ViewUsers'] },
    { permissions: ['ViewAppointments'] },
  ]);
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
  if (pathname.startsWith('/apps/')) {
    const [, , moduleCode, submoduleCode] = pathname.split('/');
    return {
      status: 'dynamic',
      moduleCode,
      ...(submoduleCode ? { submoduleCode } : {}),
    };
  }
  if (/^\/basic-data\/geographical-information\/(countries|states|districts)$/.test(pathname)) return { moduleCode: 'reference-data', submoduleCode: 'geography' };
  if (pathname === '/basic-data/geographical-information/address-types') return { moduleCode: 'reference-data', submoduleCode: 'addresses' };
  if (pathname === '/basic-data/organizational-structure/geographic-scope') return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  if (pathname === '/basic-data'
    || pathname === '/basic-data/geographical-information'
    || pathname === '/basic-data/organizational-structure') return null;
  if (pathname.startsWith('/basic-data')) return { moduleCode: 'hr', submoduleCode: 'basic-data' };
  if (pathname.startsWith('/recruitment')) return { moduleCode: 'hr', submoduleCode: 'recruitment' };
  if (pathname.startsWith('/workforce-planning')) return { moduleCode: 'hr', submoduleCode: 'workforce' };
  if (pathname.startsWith('/finance')) return { moduleCode: 'acc', submoduleCode: 'fiscal-years' };
  if (pathname.startsWith('/advanced-tools/track-changes') || pathname.startsWith('/advanced-tools/localization-api')) return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  if (pathname === '/advanced-tools' || pathname === '/extras') return null;
  if (pathname.startsWith('/administration')) return { moduleCode: 'platform', submoduleCode: 'tenant-administration' };
  if (pathname.startsWith('/advanced-tools')) return { moduleCode: 'platform', submoduleCode: 'operations' };
  if (pathname.startsWith('/extras/appointments')) return { moduleCode: 'crm', submoduleCode: 'appointments' };
  if (pathname.startsWith('/extras')) return { moduleCode: 'platform', submoduleCode: 'operations' };
  return null;
}

function routeProfile(route, pathname) {
  const effectivePath = pathname.startsWith('layout:') ? pathname.slice('layout:'.length) || '/' : pathname;
  const profile = {
    currentOwner: route.currentOwner,
    targetOwner: route.targetOwner,
    scope: route.scope,
    offlineMode: route.offlineMode,
    status: route.status,
    note: route.note,
  };

  if (effectivePath === '/basic-data'
    || effectivePath === '/basic-data/geographical-information'
    || effectivePath === '/basic-data/organizational-structure') {
    return {
      ...profile,
      currentOwner: 'Shell/composite',
      targetOwner: 'Shell/composite',
      status: 'aligned',
      note: 'Aggregate shell route; individual child routes own their module entitlements.',
    };
  }
  if (/^\/basic-data\/geographical-information\/(countries|states|districts)$/.test(effectivePath)) {
    return {
      ...profile,
      currentOwner: 'ReferenceData/geography',
      targetOwner: 'ReferenceData/geography',
      scope: 'platform-global',
      offlineMode: 'read-cache',
      status: 'aligned',
      note: 'Global geography is owned by ReferenceData/geography with the server global geography entitlement.',
    };
  }
  if (effectivePath === '/basic-data/geographical-information/address-types') {
    return {
      ...profile,
      currentOwner: 'ReferenceData/addresses',
      targetOwner: 'ReferenceData/addresses',
      scope: 'tenant/company',
      offlineMode: 'read-cache',
      status: 'aligned',
      note: 'Address types are tenant reference data in ReferenceData/addresses.',
    };
  }
  if (effectivePath === '/basic-data/organizational-structure/geographic-scope') {
    return {
      ...profile,
      currentOwner: 'Platform/tenant-administration',
      targetOwner: 'Platform/tenant-administration',
      scope: 'tenant/company',
      status: 'aligned',
      note: 'Company geographic scope is a Platform tenancy capability.',
    };
  }
  if (effectivePath.startsWith('/finance')) {
    return {
      ...profile,
      currentOwner: 'Accounting/fiscal-years',
      targetOwner: 'Accounting/fiscal-years',
      scope: 'tenant/company',
      status: 'aligned',
      note: 'Fiscal years are owned by the Accounting module (acc/fiscal-years).',
    };
  }
  if (effectivePath.startsWith('/administration')) {
    return {
      ...profile,
      currentOwner: 'Platform/tenant-administration',
      targetOwner: 'Platform/tenant-administration',
      scope: 'tenant/company',
      status: 'aligned',
      note: 'Tenant administration is owned by the Platform module.',
    };
  }
  if (effectivePath === '/advanced-tools/track-changes' || effectivePath === '/advanced-tools/localization-api') {
    return {
      ...profile,
      currentOwner: 'Platform/tenant-administration',
      targetOwner: 'Platform/tenant-administration',
      scope: 'tenant/company',
      status: 'aligned',
      note: 'Tenant administration owns track changes and localization settings.',
    };
  }
  if (effectivePath === '/advanced-tools/hangfire-dashboard' || effectivePath === '/advanced-tools/health-check' || effectivePath === '/advanced-tools/api-endpoints') {
    return {
      ...profile,
      currentOwner: 'Platform/operations',
      targetOwner: 'Platform/operations',
      scope: 'platform-global',
      status: 'aligned',
      note: 'Global operational diagnostics are owned by Platform/operations.',
    };
  }
  if (effectivePath === '/advanced-tools') {
    return {
      ...profile,
      currentOwner: 'Shell/composite',
      targetOwner: 'Shell/composite',
      status: 'aligned',
      note: 'Aggregate shell route; tenant administration and operations own their child routes.',
    };
  }
  if (effectivePath === '/extras/appointments') {
    return {
      ...profile,
      currentOwner: 'CRM/appointments',
      targetOwner: 'CRM/appointments',
      status: 'aligned',
      note: 'Appointments are CRM-owned and require CRM appointment permissions and entitlement.',
    };
  }
  if (effectivePath === '/extras' || effectivePath === '/extras/files') {
    return {
      ...profile,
      currentOwner: effectivePath === '/extras/files' ? 'Platform/files' : 'Shell/composite',
      targetOwner: effectivePath === '/extras/files' ? 'Platform/files' : 'Shell/composite',
      status: 'aligned',
      note: effectivePath === '/extras/files'
        ? 'File transfer is owned by Platform/files and remains online-authoritative.'
        : 'Aggregate shell route; files and CRM own their child routes.',
    };
  }
  if (effectivePath.startsWith('/apps/')) {
    return {
      ...profile,
      currentOwner: 'Shell/dynamic',
      targetOwner: 'Shell/dynamic',
      status: 'aligned',
      note: 'Dynamic module route is resolved through the server catalog and mobile registry.',
    };
  }
  if (effectivePath === '/apps') {
    return {
      ...profile,
      currentOwner: 'Shell/composite',
      targetOwner: 'Shell/composite',
      status: 'aligned',
      note: 'Dynamic module launcher; individual module routes own their entitlements.',
    };
  }
  if (effectivePath === '/super-admin-dashboard' || effectivePath === '/tenant-management' || effectivePath === '/tenant-admin-management') {
    return {
      ...profile,
      currentOwner: 'Platform',
      targetOwner: 'Platform',
      scope: 'platform-global',
      status: 'aligned',
      note: 'Platform super-admin route; no tenant entitlement selector is required.',
    };
  }
  return profile;
}

function targetRoutePolicy(_pathname, current, _profile) {
  return current;
}

function targetModuleRequirement(_pathname, currentModule, _profile) {
  return currentModule;
}

function endpointProfile(source) {
  if (source.includes('/core/realtime/')) return { currentOwner: 'Platform/realtime', targetOwner: 'Platform/realtime', scope: 'session/tenant/company', status: 'aligned', permissionSource: 'Platform authenticated realtime policy' };
  if (source.includes('/hr/recruitment/')) return { currentOwner: 'HR/recruitment', targetOwner: 'HR/recruitment', scope: 'tenant/company', status: 'aligned', permissionSource: 'HR API endpoint policy backed by HrPermissions.Recruitment' };
  if (source.includes('/accounting/fiscal-years/')) return { currentOwner: 'Accounting/fiscal-years', targetOwner: 'Accounting/fiscal-years', scope: 'tenant/company', status: 'aligned', permissionSource: 'Accounting FiscalYearsController and AccountingPermissions.FiscalYears' };
  if (source.includes('/reference-data/addresses/address-types/')) return { currentOwner: 'ReferenceData/addresses', targetOwner: 'ReferenceData/addresses', scope: 'tenant/company', status: 'aligned', permissionSource: 'ReferenceData AddressTypesController and ReferenceDataPermissions.TenantReferenceData' };
  if (source.includes('/reference-data/geography/countries/') || source.includes('/reference-data/geography/states/') || source.includes('/reference-data/geography/districts/')) return { currentOwner: 'ReferenceData/geography', targetOwner: 'ReferenceData/geography', scope: 'platform-global', status: 'aligned', permissionSource: 'ReferenceData geography controllers and ReferenceDataPermissions.GlobalGeography' };
  if (source.includes('/platform/tenant-administration/company-geographic-scope/')) return { currentOwner: 'Platform/tenant-administration', targetOwner: 'Platform/tenant-administration', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform CompanyGeographicScopeController and PlatformPermissions.CompanyGeographicScope' };
  if (source.includes('/hr/basic-data/organizational-structure/')) return { currentOwner: 'HR/basic-data', targetOwner: 'HR/basic-data', scope: 'tenant/company', status: 'aligned', permissionSource: 'HR OrganizationalStructureController and HrPermissions.OrganizationalStructure' };
  if (source.includes('/hr/workforce-planning/')) return { currentOwner: 'HR/workforce', targetOwner: 'HR/workforce', scope: 'tenant/company', status: 'aligned', permissionSource: 'HR workforce endpoint policy backed by HrPermissions.Workforce' };
  if (source.includes('/modules/crm/appointments/')) return { currentOwner: 'CRM/appointments', targetOwner: 'CRM/appointments', scope: 'tenant/company', status: 'aligned', permissionSource: 'CRM AppointmentsController and CrmPermissions.Appointments' };
  if (source.includes('/platform/reporting/')) return { currentOwner: 'Platform/reporting', targetOwner: 'Platform/reporting', scope: 'tenant/company', status: 'aligned', permissionSource: 'Reporting API endpoint policy and ReportingPermissions.Reports' };
  if (source.includes('/platform/tools/track-changes/')) return { currentOwner: 'Platform/tenant-administration', targetOwner: 'Platform/tenant-administration', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform EntityChangeLogsController and PlatformPermissions.ViewChangeLogs' };
  if (source.includes('/platform/tools/localization/')) return { currentOwner: 'Platform/tenant-administration', targetOwner: 'Platform/tenant-administration', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform LocalizationController and PlatformPermissions localizations' };
  if (source.includes('/platform/tools/operations/')) return { currentOwner: 'Platform/operations', targetOwner: 'Platform/operations', scope: 'platform-global', status: 'aligned', permissionSource: 'Platform BackgroundJobsController and PlatformPermissions.GlobalOperations' };
  if (source.includes('/platform/administration/') || source.includes('/platform/offline-operations/') || source.includes('/platform/tenant-admins/') || source.includes('/platform/tenants/')) return { currentOwner: 'Platform/tenant-administration', targetOwner: 'Platform/tenant-administration', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform endpoint policy and PlatformPermissions.TenantAdministration' };
  if (source.includes('/platform/auth/')) return { currentOwner: 'Platform/identity', targetOwner: 'Platform/identity', scope: 'session/tenant/company', status: 'aligned', permissionSource: 'Platform authentication/session endpoint policy' };
  if (source.includes('/platform/modules/')) return { currentOwner: 'Platform/modules', targetOwner: 'Platform/modules', scope: 'session/tenant', status: 'aligned', permissionSource: 'Platform module catalog endpoint policy' };
  if (source.includes('/platform/notifications/')) return { currentOwner: 'Platform/notifications', targetOwner: 'Platform/notifications', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform notification endpoint policy' };
  if (source.includes('/platform/tools/file-manager/')) return { currentOwner: 'Platform/files', targetOwner: 'Platform/files', scope: 'tenant/company', status: 'aligned', permissionSource: 'Platform file endpoint policy' };
  return { currentOwner: 'UNREVIEWED', targetOwner: 'UNREVIEWED', scope: 'unreviewed', status: 'deferred', permissionSource: 'UNREVIEWED endpoint ownership and permission policy' };
}

for (const route of matrix.routes) {
  const pathname = routePath(route.source);
  const profile = routeProfile(route, pathname);
  const current = pathname.startsWith('layout:') || pathname.startsWith('system:') ? { kind: 'inherited' } : policy(pathname);
  const currentModule = pathname.startsWith('layout:') || pathname.startsWith('system:') ? { status: 'inherited' } : moduleRequirement(pathname);
  Object.assign(route, profile);
  route.path = pathname;
  route.currentRoutePolicy = current;
  route.targetRoutePolicy = targetRoutePolicy(pathname, current, profile);
  route.currentModuleRequirement = currentModule;
  route.targetModuleRequirement = targetModuleRequirement(pathname, currentModule, profile);
  delete route.routePolicy;
  delete route.moduleRequirement;
}

const endpointSources = walk(path.join(mobileRoot, 'src'))
  .filter((file) => file.endsWith('endpoints.ts'))
  .map(rel)
  .sort();
const existingEndpointSources = new Set(matrix.endpointFiles.map((entry) => entry.source));
for (const source of endpointSources) {
  if (existingEndpointSources.has(source)) continue;
  matrix.endpointFiles.push({
    source,
    family: path.basename(source, '.ts').replace(/-endpoints$/, ''),
    members: [],
  });
}
matrix.endpointFiles.sort((left, right) => left.source.localeCompare(right.source));

for (const endpointFile of matrix.endpointFiles) {
  const absolute = path.join(mobileRoot, endpointFile.source);
  const source = fs.readFileSync(absolute, 'utf8');
  const parsed = endpointObject(source, endpointFile.source);
  const operations = operationsFor(endpointFile.source, parsed.variable, parsed.members);
  const profile = endpointProfile(endpointFile.source);
  endpointFile.members = parsed.members.map(({ key, pattern }) => {
    const ops = operations.get(key) ?? [];
    const permissionAuthority = endpointPermissionOverrides.get(`${endpointFile.source}#${key}`) ?? profile.permissionSource;
    const tracedOperations = ops.map((operation) => ({ ...operation, permissionAuthority }));
    return {
      key,
      pattern,
      verb: tracedOperations.length ? [...new Set(tracedOperations.flatMap((operation) => operation.verb))] : ['UNUSED'],
      operations: tracedOperations,
      currentOwner: profile.currentOwner,
      targetOwner: profile.targetOwner,
      permissionAuthority,
      scope: profile.scope,
      offlineMode: 'online-only',
      status: tracedOperations.length ? profile.status : 'deferred',
      note: tracedOperations.length
        ? `Verb and request/response boundaries are traced from non-test callers; permission authority: ${permissionAuthority}.`
        : 'Unwired endpoint constant; no non-test caller was found.',
    };
  });
}

fs.writeFileSync(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
console.log(`Synchronized ${matrix.routes.length} routes and ${matrix.endpointFiles.reduce((sum, file) => sum + file.members.length, 0)} endpoint leaf members.`);

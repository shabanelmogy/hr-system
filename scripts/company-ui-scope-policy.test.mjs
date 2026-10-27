import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { companyUiTextScope } from './company-ui-scope-policy.mjs';

test('system-only sources and mixed navigation keys cannot be customized by companies', () => {
  assert.equal(companyUiTextScope('web', 'core', 'menu.systemSettings'), 'system');
  assert.equal(companyUiTextScope('mobile', 'translation', 'systemSettings.title'), 'system');
  assert.equal(companyUiTextScope('mobile', 'translation', 'roleManagement.permissionModules.systemErrorLogs'), 'system');
  assert.equal(companyUiTextScope('mobile', 'translation', 'roleManagement.permissionModules.errorLogSettings'), 'system');
  assert.equal(companyUiTextScope('mobile', 'translation', 'systemErrorLogs.diagnostics'), 'system');
  for (const namespace of ['platform-tenants', 'reference-countries', 'reference-states', 'reference-districts'])
    assert.equal(companyUiTextScope('web', namespace, 'any.key'), 'system');
  for (const key of ['menu.countries', 'menu.countriesDescription', 'menu.superAdminDashboard', 'CountryCreatedNotificationMessage'])
    assert.equal(companyUiTextScope('web', 'core', key), 'system');
  for (const key of ['countries.title', 'states.title', 'districts.title', 'superAdminDashboard.title', 'tenantManagement.title', 'navigation.tenantAdminManagement', 'basicData.countries'])
    assert.equal(companyUiTextScope('mobile', 'translation', key), 'system');
});

test('company and shared text retain their verified owners', () => {
  assert.equal(companyUiTextScope('mobile', 'translation', 'emailTemplates.title'), 'company');
  assert.equal(companyUiTextScope('web', 'core', 'emailTemplates.title'), 'shared');
  for (const client of ['web', 'mobile']) {
    const namespace = client === 'web' ? 'platform-advanced-tools' : 'translation';
    assert.equal(companyUiTextScope(client, namespace, 'errorLogs.title'), client === 'web' ? 'shared' : 'company');
    assert.equal(companyUiTextScope(client, namespace, 'errorLogSettings.retentionDays'), 'system');
    assert.equal(companyUiTextScope(client, namespace, 'systemErrorLogs.title'), 'system');
  }
  for (const [namespace, key, scope] of [
    ['core', 'actions.save', 'shared'], ['platform-auth', 'users.title', 'shared'],
    ['platform-auth', 'userPermissions.title', 'shared'], ['reference-address-types', 'addressTypes.title', 'company'],
    ['platform-company-geography', 'companyGeographicScope.title', 'company'], ['module-hr', 'name', 'company'],
  ]) assert.equal(companyUiTextScope('web', namespace, key), scope);
  for (const key of ['userPermissions.title', 'userManagement.title', 'roleManagement.title', 'addressTypes.title', 'companyGeographicScope.title'])
    assert.equal(companyUiTextScope('mobile', 'translation', key), 'company');
  assert.equal(companyUiTextScope('mobile', 'translation', 'common.save'), 'shared');
});

test('new namespaces and mobile roots require an explicit ownership decision', () => {
  assert.equal(companyUiTextScope('web', 'unreviewed-module', 'title'), null);
  assert.equal(companyUiTextScope('web', 'constructor', 'title'), null);
  assert.equal(companyUiTextScope('mobile', 'translation', 'unreviewedFeature.title'), null);
});

test('every embedded entry is classified and ownership participates in each client fingerprint', () => {
  const catalog = JSON.parse(fs.readFileSync(new URL('../api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyLocalization/company-ui-catalog.json', import.meta.url), 'utf8'));
  assert.equal(catalog.schemaVersion, 3);
  for (const source of catalog.sources) for (const entry of source.entries)
    assert.equal(entry.scope, companyUiTextScope(source.client, source.namespace, entry.key), `${source.id}:${entry.key}`);
  for (const client of ['web', 'mobile']) {
    const sources = catalog.sources.filter(source => source.client === client);
    const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
    assert.equal(hash(sources), catalog.versions[client]);
    const changed = structuredClone(sources);
    changed[0].entries[0].scope = changed[0].entries[0].scope === 'system' ? 'company' : 'system';
    assert.notEqual(hash(changed), catalog.versions[client]);
  }
});

test("message history namespace is company-owned", () => { assert.equal(companyUiTextScope("web", "platform-messages", "messageLogs.title"), "company"); });

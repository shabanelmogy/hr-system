import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { systemUiPermissions } from './system-ui-access-policy.mjs';
test('global catalog authority is explicit, screen-specific and fail closed', () => {
 assert.deepEqual(systemUiPermissions('web','core','menu.countries'),['Countries:View']);
 assert.deepEqual(systemUiPermissions('web','core','actions.save'),[]);
 assert.equal(systemUiPermissions('web','core','menu.users'),null);
 assert.equal(systemUiPermissions('web','core','menu.emailTemplates'),null);
 assert.equal(systemUiPermissions('web','core','emailTemplates.title'),null);
 assert.equal(systemUiPermissions('mobile','translation','emailTemplates.title'),null);
 assert.equal(systemUiPermissions('mobile','translation','navigation.emailTemplates'),null);
 assert.equal(systemUiPermissions('web','module-hr','name'),null);
 assert.equal(systemUiPermissions('mobile','translation','userManagement.title'),null);
 assert.deepEqual(systemUiPermissions('mobile','translation','auditLog.title'),['SystemAuditTrail:View']);
 assert.deepEqual(systemUiPermissions('web','platform-advanced-tools','healthCheck.title'),['SystemHealth:View']);
});

test('embedded server metadata is generated from the same reviewed client policy',()=>{
 const catalog=JSON.parse(fs.readFileSync(new URL('../api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyLocalization/company-ui-catalog.json',import.meta.url),'utf8'));
 for(const source of catalog.sources)for(const entry of source.entries)assert.deepEqual(entry.systemPermissions,systemUiPermissions(source.client,source.namespace,entry.key),source.id+':'+entry.key);
 assert.deepEqual(systemUiPermissions('web','core','CountryCreatedNotificationMessage'),['Countries:View']);
 assert.deepEqual(systemUiPermissions('mobile','translation','basicData.states'),['States:View']);
});

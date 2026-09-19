import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const failures = [];

function runExpoConfig(environment) {
  const result = spawnSync(
    process.execPath,
    [resolve(root, 'node_modules/expo/bin/cli'), 'config', '--type', 'public', '--json'],
    { cwd: root, env: { ...process.env, CI: '1', ...environment }, encoding: 'utf8' },
  );
  if (result.status === 0) return JSON.parse(result.stdout);
  return { error: `${result.stderr}\n${result.stdout}` };
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const local = runExpoConfig({
  ERP_LOCAL_NATIVE_BUILD: 'true', EAS_BUILD: '', EAS_BUILD_PROJECT_ID: '', EXPO_EAS_PROJECT_ID: '',
  EXPO_PUBLIC_RELEASE_CHANNEL: 'development', EXPO_PUBLIC_API_CONTRACT_VERSION: 'v1', EXPO_PUBLIC_APP_LINK_HOST: '',
});
assert(!local.error, `Local Expo config failed: ${local.error ?? ''}`);
assert(local.extra?.eas?.projectId === '00000000-0000-4000-8000-000000000057', 'Local config must use the reserved local native project ID.');
assert(local.extra?.eas?.observe?.dispatchingEnabled === false, 'Local config must disable Observe dispatching.');

const easProjectId = '11111111-1111-4111-8111-111111111111';
const eas = runExpoConfig({
  ERP_LOCAL_NATIVE_BUILD: 'false', EAS_BUILD: 'true', EAS_BUILD_PROJECT_ID: easProjectId, EXPO_EAS_PROJECT_ID: '',
  EXPO_PUBLIC_RELEASE_CHANNEL: 'production', EXPO_PUBLIC_API_CONTRACT_VERSION: 'v1', EXPO_PUBLIC_APP_LINK_HOST: 'app.example.com',
});
assert(!eas.error, `EAS Expo config failed: ${eas.error ?? ''}`);
assert(eas.extra?.eas?.projectId === easProjectId, 'EAS config must use its build project ID.');
assert(eas.extra?.eas?.observe?.dispatchingEnabled === true, 'EAS config must enable Observe dispatching.');
assert(eas.extra?.release?.apiContractVersion === 'v1', 'Release metadata must declare API contract v1.');
assert(eas.ios?.associatedDomains?.includes('applinks:app.example.com'), 'iOS app-link association is missing.');

const requiredPaths = ['/confirm-email', '/accept-invitation', '/reset-password'];
for (const route of requiredPaths) {
  assert((eas.android?.intentFilters ?? []).some((filter) => filter.data?.some((data) => data.pathPrefix === route)), `Android app-link intent filter is missing ${route}.`);
}
for (const relativePath of ['app/(auth)/confirm-email.tsx', 'app/(auth)/accept-invitation.tsx', 'app/(auth)/reset-password.tsx']) {
  assert(existsSync(resolve(root, relativePath)), `Required deep-link route is missing: ${relativePath}`);
}

const easJson = JSON.parse(readFileSync(resolve(root, 'eas.json'), 'utf8'));
assert(easJson.build?.preview?.distribution === 'internal', 'Preview EAS profile must use internal distribution.');
assert(easJson.build?.preview?.uploadSourceMaps === true, 'Preview EAS profile must upload source maps.');
assert(easJson.build?.production?.autoIncrement === true, 'Production EAS profile must auto-increment versions.');
assert(easJson.build?.production?.uploadSourceMaps === true, 'Production EAS profile must upload source maps.');

const missingHost = runExpoConfig({ ERP_LOCAL_NATIVE_BUILD: 'false', EAS_BUILD: 'true', EAS_BUILD_PROJECT_ID: easProjectId, EXPO_PUBLIC_APP_LINK_HOST: '' });
assert(Boolean(missingHost.error) && missingHost.error.includes('EXPO_PUBLIC_APP_LINK_HOST'), 'EAS config must fail when the app-link host is absent.');

if (failures.length > 0) {
  console.error(`Mobile release readiness check failed:\n\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log('Mobile release readiness source gate passed (EAS metadata, deep links, routes, and source maps).');

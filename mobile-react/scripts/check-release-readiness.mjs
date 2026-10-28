import { existsSync, readFileSync, mkdtempSync, cpSync, writeFileSync, symlinkSync, lstatSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { resolve, join, relative, isAbsolute, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const failures = [];

async function runExpoConfig(environment) {
  const tempRoot = resolve(tmpdir());
  const prefix = 'erp-mobile-release-check-';
  const fixtureRoot = mkdtempSync(join(tempRoot, prefix));
  const modulesLink = join(fixtureRoot, 'node_modules');
  try {
    for (const file of ['app.config.ts', 'app.json', 'package.json', 'tsconfig.json']) {
      cpSync(join(root, file), join(fixtureRoot, file));
    }
    cpSync(join(root, 'assets'), join(fixtureRoot, 'assets'), {recursive: true});
    const appJson = JSON.parse(readFileSync(join(fixtureRoot, 'app.json'), 'utf8'));
    // Synthetic identities belong only to the disposable verification fixture.
    delete appJson.expo?.extra?.eas?.projectId;
    writeFileSync(join(fixtureRoot, 'app.json'), JSON.stringify(appJson));
    symlinkSync(join(root, 'node_modules'), modulesLink, process.platform === 'win32' ? 'junction' : 'dir');
    const result = spawnSync(
      process.execPath,
      [resolve(root, 'node_modules/expo/bin/cli'), 'config', '--type', 'public', '--json'],
      { cwd: fixtureRoot, env: { ...process.env, CI: '1', ...environment }, encoding: 'utf8' },
    );
    if (result.status === 0) return JSON.parse(result.stdout);
    return { error: `${result.stderr}\n${result.stdout}` };
  } finally {
    const relativeFixture = relative(tempRoot, fixtureRoot);
    if (!relativeFixture || isAbsolute(relativeFixture) || relativeFixture.startsWith('..') || !basename(fixtureRoot).startsWith(prefix)) {
      throw new Error('Refusing to remove an unexpected release-check fixture.');
    }
    if (existsSync(modulesLink) && !lstatSync(modulesLink).isSymbolicLink()) {
      throw new Error('Refusing to remove a release-check node_modules that is not a link.');
    }
    await rm(modulesLink, {force: true, maxRetries: 10, retryDelay: 200});
    await rm(fixtureRoot, {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const local = await runExpoConfig({
  ERP_LOCAL_NATIVE_BUILD: 'true', EAS_BUILD: '', EAS_BUILD_PROJECT_ID: '', EXPO_EAS_PROJECT_ID: '',
  EXPO_PUBLIC_RELEASE_CHANNEL: 'development', EXPO_PUBLIC_API_CONTRACT_VERSION: 'v1', EXPO_PUBLIC_APP_LINK_HOST: '',
});
assert(!local.error, `Local Expo config failed: ${local.error ?? ''}`);
assert(local.extra?.eas?.projectId === '00000000-0000-4000-8000-000000000057', 'Local config must use the reserved local native project ID.');
assert(local.extra?.eas?.observe?.dispatchingEnabled === false, 'Local config must disable Observe dispatching.');
assert(local.extra?.release?.demoLoginEnabled === true, 'Local development config must enable demo login by default.');

const easProjectId = '11111111-1111-4111-8111-111111111111';
const preview = await runExpoConfig({
  ERP_LOCAL_NATIVE_BUILD: 'false', EAS_BUILD: 'true', EAS_BUILD_PROJECT_ID: easProjectId, EXPO_EAS_PROJECT_ID: '',
  EXPO_PUBLIC_RELEASE_CHANNEL: 'preview', EXPO_PUBLIC_API_CONTRACT_VERSION: 'v1', EXPO_PUBLIC_APP_LINK_HOST: 'app.example.com',
  EXPO_PUBLIC_DEMO_LOGIN_ENABLED: 'true',
});
assert(!preview.error, `Preview EAS Expo config failed: ${preview.error ?? ''}`);
assert(preview.extra?.release?.demoLoginEnabled === true, 'Preview EAS config must enable demo login.');

const eas = await runExpoConfig({
  ERP_LOCAL_NATIVE_BUILD: 'false', EAS_BUILD: 'true', EAS_BUILD_PROJECT_ID: easProjectId, EXPO_EAS_PROJECT_ID: '',
  EXPO_PUBLIC_RELEASE_CHANNEL: 'production', EXPO_PUBLIC_API_CONTRACT_VERSION: 'v1', EXPO_PUBLIC_APP_LINK_HOST: 'app.example.com',
  EXPO_PUBLIC_DEMO_LOGIN_ENABLED: 'false',
});
assert(!eas.error, `EAS Expo config failed: ${eas.error ?? ''}`);
assert(eas.extra?.eas?.projectId === easProjectId, 'EAS config must use its build project ID.');
assert(eas.extra?.eas?.observe?.dispatchingEnabled === true, 'EAS config must enable Observe dispatching.');
assert(eas.extra?.release?.apiContractVersion === 'v1', 'Release metadata must declare API contract v1.');
assert(eas.extra?.release?.demoLoginEnabled === false, 'Production EAS config must disable demo login.');
assert(eas.ios?.associatedDomains?.includes('applinks:app.example.com'), 'iOS app-link association is missing.');

const requiredPaths = ['/confirm-email', '/accept-invitation', '/reset-password'];
for (const route of requiredPaths) {
  assert((eas.android?.intentFilters ?? []).some((filter) => filter.data?.some((data) => data.pathPrefix === route)), `Android app-link intent filter is missing ${route}.`);
}
for (const relativePath of ['app/(auth)/confirm-email.tsx', 'app/(auth)/accept-invitation.tsx', 'app/(auth)/reset-password.tsx']) {
  assert(existsSync(resolve(root, relativePath)), `Required deep-link route is missing: ${relativePath}`);
}

const easJson = JSON.parse(readFileSync(resolve(root, 'eas.json'), 'utf8'));
for (const profile of ['development', 'preview', 'production']) {
  assert(easJson.build?.[profile]?.node === '22.23.4', `${profile} EAS profile must use the approved patched Node 22.23.4 baseline.`);
}
assert(easJson.build?.development?.developmentClient === true, 'Development EAS profile must include the native development client.');
assert(easJson.build?.development?.distribution === 'internal', 'Development EAS profile must be installable internally.');
assert(easJson.build?.development?.environment === 'preview', 'Development EAS profile must use the configured preview endpoints.');
assert(easJson.build?.development?.env?.EXPO_PUBLIC_RELEASE_CHANNEL === 'development', 'Development EAS profile must identify the development channel.');
assert(easJson.build?.preview?.distribution === 'internal', 'Preview EAS profile must use internal distribution.');
assert(easJson.build?.preview?.uploadSourceMaps === true, 'Preview EAS profile must upload source maps.');
assert(easJson.build?.production?.autoIncrement === true, 'Production EAS profile must auto-increment versions.');
assert(easJson.build?.production?.uploadSourceMaps === true, 'Production EAS profile must upload source maps.');
assert(easJson.build?.preview?.env?.EXPO_PUBLIC_DEMO_LOGIN_ENABLED === 'true', 'Preview EAS profile must enable demo login.');
assert(easJson.build?.production?.env?.EXPO_PUBLIC_DEMO_LOGIN_ENABLED === 'false', 'Production EAS profile must disable demo login.');

const missingHost = await runExpoConfig({ ERP_LOCAL_NATIVE_BUILD: 'false', EAS_BUILD: 'true', EAS_BUILD_PROJECT_ID: easProjectId, EXPO_PUBLIC_APP_LINK_HOST: '' });
assert(Boolean(missingHost.error) && missingHost.error.includes('EXPO_PUBLIC_APP_LINK_HOST'), 'EAS config must fail when the app-link host is absent.');

if (failures.length > 0) {
  console.error(`Mobile release readiness check failed:\n\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log('Mobile release readiness source gate passed (EAS metadata, deep links, routes, and source maps).');

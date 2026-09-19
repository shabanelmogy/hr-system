import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const repositoryRoot = resolve(root, '..');
const failures = [];
const requireFile = (path) => {
  const absolute = resolve(repositoryRoot, path);
  if (!existsSync(absolute)) failures.push(`Missing required foundation artifact: ${path}`);
  return absolute;
};
const read = (path) => readFileSync(requireFile(path), 'utf8');

for (const path of [
  'documentation/mobile-react/MOBILE_CAPABILITY_MATRIX.md',
  'documentation/mobile-react/MOBILE_PERFORMANCE_BUDGETS.md',
  'documentation/mobile-react/MOBILE_RELEASE_RUNBOOK.md',
  'documentation/mobile-react/MOBILE_UI_EVIDENCE_MATRIX.md',
]) requireFile(path);

const scheduler = read('mobile-react/src/shell/offline/OfflineSyncCoordinator.tsx');
if (scheduler.includes('setInterval(')) failures.push('Offline sync must schedule persisted nextAttemptAt rather than poll with setInterval.');
if (!scheduler.includes('nextAttemptAt') || !scheduler.includes('subscribeToOfflineSyncRequests')) {
  failures.push('Offline sync must react to both persisted retry deadlines and enqueue/manual requests.');
}

for (const path of [
  'mobile-react/src/modules/hr/basic-data/countries',
  'mobile-react/src/modules/hr/basic-data/states',
  'mobile-react/src/modules/hr/basic-data/districts',
  'mobile-react/src/modules/hr/basic-data/address-types',
  'mobile-react/src/modules/hr/basic-data/company-geographic-scope',
  'mobile-react/src/modules/hr/finance/fiscal-years',
  'mobile-react/src/platform/tools/appointments',
]) {
  if (existsSync(resolve(repositoryRoot, path))) failures.push(`Legacy owner path still exists: ${path}`);
}

const capabilities = read('documentation/mobile-react/MOBILE_CAPABILITY_MATRIX.md');
for (const decision of ['Required', 'Deferred', 'Excluded']) {
  if (!capabilities.includes(`**${decision}**`)) failures.push(`Capability matrix has no ${decision} decision.`);
}

const eas = JSON.parse(read('mobile-react/eas.json'));
if (eas.build?.production?.autoIncrement !== true) failures.push('Production EAS builds must auto-increment their store version.');
if (eas.build?.preview?.distribution !== 'internal') failures.push('Preview EAS builds must use internal distribution.');

if (failures.length) {
  console.error(`Mobile foundation readiness check failed:\n\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}
console.log('Mobile foundation readiness source gates passed; device/EAS evidence remains a release-time gate.');

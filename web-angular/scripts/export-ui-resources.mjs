import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { generateClientScopePolicy } from '../../scripts/company-ui-scope-policy.mjs';
import { generateSystemUiPolicy } from '../../scripts/system-ui-access-policy.mjs';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(app, '..');
const catalogPath = path.join(root, 'api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyLocalization/company-ui-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
if (catalog.schemaVersion !== 3) throw new Error('Unsupported UI catalog protocol.');
const sources = catalog.sources.filter(source => source.client === 'web');
const version = createHash('sha256').update(JSON.stringify(sources)).digest('hex');
if (version !== catalog.versions.web) throw new Error('Catalog fingerprint is invalid; run the canonical catalog generator first.');
const outputs = new Map();
const loaders = [];
// Shared validation feedback must render immediately, even before a route's core chunk loads.
const bootstrapKeys = ['general.mainTitle', 'messages.unsavedChangesTitle', 'messages.unsavedChangesConfirm', 'messages.discardChanges', 'actions.cancel', 'common.validationErrors', 'common.reviewValidationErrors', 'validation.invalidDate', 'validation.required', 'dateField', 'numericField', 'booleanField', 'auditLog.fields.StartDate', 'auditLog.fields.EndDate', 'collections', 'reference', 'common.noOptionsFound', 'pagination', 'common.loading', 'common.error', 'actions.retry', 'actions.gridOptions', 'general.search', 'general.clear', 'general.reset', 'views.grid', 'views.cards', 'authorization.forbidden.title'];
for (const source of sources) {
  const resources = { en: {}, ar: {} };
  for (const entry of source.entries) {
    if (entry.key.split('.').some(segment => ['__proto__', 'constructor', 'prototype'].includes(segment))) throw new Error('Unsafe catalog key.');
    for (const language of ['en', 'ar']) if (typeof entry[language] === 'string') resources[language][entry.key] = entry[language];
  }
  outputs.set(`src/locales/generated/${source.namespace}.json`, JSON.stringify(resources, null, 2) + '\n');
  if (source.namespace === 'core') outputs.set('src/locales/generated/bootstrap.json', JSON.stringify({
    en: Object.fromEntries(Object.entries(resources.en).filter(([key]) => bootstrapKeys.some(base => key === base || key.startsWith(base + '_') || key.startsWith(base + '.')))),
    ar: Object.fromEntries(Object.entries(resources.ar).filter(([key]) => bootstrapKeys.some(base => key === base || key.startsWith(base + '_') || key.startsWith(base + '.')))),
  }, null, 2) + '\n');
  loaders.push(`  ${JSON.stringify(source.namespace)}: () => import('../../../locales/generated/${source.namespace}.json').then(module => module.default),`);
}
outputs.set('src/app/platform/localization/catalog.generated.ts',
  `// Generated from the existing schema-3 API web catalog. Do not edit.\nexport const uiCatalogVersion = ${JSON.stringify(version)};\nexport const namespaceLoaders = {\n${loaders.join('\n')}\n};\n`);
outputs.set('src/app/platform/localization/text-scope.generated.ts', generateClientScopePolicy('web'));
outputs.set('src/app/platform/localization/system-access.generated.ts', generateSystemUiPolicy('web'));
const check = process.argv.includes('--check');
let invalid = false;
for (const [relative, content] of outputs) {
  const target = path.join(app, relative);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') !== content) {
      process.stderr.write(`Stale Angular UI artifact: ${relative}\n`); invalid = true;
    }
  } else { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content); }
}
if (invalid) process.exitCode = 1;
else process.stdout.write(`Angular consumes existing web catalog ${version}: ${sources.length} namespaces; no API/catalog identity change.\n`);

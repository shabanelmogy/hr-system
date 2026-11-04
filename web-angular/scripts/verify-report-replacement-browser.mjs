import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Production assets and fixture APIs only: no application server or live writes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'dist/erp-angular/browser');
const output = path.resolve(root, '../.codex-tmp/report-runtime-review/replacement-browser');
const origin = 'https://localhost:4210';
await fs.mkdir(output, { recursive: true });
const catalog = await fs.readFile(
  path.join(root, 'src/app/platform/localization/catalog.generated.ts'),
  'utf8',
);
const catalogVersion = catalog.match(/[a-f0-9]{64}/)?.[0];
assert.ok(catalogVersion);
const resources = {};
for (const scope of ['core', 'reporting'])
  resources[scope] = JSON.parse(
    await fs.readFile(path.join(root, 'src/locales/generated', scope + '.json'), 'utf8'),
  );
const hash = 'a'.repeat(64);
const id = 'c6518e27-5e26-4790-932c-80d572099a32';
const version = {
  id: '104c0411-c988-449d-9a36-e27d2d7532f5',
  versionNumber: 1,
  originalFileName: 'Countries.Directory.rpt',
  size: 32,
  sha256: hash,
  summaryTitle: 'Original title',
  summarySubject: 'Original subject',
  validationStatus: 'Valid',
  validationReason: null,
  validationContractSchemaVersion: 1,
  validationContractFingerprint: hash,
  isPublished: true,
  createdOn: '2026-11-01T00:00:00Z',
};
const original = {
  id,
  entityKey: 'countries',
  reportKey: 'countries-directory',
  displayName: 'Directory',
  description: 'Keep description',
  updatedOn: '2026-11-01T00:00:00Z',
  currentVersionNumber: 1,
  isPublished: true,
  isArchived: false,
  rowVersion: 'AAAAAAAAAAA=',
  versions: [version],
};
const replacement = {
  ...original,
  currentVersionNumber: 2,
  rowVersion: 'AQEBAQEBAQE=',
  versions: [
    { ...version, isPublished: false },
    {
      ...version,
      id: '204c0411-c988-449d-9a36-e27d2d7532f5',
      versionNumber: 2,
      summaryTitle: 'New title',
      createdOn: '2026-11-04T00:00:00Z',
    },
  ],
};
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of ['en', 'ar']) {
    for (const width of [1213, 390]) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      });
      const scenario = `${language}-${width}`;
      const t = (key) => resources.reporting[language][key] ?? resources.core[language][key];
      const mutations = [];
      let current = original;
      try {
        await context.addCookies([{ name: 'i18next', value: language, url: origin }]);
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          const requested = path.resolve(
            build,
            decodeURIComponent(url.pathname).replace(/^\/+/, ''),
          );
          if (requested !== build && !requested.startsWith(build + path.sep)) return route.abort();
          const file = path.extname(requested) ? requested : path.join(build, 'index.html');
          const mime =
            {
              '.html': 'text/html',
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.json': 'application/json',
              '.woff2': 'font/woff2',
              '.svg': 'image/svg+xml',
              '.png': 'image/png',
            }[path.extname(file)] ?? 'application/octet-stream';
          try {
            await route.fulfill({ body: await fs.readFile(file), contentType: mime });
          } catch {
            await route.fulfill({ status: 404, body: '' });
          }
        });
        await context.route('**/api/**', async (route) => {
          const request = route.request();
          const url = new URL(request.url());
          let body = [];
          if (request.method() === 'POST' && url.pathname.includes('/manage'))
            mutations.push(url.pathname);
          if (/\/(session|refresh)$/.test(url.pathname))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [
                  'Countries:Edit',
                  'GlobalCrystalReports:View',
                  'GlobalCrystalReports:Create',
                  'GlobalCrystalReports:Upload',
                  'GlobalCrystalReports:Publish',
                  'GlobalCrystalReportAccess:Edit',
                ],
              },
            };
          else if (url.pathname.endsWith('/runtime'))
            body = { catalogVersion, revision: 1, overrides: [] };
          else if (url.pathname.endsWith('/csrf')) body = { requestToken: 'fixture' };
          else if (url.pathname.endsWith('/manage/entities'))
            body = [
              {
                entityKey: 'countries',
                scope: 'global',
                filters: [],
                contractSchemaVersion: 1,
                contractFingerprint: hash,
              },
            ];
          else if (url.pathname.endsWith('/upload-target')) {
            assert.equal(url.searchParams.get('entityKey'), 'countries');
            assert.equal(url.searchParams.get('fileName'), version.originalFileName);
            body = { report: current, canReplace: true };
          } else if (url.pathname.endsWith('/replace')) {
            assert.equal(url.pathname, `/api/v1/global-crystal-reports/manage/${id}/replace`);
            const multipart = request.postDataBuffer()?.toString();
            assert.ok(multipart?.includes('name="rowVersion"\r\n\r\nAAAAAAAAAAA='));
            assert.ok(multipart.includes('filename="Countries.Directory.rpt"'));
            current = replacement;
            body = current;
          } else if (url.pathname.endsWith('/access'))
            body = {
              access: [],
              allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
              canView: true,
              canEdit: true,
              rowVersion: current.rowVersion,
            };
          else if (url.pathname.endsWith('/manage/' + id)) body = current;
          else if (url.pathname.endsWith('/manage')) body = { items: [current], totalCount: 1 };
          await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin + '/administration/global-crystal-reports');
        await page
          .getByRole('button', { name: t('globalTemplates.design.uploadExisting'), exact: true })
          .click();
        const editor = page.getByRole('dialog', { name: t('crystalReports.create'), exact: true });
        await editor.locator('input[type="file"]').setInputFiles({
          name: version.originalFileName,
          mimeType: 'application/octet-stream',
          buffer: Buffer.alloc(32),
        });
        await editor.getByRole('button', { name: t('actions.save'), exact: true }).click();
        const confirmation = page.getByRole('dialog', {
          name: t('globalTemplates.replaceTitle'),
          exact: true,
        });
        await confirmation.waitFor();
        assert.match(await confirmation.innerText(), /Directory/);
        assert.equal(mutations.length, 0);
        const overflow = await confirmation.evaluate(
          (element) =>
            element.scrollWidth > element.clientWidth + 1 ||
            document.documentElement.scrollWidth > innerWidth + 1,
        );
        assert.equal(overflow, false);
        await confirmation.screenshot({ path: path.join(output, scenario + '-confirmation.png') });
        await confirmation
          .getByRole('button', { name: t('actions.cancel'), exact: true })
          .last()
          .click();
        await confirmation.waitFor({ state: 'hidden' });
        assert.equal(mutations.length, 0);
        assert.ok((await editor.innerText()).includes(version.originalFileName));
        await editor.getByRole('button', { name: t('actions.save'), exact: true }).click();
        await confirmation
          .getByRole('button', { name: t('globalTemplates.replaceAndPublish'), exact: true })
          .click();
        await editor.waitFor({ state: 'hidden' });
        const detail = page.getByRole('dialog', { name: 'Directory', exact: true });
        await detail.getByRole('tab', { name: t('crystalReports.versions'), exact: true }).click();
        const oldTitle = detail
          .locator('td[data-cell-column="title"]')
          .filter({ hasText: 'Original title' });
        await oldTitle.waitFor();
        assert.ok((await oldTitle.innerText()).includes('1'));
        assert.match(await oldTitle.innerText(), /2026|٢٠٢٦/);
        assert.deepEqual(mutations, [`/api/v1/global-crystal-reports/manage/${id}/replace`]);
        assert.deepEqual(errors, []);
        await detail.screenshot({ path: path.join(output, scenario + '-versions.png') });
        results.push({
          language,
          width,
          warningBeforeMutation: true,
          cancelPreservesSource: true,
          atomicRequests: 1,
          historicalVersionDate: true,
          errors,
        });
      } catch (error) {
        const pages = context.pages();
        if (pages[0]) {
          await pages[0].screenshot({
            path: path.join(output, scenario + '-failure.png'),
            fullPage: true,
          });
          console.log((await pages[0].locator('body').innerText()).slice(-7000));
        }
        throw error;
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}
console.log(
  `Report replacement browser passed ${results.length} isolated EN/AR desktop/mobile cases.`,
);

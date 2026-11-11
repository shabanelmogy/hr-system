import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Production assets are intercepted by default. --existing-dev-assets reads the
// already-running dev server instead. Neither mode starts a server or writes to a live API.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = path.join(root, 'dist/erp-angular/browser');
const origin = 'https://localhost:4210';
const existingDevAssets = process.argv.includes('--existing-dev-assets');
const output = path.join(
  root,
  '../.codex-tmp/report-runtime-review/' +
    (existingDevAssets ? 'designer-dev-browser' : 'designer-browser'),
);
await fs.mkdir(output, { recursive: true });
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const text = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/reporting.json'), 'utf8'),
);
const catalogVersion = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)?.[0];
const artifact = JSON.parse(
  await fs.readFile(
    path.join(
      root,
      '../api/Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Features/Analytics/CrystalReports/managed-crystal-report-contracts.v1.json',
    ),
    'utf8',
  ),
);
const profile = artifact.entities.find((entity) => entity.entityKey === 'countries');
const hash = 'a'.repeat(64);
const source = {
  ...profile,
  sourceKey: 'countries',
  moduleKey: 'reference-data',
  contractSchemaVersion: 1,
  contractFingerprint: hash,
};
const draft = {
  id: 'c6518e27-5e26-4790-932c-80d572099a32',
  entityKey: 'countries',
  reportKey: 'countries-browser',
  displayName: 'Browser draft',
  description: '',
  updatedOn: null,
  currentVersionNumber: null,
  isPublished: false,
  isArchived: false,
  rowVersion: 'AAAAAAAAAAA=',
  versions: [],
  viewName: 'dbo.vw_Countries',
  viewFingerprint: 'b'.repeat(64),
};
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [1213, 390]) {
        const scenario = { language, mode, width };
        const t = (key) => text[language][key];
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1000 },
          reducedMotion: 'reduce',
        });
        const requests = [];
        let reject = true;
        try {
          if (!existingDevAssets)
            await context.route('**/*', async (route) => {
              const url = new URL(route.request().url());
              if (url.origin !== origin) return route.abort();
              const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
              const requested = path.resolve(build, relative);
              if (!requested.startsWith(build + path.sep) && requested !== build)
                return route.abort();
              const file = path.extname(relative) ? requested : path.join(build, 'index.html');
              const mime =
                {
                  '.html': 'text/html',
                  '.js': 'application/javascript',
                  '.css': 'text/css',
                  '.json': 'application/json',
                  '.woff2': 'font/woff2',
                  '.svg': 'image/svg+xml',
                }[path.extname(file)] ?? 'application/octet-stream';
              try {
                await route.fulfill({ body: await fs.readFile(file), contentType: mime });
              } catch {
                await route.fulfill({ status: 404, body: '' });
              }
            });
          await context.addCookies(
            Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
          );
          await context.route('**/api/**', async (route) => {
            const url = new URL(route.request().url());
            let body = [];
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
                    'GlobalCrystalReports:Download',
                    'GlobalCrystalReports:Upload',
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
            else if (url.pathname.endsWith('/manage/design-sources')) body = [source];
            else if (url.pathname.endsWith('/manage/database-views'))
              body = {
                items: [
                  { viewName: 'dbo.vw_Countries', isCompatible: true, rejectionCode: null },
                  { viewName: 'dbo.vw_NotApproved', isCompatible: true, rejectionCode: null },
                  {
                    viewName: 'dbo.vw_Unbound',
                    isCompatible: false,
                    rejectionCode: 'SchemaBindingRequired',
                  },
                ],
                totalCount: 3,
              };
            else if (url.pathname.endsWith('/manage/drafts')) {
              requests.push(route.request().postDataJSON());
              if (reject) {
                reject = false;
                return route.fulfill({
                  status: 400,
                  contentType: 'application/json',
                  body: JSON.stringify({
                    errors: { 'CrystalReport.InvalidView': ['The View is not approved.'] },
                  }),
                });
              }
              body = draft;
            } else if (url.pathname.endsWith('/designer-package'))
              return route.fulfill({ contentType: 'application/zip', body: 'fixture-package' });
            else if (url.pathname.endsWith('/access'))
              body = {
                access: [],
                allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
                canView: true,
                canEdit: false,
                rowVersion: draft.rowVersion,
              };
            else if (url.pathname.endsWith('/' + draft.id)) body = draft;
            else if (url.pathname.endsWith('/manage'))
              body = {
                items: requests.length > 1 ? [draft] : [],
                totalCount: requests.length > 1 ? 1 : 0,
              };
            await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
          });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          page.on('console', (message) => {
            if (
              message.type() === 'error' &&
              !message.text().startsWith('Failed to load resource:')
            )
              errors.push(message.text());
          });
          await page.goto(origin + '/administration/global-crystal-reports');
          await page
            .locator('erp-global-template-manager erp-action-menu-button')
            .getByRole('button', { name: core[language]['actions.buttons'], exact: true })
            .click();
          await page
            .getByRole('menuitem', { name: t('globalTemplates.design.title'), exact: true })
            .click();
          const dialog = page.getByRole('dialog');
          const save = dialog.getByRole('button', {
            name: t('globalTemplates.design.saveDraft'),
            exact: true,
          });
          await save.waitFor({ timeout: 7000 }).catch(async (error) => {
            await page.screenshot({
              path: path.join(output, 'initial-failure.png'),
              fullPage: true,
            });
            console.log(
              JSON.stringify({
                scenario,
                errors,
                content: await dialog.innerText(),
                html: (await dialog.innerHTML()).slice(0, 16000),
              }),
            );
            throw error;
          });
          await save.click();
          await dialog
            .getByText(t('globalTemplates.design.required'), { exact: true })
            .first()
            .waitFor();
          assert.equal(requests.length, 0);
          await dialog
            .getByRole('combobox', { name: t('globalTemplates.design.module'), exact: true })
            .click();
          await page
            .getByRole('option', { name: t('globalTemplates.modules.reference-data'), exact: true })
            .click();
          await dialog
            .getByRole('combobox', { name: t('globalTemplates.design.source'), exact: true })
            .click();
          await page
            .getByRole('option', { name: t('globalTemplates.entities.countries'), exact: true })
            .click();
          await dialog
            .getByRole('combobox', { name: t('globalTemplates.design.viewName'), exact: true })
            .click();
          assert.equal(
            await page
              .getByRole('option')
              .filter({ hasText: 'dbo.vw_Unbound' })
              .getAttribute('aria-disabled'),
            'true',
          );
          await page.getByRole('option').filter({ hasText: 'dbo.vw_NotApproved' }).click();
          await dialog
            .getByRole('textbox', { name: t('crystalReports.displayName'), exact: true })
            .fill('Browser draft');
          await dialog
            .getByRole('textbox', { name: t('crystalReports.reportKey'), exact: true })
            .fill('countries-browser');
          await dialog
            .getByRole('combobox', { name: t('globalTemplates.design.viewName'), exact: true })
            .scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-form.png`),
            fullPage: true,
          });
          assert.equal(await dialog.getByText('CountryId', { exact: true }).count(), 1);
          assert.equal(await dialog.getByText('Language', { exact: true }).count(), 1);
          const footerVisible = await save.evaluate((button) => {
            const bounds = button.getBoundingClientRect();
            const target = document.elementFromPoint(
              bounds.x + bounds.width / 2,
              bounds.y + bounds.height / 2,
            );
            return !!target && button.contains(target);
          });
          assert.equal(footerVisible, true, 'Nested grid must not cover the sticky form action');
          const downloadEvent = page.waitForEvent('download');
          await dialog
            .getByRole('button', { name: t('globalTemplates.design.downloadPackage'), exact: true })
            .click();
          assert.equal((await downloadEvent).suggestedFilename(), 'countries-designer.zip');
          await save.click();
          await dialog
            .locator('erp-reference-field')
            .filter({ hasText: t('globalTemplates.design.viewName') })
            .getByText('The View is not approved.', { exact: true })
            .waitFor();
          await dialog
            .getByRole('combobox', { name: t('globalTemplates.design.viewName'), exact: true })
            .click();
          await page.getByRole('option').filter({ hasText: 'dbo.vw_Countries' }).click();
          await save.click();
          await dialog
            .getByText(t('globalTemplates.design.emptyVersions'), { exact: true })
            .waitFor()
            .catch(async (error) => {
              await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
              console.log(
                JSON.stringify({
                  scenario,
                  requests,
                  errors,
                  content: await page.locator('body').innerText(),
                }),
              );
              throw error;
            });
          assert.equal(requests.length, 2);
          assert.equal(requests[1].viewName, 'dbo.vw_Countries');
          assert.equal(requests[1].sourceKey, 'countries');
          assert.equal(requests[1].moduleKey, 'reference-data');
          assert.equal(requests[1].contractFingerprint, hash);
          assert.equal(Object.hasOwn(requests[1], 'connectionString'), false);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          );
          assert.equal(overflow, false, JSON.stringify(scenario));
          assert.deepEqual(errors, []);
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-draft.png`),
            fullPage: true,
          });
          results.push({
            ...scenario,
            passed: true,
            posts: requests.length,
            noApplicationServerStarted: true,
          });
        } finally {
          await context.close();
        }
      }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
console.log(`Designer preparation browser checks passed: ${results.length} cases.`);

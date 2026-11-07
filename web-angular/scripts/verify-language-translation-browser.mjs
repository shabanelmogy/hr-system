import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const build = path.join(root, 'dist/erp-angular/browser');
const origin = 'https://localhost:4210';
const output = path.resolve(
  root,
  '../documentation/modules/platform/features/angular-super-admin-settings/verification/language-translation',
);
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const auth = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/platform-auth.json'), 'utf8'),
);
const catalogVersion = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)[0];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 900, 1440]) {
        const height = width === 900 ? 640 : 844;
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({
            name,
            value,
            url: origin,
          })),
        );
        const errors = [],
          queries = [],
          writes = [];
        let revision = 3,
          failList = false,
          conflict = false,
          readOnly = false;
        const rows = Array.from({ length: 33 }, (_, i) => ({
          key: 'countries.code.' + String(i).padStart(2, '0'),
          baseValue: 'Code {{code}} ' + i,
          targetValue: 'رمز {{code}} ' + i,
          shippedValue: 'الأصل {{code}} ' + i,
          isCustomized: true,
        }));
        await context.route('**/*', async (route) => {
          const url = new URL(route.request().url());
          if (url.origin !== origin) return route.abort();
          const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
          const requested = path.resolve(build, relative);
          if (requested !== build && !requested.startsWith(build + path.sep)) return route.abort();
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
        await context.route('**/api/**', async (route) => {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          let body = {},
            status = 200;
          if (/\/(session|refresh)$/.test(endpoint))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [
                  'SystemUiTexts:View',
                  ...(readOnly ? [] : ['SystemUiTexts:Edit', 'SystemUiTexts:Reset']),
                ],
              },
            };
          else if (endpoint.endsWith('/csrf'))
            body = { requestToken: 'synthetic-translation-csrf' };
          else if (endpoint.endsWith('/runtime'))
            body = { revision, catalogVersion, overrides: [] };
          else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint.endsWith('/realtime-token')) status = 403;
          else if (endpoint.endsWith('/system-ui-localizations/settings'))
            body = {
              revision,
              languages: ['en', 'ar'],
              catalogVersions: { web: catalogVersion },
              sources: [
                { id: 'reference-countries', client: 'web', namespace: 'reference-countries' },
                { id: 'mobile-core', client: 'mobile', namespace: 'core' },
              ],
            };
          else if (endpoint.endsWith('/system-ui-localizations/texts')) {
            if (failList) {
              status = 503;
              body = {};
            } else {
              const query = Object.fromEntries(url.searchParams);
              queries.push(query);
              assert.ok(['reference-countries', 'mobile-core'].includes(query.source));
              const page = Number(query.page),
                pageSize = Number(query.pageSize);
              const filtered = rows.filter(
                (row) => !query.search || row.key.includes(query.search),
              );
              body = {
                revision,
                catalogVersion,
                totalCount: filtered.length,
                page,
                pageSize,
                items: filtered.slice((page - 1) * pageSize, page * pageSize),
              };
            }
          } else if (
            endpoint.endsWith('/system-ui-localizations/text') ||
            endpoint.endsWith('/system-ui-localizations/reset')
          ) {
            const data = request.postDataJSON();
            writes.push({ path: endpoint, method: request.method(), data });
            assert.equal(request.headers()['x-erp-xsrf'], 'synthetic-translation-csrf');
            assert.equal(data.expectedRevision, revision);
            if (conflict) {
              status = 409;
              body = {};
            } else {
              const row = rows.find((row) => row.key === data.key);
              assert.ok(row);
              row.targetValue = data.value ?? row.shippedValue;
              row.isCustomized = !!data.value;
              revision++;
              status = 204;
            }
          } else {
            errors.push('Unexpected API: ' + endpoint);
            return route.abort();
          }
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: status === 204 ? '' : JSON.stringify(body),
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(origin + '/super-admin/ui-texts');
        await expect(page).toHaveURL(origin + '/administration/language-translation');
        const sidebar = page.locator('erp-navigation-list').first();
        const drawerToggle = page.locator('erp-application-frame .drawer-toggle button');
        if ((await drawerToggle.getAttribute('aria-expanded')) !== 'true')
          await drawerToggle.click();
        await sidebar
          .getByRole('button', { name: core[language]['menu.administration'], exact: true })
          .click();
        await expect(
          sidebar.getByRole('button', { name: core[language]['menu.settings'], exact: true }),
        ).toHaveCount(1);
        if (width < 900) await page.keyboard.press('Escape');
        else await drawerToggle.click();
        const owner = page.locator('erp-language-translation-page'),
          grid = owner.locator('erp-data-table');
        const text = (key) => auth[language]['companyLocalizations.' + key];
        await expect(grid.locator('[data-collection-row]')).toHaveCount(25);
        assert.equal(queries[0].source, 'reference-countries');
        assert.equal(queries[0].baseLanguage, 'en');
        assert.equal(queries[0].targetLanguage, 'ar');
        const choose = async (label, option) => {
          await owner.getByRole('combobox', { name: label, exact: true }).click();
          await page.getByRole('option', { name: option, exact: true }).click();
        };
        await choose(text('source'), text('mobile') + ' · core');
        await expect.poll(() => queries.at(-1).source).toBe('mobile-core');
        await choose(text('source'), text('web') + ' · reference-countries');
        await expect.poll(() => queries.at(-1).source).toBe('reference-countries');
        await choose(text('baseLanguage'), text('arabic'));
        await expect.poll(() => queries.at(-1).baseLanguage).toBe('ar');
        await choose(text('targetLanguage'), text('english'));
        await expect.poll(() => queries.at(-1).targetLanguage).toBe('en');
        await choose(text('status'), text('customized'));
        await expect.poll(() => queries.at(-1).status).toBe('customized');
        await choose(text('baseLanguage'), text('english'));
        await choose(text('targetLanguage'), text('arabic'));
        await choose(text('status'), text('all'));
        await choose(core[language]['pagination.rowsPerPage'], '10');
        await expect(grid.locator('[data-collection-row]')).toHaveCount(10);
        assert.equal(queries.at(-1).pageSize, '10');
        await choose(core[language]['pagination.rowsPerPage'], '25');
        await expect(grid.locator('[data-collection-row]')).toHaveCount(25);
        await grid
          .getByRole('button', { name: core[language]['pagination.goToLastRecord'], exact: true })
          .click();
        await expect(grid.locator('[data-collection-row]')).toHaveCount(8);
        assert.equal(queries.at(-1).page, '2');
        const search = grid.locator('erp-collection-frame erp-text-field input').first();
        await search.fill('code.00');
        await expect(grid.locator('[data-collection-row]')).toHaveCount(1);
        assert.equal(queries.at(-1).search, 'code.00');
        assert.equal(queries.at(-1).page, '1');
        const row = grid.locator('[data-collection-row]').first();
        await row.getByRole('button', { name: text('edit'), exact: true }).click();
        let dialog = page.getByRole('dialog').filter({ has: page.locator('erp-form') });
        const input = dialog.getByRole('textbox', { name: text('value'), exact: true });
        await input.fill(' ');
        await dialog
          .getByRole('button', { name: core[language]['actions.save'], exact: true })
          .click();
        await expect(dialog.locator('erp-text-field .error')).toBeVisible();
        assert.equal(writes.length, 0);
        await input.fill('تعديل {{code}}');
        await dialog
          .getByRole('button', { name: core[language]['actions.save'], exact: true })
          .click();
        await expect(dialog).toHaveCount(0);
        await expect(row.locator('[data-cell-column=targetValue]')).toHaveText('تعديل {{code}}');
        assert.equal(writes.length, 1);
        await row.getByRole('button', { name: text('reset'), exact: true }).click();
        const confirm = page
          .getByRole('dialog')
          .filter({ hasText: auth[language]['systemUiTexts.resetTitle'] });
        await confirm.getByRole('button', { name: text('reset'), exact: true }).click();
        await expect(confirm).toHaveCount(0);
        await expect(row.locator('[data-cell-column=targetValue]')).toHaveText('الأصل {{code}} 0');
        conflict = true;
        await row.getByRole('button', { name: text('edit'), exact: true }).click();
        dialog = page.getByRole('dialog').filter({ has: page.locator('erp-form') });
        await dialog
          .getByRole('textbox', { name: text('value'), exact: true })
          .fill('تعارض {{code}}');
        await dialog
          .getByRole('button', { name: core[language]['actions.save'], exact: true })
          .click();
        await expect(dialog).toContainText(text('saveFailed'));
        assert.equal(writes.length, 3);
        await dialog
          .getByRole('button', { name: core[language]['actions.cancel'], exact: true })
          .click();
        const discard = page
          .getByRole('dialog')
          .filter({ hasText: core[language]['messages.unsavedChangesTitle'] });
        await discard
          .getByRole('button', { name: core[language]['messages.discardChanges'], exact: true })
          .click();
        await expect(dialog).toHaveCount(0);
        conflict = false;
        failList = true;
        await owner
          .locator('erp-page-header')
          .getByRole('button', { name: text('reload'), exact: true })
          .click();
        await expect(grid.locator('erp-collection-feedback')).toContainText(
          core[language]['common.error'],
        );
        failList = false;
        await grid.locator('erp-collection-feedback button').click();
        await expect(grid.locator('[data-collection-row]')).toHaveCount(1);
        const geometry = await page.evaluate(() => ({
          x: document.documentElement.scrollWidth - innerWidth,
          y: document.documentElement.scrollHeight - innerHeight,
        }));
        assert.ok(geometry.x <= 1 && geometry.y <= 1, JSON.stringify(geometry));
        await expect(page.locator('.p-toast-message')).toHaveCount(0, { timeout: 10000 });
        if (width === 390 && mode === 'light')
          await page.screenshot({ path: path.join(output, language + '-390.png') });
        readOnly = true;
        await page.reload();
        await expect(grid.locator('[data-collection-row]')).toHaveCount(25);
        await expect(
          grid
            .locator('[data-collection-row]')
            .first()
            .getByRole('button', { name: text('edit'), exact: true }),
        ).toBeDisabled();
        assert.deepEqual(errors, []);
        results.push({
          language,
          mode,
          width,
          height,
          geometry,
          sourceDiscovery: true,
          serverSearchPaging: true,
          validation: true,
          saveReset: true,
          conflict: true,
          failureRetry: true,
          permissionReadOnly: true,
          canonicalDeepLink: true,
          singleSettingsEntry: true,
        });
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
  await fs.writeFile(
    path.join(output, 'results.json'),
    JSON.stringify({ date: new Date().toISOString(), fixtureOnly: true, cases: results }, null, 2),
  );
} finally {
  await browser.close();
}

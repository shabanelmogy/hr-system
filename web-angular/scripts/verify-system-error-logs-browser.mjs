import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { utils, write } from 'xlsx';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-system-error-logs');
const resources = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${name}.json`), 'utf8'));
const captions = resources('platform-advanced-tools'),
  core = resources('core');
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const entries = Array.from({ length: 31 }, (_, index) => ({
  id: `2b92450e-c383-feee-339f-${String(index + 1).padStart(12, '0')}`,
  occurredOnUtc: '2026-11-06T10:25:40.000Z',
  source: index % 2 ? 'web' : 'api',
  severity: index % 2 ? 'warning' : 'error',
  userName: 'fixture-user',
  service: 'FixtureService',
  action: 'ReadFixture',
  statusCode: 500,
  durationMs: 142,
  correlationId: 'fixture-correlation',
  summary: 'Synthetic error ' + (index + 1) + '\n<script>never executed</script>',
  client: 'Fixture client',
  browser: 'Fixture browser',
  ipAddress: '192.0.2.1',
}));
const book = utils.book_new();
utils.book_append_sheet(book, utils.json_to_sheet(entries), 'Errors');
const xlsx = Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx' }));
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
const smoke = process.argv.includes('--smoke');
try {
  for (const language of smoke ? ['en'] : ['en', 'ar'])
    for (const mode of smoke ? ['light'] : ['light', 'dark'])
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
          acceptDownloads: true,
          permissions: ['clipboard-read', 'clipboard-write'],
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const errors = [],
          queries = [],
          exports = [],
          details = [];
        await context.route('**/api/**', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            assert.equal(url.origin, api);
            assert.equal(request.method(), 'GET');
            let body,
              status = 200;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: [
                    'SystemErrorLogs:View',
                    'SystemErrorLogs:ViewDetails',
                    'SystemErrorLogs:Export',
                    'ErrorLogSettings:View',
                  ],
                },
              };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'error-log-fixture' };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/system-error-logs/export')) {
              exports.push(Object.fromEntries(url.searchParams));
              await route.fulfill({
                status: 200,
                body: xlsx,
                headers: {
                  'content-type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'content-disposition':
                    "attachment; filename=system-error-logs.xlsx; filename*=UTF-8''system-error-logs.xlsx",
                },
              });
              return;
            } else if (endpoint.endsWith('/system-error-logs')) {
              const query = Object.fromEntries(url.searchParams),
                page = Number(query.page),
                pageSize = Number(query.pageSize);
              queries.push(query);
              assert.deepEqual(
                Object.keys(query).filter((key) => /sort|filter/i.test(key)),
                [],
              );
              const filtered = query.search
                ? entries.filter((row) => row.summary.includes(query.search))
                : entries;
              body = {
                items: filtered.slice((page - 1) * pageSize, page * pageSize),
                totalCount: filtered.length,
                page,
                pageSize,
              };
            } else if (endpoint.includes('/system-error-logs/')) {
              const id = endpoint.split('/').at(-1),
                entry = entries.find((row) => row.id === id);
              assert.ok(entry);
              details.push(id);
              body = {
                entry,
                diagnostics: Array.from(
                  { length: 80 },
                  (_, index) => `at Fixture.Method${index} <raw>& value`,
                ),
              };
            } else throw Error('Unexpected endpoint ' + endpoint);
            await route.fulfill({
              status,
              contentType: 'application/json',
              body: JSON.stringify(body),
            });
          } catch (error) {
            errors.push(String(error));
            await route.abort();
          }
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('dialog', async (dialog) => {
          errors.push('Native dialog');
          await dialog.dismiss();
        });
        const t = (key) => captions[language]['errorLogs.' + key];
        await page.goto(origin + '/super-admin/error-logs');
        const owner = page.locator('erp-system-error-logs-page');
        const grid = owner.locator('erp-data-table');
        await expect(owner.getByTestId('system-error-logs')).toHaveAttribute('data-kind', 'ready', {
          timeout: 20000,
        });
        await expect(grid.locator('tbody [data-collection-row]')).toHaveCount(25);
        const debuggerOutput = page.locator('erp-viewport-debugger output');
        await expect(debuggerOutput).toContainText(`${width} × 1050`);
        await page.setViewportSize({ width: width + 1, height: 1050 });
        await expect(debuggerOutput).toContainText(`${width + 1} × 1050`);
        await page.setViewportSize({ width, height: 1050 });
        await expect(debuggerOutput).toContainText(`${width} × 1050`);
        const gridGeometry = await grid.evaluate((element) => ({
          width: element.getBoundingClientRect().width,
          availableWidth: element.parentElement.getBoundingClientRect().width,
          flex: getComputedStyle(element).flex,
          parentFlex: getComputedStyle(element.parentElement).flex,
        }));
        assert.ok(
          Math.abs(gridGeometry.width - gridGeometry.availableWidth) <= 1,
          `Grid must fill the collection workspace: ${JSON.stringify(gridGeometry)}`,
        );
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-grid.png`),
          fullPage: false,
        });
        assert.equal(details.length, 0);
        await expect(grid.locator('p-checkbox')).toHaveCount(0);
        await expect(grid.locator('p-column-filter')).toHaveCount(12);
        await expect(grid.locator('.collection-toolbar')).toHaveCount(0);
        await page.locator('.drawer-toggle button').click();
        const sidebar =
          width >= 900 ? page.locator('.workspace-sidebar') : page.locator('.p-drawer');
        await sidebar
          .getByRole('button', { name: core[language]['menu.administration'], exact: true })
          .click();
        const administration = sidebar.getByRole('navigation', {
          name: core[language]['menu.administration'],
          exact: true,
        });
        await expect(
          administration.getByRole('button', {
            name: core[language]['menu.systemErrorLogs'],
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          administration.getByRole('button', {
            name: captions[language]['errorLogSettings.title'],
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          administration.getByRole('button', {
            name: core[language]['menu.globalGeography'],
            exact: true,
          }),
        ).toHaveCount(0);
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-navigation.png`),
          fullPage: false,
        });
        if (width < 900) {
          await administration
            .getByRole('button', { name: core[language]['menu.systemErrorLogs'], exact: true })
            .click();
          await expect(sidebar).toHaveCount(0);
        } else await page.locator('.drawer-toggle button').click();
        await owner.locator('erp-page-header .filter button').click();
        await expect(grid.locator('erp-error-log-criteria')).toBeVisible();
        const search = grid.getByPlaceholder(t('search'));
        await search.fill('Synthetic error 2');
        await expect.poll(() => queries.at(-1)?.search).toBe('Synthetic error 2');
        await expect(grid.locator('tbody [data-collection-row]')).toHaveCount(11);
        await grid
          .locator('tbody [data-collection-row]')
          .first()
          .getByRole('button', { name: t('view'), exact: true })
          .click();
        const detailDialog = page
          .getByRole('dialog')
          .filter({ has: page.locator('erp-copy-button') });
        await expect(detailDialog.locator('erp-text-panel').first()).toBeVisible();
        await expect(detailDialog).toContainText('fixture-correlation');
        await expect(detailDialog).toContainText('Fixture browser');
        await expect(detailDialog.locator('script')).toHaveCount(0);
        const diagnostics = detailDialog.locator('erp-text-panel').last();
        const geometry = await diagnostics.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          viewport: innerHeight,
          text: element.querySelector('pre')?.textContent,
          direction: element.querySelector('pre')?.getAttribute('dir'),
        }));
        assert.equal(geometry.direction, 'ltr');
        assert.ok(geometry.height <= geometry.viewport * 0.45 + 2, JSON.stringify(geometry));
        await detailDialog.getByRole('button', { name: t('copyMessage'), exact: true }).click();
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        assert.ok(
          copied.includes('fixture-correlation') &&
            copied.includes('Fixture browser') &&
            copied.includes('Fixture.Method79'),
          copied,
        );
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-detail.png`),
          fullPage: false,
        });
        await detailDialog
          .getByRole('button', { name: core[language]['actions.close'], exact: true })
          .last()
          .click();
        await expect(detailDialog).toHaveCount(0);
        let downloaded;
        try {
          [downloaded] = await Promise.all([
            page.waitForEvent('download'),
            owner
              .locator('erp-page-header')
              .getByRole('button', { name: t('export'), exact: true })
              .click(),
          ]);
        } catch (error) {
          console.log(
            JSON.stringify({
              errors,
              exports,
              queries,
              body: (await page.locator('body').innerText()).slice(-2500),
            }),
          );
          throw error;
        }
        assert.equal(downloaded.suggestedFilename(), 'error-logs.xlsx');
        assert.equal(exports.at(-1)?.search, 'Synthetic error 2');
        await expect(page.getByText(t('exported'), { exact: true })).toBeVisible();
        await owner.locator('erp-page-header [data-view=cards] button').click();
        await expect(owner.locator('erp-card-list')).toBeVisible();
        await expect(owner.locator('erp-card-list erp-error-log-criteria')).toBeVisible();
        await page.reload();
        await expect(owner.locator('erp-card-list')).toBeVisible();
        await expect(owner.locator('erp-card-list erp-surface-card').first()).toBeVisible();
        const cardsGeometry = await owner.locator('erp-card-list').evaluate((element) => ({
          width: element.getBoundingClientRect().width,
          availableWidth: element.parentElement.getBoundingClientRect().width,
          columns: getComputedStyle(element.querySelector('.cards')).gridTemplateColumns.split(' ')
            .length,
        }));
        assert.ok(
          Math.abs(cardsGeometry.width - cardsGeometry.availableWidth) <= 1,
          JSON.stringify(cardsGeometry),
        );
        assert.equal(cardsGeometry.columns, width === 390 ? 1 : 4);
        const pageGeometry = await page.evaluate(() => ({
          vertical: document.documentElement.scrollHeight - innerHeight,
          horizontal: document.documentElement.scrollWidth - innerWidth,
        }));
        assert.ok(
          pageGeometry.vertical <= 1 && pageGeometry.horizontal <= 1,
          JSON.stringify(pageGeometry),
        );
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}-cards.png`),
          fullPage: false,
        });
        assert.deepEqual(errors, []);
        results.push({
          language,
          mode,
          width,
          passed: true,
          gridGeometry,
          details: details.length,
          exports: exports.length,
          queries: queries.length,
          geometry: pageGeometry,
          hostedWrites: 0,
        });
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2),
  );
} finally {
  await browser.close();
}

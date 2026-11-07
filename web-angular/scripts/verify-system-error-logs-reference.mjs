import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.NEXT_REFERENCE_ORIGIN ?? 'http://localhost:3100';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const output = path.resolve(root, '../.codex-tmp/angular-system-error-logs/reference');
const readResources = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, `src/locales/generated/${name}.json`), 'utf8'));
const advanced = readResources('platform-advanced-tools');
const core = readResources('core');
const smoke = process.argv.includes('--smoke');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
fs.mkdirSync(output, { recursive: true });
try {
  for (const language of smoke ? ['en'] : ['en', 'ar']) {
    for (const mode of smoke ? ['light'] : ['light', 'dark']) {
      for (const width of smoke ? [1440] : [390, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
          acceptDownloads: true,
          permissions: ['clipboard-read', 'clipboard-write'],
          timezoneId: 'Africa/Cairo',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const login = await context.request.post(origin + '/api/v1/auth/login', {
          headers: { origin },
          data: { username: 'superadmin', password: 'P@ssword123' },
        });
        assert.equal(login.status(), 200);
        const page = await context.newPage();
        const errors = [],
          queries = [],
          writes = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => {
          const url = new URL(request.url());
          if (!url.pathname.includes('/api/v1/system-error-logs')) return;
          if (request.method() !== 'GET') writes.push(request.method());
          if (url.pathname.endsWith('/system-error-logs'))
            queries.push(Object.fromEntries(url.searchParams));
        });
        const t = (key) => advanced[language]['errorLogs.' + key];
        const s = (key) => advanced[language]['errorLogSettings.' + key];
        const capture = (suffix) =>
          page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-${suffix}.png`),
            fullPage: false,
          });
        try {
          await page.goto(origin + '/super-admin/error-logs', {
            waitUntil: 'commit',
            timeout: 120000,
          });
          await expect(page.getByRole('grid')).toBeVisible({ timeout: 120000 });
          await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', {
            timeout: 30000,
          });
          await expect(page.locator('html')).toHaveAttribute('lang', language);
          await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
          assert.equal(queries[0].pageSize, '25');
          assert.equal(queries[0].page, '1');
          await expect(page.getByRole('grid').getByRole('checkbox')).toHaveCount(0);
          await expect(page.getByPlaceholder(t('search'))).toHaveCount(0);
          await capture('grid');
          await page
            .getByRole('button', { name: core[language]['pagination.goToLastRecord'], exact: true })
            .click();
          await expect.poll(() => queries.at(-1)?.page).toBe('2');
          await page
            .getByRole('button', {
              name: core[language]['pagination.goToFirstRecord'],
              exact: true,
            })
            .click();
          await page
            .getByRole('button', { name: core[language]['navigation.filter'], exact: true })
            .click();
          await expect(page.getByPlaceholder(t('search'))).toBeVisible();
          await expect(
            page.getByRole('combobox', { name: t('source'), exact: true }),
          ).toBeVisible();
          const columns = new Set();
          for (const fraction of [0, 0.5, 1]) {
            await page.locator('.MuiDataGrid-virtualScroller').evaluate(
              async (element, { fraction, language }) => {
                element.scrollLeft =
                  (element.scrollWidth - element.clientWidth) *
                  fraction *
                  (language === 'ar' ? -1 : 1);
                await new Promise((resolve) => setTimeout(resolve, 100));
              },
              { fraction, language },
            );
            for (const field of await page
              .locator('[role=columnheader][data-field]')
              .evaluateAll((elements) =>
                elements.map((element) => element.getAttribute('data-field')),
              ))
              columns.add(field);
          }
          assert.equal(columns.size, 13);
          await page
            .getByRole('button', { name: t('view'), exact: true })
            .first()
            .click();
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          const diagnostics = dialog
            .locator('pre[aria-label]')
            .filter({ hasText: 'Erp.OrdersController.GetOrder' });
          await expect(diagnostics).toHaveAttribute('dir', 'ltr');
          await expect(diagnostics).toContainText('Erp.OrdersController.GetOrder');
          await dialog.getByRole('button', { name: t('copyMessage'), exact: true }).click();
          assert.ok(
            (await page.evaluate(() => navigator.clipboard.readText())).includes(
              'Erp.OrdersController.GetOrder',
            ),
          );
          await capture('detail');
          await dialog
            .getByRole('button', { name: core[language]['actions.close'], exact: true })
            .last()
            .click();
          await expect(dialog).toHaveCount(0);
          await page
            .getByRole('button', { name: core[language]['actions.export'], exact: true })
            .click();
          const download = page.waitForEvent('download');
          await page.getByRole('menuitem', { name: t('export'), exact: true }).click();
          assert.equal((await download).suggestedFilename(), 'error-logs.xlsx');
          await expect(page.getByText(t('exported'), { exact: true })).toBeVisible();
          await page
            .getByRole('button', { name: core[language]['views.cards'], exact: true })
            .click();
          await expect(page.getByRole('grid')).toHaveCount(0);
          await expect(
            page.getByRole('button', { name: t('view'), exact: true }).first(),
          ).toBeVisible();
          await capture('cards');
          await page.goto(origin + '/super-admin/error-log-settings', { waitUntil: 'commit' });
          await expect(page.getByRole('heading', { name: s('title'), exact: true })).toBeVisible({
            timeout: 60000,
          });
          await expect(page).toHaveURL(/\/super-admin\/error-log-settings$/);
          await capture('settings');
          await page.getByRole('button', { name: s('edit'), exact: true }).click();
          const editor = page.getByRole('dialog');
          const days = editor.getByRole('spinbutton', { name: s('retentionDays'), exact: true });
          await days.fill('0');
          await editor.getByRole('button', { name: s('save'), exact: true }).click();
          await expect(editor.getByText(s('range'), { exact: true })).toBeVisible();
          await capture('editor');
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          const geometry = await page.evaluate(() => ({
            horizontal: document.documentElement.scrollWidth - innerWidth,
          }));
          assert.ok(geometry.horizontal <= 1, JSON.stringify(geometry));
          results.push({
            language,
            mode,
            width,
            passed: true,
            columns: [...columns],
            listRequests: queries.length,
            businessWrites: 0,
            settingsRoute: '/super-admin/error-log-settings',
            geometry,
          });
          console.log(JSON.stringify(results.at(-1)));
        } catch (error) {
          await capture('failure').catch(() => {});
          console.log(JSON.stringify({ language, mode, width, errors, queries, url: page.url() }));
          throw error;
        } finally {
          await context.close();
        }
      }
    }
  }
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2),
  );
} finally {
  await browser.close();
}

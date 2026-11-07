import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { adminFixture } from '../src/app/platform/tenant-admins/tenant-admin.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.NEXT_REFERENCE_ORIGIN ?? 'http://localhost:3100';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const output = path.resolve(root, '../.codex-tmp/angular-tenant-admins/reference');
fs.mkdirSync(output, { recursive: true });
const resources = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/platform-tenants.json'), 'utf8'),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
        });
        const errors = [],
          writes = [];
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
        const rows = [
          adminFixture,
          { ...adminFixture, id: 'disabled', firstName: 'Disabled', isDisabled: true },
          { ...adminFixture, id: 'locked', firstName: 'Locked', isLocked: true },
        ];
        await context.route(origin + '/api/v1/tenantAdmins/**', async (route) => {
          const request = route.request();
          if (request.method() !== 'GET') {
            writes.push(request.method());
            return route.abort();
          }
          const endpoint = new URL(request.url()).pathname;
          return route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(endpoint.endsWith('/getAll') ? rows : rows[0]),
          });
        });
        await context.route(origin + '/api/v1/tenants/getAll', (route) =>
          route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify([
              { ...tenantFixture, id: 't', name: 'Alpha', identifier: 'alpha' },
            ]),
          }),
        );
        const page = await context.newPage();
        page.setDefaultNavigationTimeout(120000);
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(origin + '/super-admin/tenant-admins', { waitUntil: 'commit' });
          const caption = (key) => resources[language]['tenantAdmins.' + key];
          await expect(page.getByRole('button', { name: caption('add'), exact: true })).toBeVisible(
            { timeout: 120000 },
          );
          await expect(page.locator('.MuiCard-root')).toHaveCount(3);
          await expect(page.locator('html')).toHaveAttribute('lang', language);
          await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
          await expect(page.locator('html')).toHaveAttribute('data-app-ready', 'true', {
            timeout: 30000,
          });
          for (const key of ['active', 'disabled', 'locked', 'default'])
            await expect(page.locator('main')).toContainText(caption(key));
          const cards = await page.locator('.MuiCard-root').evaluateAll((elements) =>
            elements.map((element) => {
              const { top, width } = element.getBoundingClientRect();
              return { top, width };
            }),
          );
          if (width === 1440) {
            assert.ok(cards.every((card) => Math.abs(card.top - cards[0].top) <= 1));
            assert.ok(cards[0].width >= 320);
          }
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-cards.png`),
            fullPage: true,
          });
          await page.getByRole('button', { name: caption('add'), exact: true }).click();
          const dialog = page.getByRole('dialog', { name: caption('add'), exact: false });
          for (const key of ['firstName', 'lastName', 'userName', 'email', 'password'])
            await expect(
              dialog.getByRole('textbox', { name: caption(key), exact: false }),
            ).toBeVisible();
          await expect(
            dialog.getByRole('combobox', { name: caption('tenants'), exact: false }),
          ).toBeVisible();
          await expect(
            dialog.getByRole('combobox', { name: caption('defaultTenant'), exact: false }),
          ).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-editor.png`),
            fullPage: true,
          });
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          results.push({ language, mode, width, passed: true, cards, businessWrites: 0 });
          console.log(`Tenant Admins Next reference passed ${language}/${mode}/${width}`);
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => {});
          throw error;
        } finally {
          await context.close();
        }
      }
} finally {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}

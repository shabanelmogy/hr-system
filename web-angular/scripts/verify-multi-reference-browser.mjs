import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';
import { serveAngularFixtureBuild } from './angular-build-browser-fixture.mjs';

const root = path.resolve(import.meta.dirname, '..');
const origin = 'https://localhost:4210';
const output = path.resolve(root, '../.codex-tmp/multi-reference-browser');
const captions = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/platform-tenants.json'), 'utf8'),
);
const version = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)[0];
const smoke = process.argv.includes('--smoke');
const sizes = smoke
  ? [[1440, 900]]
  : [
      [390, 844],
      [900, 640],
      [1440, 900],
      [844, 390],
    ];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of smoke ? ['en'] : ['en', 'ar']) {
    for (const mode of smoke ? ['light'] : ['light', 'dark']) {
      for (const [width, height] of sizes) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height },
          reducedMotion: 'reduce',
        });
        const errors = [];
        let writes = 0;
        await serveAngularFixtureBuild(context, root, origin);
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const names =
          language === 'en'
            ? ['ERP Demo', 'NewTenant', 'Shaban', 'International trading and distribution group']
            : ['النظام التجريبي', 'مستأجر جديد', 'شعبان', 'المجموعة الدولية للتجارة والتوزيع'];
        const tenants = names.map((name, index) => ({
          ...tenantFixture,
          id: `tenant-${index}`,
          name,
          identifier: `tenant${index}`,
        }));
        await context.route('**/api/**', async (route) => {
          const request = route.request();
          const endpoint = new URL(request.url()).pathname;
          let body;
          let status = 200;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh')) {
            body = {
              isAuthenticated: true,
              user: { ...sessionFixture, roles: ['super_admin'], tenantReadOnly: false },
            };
          } else if (endpoint.endsWith('/runtime')) {
            body = { catalogVersion: version, revision: 0, overrides: [] };
          } else if (endpoint.endsWith('/csrf')) {
            body = { requestToken: 'multi-reference-fixture' };
          } else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/modules/accessible')) {
            body = [];
          } else if (endpoint.endsWith('/tenants/getAll')) {
            body = tenants;
          } else if (endpoint.endsWith('/tenantAdmins/getAll')) {
            body = [];
          } else {
            writes += request.method() === 'GET' ? 0 : 1;
            errors.push(`Unexpected request: ${request.method()} ${endpoint}`);
            return route.abort();
          }
          return route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(body),
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(origin + '/super-admin/tenant-admins');
          await expect(page.locator('[data-testid=tenant-admins]')).toHaveAttribute(
            'data-kind',
            'ready',
          );
          const add = captions[language]['tenantAdmins.add'];
          await page
            .locator('erp-page-header')
            .getByRole('button', { name: add, exact: true })
            .click();
          const editor = page.getByRole('dialog', { name: add, exact: true });
          for (const [key, value] of Object.entries({
            firstName: 'Browser',
            lastName: 'Admin',
            userName: 'browser-admin',
            email: 'browser@example.test',
            password: 'Example123',
          })) {
            await editor
              .getByRole('textbox', {
                name: captions[language]['tenantAdmins.' + key],
                exact: false,
              })
              .fill(value);
          }
          const form = editor.locator('form');
          await form.evaluate((element) => {
            element.dataset.submitted = 'false';
            element.addEventListener('submit', () => {
              element.dataset.submitted = 'true';
            });
          });
          const field = editor.locator('erp-multi-reference-field');
          const combobox = field.getByRole('combobox');
          await combobox.press('ArrowDown');
          const overlay = page.locator('.erp-multi-reference-overlay');
          const closePopup = async () => {
            // Selecting the first membership can scroll a short dialog and close
            // its body overlay. Only send Escape while that popup is still open.
            await combobox.evaluate((input) => {
              if (input.getAttribute('aria-expanded') === 'true') {
                input.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 'Escape',
                    code: 'Escape',
                    bubbles: true,
                    cancelable: true,
                  }),
                );
              }
            });
            await expect(overlay).toHaveCount(0);
          };
          await expect(overlay).toBeVisible();
          await expect(overlay.getByRole('option')).toHaveCount(4);
          const geometry = await overlay.evaluate((element) => {
            const filter = element.querySelector('[role=searchbox]');
            const icon = element.querySelector('.p-inputicon');
            const inputBox = filter.getBoundingClientRect();
            const iconBox = icon.getBoundingClientRect();
            return {
              iconInside:
                iconBox.left >= inputBox.left &&
                iconBox.right <= inputBox.right &&
                iconBox.top >= inputBox.top &&
                iconBox.bottom <= inputBox.bottom,
              rows: [...element.querySelectorAll('[role=option]')].map((option) => {
                const css = getComputedStyle(option);
                return {
                  height: option.getBoundingClientRect().height,
                  padding: parseFloat(css.paddingInlineStart),
                  gap: parseFloat(css.gap),
                };
              }),
            };
          });
          assert.ok(geometry.iconInside, 'The search icon must remain inside its input');
          assert.ok(
            geometry.rows.every((row) => row.height >= 40 && row.padding >= 10 && row.gap >= 8),
          );
          const search = overlay.getByRole('searchbox');
          await search.fill(names[1]);
          await expect(overlay.getByRole('option')).toHaveCount(1);
          await search.fill('');
          await expect(overlay.getByRole('option')).toHaveCount(4);
          await closePopup();
          for (const name of names) {
            await combobox.scrollIntoViewIfNeeded();
            await combobox.press('ArrowDown');
            await expect(overlay).toBeVisible();
            await overlay.getByRole('option', { name: new RegExp('^' + name) }).click();
            await closePopup();
          }
          await expect(field.locator('.p-multiselect-chip')).toHaveCount(4);
          const badges = await field.evaluate((element) => {
            const box = element.getBoundingClientRect();
            return [...element.querySelectorAll('.p-multiselect-chip')].map((chip) => {
              const bounds = chip.getBoundingClientRect();
              return {
                inside: bounds.left >= box.left && bounds.right <= box.right,
                height: bounds.height,
              };
            });
          });
          assert.ok(badges.every((badge) => badge.inside && badge.height > 20));
          await field.locator('.p-chip-remove-icon').first().press('Enter');
          await expect(field.locator('.p-multiselect-chip')).toHaveCount(3);
          await expect(form).toHaveAttribute('data-submitted', 'false');
          await combobox.press('ArrowDown');
          await expect(overlay).toBeVisible();
          await expect(overlay.getByRole('option').first()).toHaveAttribute(
            'aria-selected',
            'false',
          );
          await expect(overlay.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true');
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}.png`),
            fullPage: true,
          });
          assert.equal(writes, 0);
          assert.deepEqual(errors, []);
          results.push({ language, mode, width, height, geometry, badges, passed: true, writes });
          console.log(
            `MultiReference badges and popup passed: ${language}/${mode}/${width}x${height}`,
          );
        } catch (error) {
          await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
          throw error;
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}

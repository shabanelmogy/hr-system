import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-error-log-settings');
const captions = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/platform-advanced-tools.json'), 'utf8'),
);
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1050 },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const errors = [],
          writes = [],
          apiCalls = [];
        let settings = {
            retentionDays: 90,
            revision: 4,
            queueDepth: 2,
            droppedCount: 0,
            failedWrites: 1,
          },
          conflict = true;
        await context.route('**/api/**', async (route) => {
          try {
            const request = route.request(),
              url = new URL(request.url()),
              endpoint = url.pathname;
            apiCalls.push(request.method() + ' ' + endpoint);
            assert.equal(url.origin, api);
            let body,
              status = 200;
            if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
              body = {
                isAuthenticated: true,
                user: {
                  ...sessionFixture,
                  roles: ['super_admin'],
                  permissions: ['ErrorLogSettings:View', 'ErrorLogSettings:Edit'],
                },
              };
            else if (endpoint.endsWith('/runtime'))
              body = { catalogVersion: version, revision: 0, overrides: [] };
            else if (endpoint.endsWith('/csrf')) body = { requestToken: 'settings-fixture' };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) {
              status = 403;
              body = {};
            } else if (endpoint.endsWith('/system-error-logs/settings')) {
              if (request.method() === 'PUT') {
                assert.equal(request.headers()['x-erp-xsrf'], 'settings-fixture');
                const payload = request.postDataJSON();
                assert.deepEqual(Object.keys(payload).sort(), [
                  'expectedRevision',
                  'retentionDays',
                ]);
                writes.push(payload);
                if (conflict) {
                  conflict = false;
                  status = 409;
                  body = { title: 'Settings changed' };
                  settings = { ...settings, retentionDays: 60, revision: 7 };
                } else {
                  assert.equal(payload.expectedRevision, settings.revision);
                  settings = {
                    ...settings,
                    retentionDays: payload.retentionDays,
                    revision: settings.revision + 1,
                  };
                  body = settings;
                }
              } else {
                assert.equal(request.method(), 'GET');
                body = settings;
              }
            } else throw Error('Unexpected API ' + request.method() + ' ' + endpoint);
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
        await page.goto(origin + '/super-admin/error-log-settings');
        const root = page.locator('erp-error-log-settings-page');
        try {
          await expect(root.locator('erp-metric-card')).toHaveCount(5, { timeout: 15000 });
        } catch (error) {
          console.log(
            JSON.stringify({
              url: page.url(),
              errors,
              apiCalls,
              body: (await page.locator('body').innerText()).slice(0, 2500),
            }),
          );
          throw error;
        }
        const t = (key) => captions[language]['errorLogSettings.' + key];
        const edit = root.getByRole('button', { name: t('edit'), exact: true });
        await edit.click();
        const dialog = page.getByRole('dialog').filter({ has: page.locator('erp-retention-form') });
        await expect(dialog).toBeVisible();
        const field = dialog.locator('erp-numeric-field input');
        const save = dialog.getByRole('button', { name: t('save'), exact: true });
        await field.fill('');
        await expect(save).toBeEnabled();
        await save.click();
        await expect(dialog.locator('erp-numeric-field')).toContainText(t('required'));
        await expect(field).toBeFocused();
        assert.equal(writes.length, 0);
        await field.fill('120');
        await save.click();
        await expect(dialog).toContainText(t('conflict'));
        await dialog.getByRole('button', { name: t('reload'), exact: true }).click();
        await expect(save).toBeEnabled();
        await expect(field).toHaveValue('120');
        await save.click();
        await expect(dialog).toHaveCount(0);
        assert.deepEqual(writes, [
          { retentionDays: 120, expectedRevision: 4 },
          { retentionDays: 120, expectedRevision: 7 },
        ]);
        await edit.click();
        await field.fill('180');
        await dialog.getByRole('button', { name: t('loadCurrent'), exact: true }).click();
        const confirmation = page
          .getByRole('dialog')
          .filter({ hasText: core[language]['messages.unsavedChangesConfirm'] });
        await expect(confirmation).toBeVisible();
        await confirmation
          .getByRole('button', { name: core[language]['messages.discardChanges'], exact: true })
          .click();
        await expect(field).toHaveValue('120');
        await dialog
          .getByRole('button', { name: core[language]['actions.cancel'], exact: true })
          .click();
        await expect(dialog).toHaveCount(0);
        const geometry = await page.evaluate(() => ({
          documentOverflow: document.documentElement.scrollHeight - innerHeight,
          documentHorizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        }));
        assert.ok(
          geometry.documentOverflow <= 1 && geometry.documentHorizontalOverflow <= 1,
          JSON.stringify(geometry),
        );
        assert.deepEqual(errors, []);
        await page.screenshot({
          path: path.join(output, `${language}-${mode}-${width}.png`),
          fullPage: false,
        });
        results.push({
          language,
          mode,
          width,
          passed: true,
          fixturePuts: writes.length,
          hostedPuts: 0,
          geometry,
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

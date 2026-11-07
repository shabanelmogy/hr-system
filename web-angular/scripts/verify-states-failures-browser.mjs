import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { utils, write } from 'xlsx';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-states');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const states = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/reference-states.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const book = utils.book_new();
utils.book_append_sheet(
  book,
  utils.aoa_to_sheet([
    ['nameAr', 'nameEn', 'code', 'countryName'],
    ['القاهرة', 'Cairo', 'CAI', 'Egypt'],
  ]),
  'Import',
);
const workbook = Buffer.from(write(book, { type: 'buffer', bookType: 'xlsx' }));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const language of ['en', 'ar'])
    for (const scenario of [
      'read-only',
      'parent-forbidden',
      'parent-error',
      'field',
      'duplicate',
      'uncertain',
      'api-forbidden',
    ]) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1440, height: 1050 },
        reducedMotion: 'reduce',
      });
      await context.addCookies(
        Object.entries({
          i18next: language,
          currentMode: language === 'ar' ? 'dark' : 'light',
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
      const text = core[language],
        captions = states[language],
        errors = [],
        writes = [];
      const country = { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false };
      let lookupCalls = 0;
      await context.route('**/api/**', async (route) => {
        try {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          assert.equal(url.origin, api);
          let status = 200,
            body;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [
                  'States:View',
                  'States:Create',
                  'States:Edit',
                  'States:Archive',
                  'States:Restore',
                  'Countries:View',
                ],
                tenantReadOnly: scenario === 'read-only',
              },
            };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'state-fixture-csrf' };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (endpoint.endsWith('/modules/accessible')) body = [];
          else if (endpoint === '/api/v1/countries/lookup') {
            lookupCalls++;
            status =
              scenario === 'parent-forbidden' ? 403 : scenario === 'parent-error' ? 503 : 200;
            body = status === 200 ? [country] : {};
          } else if (endpoint === '/api/v1/states' && request.method() === 'GET') {
            status = scenario === 'api-forbidden' ? 403 : 200;
            body =
              status === 403
                ? {}
                : {
                    items: [
                      {
                        id: 1,
                        nameAr: 'القاهرة',
                        nameEn: 'Cairo',
                        code: 'CAI',
                        countryId: 1,
                        country,
                        createdOn: '2026-01-01T00:00:00Z',
                        updatedOn: null,
                        isDeleted: false,
                        districtsCount: 0,
                      },
                    ],
                    metaData: {
                      currentPage: 1,
                      pageNumber: 1,
                      pageSize: 10,
                      totalCount: 1,
                      totalPages: 1,
                      hasPrev: false,
                      hasNext: false,
                    },
                  };
          } else if (endpoint === '/api/v1/states' && request.method() === 'POST') {
            writes.push(request.postDataJSON());
            status = scenario === 'uncertain' ? 503 : scenario === 'duplicate' ? 409 : 400;
            body =
              scenario === 'field'
                ? { errors: { NameEn: ['This name is reserved for an existing state.'] } }
                : { errors: { 'State.Duplicated': ['PRIVATE_DIAGNOSTIC_MUST_STAY_HIDDEN'] } };
          } else throw Error('Unexpected States failure API ' + endpoint);
          await route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(body),
          });
        } catch (error) {
          errors.push(String(error));
          await route.abort().catch(() => {});
        }
      });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('dialog', async (dialog) => {
        errors.push('Native dialog');
        await dialog.dismiss();
      });
      try {
        await page.goto(origin + '/super-admin/geography/states');
        const workspace = page.locator('.workspace[data-testid=states]'),
          header = page.locator('erp-page-header');
        await expect(workspace).toHaveAttribute(
          'data-kind',
          scenario === 'api-forbidden' ? 'forbidden' : 'ready',
          { timeout: 60000 },
        );
        if (scenario === 'api-forbidden') {
          await expect(workspace.locator('[data-collection-row]')).toHaveCount(0);
          await expect(workspace).toContainText(text['authorization.forbidden.title']);
        } else if (scenario === 'read-only') {
          await expect(
            header.getByRole('button', { name: captions['states.add'], exact: true }),
          ).toHaveCount(0);
          await expect(workspace.locator('thead th.selection-cell input')).toHaveCount(0);
          await expect(
            workspace.getByRole('button', { name: text['actions.edit'], exact: true }),
          ).toHaveCount(0);
        } else if (scenario.startsWith('parent-')) {
          await header.locator('[data-view=import] button').click();
          const view = page.locator('erp-state-import-view');
          await expect(view).toContainText(
            captions[
              'states.import.countryLookup.' + (scenario === 'parent-error' ? 'error' : 'forbidden')
            ],
          );
          await view.locator('input[type=file]').setInputFiles({
            name: 'states.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: workbook,
          });
          await expect(view.locator('tbody tr')).toHaveCount(1);
          await expect(view.getByTestId('import-submit').getByRole('button')).toBeDisabled();
          await expect(view.locator('tbody tr')).not.toContainText(
            captions['states.import.unknownCountry'],
          );
          if (scenario === 'parent-error') {
            await view.getByRole('button', { name: text['actions.retry'], exact: true }).click();
            await expect.poll(() => lookupCalls).toBe(2);
          }
        } else {
          await header.getByRole('button', { name: captions['states.add'], exact: true }).click();
          const editor = page.getByRole('dialog', { name: captions['states.add'], exact: true });
          await editor.getByLabel(text['general.nameAr'], { exact: false }).fill('محافظة اختبار');
          await editor.getByLabel(text['general.nameEn'], { exact: false }).fill('Failure State');
          await editor.getByLabel(captions['states.code'], { exact: false }).fill('FAIL');
          await editor.locator('erp-reference-field p-select').click();
          await page
            .getByRole('option', { name: language === 'ar' ? 'مصر' : 'Egypt', exact: true })
            .click();
          await editor.getByRole('button', { name: captions['states.add'], exact: true }).click();
          await expect.poll(() => writes.length).toBe(1);
          if (scenario === 'field') {
            await expect(editor).toContainText('This name is reserved for an existing state.');
            await expect(
              editor.getByLabel(text['general.nameEn'], { exact: false }),
            ).toHaveAttribute('aria-invalid', 'true');
          } else if (scenario === 'duplicate') {
            await expect(editor.locator('erp-text-field [aria-invalid=true]')).toHaveCount(3);
            await expect(editor).toContainText(captions['states.duplicate']);
          } else {
            await expect(page.getByRole('dialog').last()).toContainText(
              captions['states.mutationUncertain'],
            );
            await expect(
              editor.getByRole('button', { name: captions['states.add'], exact: true }),
            ).toBeDisabled();
          }
          await expect(page.locator('body')).not.toContainText(
            'PRIVATE_DIAGNOSTIC_MUST_STAY_HIDDEN',
          );
        }
        assert.deepEqual(errors, []);
        results.push({ language, scenario, writes: writes.length, passed: true });
        console.log(`States failure passed ${language}/${scenario}`);
      } catch (error) {
        await page
          .screenshot({ path: path.join(output, 'failure-negative.png'), fullPage: true })
          .catch(() => {});
        throw Error(`${language}/${scenario}: ${error}`, { cause: error });
      } finally {
        await context.close();
      }
    }
  fs.writeFileSync(path.join(output, 'failure-results.json'), JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}

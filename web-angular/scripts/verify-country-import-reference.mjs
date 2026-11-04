import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { utils, write, read } from 'xlsx';
import { chromium, expect } from '@playwright/test';
const root = path.resolve(import.meta.dirname, '..'),
  origin = process.env.NEXT_REFERENCE_ORIGIN ?? 'http://localhost:3100',
  backend = 'http://127.0.0.1:3199',
  output = path.resolve(root, '../.codex-tmp/angular-country-import/reference');
fs.mkdirSync(output, { recursive: true });
const core = JSON.parse(
    fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
  ),
  headers = ['nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'];
const book = utils.book_new();
utils.book_append_sheet(
  book,
  utils.aoa_to_sheet([
    headers,
    ['دولة أولى', 'First', '', '', '', ''],
    ['دولة مكررة', 'First', '', '', '', ''],
    ['', 'Invalid', '', '', '', ''],
  ]),
  'Import',
);
const bytes = write(book, { type: 'buffer', bookType: 'xlsx' });
await fetch(backend + '/__e2e/reset', { method: 'POST' });
const browser = await chromium.launch({ channel: 'chrome' }),
  results = [];
const selectedCase = process.argv.find((value) => value.startsWith('--case='))?.slice(7);
try {
  for (const mode of ['light', 'dark'])
    for (const language of ['en', 'ar'])
      for (const width of [390, 1440]) {
        if (selectedCase && selectedCase !== `${mode}/${language}/${width}`) continue;
        const context = await browser.newContext({
            viewport: { width, height: width === 390 ? 780 : 1050 },
            reducedMotion: 'reduce',
            acceptDownloads: true,
          }),
          p = await context.newPage();
        p.setDefaultNavigationTimeout(120000);
        await context.addCookies(
          Object.entries({ themePalette: 'green', currentMode: mode, i18next: language }).map(
            ([name, value]) => ({ name, value, url: origin }),
          ),
        );
        const errors = [];
        p.on('pageerror', (e) => errors.push(e.message));
        p.on('response', (r) => {
          if (r.status() >= 400) errors.push(new URL(r.url()).pathname + ':' + r.status());
        });
        assert.ok(
          ['localhost', '127.0.0.1'].includes(new URL(origin).hostname),
          'Source harness requires local fixture preview',
        );
        const login = await p.request.post(origin + '/api/v1/auth/login', {
          headers: { origin },
          data: { username: 'superadmin', password: 'P@ssword123' },
        });
        assert.equal(login.status(), 200);
        await context.route(origin + '/api/v1/countries?**', async (route) => {
          const url = new URL(route.request().url()),
            size = Number(url.searchParams.get('pageSize')),
            page = Number(url.searchParams.get('pageNumber'));
          await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
              items: [
                {
                  id: 1,
                  nameAr: 'مصر',
                  nameEn: 'Egypt',
                  alpha2Code: 'EG',
                  alpha3Code: 'EGY',
                  phoneCode: '20',
                  currencyCode: 'EGP',
                  statesCount: 0,
                  isDeleted: false,
                  createdOn: '2026-01-01T00:00:00Z',
                  updatedOn: null,
                },
              ],
              metaData: {
                currentPage: page,
                pageNumber: page,
                pageSize: size,
                totalCount: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            }),
          });
        });
        const posts = [];
        await context.route(origin + '/api/v1/countries/bulk', async (route) => {
          posts.push(route.request().postDataJSON());
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ createdCount: 1 }),
          });
        });
        await p.goto(origin + '/super-admin/geography/countries', { waitUntil: 'commit' });
        await p.bringToFront();
        try {
          await expect(p.locator('.MuiDataGrid-row').first()).toBeVisible({ timeout: 120000 });
        } catch (error) {
          await p.screenshot({ path: path.join(output, 'entry-failure.png'), fullPage: true });
          const diagnostic = {
            case: { mode, language, width },
            errors,
            url: p.url(),
            root: await p.locator('html').evaluate((e) => ({
              language: e.lang,
              mode: e.dataset.theme,
              ready: e.dataset.appReady ?? null,
            })),
          };
          fs.writeFileSync(
            path.join(output, 'bootstrap-failure.json'),
            JSON.stringify(diagnostic, null, 2),
          );
          console.log(JSON.stringify(diagnostic));
          throw error;
        }
        await expect(p.locator('html')).toHaveAttribute('lang', language);
        await expect(p.locator('html')).toHaveAttribute('data-theme', mode);
        await expect(p.locator('html')).toHaveAttribute('data-app-ready', 'true', {
          timeout: 30000,
        });
        const label = core[language]['views.import'],
          button = p.getByRole('button', { name: label, exact: true });
        if ((await button.count()) && (await button.isVisible())) await button.click();
        else {
          await p
            .getByRole('button', { name: core[language]['navigation.moreViews'], exact: true })
            .click();
          await p.getByRole('menuitem', { name: label, exact: true }).click();
        }
        const downloadPromise = p.waitForEvent('download');
        await p
          .getByRole('button', { name: core[language]['imports.downloadTemplate'], exact: true })
          .click();
        const download = await downloadPromise,
          b = read(fs.readFileSync(await download.path()));
        assert.deepEqual(utils.sheet_to_json(b.Sheets[b.SheetNames[0]], { header: 1 }), [headers]);
        await p.locator('input[type=file]').setInputFiles({
          name: 'countries.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: bytes,
        });
        const upload = p.getByRole('button', {
          name: core[language]['imports.uploadData'],
          exact: true,
        });
        await expect(upload).toBeEnabled();
        await upload.click();
        await expect.poll(() => posts.length).toBe(1);
        assert.equal(posts[0].countries.length, 1);
        assert.equal(posts[0].countries[0].nameEn, 'First');
        await expect(upload).toBeDisabled();
        await expect(
          p.getByText(core[language]['imports.invalid'], { exact: true }).first(),
        ).toBeVisible();
        await p.screenshot({
          path: path.join(output, `${mode}-${language}-${width}.png`),
          fullPage: true,
        });
        results.push({
          mode,
          language,
          width,
          template: true,
          valid: 1,
          invalid: 2,
          oneBatch: true,
          passed: true,
        });
        fs.writeFileSync(
          path.join(output, `${mode}-${language}-${width}-results.json`),
          JSON.stringify([results.at(-1)], null, 2),
        );
        await context.close();
        console.log(`Source Import ${mode}/${language}/${width} passed`);
      }
  fs.writeFileSync(
    path.join(
      output,
      selectedCase ? selectedCase.replaceAll('/', '-') + '-results.json' : 'results.json',
    ),
    JSON.stringify(results, null, 2),
  );
} catch (error) {
  fs.writeFileSync(path.join(output, 'partial-results.json'), JSON.stringify(results, null, 2));
  throw error;
} finally {
  await browser.close();
}

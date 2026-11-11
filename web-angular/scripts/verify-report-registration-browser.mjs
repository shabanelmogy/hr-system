import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Loads the production build through Playwright routing; never launches or restarts
// an application server. All API requests are fixtures, with no live report writes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const build = path.join(root, 'dist/erp-angular/browser');
const output = path.resolve(
  process.env.REPORT_REGISTRATION_ARTIFACTS ??
    path.join(root, '../.codex-tmp/report-runtime-review/registration-layout'),
);
await fs.mkdir(output, { recursive: true });
const catalog = await fs.readFile(
  path.join(root, 'src/app/platform/localization/catalog.generated.ts'),
  'utf8',
);
const catalogVersion = catalog.match(/[a-f0-9]{64}/)?.[0];
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const translations = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/reporting.json'), 'utf8'),
);
assert.ok(catalogVersion);
const hash = 'a'.repeat(64);
const candidates = [
  {
    sourceId: 'b'.repeat(64),
    entityKey: 'countries',
    reportKey: 'countries',
    displayName: 'Countries',
    fileName: 'Countries.WithStates.AndDistricts.Directory.rpt',
    subject: 'Geographical reference directory / دليل البيانات الجغرافية',
    size: 8704,
    sha256: hash,
    isImportable: true,
    isImported: false,
    validationReason: null,
  },
  {
    sourceId: 'c'.repeat(64),
    entityKey: 'countries',
    reportKey: 'countries-registered',
    displayName: 'Registered directory',
    fileName: 'Countries.Registered.rpt',
    subject: null,
    size: 9728,
    sha256: hash,
    isImportable: true,
    isImported: true,
    validationReason: null,
  },
  {
    sourceId: 'd'.repeat(64),
    entityKey: 'countries',
    reportKey: 'countries-rejected',
    displayName: 'Rejected directory',
    fileName: 'Countries.Rejected.rpt',
    subject: null,
    size: 9728,
    sha256: hash,
    isImportable: false,
    isImported: false,
    validationReason: 'The template uses database connection metadata that is not allowed.',
  },
];
const cases = process.argv.includes('--smoke')
  ? [{ language: 'en', mode: 'light', palette: 'green', width: 1213 }]
  : ['en', 'ar'].flatMap((language) =>
      ['light', 'dark'].flatMap((mode) =>
        ['green', 'orange', 'blue', 'navy', 'monochrome'].flatMap((palette) =>
          [1213, 390].map((width) => ({ language, mode, palette, width })),
        ),
      ),
    );
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const scenario of cases) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: scenario.width, height: 900 },
      reducedMotion: 'reduce',
    });
    try {
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
            '.png': 'image/png',
            '.ico': 'image/x-icon',
          }[path.extname(file)] ?? 'application/octet-stream';
        try {
          await route.fulfill({ body: await fs.readFile(file), contentType: mime });
        } catch {
          await route.fulfill({ status: 404, body: '' });
        }
      });
      await context.addCookies(
        Object.entries({
          i18next: scenario.language,
          currentMode: scenario.mode,
          themePalette: scenario.palette,
        }).map(([name, value]) => ({ name, value, url: origin })),
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
        else if (url.pathname.endsWith('/manage')) body = { items: [], totalCount: 0 };
        else if (url.pathname.endsWith('/deployment-candidates'))
          body = { items: candidates, totalCount: candidates.length };
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + '/administration/global-crystal-reports');
      // The canonical catalog supplies the translated accessible label.
      const manager = page.locator('erp-global-template-manager');
      await manager.waitFor();
      await manager
        .locator('erp-action-menu-button')
        .getByRole('button', {
          name: core[scenario.language]['actions.buttons'],
          exact: true,
        })
        .click();
      await page
        .getByRole('menuitem', {
          name: translations[scenario.language]['globalTemplates.registerExisting'],
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      try {
        await dialog
          .locator('erp-record-summary')
          .filter({ hasText: 'Countries.WithStates' })
          .waitFor();
      } catch (error) {
        await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
        console.log(await dialog.innerText());
        console.log(errors);
        throw error;
      }
      await page.waitForTimeout(150);
      assert.equal(await dialog.locator('td[data-cell-column="register"] button').count(), 3);
      const check = async () =>
        dialog.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const buttons = [...element.querySelectorAll('td[data-cell-column="register"] button')];
          const controls = buttons.map((button) => {
            const rect = button.getBoundingClientRect();
            const middle = document.elementFromPoint(
              rect.x + rect.width / 2,
              rect.y + rect.height / 2,
            );
            return {
              visible:
                rect.left >= bounds.left &&
                rect.right <= bounds.right &&
                !!middle &&
                button.contains(middle),
              nowrap: getComputedStyle(button).whiteSpace === 'nowrap',
              frozen: button.closest('td')?.classList.contains('p-datatable-frozen-column'),
              labelVisible:
                getComputedStyle(button.querySelector('[pButtonLabel]')).display !== 'none',
              columnWidth: button.closest('td')?.getBoundingClientRect().width,
            };
          });
          const label = element.querySelector('erp-option-select label');
          const labelRect = label?.getBoundingClientRect();
          const content = element.querySelector('.p-dialog-content')?.getBoundingClientRect();
          return {
            controls,
            documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
            dialogOverflow: element.scrollWidth > element.clientWidth + 1,
            labelUnclipped: !!labelRect && !!content && labelRect.top >= content.top,
          };
        });
      const before = await check();
      assert.equal(before.documentOverflow, false, JSON.stringify({ scenario, before }));
      assert.equal(before.dialogOverflow, false);
      assert.equal(before.labelUnclipped, true);
      assert.ok(
        before.controls.every((control) => control.visible && control.nowrap && control.frozen),
        JSON.stringify({ scenario, before }),
      );
      assert.ok(
        before.controls.every((control) =>
          scenario.width < 600
            ? !control.labelVisible && control.columnWidth <= 73
            : control.labelVisible && control.columnWidth >= 180,
        ),
        JSON.stringify({ scenario, before }),
      );
      const viewport = dialog.locator('.p-datatable-table-container');
      await viewport.evaluate((element) => {
        element.scrollLeft = getComputedStyle(element).direction === 'rtl' ? -10000 : 10000;
      });
      await page.waitForTimeout(75);
      const after = await check();
      assert.ok(
        after.controls.every((control) => control.visible),
        JSON.stringify({ scenario, after }),
      );
      assert.equal(
        await dialog.locator('td[data-cell-column="register"] button:disabled').count(),
        2,
      );
      assert.deepEqual(errors, []);
      await viewport.evaluate((element) => {
        element.scrollLeft = 0;
      });
      await page.waitForTimeout(75);
      const id = `${scenario.language}-${scenario.palette}-${scenario.mode}-${scenario.width}`;
      await dialog.screenshot({ path: path.join(output, id + '.png') });
      results.push({
        ...scenario,
        translatedTitle: await dialog.locator('h2').innerText(),
        before,
        after,
      });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}
console.log(`Report registration browser layout passed ${results.length} isolated cases.`);

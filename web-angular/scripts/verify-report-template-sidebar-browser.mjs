import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { globalReportFixture } from '../src/app/modules/reporting/global-reports/report.fixture.ts';

// Serves the actual production bundle through Playwright; all requests are fixtures.
const root = path.resolve(import.meta.dirname, '..');
const build = path.join(root, 'dist/erp-angular/browser');
const origin = 'https://localhost:4210';
const output = path.resolve(root, '../.codex-tmp/report-template-sidebar');
await fs.mkdir(output, { recursive: true });
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const catalogVersion = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)?.[0];
assert.ok(catalogVersion);
const hash = globalReportFixture.rowVersion;
const row = {
  id: 'c6518e27-5e26-4790-932c-80d572099a32',
  entityKey: 'countries',
  reportKey: globalReportFixture.reportKey,
  displayName: 'Sidebar template fixture',
  description: null,
  updatedOn: '2026-11-05T00:00:00Z',
  currentVersionNumber: 1,
  isPublished: true,
  isArchived: false,
  rowVersion: 'AAAAAAAAAAA=',
};
const version = {
  id: '104c0411-c988-449d-9a36-e27d2d7532f5',
  versionNumber: 1,
  originalFileName: 'Countries.rpt',
  size: 32,
  sha256: hash,
  summaryTitle: 'Sidebar fixture',
  summarySubject: null,
  validationStatus: 'Valid',
  validationReason: null,
  validationContractSchemaVersion: 1,
  // Preserved legacy inspection evidence; the API has proved this entity unchanged.
  validationContractFingerprint: 'c'.repeat(64),
  isContractCurrent: true,
  isPublished: true,
  createdOn: '2026-11-05T00:00:00Z',
};
// Match the real GlobalCrystalReportIdentity SourceId/Token envelope, not raw SHA.
const digest = (value) => createHash('sha256').update(value).digest('hex');
const viewerReport = {
  ...globalReportFixture,
  id: digest('managed-global\n' + row.id.replaceAll('-', '')),
  rowVersion: digest(version.id.replaceAll('-', '') + '\n' + hash + '\n' + version.sha256),
  currentVersionNumber: 1,
};
const results = [];
const scenarios = ['en', 'ar'].flatMap((language) =>
  ['light', 'dark'].flatMap((mode) =>
    [390, 1440].map((width) => ({ language, mode, width, policy: 'admin' })),
  ),
);
scenarios.push({ language: 'en', mode: 'light', width: 1440, policy: 'reader' });
scenarios.push({ language: 'en', mode: 'light', width: 1440, policy: 'denied-acl' });
scenarios.push({ language: 'en', mode: 'light', width: 1440, policy: 'stale' });
scenarios.push({ language: 'en', mode: 'light', width: 1440, policy: 'different-id' });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const scenario of scenarios) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      reducedMotion: 'reduce',
      viewport: { width: scenario.width, height: 1050 },
      acceptDownloads: true,
    });
    const calls = { manage: 0, uploads: 0, publishes: 0, downloads: 0 };
    const errors = [];
    let detail = {
      ...row,
      versions: [{ ...version, sha256: scenario.policy === 'stale' ? 'f'.repeat(64) : hash }],
    };
    try {
      await context.addCookies(
        Object.entries({
          i18next: scenario.language,
          currentMode: scenario.mode,
          themePalette: 'green',
        }).map(([name, value]) => ({ name, value, url: origin })),
      );
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
      await context.route('**/api/**', async (route) => {
        const request = route.request(),
          url = new URL(request.url()),
          endpoint = url.pathname;
        let body = [];
        try {
          if (/\/(session|refresh)$/.test(endpoint))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: [
                  'GlobalCrystalReports:View',
                  'GlobalCrystalReports:Download',
                  ...(scenario.policy === 'reader'
                    ? []
                    : [
                        'GlobalCrystalReports:Upload',
                        'GlobalCrystalReports:Publish',
                        'Countries:Edit',
                      ]),
                ],
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion, revision: 1, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'sidebar-fixture' };
          else if (endpoint.includes('/manage')) {
            calls.manage++;
            if (endpoint.endsWith('/entities'))
              body = [
                {
                  entityKey: 'countries',
                  scope: 'global',
                  filters: [],
                  contractSchemaVersion: 1,
                  contractFingerprint: hash,
                },
              ];
            else if (endpoint.endsWith('/manage/query')) {
              assert.deepEqual(request.postDataJSON().filters, [
                {
                  field: 'reportKey',
                  operator: 'and',
                  constraints: [{ matchMode: 'equals', value: row.reportKey }],
                },
              ]);
              body = { items: [row], totalCount: 1 };
            } else if (endpoint.endsWith('/manage')) body = { items: [row], totalCount: 1 };
            else if (endpoint.endsWith('/access'))
              body = {
                access: [],
                allowedRights:
                  scenario.policy === 'denied-acl'
                    ? ['Run', 'Download']
                    : ['Run', 'Download', 'Upload', 'Publish'],
                canView: true,
                canEdit: false,
                rowVersion: row.rowVersion,
              };
            else if (endpoint.endsWith('/versions')) {
              assert.equal(request.method(), 'POST');
              assert.ok(endpoint.includes(row.id));
              assert.equal(request.headers()['x-erp-xsrf'], 'sidebar-fixture');
              calls.uploads++;
              detail = {
                ...detail,
                versions: [
                  ...detail.versions,
                  {
                    ...version,
                    id: '204c0411-c988-449d-9a36-e27d2d7532f5',
                    versionNumber: 2,
                    isPublished: false,
                  },
                ],
              };
              body = detail;
            } else if (endpoint.endsWith('/publish')) {
              calls.publishes++;
              body = detail;
            } else if (endpoint.endsWith('/' + row.id)) body = detail;
            else throw Error('Unexpected management request ' + endpoint);
          } else if (endpoint.endsWith('/global-crystal-reports'))
            body = [
              {
                ...viewerReport,
                id: scenario.policy === 'different-id' ? 'f'.repeat(64) : viewerReport.id,
                canDownloadSource: true,
              },
            ];
          else if (endpoint.endsWith('/source')) {
            assert.equal(url.searchParams.get('expectedSha256'), viewerReport.rowVersion);
            calls.downloads++;
            return route.fulfill({
              contentType: 'application/octet-stream',
              body: Buffer.from('RPT download fixture'),
            });
          } else if (endpoint.endsWith('/render'))
            return route.fulfill({
              contentType: 'application/pdf',
              body: Buffer.from('%PDF-1.4\n% Sidebar fixture\n%%EOF'),
            });
          await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
        } catch (error) {
          errors.push(String(error));
          await route.fulfill({ status: 500, body: 'fixture contract failure' });
        }
      });
      const page = await context.newPage();
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + '/reports/global');
      const view = page.locator('erp-global-report-view');
      await expect(view.locator('erp-pdf-viewer')).toBeVisible();
      assert.equal(calls.manage, 0, 'Readers must not preload management requests.');
      await view
        .getByRole('tab', { name: core[scenario.language]['reports.viewerOptions'], exact: true })
        .click();
      await expect(view.locator('erp-page-header a[download]')).toBeVisible();
      await expect(view.locator('aside a[download]')).toHaveCount(0);
      const downloaded = page.waitForEvent('download');
      await view.getByTestId('download-source').getByRole('button').click();
      assert.equal((await downloaded).suggestedFilename(), row.reportKey + '.rpt');
      assert.equal(calls.downloads, 1);
      if (scenario.policy === 'reader') {
        await expect(view.getByTestId('upload-source')).toHaveCount(0);
        assert.equal(calls.manage, 0);
      } else {
        await view.getByTestId('upload-source').getByRole('button').click();
        const editor = page.locator('erp-global-report-template-editor');
        await expect(editor).toHaveCount(1);
        if (
          scenario.policy === 'denied-acl' ||
          scenario.policy === 'stale' ||
          scenario.policy === 'different-id'
        ) {
          await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
          await expect(page.locator('input[type=file]')).toHaveCount(0);
          assert.equal(calls.uploads, 0);
          await page
            .getByRole('dialog')
            .getByRole('button', { name: core[scenario.language]['actions.close'], exact: true })
            .click();
        } else {
          const upload = page.getByRole('dialog').filter({ has: page.locator('input[type=file]') });
          const file = upload.locator('input[type=file]');
          await expect(file).toHaveCount(1);
          await file.setInputFiles({
            name: 'Countries.rpt',
            mimeType: 'application/octet-stream',
            buffer: Buffer.from('RPT upload fixture'),
          });
          await upload
            .getByRole('button', { name: core[scenario.language]['actions.save'], exact: true })
            .click();
          await expect.poll(() => calls.uploads).toBe(1);
          await expect(
            page.locator('erp-global-template-versions [data-collection-row]'),
          ).toHaveCount(2);
          assert.equal(calls.publishes, 0, 'Upload must not publish automatically.');
          await page.screenshot({
            path: path.join(
              output,
              `${scenario.language}-${scenario.mode}-${scenario.width}-versions.png`,
            ),
            fullPage: true,
          });
          await page
            .getByRole('dialog')
            .getByRole('button', { name: core[scenario.language]['actions.close'], exact: true })
            .click();
        }
        await expect(page.locator('erp-global-report-template-editor')).toHaveCount(0);
      }
      assert.deepEqual(errors, []);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      results.push({ ...scenario, calls, errors });
      console.log(
        `Report template sidebar passed ${scenario.language}/${scenario.mode}/${scenario.width}/${scenario.policy}`,
      );
    } catch (error) {
      await context
        .pages()[0]
        ?.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
      throw error;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  path.join(output, 'verification.json'),
  JSON.stringify(
    {
      date: new Date().toISOString(),
      source: 'production build; all API writes intercepted',
      passed: results.length,
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ passed: results.length, output }));

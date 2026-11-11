import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

// Loads the production build through Playwright routing; never launches or restarts
// an application server. All API requests are fixtures, with no live report writes.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const build = process.env.ANGULAR_FIXTURE_BUILD
  ? path.resolve(process.env.ANGULAR_FIXTURE_BUILD)
  : path.join(root, 'dist/erp-angular/browser');
const output = path.resolve(
  process.env.REPORT_PAGINATION_ARTIFACTS ??
    path.join(root, '../.codex-tmp/reporting-audit-2026-11-09/corrected-browser'),
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
const reporting = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/reporting.json'), 'utf8'),
);
assert.ok(catalogVersion);
const hash = 'a'.repeat(64);
const cases = ['en', 'ar'].flatMap((language) =>
  ['light', 'dark'].flatMap((mode) =>
    [
      { width: 1440, height: 900 },
      { width: 1152, height: 720 },
      { width: 844, height: 390 },
      { width: 390, height: 844 },
    ].map((size) => ({ language, mode, palette: 'green', ...size })),
  ),
);
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const scenario of cases) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: scenario.width, height: scenario.height },
      // 1152x720 CSS pixels at DPR 1.25 models a 1440x900 window at 125% zoom.
      deviceScaleFactor: scenario.width === 1152 ? 1.25 : 1,
      reducedMotion: 'reduce',
    });
    const requests = [];
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
                'GlobalCrystalReports:Publish',
                'GlobalCrystalReports:Upload',
                'GlobalCrystalReports:Download',
                'GlobalCrystalReportAccess:View',
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
        else if (url.pathname.endsWith('/manage') || url.pathname.endsWith('/manage/query')) {
          const query =
            route.request().method() === 'POST'
              ? route.request().postDataJSON()
              : Object.fromEntries(url.searchParams);
          requests.push(query);
          const size = Number(query.pageSize ?? 10);
          const start = (Number(query.page ?? 1) - 1) * size;
          let all = Array.from({ length: 125 }, (_, i) => ({
            id: 'c6518e27-5e26-4790-932c-' + String(i).padStart(12, '0'),
            entityKey: 'countries',
            reportKey: 'directory-' + i,
            displayName: 'Directory ' + i,
            description: null,
            updatedOn: '2026-11-01T00:00:00Z',
            currentVersionNumber: null,
            isPublished: false,
            isArchived: false,
            rowVersion: 'AAAAAAAAAAA=',
          }));
          for (const group of query.filters ?? []) {
            all = all.filter((row) =>
              group.constraints.every((rule) => {
                const value = group.field === 'status' ? 'published' : row[group.field];
                return rule.matchMode === 'contains'
                  ? String(value).includes(rule.value)
                  : value === rule.value;
              }),
            );
          }
          body = {
            items: all.slice(start, start + size),
            totalCount: all.length,
          };
        } else if (/\/manage\/[a-f0-9-]{36}$/.test(url.pathname)) {
          body = {
            id: url.pathname.split('/').at(-1),
            entityKey: 'countries',
            reportKey: 'directory-0',
            displayName: 'Directory 0',
            description: 'Saved report description',
            updatedOn: '2026-11-01T00:00:00Z',
            currentVersionNumber: 1,
            isPublished: true,
            isArchived: false,
            rowVersion: 'AAAAAAAAAAA=',
            viewName: 'ref.vw_Countries',
            versions: [
              {
                id: '104c0411-c988-449d-9a36-e27d2d7532f5',
                versionNumber: 1,
                originalFileName: 'Countries.rpt',
                size: 100,
                sha256: hash,
                summaryTitle: 'Country directory',
                summarySubject: 'دليل الدول',
                validationStatus: 'Valid',
                validationReason: null,
                validationContractSchemaVersion: 1,
                validationContractFingerprint: hash,
                isPublished: false,
                createdOn: '2026-11-01T00:00:00Z',
              },
            ],
          };
        } else if (url.pathname.endsWith('/access'))
          body = {
            access: [
              {
                roleId: 'tenant-role',
                roleName: 'Accountant',
                rights: ['Run'],
                tenantId: 'tenant-a',
                tenantName: 'Tenant A',
                scopeKnown: true,
              },
              {
                roleId: 'platform-role',
                roleName: 'Reader',
                rights: ['Run'],
                tenantId: null,
                tenantName: null,
                scopeKnown: true,
              },
              { roleId: 'legacy-role', roleName: 'Legacy', rights: ['Run'] },
            ],
            allowedRights: ['Run', 'Download', 'Upload', 'Publish'],
            canView: true,
            canEdit: false,
            rowVersion: 'AAAAAAAAAAA=',
          };
        else if (url.pathname.endsWith('/roles')) body = { items: [], totalCount: 0 };
        else if (url.pathname.endsWith('/deployment-candidates'))
          body = { items: [], totalCount: 0 };
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(origin + '/administration/global-crystal-reports');
      // The canonical catalog supplies the translated accessible label.
      const manager = page.locator('erp-global-template-manager');
      await manager.waitFor();

      await manager.locator('erp-collection-footer').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      await manager.locator('td').first().waitFor();

      const measure = async () => {
        await manager.locator('erp-collection-footer').first().scrollIntoViewIfNeeded();
        return page.evaluate(() => {
          const footer = document.querySelector(
            'erp-global-template-manager erp-collection-footer',
          );
          const body = document.querySelector(
            'erp-global-template-manager .p-datatable-table-container',
          );
          const rect = footer?.getBoundingClientRect();
          return {
            footer: rect?.toJSON(),
            height: innerHeight,
            visibleRows: [
              ...document.querySelectorAll('erp-global-template-manager [data-collection-row]'),
            ].filter((row) => {
              const r = row.getBoundingClientRect();
              return r.top >= 0 && r.bottom <= innerHeight;
            }).length,
            tableScrollHeight: body?.scrollHeight,
            tableClientHeight: body?.clientHeight,
            footerWithinViewport: !!rect && rect.top >= 0 && rect.bottom <= innerHeight,
            outerScrollers: [...document.querySelectorAll('*')]
              .filter(
                (el) =>
                  el.scrollHeight > el.clientHeight + 2 &&
                  ['auto', 'scroll'].includes(getComputedStyle(el).overflowY),
              )
              .map((el) => ({
                tag: el.tagName,
                cls: el.className,
                height: el.clientHeight,
                scroll: el.scrollHeight,
              })),
          };
        });
      };
      const geometry = await measure();
      const toggle = page.locator('erp-application-frame .drawer-toggle button');
      const navigationGeometry = [];
      for (const expanded of [true, false]) {
        if ((await toggle.getAttribute('aria-expanded')) !== String(expanded)) await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', String(expanded));
        await page.evaluate(() => document.fonts.ready);
        const current = await measure();
        assert.equal(
          current.footerWithinViewport,
          true,
          JSON.stringify({ scenario, expanded, current }),
        );
        navigationGeometry.push({ expanded, ...current });
        // On touch layouts the navigation is an overlay; dismiss through its accessible close control.
        if (expanded && scenario.width < 900) {
          const drawer = page.locator('.p-drawer[role="complementary"]');
          await expect(drawer).toBeVisible();
          await drawer
            .getByRole('button', {
              name: core[scenario.language]['menu.closeSidebar'],
              exact: true,
            })
            .click();
          await expect(toggle).toHaveAttribute('aria-expanded', 'false');
          await expect(drawer).toBeHidden();
          await expect(page.locator('.p-drawer-mask')).toHaveCount(0);
        }
      }
      assert.equal(geometry.footerWithinViewport, true, JSON.stringify({ scenario, geometry }));
      assert.ok(geometry.visibleRows > 0, JSON.stringify({ scenario, geometry }));
      const firstCell = manager.locator('tbody [data-collection-row] > td').first();
      await firstCell.scrollIntoViewIfNeeded();
      await expect(firstCell).toBeInViewport({ ratio: 1 });
      const rowReachable = await firstCell.evaluate((cell) => {
        const box = cell.getBoundingClientRect();
        const target = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return {
          reachable: target !== null && cell.contains(target),
          bounds: box.toJSON(),
          covering: target?.outerHTML.slice(0, 2000),
          ancestors: [
            ...(function* () {
              for (let parent = cell.parentElement; parent; parent = parent.parentElement)
                yield parent;
            })(),
          ].map((parent) => ({
            tag: parent.tagName,
            cls: parent.className,
            top: parent.scrollTop,
            bounds: parent.getBoundingClientRect().toJSON(),
            overflow: getComputedStyle(parent).overflowY,
          })),
        };
      });
      if (!rowReachable.reachable) {
        await page.screenshot({
          path: path.join(
            output,
            `covered-row-${scenario.language}-${scenario.mode}-${scenario.width}.png`,
          ),
        });
      }
      assert.equal(
        rowReachable.reachable,
        true,
        JSON.stringify({ scenario, geometry, rowReachable }),
      );
      await expect(manager.locator('erp-page-header')).toHaveClass(/collection-header/);
      await expect(manager.getByRole('heading', { level: 1 })).toHaveText(
        reporting[scenario.language]['globalTemplates.title'],
      );
      await page.screenshot({
        path: path.join(
          output,
          'audit-' +
            scenario.language +
            '-' +
            scenario.mode +
            '-' +
            scenario.width +
            'x' +
            scenario.height +
            '.png',
        ),
      });
      const footerButtons = await manager
        .locator('erp-collection-footer button')
        .evaluateAll((nodes) =>
          nodes.map((el) => ({
            text: el.textContent,
            label: el.getAttribute('aria-label'),
            disabled: el.disabled,
          })),
        );
      let failureEvidence;
      if (scenario.width === 1440 && scenario.language === 'en' && scenario.mode === 'light') {
        await context.route('**/manage/*/versions/*/publish', (route) =>
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              errors: { 'CrystalReport.ContractStale': ['Audit simulated stale contract'] },
            }),
          }),
        );
        await manager.locator('[data-collection-row]').first().dblclick();
        const dialog = page.getByRole('dialog');
        await dialog
          .getByRole('tab', { name: reporting.en['crystalReports.permissions'], exact: true })
          .click();
        const permissions = dialog.locator('erp-global-template-permissions');
        await expect(permissions.locator('[data-collection-row]')).toHaveCount(3);
        await expect(
          permissions.locator('[data-collection-row]').filter({ hasText: 'Accountant' }),
        ).toContainText('Tenant A');
        await expect(
          permissions
            .locator('[data-collection-row]')
            .filter({ hasText: 'Legacy' })
            .locator('[data-cell-column="tenant"]'),
        ).toHaveText('—');
        await dialog
          .getByRole('tab', { name: reporting.en['crystalReports.versions'], exact: true })
          .click();
        await dialog
          .getByRole('button', { name: reporting.en['crystalReports.publish'], exact: true })
          .click();
        await expect(manager.locator('erp-global-template-list')).toContainText(
          'Audit simulated stale contract',
        );
        await expect(dialog.getByRole('alert')).toContainText('Audit simulated stale contract');
        failureEvidence = {
          visibleInDialog: (await dialog.textContent()).includes('Audit simulated stale contract'),
          presentBehindDialog: (
            await manager.locator('erp-global-template-list').textContent()
          ).includes('Audit simulated stale contract'),
        };
        await page.screenshot({ path: path.join(output, 'hidden-lifecycle-error.png') });
      }
      assert.deepEqual(errors, []);
      console.log(
        `Manager header/footer/error/scope passed ${scenario.language}/${scenario.mode}/${scenario.width}x${scenario.height}`,
      );
      results.push({
        scenario,
        geometry,
        navigationGeometry,
        footerButtons,
        failureEvidence,
        errors,
      });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
console.log(
  JSON.stringify({
    cases: results.length,
    failures: results
      .filter((item) => !item.geometry.footerWithinViewport)
      .map((item) => item.scenario),
    output,
  }),
);

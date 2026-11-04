import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';
import { globalReportFixture } from '../src/app/modules/reporting/global-reports/report.fixture.ts';

// Isolated build assets and synthetic API/PDF data; never starts a server.
// Embedded geography navigation is development-only in the owning shell.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const embedded = process.argv.includes('--embedded');
const build = path.join(
  root,
  embedded ? 'dist/report-embedded/browser' : 'dist/erp-angular/browser',
);
const output = path.resolve(
  process.env.REPORT_VIEWER_ARTIFACTS ??
    path.join(root, '../.codex-tmp/report-runtime-review/sidebar-browser'),
);
const origin = 'https://localhost:4210';
const pdf = await fs.readFile(
  path.join(
    root,
    '../documentation/modules/reporting/features/global-crystal-template-manager/verification/vertical-lines/direction-en.pdf',
  ),
);
const text = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const catalogVersion = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)?.[0];
await fs.mkdir(output, { recursive: true });
const results = [];
for (const channel of ['chrome', 'msedge']) {
  const browser = await chromium.launch({ channel, headless: true });
  try {
    for (const language of ['en', 'ar']) {
      for (const width of [1213, 390]) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 1000 },
          colorScheme: 'light',
          reducedMotion: 'reduce',
          acceptDownloads: true,
        });
        const errors = [];
        let renders = 0;
        try {
          await context.route('**/*', async (route) => {
            const url = new URL(route.request().url());
            if (url.origin !== origin) return route.abort();
            const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
            const requested = path.resolve(build, relative);
            if (!requested.startsWith(build + path.sep)) return route.abort();
            const file = path.extname(relative) ? requested : path.join(build, 'index.html');
            const contentType =
              {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.woff2': 'font/woff2',
                '.svg': 'image/svg+xml',
              }[path.extname(file)] ?? 'application/octet-stream';
            try {
              await route.fulfill({ body: await fs.readFile(file), contentType });
            } catch {
              await route.fulfill({ status: 404, body: '' });
            }
          });
          await context.addCookies(
            Object.entries({ i18next: language, currentMode: 'light', themePalette: 'green' }).map(
              ([name, value]) => ({ name, value, url: origin }),
            ),
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
                  permissions: ['GlobalCrystalReports:View', 'Countries:View', 'Countries:Edit'],
                },
              };
            else if (url.pathname.endsWith('/runtime'))
              body = { catalogVersion, revision: 1, overrides: [] };
            else if (url.pathname.endsWith('/csrf')) body = { requestToken: 'fixture' };
            else if (url.pathname.endsWith('/getDashboardSummary')) body = dashboardFixture;
            else if (url.pathname === '/api/v1/countries')
              body = {
                items: [],
                metaData: {
                  currentPage: 1,
                  pageNumber: 1,
                  pageSize: 10,
                  totalCount: 0,
                  totalPages: 0,
                  hasNext: false,
                  hasPrev: false,
                },
              };
            else if (url.pathname.endsWith('/render')) {
              renders++;
              return route.fulfill({ contentType: 'application/pdf', body: pdf });
            } else if (url.pathname.endsWith('/global-crystal-reports'))
              body = [{ ...globalReportFixture, canDownloadSource: true }];
            return route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => errors.push(error.message));
          if (embedded) {
            await page.goto(origin + '/home');
            await page.getByTestId('open-data').getByRole('button').click();
            await page
              .getByRole('complementary')
              .getByRole('button', { name: text[language]['menu.countries'], exact: true })
              .click();
            await page.locator('[data-testid="countries"][data-kind="ready"]').waitFor();
            if (width >= 1024)
              await page
                .locator('.drawer-header')
                .getByRole('button', { name: text[language]['menu.closeSidebar'], exact: true })
                .click();
            const header = page.locator('erp-countries-read-page erp-page-header');
            const direct = header.locator('[data-view="report"] button');
            if (await direct.isVisible()) await direct.click();
            else {
              await header
                .getByRole('button', { name: text[language]['navigation.moreViews'], exact: true })
                .click();
              await page
                .locator('.overflow-views')
                .getByRole('button', { name: text[language]['views.report'], exact: true })
                .click();
            }
          } else await page.goto(origin + '/reports/global');
          const viewer = page.locator('erp-pdf-viewer');
          const workspace = page.locator('erp-report-workspace');
          const actions = workspace.locator('aside .document-actions nav');
          const iframe = viewer.locator('iframe');
          await iframe.waitFor({ timeout: 20000 });
          await page.evaluate(() => document.fonts.ready);
          const form = workspace.locator('erp-form form');
          const arrangement = await form.evaluate((element) => {
            const fields = Array.from(element.querySelectorAll('.form-content > [data-testid]'));
            const buttons = Array.from(element.querySelectorAll('footer button'));
            const bounds = element.getBoundingClientRect();
            return {
              fields: fields.map((field) => field.getAttribute('data-testid')),
              primaryFirst: buttons[0]?.type === 'submit' && buttons[1]?.type === 'button',
              icons: buttons.every((button) => button.querySelector('erp-icon svg')),
              aligned: buttons.every((button) => {
                const rect = button.getBoundingClientRect();
                return Math.abs(rect.width - (bounds.width - 32)) < 2;
              }),
              fits: [...fields, ...buttons].every((control) => {
                const rect = control.getBoundingClientRect();
                return rect.left >= bounds.left && rect.right <= bounds.right;
              }),
              sourceDownloadsInForm: element.querySelectorAll('[data-testid="download-source"]')
                .length,
            };
          });
          assert.deepEqual(arrangement.fields, ['report', 'nameAr', 'nameEn']);
          assert.equal(arrangement.primaryFirst, true);
          assert.equal(arrangement.icons, true);
          assert.equal(arrangement.aligned, true);
          assert.equal(arrangement.fits, true);
          assert.equal(arrangement.sourceDownloadsInForm, 0);
          await workspace.locator('aside').screenshot({
            path: path.join(output, `${channel}-${language}-${width}-search.png`),
          });
          const assertIndicator = async () => {
            await page
              .waitForFunction(() => {
                const tabs = document.querySelector('erp-report-workspace erp-content-tabs');
                const active = tabs?.querySelector('[role="tab"][aria-selected="true"]');
                const bar = tabs?.querySelector('.p-tablist-active-bar');
                if (!active || !bar) return false;
                const style = getComputedStyle(active);
                const inactive = tabs.querySelector('[role="tab"][aria-selected="false"]');
                return (
                  style.borderBottomWidth === '2px' &&
                  style.borderBottomColor === style.color &&
                  getComputedStyle(inactive).borderBottomColor === 'rgba(0, 0, 0, 0)' &&
                  bar.getBoundingClientRect().height === 0
                );
              })
              .catch(async (error) => {
                console.log(
                  JSON.stringify({
                    channel,
                    language,
                    width,
                    geometry: await workspace.evaluate((element) =>
                      Array.from(
                        element.querySelectorAll('[role="tab"], .p-tablist-active-bar'),
                      ).map((node) => ({
                        html: node.outerHTML,
                        rect: node.getBoundingClientRect().toJSON(),
                        style: {
                          left: getComputedStyle(node).left,
                          right: getComputedStyle(node).right,
                          width: getComputedStyle(node).width,
                          direction: getComputedStyle(node).direction,
                        },
                      })),
                    ),
                  }),
                );
                await workspace.screenshot({ path: path.join(output, 'indicator-failure.png') });
                throw error;
              });
          };
          await assertIndicator();
          const originalFrame = await iframe.elementHandle();
          const renderCount = renders;
          const draft = workspace.locator('[data-testid="nameEn"] input');
          await draft.fill('Country draft');
          const searchTab = workspace.getByRole('tab', {
            name: text[language]['general.search'],
            exact: true,
          });
          const optionsTab = workspace.getByRole('tab', {
            name: text[language]['reports.viewerOptions'],
            exact: true,
          });
          await optionsTab.click();
          await assertIndicator();
          await draft.waitFor({ state: 'hidden' });
          await actions.waitFor();
          const sourceDownload = workspace.getByTestId('download-source');
          await sourceDownload.waitFor();
          assert.equal(await actions.locator('a erp-icon svg').count(), 2);
          assert.equal(await sourceDownload.locator('erp-icon svg').count(), 1);
          await searchTab.click();
          await assertIndicator();
          assert.equal(await draft.inputValue(), 'Country draft');
          await actions.waitFor({ state: 'hidden' });
          await optionsTab.click();
          await assertIndicator();
          assert.equal(renders, renderCount);
          assert.equal(
            await iframe.evaluate((element, original) => element === original, originalFrame),
            true,
          );
          assert.equal(await actions.locator('a').count(), 2);
          assert.equal(await viewer.locator('nav').count(), 0);
          assert.equal(
            await iframe.evaluate(
              (frame) =>
                Math.abs(
                  frame.getBoundingClientRect().top -
                    frame.parentElement.getBoundingClientRect().top,
                ) < 1,
            ),
            true,
          );
          await iframe.scrollIntoViewIfNeeded();
          // Native PDF rendering is outside the application's DOM and load event.
          // Capture actual browser output for visual review, not an iframe.load assertion.
          await page.waitForTimeout(1800);
          const handle = await iframe.elementHandle();
          const source = await iframe.getAttribute('src');
          const before = renders;
          assert.ok(source.startsWith('blob:'));
          const styles = async () =>
            workspace.evaluate((element) => {
              const nav = element.querySelector('aside nav');
              const frame = element.querySelector('iframe');
              const expected = document.createElement('span');
              element.append(expected);
              expected.style.background = 'var(--surface)';
              const surface = getComputedStyle(expected).backgroundColor;
              expected.style.background = 'var(--muted)';
              const muted = getComputedStyle(expected).backgroundColor;
              expected.style.color = 'var(--foreground)';
              const foreground = getComputedStyle(expected).color;
              expected.remove();
              return {
                nav: getComputedStyle(nav).backgroundColor,
                navColor: getComputedStyle(nav).color,
                foreground,
                frame: getComputedStyle(frame).backgroundColor,
                scheme: getComputedStyle(frame).colorScheme,
                surface,
                muted,
                filtered: getComputedStyle(frame).filter,
                horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
              };
            });
          const light = await styles();
          assert.equal(light.navColor, light.foreground);
          assert.equal(light.frame, light.muted);
          assert.equal(light.scheme, 'light');
          await workspace.screenshot({
            path: path.join(output, `${channel}-${language}-${width}-light.png`),
          });
          const switchTheme = page.getByRole('button', {
            name: text[language]['general.darkMode'],
            exact: true,
          });
          if (!(await switchTheme.first().isVisible())) {
            await page
              .getByRole('banner')
              .getByRole('button', { name: text[language]['menu.settings'], exact: true })
              .click();
          }
          await switchTheme.filter({ visible: true }).first().click();
          await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
          await page.keyboard.press('Escape');
          await iframe.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          const dark = await styles();
          assert.equal(dark.navColor, dark.foreground);
          assert.equal(dark.frame, dark.muted);
          assert.equal(dark.scheme, 'dark');
          assert.equal(dark.filtered, 'none');
          assert.notEqual(light.navColor, dark.navColor);
          assert.equal(dark.horizontalOverflow, false);
          assert.equal(
            await iframe.evaluate((element, original) => element === original, handle),
            true,
          );
          assert.equal(await iframe.getAttribute('src'), source);
          assert.equal(renders, before);
          await workspace.screenshot({
            path: path.join(output, `${channel}-${language}-${width}-dark.png`),
          });
          const downloadLink = actions.locator('a[download]');
          const [download] = await Promise.all([
            page.waitForEvent('download'),
            downloadLink.click(),
          ]);
          assert.deepEqual(await fs.readFile(await download.path()), pdf);
          const open = actions.locator('a[target="_blank"]');
          assert.equal(await open.getAttribute('href'), source);
          assert.equal(await open.getAttribute('rel'), 'noopener noreferrer');
          const [popup] = await Promise.all([page.waitForEvent('popup'), open.click()]);
          await popup.waitForLoadState('domcontentloaded');
          assert.equal(popup.url(), source);
          await popup.close();
          if (!embedded) {
            await page.locator('erp-global-report-view [data-testid="language"] button').click();
            await page.waitForFunction((previousSource) => {
              const frame = document.querySelector('erp-pdf-viewer iframe');
              return frame?.src.startsWith('blob:') && frame.src !== previousSource;
            }, source);
            await assertIndicator();
            const switchedLanguage = language === 'en' ? 'ar' : 'en';
            await workspace
              .getByRole('tab', { name: text[switchedLanguage]['general.search'], exact: true })
              .click();
            await assertIndicator();
            assert.equal(await draft.inputValue(), 'Country draft');
            await workspace
              .getByRole('tab', {
                name: text[switchedLanguage]['reports.viewerOptions'],
                exact: true,
              })
              .click();
            await assertIndicator();
            assert.equal(renders, before + 1);
          }
          assert.deepEqual(errors, []);
          results.push({
            channel,
            language,
            width,
            embedded,
            arrangement,
            light,
            dark,
            noRerenderOnTheme: true,
            originalDownloadBytes: true,
            sidebarActions: true,
            horizontalSidebarTabs: true,
            activeIndicatorAligned: true,
            activeIndicatorAlignedAfterLiveLanguageChange: !embedded,
            draftAndDocumentPreservedOnTabChange: true,
            noToolbarAboveDocument: true,
            newPdfTab: true,
            errors,
          });
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
}
await fs.writeFile(
  path.join(output, 'browser-results.json'),
  JSON.stringify(results, null, 2) + '\n',
);
console.log(JSON.stringify({ passed: results.length, output }));

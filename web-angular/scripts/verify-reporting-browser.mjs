import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import { themePaletteOrder } from '@app/tokens';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { globalReportFixture } from '../src/app/modules/reporting/global-reports/report.fixture.ts';

const app = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const focused = process.argv.includes('--focused');
const output = path.resolve(app, '../.codex-tmp/angular-reporting');
const captures = path.join(output, focused ? 'focused' : 'full');
fs.mkdirSync(captures, { recursive: true });
const captions = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const version = fs.readFileSync(path.join(app, 'src/app/platform/localization/catalog.generated.ts'), 'utf8').match(/[a-f0-9]{64}/)[0];
// A complete one-page PDF fixture with a valid xref. This is not output from a live RPT engine.
function pdfFixture() {
  const stream = 'BT /F1 18 Tf 36 140 Td (Managed PDF acceptance fixture) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 420 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let text = '%PDF-1.4\n'; const offsets = [0];
  for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(text)); text += `${index + 1} 0 obj\n${object}\nendobj\n`; }
  const xref = Buffer.byteLength(text); text += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(text);
}
const pdf = pdfFixture(), results = [], browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const palette of (focused ? ['green'] : themePaletteOrder)) for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1050 }, reducedMotion: 'reduce', acceptDownloads: true });
    await context.addCookies(Object.entries({ themePalette: palette, currentMode: mode, i18next: language }).map(([name, value]) => ({ name, value, url: origin })));
    await context.addInitScript(({ fallback }) => {
      const made = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
      window.pdfLeases = { created: [], revoked: [] };
      URL.createObjectURL = blob => { const url = made(blob); window.pdfLeases.created.push(url); return url; };
      URL.revokeObjectURL = url => { window.pdfLeases.revoked.push(url); revoke(url); };
      if (fallback) Object.defineProperty(navigator, 'pdfViewerEnabled', { value: false });
    }, { fallback: focused && width === 390 });
    const state = { mode: 'ready', catalogs: 0, renders: [], sessions: 0, csrf: 0, permitted: true, hash: globalReportFixture.rowVersion, holdRender: false, holdCsrf: false, releaseRender: null, releaseCsrf: null };
    const errors = [], hotUpdates = [], apiErrors = []; let nativeDialogs = 0;
    await context.route('**/api/**', async route => {
      try {
        const request = route.request(), url = new URL(request.url()), endpoint = url.pathname;
        assert.equal(url.origin, api); assert.equal(request.headers().authorization, undefined);
        let body, status = 200;
        if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh')) {
          state.sessions++; body = { isAuthenticated: true, user: { ...sessionFixture, roles: ['super_admin'], permissions: state.permitted ? ['GlobalCrystalReports:View'] : [] } };
        } else if (endpoint.endsWith('/csrf')) {
          state.csrf++; if (state.holdCsrf) await new Promise(resolve => { state.releaseCsrf = resolve; });
          body = { requestToken: 'report-csrf-fixture' };
        } else if (endpoint.endsWith('/runtime')) body = { catalogVersion: version, revision: 1, overrides: [] };
        else if (endpoint.endsWith('/global-crystal-reports')) {
          state.catalogs++; assert.equal(url.searchParams.get('entityKey'), 'countries');
          body = state.mode === 'empty' ? [] : state.mode === 'catalog-invalid' ? [{ broken: true }] : [{ ...globalReportFixture, rowVersion: state.hash }, { ...globalReportFixture, id: 'c'.repeat(64), reportKey: 'countries-alt', displayName: 'Alternative fixture', summarySubject: 'Alternative fixture', summaryTitle: 'تقرير بديل', rowVersion: 'd'.repeat(64) }];
        } else if (endpoint.endsWith('/render')) {
          assert.equal(request.method(), 'POST'); assert.equal(request.headers()['x-erp-xsrf'], 'report-csrf-fixture');
          const render = request.postDataJSON(); state.renders.push({ ...render, source: endpoint.split('/').at(-2) });
          assert.equal(render.entityKey, 'countries'); assert.ok(['en', 'ar'].includes(render.language));
          if (state.holdRender) await new Promise(resolve => { state.releaseRender = resolve; });
          if (state.mode === 'stale') status = 409;
          else if (state.mode === 'forbidden') status = 403;
          else if (state.mode === 'validation') status = 400;
          else if (state.mode === 'offline') status = 503;
          else if (state.mode === 'invalid') { await route.fulfill({ contentType: 'application/pdf', body: Buffer.from('{"error":true}') }); return; }
          else if (state.mode === 'json') { await route.fulfill({ contentType: 'application/json', body: '{}' }); return; }
          else if (state.mode === 'empty-pdf') { await route.fulfill({ contentType: 'application/pdf', body: Buffer.alloc(0) }); return; }
          if (status === 200) { await route.fulfill({ contentType: 'application/pdf', body: pdf }); return; }
          body = status === 400 ? { errors: { 'Filters.NameEn': ['Server fixture rejection'], unknown: ['must stay hidden'] } } : { title: 'Fixture rejection' };
        } else throw Error('Unexpected reporting API ' + endpoint);
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      } catch (error) {
        if (/Target.*closed|Route is already handled|Invalid InterceptionId|interception.*not found/i.test(String(error))) return;
        apiErrors.push(String(error)); await route.abort().catch(() => {});
      }
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', async dialog => { nativeDialogs++; await dialog.dismiss(); });
    page.on('websocket', socket => socket.on('framereceived', frame => { try { const message = JSON.parse(String(frame.payload)); if (message.type === 'full-reload' || message.event === 'angular:component-update') hotUpdates.push(message.type); } catch {} }));
    const view = page.locator('erp-global-report-view'), viewer = page.locator('erp-pdf-viewer');
    const input = id => page.getByTestId(id).locator('input');
    const button = id => page.getByTestId(id).getByRole('button');
    const search = () => page.getByTestId('criteria').locator('button[type=submit]').click();
    const ready = () => expect(viewer.locator('a[download]')).toBeVisible();
    const rendered = async action => {
      const previous = await viewer.locator('a[download]').count() ? await viewer.locator('a[download]').getAttribute('href') : null, count = state.renders.length;
      await action(); await expect.poll(() => state.renders.length).toBe(count + 1);
      await ready(); if (previous) await expect(viewer.locator('a[download]')).not.toHaveAttribute('href', previous);
    };
    const heading = key => view.getByRole('heading', { name: captions[language][key], exact: true });
    const fresh = async () => { state.mode = 'ready'; state.holdRender = false; state.holdCsrf = false; state.permitted = true; await page.goto(origin + '/dev/reports'); await ready(); };
    await fresh(); await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('html')).toHaveAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    assert.equal(state.catalogs, 1); assert.equal(state.renders.length, 1); assert.equal(state.renders[0].language, language);
    assert.equal(await page.getByTestId('criteria').locator('form').getAttribute('novalidate'), '');
    const currentUrl = await viewer.locator('a[download]').getAttribute('href'); assert.ok(currentUrl.startsWith('blob:' + origin + '/'));
    await expect(viewer.locator('a[target=_blank]')).toHaveAttribute('rel', 'noopener noreferrer');
    if (focused && width === 390) { await expect(viewer.locator('iframe')).toHaveCount(0); await expect(viewer.locator('[role=status]')).toContainText(captions[language]['reports.previewUnavailable']); }
    else await expect(viewer.locator('iframe')).toHaveAttribute('src', currentUrl);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const geometry = await page.locator('erp-report-workspace').evaluate(element => ({ width: element.getBoundingClientRect().width, viewport: innerWidth, page: document.documentElement.scrollWidth }));
    await page.screenshot({ path: path.join(captures, `${palette}-${mode}-${language}-${width}-ready.png`), fullPage: true, animations: 'disabled' });
    if (focused) {
      const downloadPromise = page.waitForEvent('download'); await viewer.locator('a[download]').click();
      const download = await downloadPromise; assert.equal(download.suggestedFilename(), 'countries-' + globalReportFixture.id.slice(0, 16) + '.pdf');
      const downloaded = await download.path(); assert.deepEqual(fs.readFileSync(downloaded), pdf);
      await input('nameAr').fill('مصر'); let before = state.renders.length;
      await rendered(() => button('language').click()); await expect.poll(() => state.renders.length).toBe(before + 1);
      assert.deepEqual(state.renders.at(-1).filters, {}); await expect(input('nameAr')).toHaveValue('مصر');
      await rendered(() => button('language').click()); before = state.renders.length;
      await rendered(search); assert.equal(state.renders.length, before + 1); assert.deepEqual(state.renders.at(-1).filters, { NameAr: 'مصر' });
      await expect.poll(() => page.evaluate(url => window.pdfLeases.revoked.includes(url), currentUrl)).toBe(true);
      await page.getByTestId('report').getByRole('combobox').click();
      await rendered(() => page.getByRole('option', { name: language === 'ar' ? 'تقرير بديل' : 'Alternative fixture', exact: true }).click());
      assert.equal(state.renders.at(-1).source, 'c'.repeat(64)); assert.deepEqual(state.renders.at(-1).filters, { NameAr: 'مصر' });
      before = state.renders.length; await rendered(() => button('reset').click()); assert.equal(state.renders.length, before + 1); assert.deepEqual(state.renders.at(-1).filters, {});
      // Programmatic value bypasses maxlength to exercise shared submit validation.
      await input('nameEn').evaluate(element => { element.value = 'x'.repeat(201); element.dispatchEvent(new Event('input', { bubbles: true })); });
      before = state.renders.length; await search(); await expect(view.locator('.error-summary a')).toHaveCount(1); await expect(input('nameEn')).toBeFocused(); assert.equal(state.renders.length, before);
      await input('nameEn').fill('Egypt'); state.mode = 'validation'; await search();
      await expect(page.getByTestId('nameEn').locator('.error')).toHaveText('Server fixture rejection'); await expect(viewer).toHaveCount(0); await expect(view).not.toContainText('must stay hidden');
      await page.screenshot({ path: path.join(captures, `${mode}-${language}-${width}-field-error.png`), fullPage: true, animations: 'disabled' });
      for (const outcome of ['invalid', 'json', 'empty-pdf', 'offline']) {
        await fresh(); state.mode = outcome; await search(); await expect(viewer).toHaveCount(0);
        await expect(heading(outcome === 'offline' ? 'common.error' : 'reports.invalidPdf')).toBeVisible();
        state.mode = 'ready'; await view.getByRole('button', { name: captions[language]['actions.retry'], exact: true }).click(); await ready();
      }
      await fresh(); state.mode = 'stale'; await search(); await expect(heading('reports.sourceChanged')).toBeVisible(); await expect(viewer).toHaveCount(0);
      before = state.renders.length; await button('language').click(); await expect.poll(() => state.renders.length).toBe(before);
      state.mode = 'ready'; state.hash = 'e'.repeat(64); await rendered(() => button('reload').click()); assert.equal(state.renders.at(-1).expectedSha256, state.hash);
      await rendered(() => button('language').click());
      state.mode = 'forbidden'; await search(); await expect(heading('authorization.forbidden.title')).toBeVisible(); await expect(viewer).toHaveCount(0);
      before = state.renders.length; await button('reload').click(); assert.equal(state.renders.length, before);
      await fresh(); state.holdRender = true; await search(); await expect.poll(() => !!state.releaseRender).toBe(true); await expect(viewer).toHaveCount(0);
      state.permitted = false; const sessions = state.sessions;
      await page.evaluate(() => { const channel = new BroadcastChannel('erp-browser-session-context'); channel.postMessage({ kind: 'session-changed' }); channel.close(); });
      await expect.poll(() => state.sessions).toBeGreaterThan(sessions); await expect(heading('authorization.forbidden.title')).toBeVisible();
      state.holdRender = false; state.releaseRender(); await expect(viewer).toHaveCount(0);
      before = state.renders.length; const catalogs = state.catalogs; await page.reload(); await expect(heading('authorization.forbidden.title')).toBeVisible(); assert.equal(state.catalogs, catalogs); assert.equal(state.renders.length, before);
      await fresh(); state.holdCsrf = true; state.releaseCsrf = null; before = state.renders.length;
      await search(); await expect.poll(() => !!state.releaseCsrf).toBe(true); await expect(viewer).toHaveCount(0);
      // Browser history navigation goes through the real Router without replacing the document.
      await page.evaluate(() => { history.pushState(null, '', '/dev/reads'); dispatchEvent(new PopStateEvent('popstate')); });
      await expect(page.getByTestId('state')).toHaveAttribute('data-kind', 'ready');
      state.holdCsrf = false; state.releaseCsrf();
      await expect.poll(() => page.evaluate(() => window.pdfLeases.created.length === window.pdfLeases.revoked.length)).toBe(true);
      assert.equal(state.renders.length, before);
      for (const outcome of ['empty', 'catalog-invalid']) {
        state.mode = outcome; await page.goto(origin + '/dev/reports');
        await expect(heading(outcome === 'empty' ? 'reports.noResultsFound' : 'common.error')).toBeVisible(); await expect(viewer).toHaveCount(0);
      }
    }
    assert.deepEqual(errors, []); assert.deepEqual(hotUpdates, [], 'Source changed during acceptance'); assert.deepEqual(apiErrors, []); assert.equal(nativeDialogs, 0);
    results.push({ palette, mode, language, width, geometry, focused, renders: state.renders.length, passed: true });
    await context.close(); console.log(`Managed PDF passed ${palette}/${mode}/${language}/${width}${focused ? ' lifecycle' : ''}`);
  }
  fs.writeFileSync(path.join(output, focused ? 'focused-results.json' : 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Managed PDF: ${results.length} ${focused ? 'focused lifecycle' : 'visual'} cases passed. Mock PDF/API only; no live RPT or physical-device claim.`);
} finally { await browser.close(); }

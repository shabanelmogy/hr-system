import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { fiscalContextFixture } from '../src/app/modules/accounting/fiscal-year-context/fiscal-context.fixture.ts';

const root = path.resolve(import.meta.dirname, '..'), origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const output = path.resolve(root, '../.codex-tmp/angular-unsaved'); fs.mkdirSync(output, { recursive: true });
const resources = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'));
const version = fs.readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8').match(/[a-f0-9]{64}/)[0];
const companies = [{ id: 1, companyCode: 'ONE', nameAr: 'الأولى', nameEn: 'First' }, { id: 2, companyCode: 'TWO', nameAr: 'الثانية', nameEn: 'Second' }];
const browser = await chromium.launch({ channel: 'chrome', headless: true }), results = [];
try {
  for (const language of ['en', 'ar']) for (const mode of ['light', 'dark']) for (const width of [390, 1440]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await context.addCookies(Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({ name, value, url: origin })));
    const state = { company: 1, year: 1, authenticated: true, companyWrites: 0, yearWrites: 0, logouts: 0, runtimeReads: 0, sessions: 0 };
    const user = () => ({ ...sessionFixture, companyId: state.company, companyCode: companies[state.company - 1].companyCode,
      companyNameAr: companies[state.company - 1].nameAr, companyNameEn: companies[state.company - 1].nameEn, companies, permissions: ['FiscalYears:View'] });
    await context.route('**/api/**', async route => {
      const request = route.request(), endpoint = new URL(request.url()).pathname; let body, status = 200;
      assert.equal(request.headers().authorization, undefined);
      if (endpoint.endsWith('/csrf')) body = { requestToken: 'synthetic' };
      else if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh')) { state.sessions++; status = state.authenticated ? 200 : 401; body = { isAuthenticated: true, user: user() }; }
      else if (endpoint.endsWith('/switch-company')) {
        state.companyWrites++; assert.equal(request.headers()['x-erp-xsrf'], 'synthetic'); state.company = request.postDataJSON().companyId; body = { isAuthenticated: true, user: user() };
      } else if (endpoint.endsWith('/fiscal-years/context')) {
        if (request.method() === 'PUT') { state.yearWrites++; assert.equal(request.headers()['x-erp-xsrf'], 'synthetic'); state.year = request.postDataJSON().fiscalYearId; }
        body = { ...fiscalContextFixture, selectedFiscalYear: fiscalContextFixture.availableFiscalYears[state.year - 1], hasUserOverride: state.year !== 1 };
      } else if (endpoint.endsWith('/runtime')) { state.runtimeReads++; body = { tenantId: sessionFixture.tenantId, companyId: state.company, catalogVersion: version, revision: 1, defaultLanguage: 'en', overrides: [] }; }
      else if (endpoint.endsWith('/logout')) { state.logouts++; state.authenticated = false; status = 204; }
      else throw Error('Unexpected unsaved context fixture API ' + endpoint);
      await route.fulfill({ status, contentType: 'application/json', ...(body ? { body: JSON.stringify(body) } : {}) });
    });
    const page = await context.newPage(), errors = []; page.on('pageerror', error => errors.push(error.message));
    let nativeDialogs = 0; page.on('dialog', async dialog => { nativeDialogs++; await dialog.dismiss(); });
    await page.goto(origin + '/dev/unsaved-context');
    const core = resources[language], view = page.getByTestId('context-state'), name = page.getByTestId('name').locator('input');
    const prompt = page.getByRole('dialog', { name: core['messages.unsavedChangesTitle'], exact: true });
    const cancel = prompt.locator('.dialog-actions').getByRole('button', { name: core['actions.cancel'], exact: true });
    const discard = prompt.getByRole('button', { name: core['messages.discardChanges'], exact: true });
    const chooseCompany = async () => { await page.getByTestId('company').getByRole('combobox').click(); await page.getByRole('option', { name: language === 'ar' ? 'الثانية' : 'Second', exact: true }).click(); };
    const chooseYear = async () => { await page.locator('erp-fiscal-context').getByRole('combobox').click(); await page.getByRole('option', { name: new RegExp(language === 'ar' ? 'السنة 2027' : 'Year 2027') }).click(); };
    await expect(view).toHaveAttribute('data-year', '1'); await name.fill('Registered draft');
    const runtimeReads = state.runtimeReads;
    await chooseCompany(); await expect(prompt).toBeVisible(); await expect(view).toHaveAttribute('data-pending', 'false');
    assert.equal(state.companyWrites, 0); assert.equal(state.runtimeReads, runtimeReads); await cancel.click(); await expect(name).toHaveValue('Registered draft');
    await expect(page.getByTestId('company').getByRole('combobox')).toContainText(language==='ar'?'الأولى':'First');
    await chooseYear(); await expect(prompt).toBeVisible(); assert.equal(state.yearWrites, 0); await cancel.click(); await expect(view).toHaveAttribute('data-year', '1');
    await page.getByTestId('logout').getByRole('button').click(); await expect(prompt).toBeVisible(); await cancel.click(); assert.equal(state.logouts, 0); await expect(name).toHaveValue('Registered draft');
    await page.getByTestId('busy').getByRole('button').click(); await chooseCompany(); await expect(prompt).toHaveCount(0); assert.equal(state.companyWrites, 0);
    await page.getByTestId('busy').getByRole('button').click();
    await chooseCompany(); await expect(prompt).toBeVisible(); await discard.click();
    await expect(view).toHaveAttribute('data-company', '2'); await expect(view).toHaveAttribute('data-active', 'false'); assert.equal(state.companyWrites, 1);
    await page.getByTestId('reopen').getByRole('button').click(); await name.fill('Year draft'); await chooseYear(); await expect(prompt).toBeVisible(); await discard.click();
    await expect(view).toHaveAttribute('data-year', '2'); await expect(view).toHaveAttribute('data-active', 'false'); assert.equal(state.yearWrites, 1);
    // A same-scope external hint cancels old consent, but does not discard an unchanged draft.
    await page.getByTestId('reopen').getByRole('button').click(); await name.fill('External draft');
    const sessionReads = state.sessions;
    await page.evaluate(() => { const channel = new BroadcastChannel('erp-browser-session-context'); channel.postMessage({ kind: 'session-changed' }); channel.close(); });
    // The actual channel name comes from the existing SessionContextEvents contract.
    await expect.poll(() => state.sessions).toBeGreaterThan(sessionReads);
    await expect(view).toHaveAttribute('data-pending', 'false'); await expect(name).toHaveValue('External draft'); await expect(view).toHaveAttribute('data-active', 'true');
    await expect(view).toHaveAttribute('data-year','2');
    await expect(page.locator('erp-fiscal-context').getByRole('combobox')).toContainText(language==='ar'?'السنة 2027':'Year 2027');
    await page.screenshot({ path: path.join(output, `${mode}-${language}-${width}-context.png`), fullPage: true, animations: 'disabled' });
    await page.getByTestId('logout').getByRole('button').click(); await expect(prompt).toBeVisible(); await discard.click();
    await expect(view).toHaveAttribute('data-company', ''); await expect(view).toHaveAttribute('data-active', 'false'); assert.equal(state.logouts, 1);
    assert.deepEqual(errors, []); assert.equal(nativeDialogs, 0);
    results.push({ language, mode, width, companyWrites: state.companyWrites, yearWrites: state.yearWrites, logouts: state.logouts, passed: true });
    console.log(`Context passed ${language}/${mode}/${width}`); await context.close();
  }
  fs.writeFileSync(path.join(output, 'context-results.json'), JSON.stringify(results, null, 2)); console.log('Unsaved actual context owners:8 intercepted company/year/logout/cancel/busy/external flows passed.');
} finally { await browser.close(); }

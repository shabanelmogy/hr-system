import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(app, '../.codex-tmp/login-parity'); fs.mkdirSync(output, { recursive: true });
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4210';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://localhost:7037';
const nextOrigin = process.env.NEXT_PREVIEW_ORIGIN ?? 'https://localhost:3000';
const authText = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/platform-auth.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const version = fs.readFileSync(path.join(app, 'src/app/platform/localization/catalog.generated.ts'), 'utf8').match(/[a-f0-9]{64}/)[0];
const user = { userId: 'fixture-user', tenantId: 'fixture-tenant', tenantName: 'Fixture Tenant', tenantPlanName: 'Fixture Plan', companyId: 1,
  companyCode: 'TEST', companyNameAr: 'شركة اختبار', companyNameEn: 'Fixture Company', companies: [], userName: 'fixture',
  email: 'fixture@example.test', firstName: 'Fixture', lastName: 'User', roles: ['user'], permissions: [], tenantSubscriptionStatus: 'Active',
  tenantSubscriptionEndsOn: null, tenantReadOnly: false, expiresAt: 2_000_000_000 };
const session = { isAuthenticated: true, user };
const browser = await chromium.launch({ channel: 'chrome' });
const results = []; const errors = [];
const t = (language, key) => authText[language][key];
async function context(language = 'en', width = 1440, mode = 'light', url = origin) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
  await context.addCookies(Object.entries({ i18next: language, currentMode: mode, themePalette: 'green' }).map(([name, value]) => ({ name, value, url })));
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  return context;
}
async function mock(context) {
  const state = { authenticated: false, action: 'invalid', posts: [] };
  await context.route(api + '/api/**', async route => {
    const request = route.request(); const pathname = new URL(request.url()).pathname;
    let status = 200; let body;
    if (request.method() === 'POST') state.posts.push({ path: pathname, csrf: !!request.headers()['x-erp-xsrf'], credentials: request.headers()['authorization'] === undefined });
    const tenant = { isAuthenticated: false, requiresTenantSelection: true, tenantSelectionToken: 'fixture-selection',
      tenantSelectionTokenExpiration: new Date(Date.now() + 60_000).toISOString(), tenants: [{ id: 'fixture-tenant', name: 'Tenant A', identifier: 'TEST' }] };
    const company = { isAuthenticated: false, requiresCompanySelection: true, companySelectionToken: 'fixture-company',
      companySelectionTokenExpiration: new Date(Date.now() + 60_000).toISOString(), companies: [{ id: 1, companyCode: 'TEST', nameAr: 'شركة اختبار', nameEn: 'Fixture Company' }] };
    if (pathname.endsWith('/csrf')) body = { requestToken: 'fixture-csrf' };
    else if (pathname.endsWith('/session')) { body = session; if (!state.authenticated) status = 401; }
    else if (pathname.endsWith('/refresh')) { body = session; if (!state.authenticated) status = 401; }
    else if (pathname.endsWith('/login')) {
      body = state.action === 'tenant' ? tenant : session;
      if (state.action === 'invalid') status = 401;
      else if (state.action === 'unavailable') status = 503;
      else if (state.action === 'malformed') body = { accessToken: 'invalid-response' };
      else if (state.action === 'success') state.authenticated = true;
    } else if (pathname.endsWith('/select-tenant')) body = company;
    else if (pathname.endsWith('/select-company')) { body = session; state.authenticated = true; }
    else if (pathname.endsWith('/logout')) { state.authenticated = false; body = {}; }
    else if (pathname.endsWith('/company-localizations/runtime')) body = { tenantId: user.tenantId, companyId: 1, defaultLanguage: 'en', revision: 1, catalogVersion: version,
      overrides: [{ namespace: 'core', key: 'general.mainTitle', language: 'en', value: 'Scoped title from SQL fixture' }] };
    else if (pathname.endsWith('/forgetPassword')) body = {};
    else if (pathname.endsWith('/modules/accessible')) body = [];
    else throw new Error('Unexpected API contract: ' + pathname);
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body ?? {}) });
  });
  return state;
}
async function ready(page, url = origin + '/login') {
  await page.goto(url); await page.locator('input[autocomplete=username]').waitFor();
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
}
try {
  for (const mode of ['light', 'dark']) for (const language of ['en', 'ar']) for (const width of [390, 1440]) {
    const c = await context(language, width, mode); await mock(c); const p = await c.newPage(); await ready(p, origin + '/');
    await expect(p).toHaveURL(origin + '/login');
    assert.equal(await p.locator('form').evaluate(e => e.noValidate), true);
    await expect(p.locator('button[type=submit]')).toBeEnabled();
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await p.evaluate(() => document.documentElement.dir), language === 'ar' ? 'rtl' : 'ltr');
    if (width === 1440) {
      await expect(p.locator('erp-option-select .p-select-label').first()).toHaveText(language==='ar'?'العربية':'English');
      await expect(p.locator('erp-option-select select')).toHaveCount(0);
    }
    await p.screenshot({ path: path.join(output, `angular-${language}-${width}-${mode}.png`), fullPage: true });
    const actual = await p.locator('.auth-card').boundingBox();
    const submit = await p.locator('button[type=submit]').boundingBox();
    if (process.argv.includes('--compare-next')) {
      const referenceContext = await context(language, width, mode, nextOrigin); const reference = await referenceContext.newPage();
      await reference.goto(nextOrigin + '/login'); await reference.locator('input[type=password]').waitFor();
      await reference.evaluate(() => document.fonts.ready); await reference.waitForTimeout(1600);
      const expected = await reference.locator('.MuiPaper-root').evaluateAll(elements => {
        const element = elements.find(e => e.tagName === 'DIV' && e.getBoundingClientRect().width > 200);
        const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      const expectedSubmit = await reference.locator('button[type=submit]').boundingBox();
      for (const key of ['x', 'y', 'width', 'height']) {
        assert.ok(Math.abs(actual[key] - expected[key]) <= 1, `Card ${language}/${width}/${mode} ${key}: ${actual[key]} vs ${expected[key]}`);
        assert.ok(Math.abs(submit[key] - expectedSubmit[key]) <= 1, `Submit ${language}/${width}/${mode} ${key}`);
      }
      await reference.screenshot({ path: path.join(output, `next-${language}-${width}-${mode}.png`), fullPage: true });
      await referenceContext.close();
    }
    await p.locator("button[type=submit]").click(); await expect(p.locator(".error-count")).toHaveText("2"); await expect(p.locator(".error-badge")).toHaveCount(2); await p.locator(".error-badge").nth(1).click(); await expect(p.locator("input[autocomplete=current-password]")).toBeFocused(); assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); await p.screenshot({ path: path.join(output, `validation-${language}-${width}-${mode}.png`), fullPage:true });
    results.push({ kind: 'visual', language, width, mode, card: actual, submit }); await c.close();
  }
  for (const language of ['en', 'ar']) {
    const c = await context(language, 390); const state = await mock(c); const p = await c.newPage(); await ready(p);
    const username = p.locator('input[autocomplete=username]'); const password = p.locator('input[autocomplete=current-password]');
    await p.locator('button[type=submit]').click(); await expect(p.locator('.error')).toHaveCount(2); await expect(username).toBeFocused();
    await username.fill('fixture'); await password.fill('synthetic'); await p.locator('button[type=submit]').click();
    await expect(p.locator('.form-feedback')).toHaveText(t(language, 'angularAuth.invalidCredentials'));
    state.action = 'tenant'; await p.locator('button[type=submit]').click();
    const dialog = p.getByRole('dialog'); await expect(dialog).toBeVisible(); assert.notEqual(await dialog.locator('..').evaluate(e => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0)'); await expect(dialog).toHaveAccessibleName(t(language, 'auth.selectTenant')); await expect(dialog.getByRole('button', { name: core[language]['actions.close'], exact: true })).toBeVisible(); await p.screenshot({ path: path.join(output, `tenant-dialog-${language}.png`), fullPage: true });
    await p.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(password).toHaveValue('');
    await password.fill('synthetic'); await p.locator('button[type=submit]').click();
    await dialog.getByRole('button', { name: /Tenant A/ }).click();
    await dialog.getByRole('button', { name: t(language, 'auth.continueToTenant'), exact: true }).click();
    await dialog.getByRole('button', { name: new RegExp(language === 'ar' ? 'شركة اختبار' : 'Fixture Company') }).click();
    await dialog.getByRole('button', { name: t(language, 'auth.continueToCompany'), exact: true }).click();
    await expect(p).toHaveURL(origin + '/apps'); await expect(p.getByRole('img', { name: 'Fixture User', exact: true }).first()).toBeVisible();
    if (language === 'en') await expect(p.locator('.brand')).toHaveText('Scoped title from SQL fixture');
    await p.reload(); await expect(p.getByRole('img', { name: 'Fixture User', exact: true }).first()).toBeVisible();
    await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();
    await p.getByRole('dialog', { name: core[language]['menu.settings'], exact: true }).getByRole('button', { name: new RegExp('^' + core[language]['auth.logout']) }).click(); await expect(p).toHaveURL(origin + '/login');
    await expect(p.locator('.brand')).toHaveText(core[language]['general.mainTitle']);
    assert.ok(state.posts.filter(value => value.path.includes('/browser-auth/')).every(value => value.csrf && value.credentials));
    assert.equal(await p.evaluate(() => localStorage.length + sessionStorage.length), 0);
    await p.goto(origin + '/unknown'); await expect(p).toHaveURL(origin + '/login');
    await p.goto(origin + '/home'); await expect(p).toHaveURL(origin + '/login');
    await username.fill('fixture'); await password.fill('synthetic'); state.action = 'unavailable'; await p.locator('button[type=submit]').click();
    await expect(p.locator('.form-feedback')).toHaveText(t(language, 'angularAuth.unavailable')); await expect(p.locator('button[type=submit]')).toBeEnabled();
    state.action = 'malformed'; await p.locator('button[type=submit]').click();
    await expect(p.locator('.form-feedback')).toHaveText(t(language, 'angularAuth.authenticationFailed'));
    await p.goto(origin + '/forgetPassword'); await p.locator('input[type=email]').fill('fixture@example.test'); await p.locator('button[type=submit]').click();
    await expect(p.locator('.form-feedback')).toHaveText(t(language, 'angularAuth.passwordRequestSent'));
    results.push({ kind: 'workflow', language, passed: true }); await c.close();
  }
  if (process.argv.includes('--live')) {
    const c = await context(); const p = await c.newPage(); const statuses = [];
    p.on('response', response => { if (response.url().includes('/api/')) statuses.push({ path: new URL(response.url()).pathname, status: response.status() }); });
    await ready(p); await p.locator('.demo-superadmin button').click(); await expect(p).toHaveURL(origin + '/home', { timeout: 30_000 });
    await p.reload(); await expect(p).toHaveURL(origin + '/home'); await expect(p.locator('[data-dashboard=ready]')).toBeVisible();
    const cookies = (await c.cookies()).filter(value => /erp-angular-(access|refresh)$/.test(value.name));
    assert.equal(cookies.length, 2); assert.ok(cookies.every(value => value.secure && value.httpOnly));
    assert.equal(await p.evaluate(() => document.cookie.includes('erp-angular-access') || document.cookie.includes('erp-angular-refresh')), false);
    await p.locator('.workspace-actions erp-popover-panel>erp-button button').click();
    await p.getByRole('dialog', { name: core.en['menu.settings'], exact: true })
      .getByRole('button', { name: new RegExp('^' + core.en['auth.logout']) }).click();
    await expect(p).toHaveURL(origin + '/login');
    assert.equal((await c.cookies()).filter(value => /erp-angular-(access|refresh)$/.test(value.name)).length, 0);
    assert.ok(statuses.some(value => value.path.endsWith('/system-ui-localizations/runtime') && value.status === 200));
    results.push({ kind: 'live-api-sql', passed: true, statuses }); await c.close();
  }
  assert.deepEqual(errors, []); fs.writeFileSync(path.join(output, 'login-results.json'), JSON.stringify(results, null, 2));
  console.log(`Login browser acceptance passed: ${results.length} scenarios; Next comparison=${process.argv.includes('--compare-next')}; live API=${process.argv.includes('--live')}.`);
} finally { await browser.close(); }

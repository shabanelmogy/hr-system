import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { tenantFixture } from '../src/app/platform/tenants/management/tenant.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(root, '../.codex-tmp/angular-view-preference');
const captions = JSON.parse(
  fs.readFileSync(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)[0];
const country = {
  id: 1,
  nameAr: 'مصر',
  nameEn: 'Egypt',
  alpha2Code: 'EG',
  alpha3Code: 'EGY',
  phoneCode: '+20',
  currencyCode: 'EGP',
  createdOn: '2026-01-01T00:00:00Z',
  updatedOn: null,
  isDeleted: false,
  statesCount: 1,
};
const state = {
  id: 1,
  nameAr: 'القاهرة',
  nameEn: 'Cairo',
  code: 'CAI',
  countryId: 1,
  country: { id: 1, nameAr: country.nameAr, nameEn: country.nameEn, isDeleted: false },
  createdOn: country.createdOn,
  updatedOn: null,
  isDeleted: false,
  districtsCount: 1,
};
const district = {
  id: 1,
  nameAr: 'المعادي',
  nameEn: 'Maadi',
  code: 'MAA',
  stateId: 1,
  state: { id: 1, nameAr: state.nameAr, nameEn: state.nameEn, code: state.code, countryId: 1 },
  createdOn: country.createdOn,
  updatedOn: null,
  isDeleted: false,
  addressesCount: 0,
};
const screens = [
  { path: '/super-admin/tenants', owner: 'erp-tenant-management-page', key: 'tenants-view-layout' },
  { path: '/dev/countries', owner: 'erp-countries-read-page', key: 'countries-view-layout' },
  { path: '/super-admin/geography/states', owner: 'erp-states-page', key: 'states-view-layout' },
  {
    path: '/super-admin/geography/districts',
    owner: 'erp-districts-page',
    key: 'districts-view-layout',
  },
];
fs.mkdirSync(output, { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of ['en', 'ar'])
    for (const width of [390, 1440]) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width, height: 1050 },
        reducedMotion: 'reduce',
      });
      await context.addCookies([{ name: 'i18next', value: language, url: origin }]);
      const errors = [];
      await context.route('**/api/**', async (route) => {
        try {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          assert.equal(url.origin, api);
          assert.equal(request.method(), 'GET');
          let body,
            status = 200;
          if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
            body = {
              isAuthenticated: true,
              user: {
                ...sessionFixture,
                roles: ['super_admin'],
                permissions: ['Countries:View', 'States:View', 'Districts:View'],
              },
            };
          else if (endpoint.endsWith('/runtime'))
            body = { catalogVersion: version, revision: 0, overrides: [] };
          else if (endpoint.endsWith('/csrf')) body = { requestToken: 'view-preference-fixture' };
          else if (endpoint.endsWith('/realtime-token')) {
            status = 403;
            body = {};
          } else if (
            endpoint.endsWith('/modules/accessible') ||
            endpoint.endsWith('/modules/tenant-entitlements')
          )
            body = [];
          else if (endpoint === '/api/v1/countries/lookup') body = [state.country];
          else if (endpoint === '/api/v1/states/lookup') body = [district.state];
          else if (
            endpoint.endsWith('/tenants/getPage') ||
            ['/api/v1/countries', '/api/v1/states', '/api/v1/districts'].includes(endpoint)
          ) {
            const items = endpoint.endsWith('/getPage')
              ? [tenantFixture]
              : endpoint.endsWith('/countries')
                ? [country]
                : endpoint.endsWith('/states')
                  ? [state]
                  : [district];
            const pageSize = Number(url.searchParams.get('pageSize') ?? 10);
            body = {
              items,
              metaData: {
                currentPage: 1,
                pageNumber: 1,
                pageSize,
                totalCount: 1,
                totalPages: 1,
                hasPrev: false,
                hasNext: false,
              },
            };
          } else throw Error('Unexpected request: ' + endpoint);
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
      for (const screen of screens) {
        const key = 'erp-angular:views:' + screen.key;
        await page.goto(origin + screen.path);
        const root = page.locator(screen.owner);
        await expect(root.locator('tbody [data-collection-row]').first()).toBeVisible();
        const choose = (value) => root.locator(`erp-page-header [data-view="${value}"] button`);
        await choose('cards').click();
        await expect(root.locator('erp-card-list')).toBeVisible();
        assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), 'cards');
        await page.reload();
        await expect(root.locator('erp-card-list erp-surface-card').first()).toBeVisible();
        await expect(choose('cards')).toHaveAttribute('aria-pressed', 'true');
        await page.evaluate((key) => {
          localStorage.setItem(key, 'grid');
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }, key);
        await expect(root.locator('tbody [data-collection-row]').first()).toBeVisible();
        await page.evaluate((key) => {
          localStorage.setItem(key, 'unavailable-view');
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }, key);
        await expect(choose('grid')).toHaveAttribute('aria-pressed', 'true');
        if (width === 1440) {
          await choose('cards').click();
          if (screen.key === 'tenants-view-layout') {
            await root.locator('erp-page-header .primary-action button').click();
            await expect(page.locator('erp-tenant-create-page')).toBeVisible();
          } else {
            await page
              .locator('.workspace-sidebar erp-navigation-list')
              .getByRole('button', {
                name: captions[language]['menu.tenantManagement'],
                exact: true,
              })
              .click();
            await expect(page.locator('erp-tenant-management-page')).toBeVisible();
          }
          await page.goBack();
          await expect(root.locator('erp-card-list erp-surface-card').first()).toBeVisible();
        }
        assert.deepEqual(errors, []);
        results.push({
          language,
          width,
          screen: screen.path,
          restore: true,
          synchronization: true,
          unavailableFallback: true,
          hostedWrites: 0,
        });
        console.log(JSON.stringify(results.at(-1)));
      }
      await context.close();
    }
  fs.writeFileSync(
    path.join(output, 'results.json'),
    JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2),
  );
} finally {
  await browser.close();
}

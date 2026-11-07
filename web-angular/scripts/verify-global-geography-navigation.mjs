import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';
import { dashboardFixture } from '../src/app/platform/tenants/dashboard.fixture.ts';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = process.env.ANGULAR_PREVIEW_ORIGIN ?? 'https://localhost:4220';
const api = process.env.ANGULAR_API_ORIGIN ?? 'https://shabanhrms.runasp.net';
const output = path.resolve(app, '../.codex-tmp/angular-global-geography-navigation');
const smoke = process.argv.includes('--smoke');
const core = JSON.parse(fs.readFileSync(path.join(app, 'src/locales/generated/core.json'), 'utf8'));
const reporting = JSON.parse(
  fs.readFileSync(path.join(app, 'src/locales/generated/reporting.json'), 'utf8'),
);
const version = fs
  .readFileSync(path.join(app, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
  .match(/[a-f0-9]{64}/)?.[0];

if (!version) throw Error('Missing localization catalog version.');
fs.mkdirSync(output, { recursive: true });

const grants = Object.freeze({
  all: ['Countries:View', 'States:View', 'Districts:View'],
  states: ['States:View'],
  districts: ['Districts:View'],
  none: [],
  nonSuper: ['Countries:View', 'States:View', 'Districts:View'],
  templates: ['Countries:View', 'Countries:Edit', 'GlobalCrystalReports:View'],
});
const scenarios = smoke
  ? [
      ['all', grants.all, 'super_admin'],
      ['states', grants.states, 'super_admin'],
      ['districts', grants.districts, 'super_admin'],
      ['none', grants.none, 'super_admin'],
      ['non-super', grants.nonSuper, 'user'],
      ['templates', grants.templates, 'super_admin'],
    ]
  : [
      ['all', grants.all, 'super_admin'],
      ['states', grants.states, 'super_admin'],
      ['districts', grants.districts, 'super_admin'],
      ['none', grants.none, 'super_admin'],
      ['non-super', grants.nonSuper, 'user'],
      ['templates', grants.templates, 'super_admin'],
    ];
const languages = smoke ? ['en'] : ['en', 'ar'];
const widths = smoke ? [1440] : [390, 1440];
const results = [];
const errors = [];

const fixtures = Object.freeze({
  countries: [{ id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false }],
  states: [
    {
      id: 1,
      nameAr: 'القاهرة',
      nameEn: 'Cairo',
      code: 'CAI',
      countryId: 1,
      country: { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
      createdOn: '2026-01-01T00:00:00.000Z',
      updatedOn: null,
      isDeleted: false,
      districtsCount: 1,
    },
  ],
  districts: [
    {
      id: 1,
      nameAr: 'مدينة نصر',
      nameEn: 'Nasr City',
      code: 'NAS',
      stateId: 1,
      state: { id: 1, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 1 },
      createdOn: '2026-01-01T00:00:00.000Z',
      updatedOn: null,
      isDeleted: false,
      addressesCount: 0,
    },
  ],
});

function page(items, search) {
  return {
    items,
    metaData: {
      currentPage: Number(search.get('pageNumber') ?? 1),
      pageNumber: Number(search.get('pageNumber') ?? 1),
      pageSize: Number(search.get('pageSize') ?? 10),
      totalCount: items.length,
      totalPages: items.length ? 1 : 0,
      hasPrev: false,
      hasNext: false,
    },
  };
}

async function mockApi(context, permissions, role) {
  const user = {
    ...sessionFixture,
    roles: [role],
    permissions,
    tenantId: sessionFixture.tenantId,
    tenantReadOnly: false,
  };
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const endpoint = url.pathname;
    try {
      assert.equal(url.origin, api);
      let body = {};
      let status = 200;
      if (endpoint.endsWith('/session') || endpoint.endsWith('/refresh'))
        body = { isAuthenticated: true, user };
      else if (endpoint.endsWith('/runtime'))
        body = { catalogVersion: version, revision: 0, overrides: [] };
      else if (endpoint.endsWith('/csrf')) body = { requestToken: 'global-geography-fixture' };
      else if (endpoint.endsWith('/realtime-token')) status = 403;
      else if (endpoint.endsWith('/modules/accessible')) body = [];
      else if (endpoint === '/api/v1/tenants/getDashboardSummary') body = dashboardFixture;
      else if (endpoint === '/api/v1/countries/lookup') body = fixtures.countries;
      else if (endpoint === '/api/v1/states/lookup')
        body = fixtures.states.map(({ id, nameAr, nameEn, code, countryId }) => ({
          id,
          nameAr,
          nameEn,
          code,
          countryId,
        }));
      else if (endpoint === '/api/v1/states' && request.method() === 'GET')
        body = page(fixtures.states, url.searchParams);
      else if (endpoint === '/api/v1/districts' && request.method() === 'GET')
        body = page(fixtures.districts, url.searchParams);
      else if (endpoint === '/api/v1/countries' && request.method() === 'GET')
        body = page(fixtures.countries, url.searchParams);
      else if (endpoint.includes('/global-crystal-reports')) body = [];
      else throw Error('Unexpected API request: ' + endpoint);
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    } catch (error) {
      errors.push(String(error));
      await route.abort().catch(() => {});
    }
  });
}

async function navigationScope(pageRef, width) {
  await pageRef.locator('.workspace-topbar').waitFor();
  await pageRef.locator('.drawer-toggle button').click();
  const scope = width >= 900 ? pageRef.locator('.workspace-sidebar') : pageRef.locator('.p-drawer');
  await expect(scope).toBeVisible();
  return scope;
}

async function assertGeographyTree(nav, labels, expected) {
  const basic = nav.getByRole('button', { name: labels.basic, exact: true });
  if (!expected.length) {
    await expect(basic).toBeVisible();
    await basic.click();
    await expect(nav.getByRole('button', { name: labels.geography, exact: true })).toHaveCount(0);
    return;
  }
  await expect(basic).toBeVisible();
  await basic.click();
  const basicChildren = basic.locator('xpath=../following-sibling::div[1]');
  const geography = basicChildren.getByRole('button', { name: labels.geography, exact: true });
  await expect(geography).toBeVisible();
  await geography.click();
  const geographyChildren = geography.locator('xpath=../following-sibling::div[1]');
  for (const label of [labels.countries, labels.states, labels.districts]) {
    const expectedChild = expected.includes(label);
    await expect(geographyChildren.getByRole('button', { name: label, exact: true })).toHaveCount(
      expectedChild ? 1 : 0,
    );
    if (expectedChild) {
      const nestedLists = await geographyChildren
        .getByRole('button', { name: label, exact: true })
        .evaluate((button) => {
          let count = 0;
          for (let current = button.parentElement; current; current = current.parentElement)
            if (current.tagName === 'ERP-NAVIGATION-LIST') count++;
          return count;
        });
      assert.ok(nestedLists >= 3, `${label} must remain below Basic Data and Global Geography.`);
    }
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const language of languages)
    for (const width of widths)
      for (const [name, permissions, role] of scenarios) {
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height: 900 },
          reducedMotion: 'reduce',
        });
        await context.addCookies([{ name: 'i18next', value: language, url: origin }]);
        await mockApi(context, permissions, role);
        const pageRef = await context.newPage();
        pageRef.on('pageerror', (error) => errors.push(error.message));
        const labels = {
          basic: core[language]['menu.basicData'],
          geography: core[language]['menu.globalGeography'],
          countries: core[language]['menu.countries'],
          states: core[language]['menu.states'],
          districts: core[language]['menu.districts'],
          templates: reporting[language]['globalTemplates.title'],
          reports: reporting[language]['globalTemplates.availableReports'],
        };
        console.log(`Checking ${name}/${language}/${width}`);
        if (name === 'non-super') {
          await pageRef.goto(origin + '/super-admin/geography/states', {
            waitUntil: 'domcontentloaded',
            timeout: 10_000,
          });
          await expect(pageRef).toHaveURL(origin + '/apps');
          results.push({ language, width, name, passed: true });
          await context.close();
          continue;
        }
        await pageRef.goto(origin + '/home', { waitUntil: 'domcontentloaded', timeout: 10_000 });
        const nav = await navigationScope(pageRef, width);
        const expected =
          name === 'all'
            ? [labels.countries, labels.states, labels.districts]
            : name === 'states'
              ? [labels.states]
              : name === 'districts'
                ? [labels.districts]
                : name === 'templates'
                  ? [labels.countries]
                  : [];
        await assertGeographyTree(nav, labels, expected);
        const tenantGroup = nav.getByRole('button', {
          name: core[language]['modules.tenantAdministration'],
          exact: true,
        });
        await expect(tenantGroup).toBeVisible();
        await tenantGroup.click();
        const tenantChildren = tenantGroup.locator('xpath=../following-sibling::div[1]');
        for (const key of ['menu.tenantAdminManagement', 'menu.tenantManagement']) {
          const child = tenantChildren.getByRole('button', {
            name: core[language][key],
            exact: true,
          });
          await expect(child).toBeVisible();
          await expect(
            nav.getByRole('button', { name: core[language][key], exact: true }),
          ).toHaveCount(1);
          assert.ok(
            await child.evaluate((button) => {
              let depth = 0;
              for (let parent = button.parentElement; parent; parent = parent.parentElement)
                if (parent.tagName === 'ERP-NAVIGATION-LIST') depth++;
              return depth >= 3;
            }),
            'Tenant destination must remain below Basic Data and Tenant administration',
          );
        }
        await expect(nav.getByRole('button', { name: labels.reports, exact: true })).toHaveCount(0);
        await expect(nav.getByRole('button', { name: labels.templates, exact: true })).toHaveCount(
          name === 'templates' ? 1 : 0,
        );

        if (name === 'states' || name === 'districts') {
          const route =
            name === 'states'
              ? '/super-admin/geography/states'
              : '/super-admin/geography/districts';
          await pageRef.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 10_000 });
          await expect(pageRef).toHaveURL(origin + route);
          const directNav = await navigationScope(pageRef, width);
          await assertGeographyTree(directNav, labels, expected);
          await expect(
            directNav.getByRole('button', {
              name: name === 'states' ? labels.states : labels.districts,
              exact: true,
            }),
          ).toHaveAttribute('aria-pressed', 'true');
        }
        results.push({ language, width, name, passed: true });
        await context.close();
      }
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`Global geography navigation passed: ${results.length} cases.`);
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const origin = process.env.NEXT_REFERENCE_ORIGIN ?? 'http://localhost:3100';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const output = path.resolve(
  root,
  '../documentation/modules/platform/features/angular-account-profile/verification/reference',
);
const auth = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/platform-auth.json'), 'utf8'),
);
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const bootstrap = await browser.newContext();
const results = [];
await fs.mkdir(output, { recursive: true });
try {
  const login = await bootstrap.request.post(origin + '/api/v1/auth/login', {
    headers: { origin },
    data: { username: 'superadmin', password: 'P@ssword123' },
  });
  assert.equal(login.status(), 200, 'Existing local reference demo sign-in must succeed');
  const storageState = await bootstrap.storageState();
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 1440]) {
        const context = await browser.newContext({
          storageState,
          viewport: { width, height: 844 },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({
            name,
            value,
            url: origin,
          })),
        );
        const writes = [],
          reads = [],
          errors = [];
        await context.route('**/api/**', async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          if (/\/(?:account-info|AccountInfo)\//i.test(url.pathname)) {
            if (request.method() !== 'GET') {
              writes.push(request.method());
              return route.abort();
            }
            reads.push(url.pathname);
            return route.fulfill({
              contentType: 'application/json',
              body: JSON.stringify(
                url.pathname.endsWith('GetInfo')
                  ? {
                      id: 'reference-self',
                      email: 'reference@example.test',
                      userName: 'reference.account',
                      firstName: 'Reference',
                      lastName: 'Account',
                    }
                  : { profilePicture: null, contentType: null },
              ),
            });
          }
          if (request.method() !== 'GET') {
            // Diagnostics and session requests are not business account mutations.
            if (
              /\/auth\/(session|realtime-token)/.test(url.pathname) ||
              /telemetry|observability/.test(url.pathname)
            )
              return route.continue();
            writes.push(url.pathname);
            return route.abort();
          }
          return route.continue();
        });
        const page = await context.newPage();
        page.setDefaultTimeout(120000);
        page.on('pageerror', (error) => errors.push(error.message));
        const text = (key) => auth[language][key] ?? core[language][key];
        try {
          await page.goto(origin + '/profile', { waitUntil: 'domcontentloaded', timeout: 120000 });
          await expect(
            page.getByRole('tab', { name: text('auth.personalInfo'), exact: true }),
          ).toBeVisible();
          await expect(
            page.getByRole('button', { name: text('auth.editProfilePicture'), exact: true }),
          ).toBeVisible();
          await page
            .getByRole('button', { name: text('actions.editInformation'), exact: true })
            .click();
          for (const field of ['userName', 'firstName', 'lastName'])
            await expect(
              page.getByRole('textbox', { name: text('auth.' + field), exact: true }),
            ).toBeEditable();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-personal.png`),
            fullPage: true,
          });
          await page.getByRole('tab', { name: text('auth.changePassword'), exact: true }).click();
          const security = page.locator('main');
          await expect(
            security.getByText(text('auth.securitySettings'), { exact: true }),
          ).toBeVisible();
          await page.screenshot({
            path: path.join(output, `${language}-${mode}-${width}-password.png`),
            fullPage: true,
          });
          assert.ok(reads.some((value) => value.endsWith('/GetInfo')));
          assert.ok(reads.some((value) => value.endsWith('/GetUserPhoto')));
          assert.deepEqual(writes, []);
          assert.deepEqual(errors, []);
          results.push({
            language,
            mode,
            width,
            height: 844,
            currentNextRendered: true,
            personalFields: true,
            photoActions: true,
            securityTab: true,
            accountWrites: 0,
          });
          console.log(JSON.stringify(results.at(-1)));
        } catch (error) {
          await page
            .screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
            .catch(() => undefined);
          throw error;
        } finally {
          await context.close();
        }
      }
} finally {
  await bootstrap.request
    .post(origin + '/api/auth/logout', { headers: { origin } })
    .catch(() => undefined);
  await bootstrap.close();
  await fs.writeFile(
    path.join(output, 'results.json'),
    JSON.stringify({ dateUtc: new Date().toISOString(), cases: results }, null, 2),
  );
  await browser.close();
}

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';
import { sessionFixture } from '../src/app/platform/auth/auth.fixture.ts';

const root = path.resolve(import.meta.dirname, '..');
const build = path.join(root, 'dist/erp-angular/browser');
const origin = 'https://localhost:4210';
const output = path.resolve(
  root,
  '../documentation/modules/platform/features/angular-account-profile/verification/browser',
);
const translations = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/platform-auth.json'), 'utf8'),
);
const core = JSON.parse(
  await fs.readFile(path.join(root, 'src/locales/generated/core.json'), 'utf8'),
);
const version = (
  await fs.readFile(path.join(root, 'src/app/platform/localization/catalog.generated.ts'), 'utf8')
).match(/[a-f0-9]{64}/)[0];
const png =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE1sAAAAASUVORK5CYII=';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await fs.mkdir(output, { recursive: true });
const results = [];
try {
  for (const language of ['en', 'ar'])
    for (const mode of ['light', 'dark'])
      for (const width of [390, 900, 1440]) {
        const height = width === 900 ? 640 : 844;
        const context = await browser.newContext({
          ignoreHTTPSErrors: true,
          viewport: { width, height },
          reducedMotion: 'reduce',
        });
        await context.addCookies(
          Object.entries({ i18next: language, currentMode: mode }).map(([name, value]) => ({
            name,
            value,
            url: origin,
          })),
        );
        let info = {
          id: sessionFixture.userId,
          email: 'synthetic@example.test',
          userName: 'fixture.account',
          firstName: 'Fixture',
          lastName: 'Account',
        };
        let photo = null,
          signedIn = true,
          rejectPassword = true,
          failPhoto = false,
          logoutCount = 0;
        const writes = [],
          errors = [];
        await context.route('**/*', async (route) => {
          const request = route.request(),
            url = new URL(request.url()),
            endpoint = url.pathname;
          let body = {},
            status = 200;
          if (endpoint.startsWith('/AccountInfo/')) {
            if (endpoint.endsWith('/GetInfo')) body = info;
            else if (endpoint.endsWith('/GetUserPhoto')) {
              body = { profilePicture: photo, contentType: photo ? 'image/png' : null };
              if (failPhoto) status = 503;
            } else {
              assert.equal(request.method(), 'PUT');
              assert.equal(request.headers()['x-erp-xsrf'], 'synthetic-account-csrf');
              writes.push({ endpoint, type: request.headers()['content-type'] });
              if (endpoint.endsWith('/UpdateInfo')) {
                const update = request.postDataJSON();
                assert.deepEqual(Object.keys(update).sort(), [
                  'firstName',
                  'id',
                  'lastName',
                  'userName',
                ]);
                info = { ...info, ...update };
                status = 204;
              } else if (endpoint.endsWith('/UpdateUserPicture')) {
                assert.match(request.headers()['content-type'], /multipart\/form-data; boundary=/);
                const value = request.postData() ?? '';
                photo = value.includes('name="Remove"') ? null : png;
                status = 204;
              } else if (endpoint.endsWith('/ChangePassword')) {
                const data = request.postDataJSON();
                assert.equal(data.newPassword, 'Changed123!');
                if (rejectPassword) {
                  status = 400;
                  body = {
                    title: 'PasswordMismatch',
                    detail: 'Incorrect password.',
                    type: 'urn:erp:error:PasswordMismatch',
                  };
                } else status = 204;
              } else throw Error('Unexpected own-account route ' + endpoint);
            }
          } else if (endpoint.startsWith('/api/')) {
            if (/\/(session|refresh)$/.test(endpoint)) {
              status = signedIn ? 200 : 401;
              body = signedIn
                ? {
                    isAuthenticated: true,
                    user: { ...sessionFixture, ...info, roles: ['super_admin'], permissions: [] },
                  }
                : {};
            } else if (endpoint.endsWith('/csrf'))
              body = { requestToken: 'synthetic-account-csrf' };
            else if (endpoint.endsWith('/logout')) {
              signedIn = false;
              logoutCount++;
              status = 204;
            } else if (endpoint.endsWith('/runtime'))
              body = { revision: 0, catalogVersion: version, overrides: [] };
            else if (endpoint.endsWith('/modules/accessible')) body = [];
            else if (endpoint.endsWith('/realtime-token')) status = 403;
            else {
              errors.push('Unexpected API ' + endpoint);
              return route.abort();
            }
          } else {
            if (url.origin !== origin) return route.abort();
            const relative = decodeURIComponent(endpoint).replace(/^\/+/, '');
            const requested = path.resolve(build, relative);
            if (requested !== build && !requested.startsWith(build + path.sep))
              return route.abort();
            const file = path.extname(relative) ? requested : path.join(build, 'index.html');
            const mime =
              {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.woff2': 'font/woff2',
                '.svg': 'image/svg+xml',
              }[path.extname(file)] ?? 'application/octet-stream';
            try {
              return await route.fulfill({ body: await fs.readFile(file), contentType: mime });
            } catch {
              return route.fulfill({ status: 404, body: '' });
            }
          }
          return route.fulfill({
            status,
            contentType: 'application/json',
            body: status === 204 ? '' : JSON.stringify(body),
          });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        const text = (key) => translations[language]['accountProfile.' + key];
        const save = core[language]['actions.save'],
          cancel = core[language]['actions.cancel'];
        await page.goto(origin + '/profile');
        const owner = page.locator('erp-account-profile-page'),
          personal = owner.locator('erp-account-personal-info'),
          password = owner.locator('erp-account-password-editor'),
          image = owner.locator('erp-account-photo-editor');
        await expect(owner.getByText(info.email, { exact: true })).toBeVisible();
        await personal.getByRole('button', { name: text('edit'), exact: true }).click();
        await personal.getByRole('textbox', { name: text('firstName'), exact: true }).fill('ab');
        await expect(personal.getByRole('button', { name: save, exact: true })).toBeEnabled();
        await personal.getByRole('button', { name: save, exact: true }).click();
        await expect(
          personal.getByRole('textbox', { name: text('firstName'), exact: true }),
        ).toBeFocused();
        assert.equal(writes.length, 0);
        await personal
          .getByRole('textbox', { name: text('firstName'), exact: true })
          .fill('Updated');
        await personal.getByRole('button', { name: save, exact: true }).click();
        await expect.poll(() => info.firstName).toBe('Updated');
        await expect(
          personal.getByRole('button', { name: text('edit'), exact: true }),
        ).toBeVisible();
        await image.getByRole('button', { name: text('editPhoto'), exact: true }).click();
        const beforeInvalidImage = writes.length;
        await image.locator('input[type=file]').setInputFiles({
          name: 'invalid.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('invalid image'),
        });
        await expect(image.locator('erp-file-field .error')).toHaveText(text('invalidImage'));
        await image.getByRole('button', { name: text('savePhoto'), exact: true }).click();
        assert.equal(writes.length, beforeInvalidImage);
        await image.locator('input[type=file]').setInputFiles({
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: Buffer.from(png, 'base64'),
        });
        await expect(image.locator('img')).toHaveAttribute('src', /^blob:/);
        const drop = await page.evaluateHandle((base64) => {
          const transfer = new DataTransfer();
          transfer.items.add(
            new File(
              [Uint8Array.from(atob(base64), (value) => value.charCodeAt(0))],
              'dropped.png',
              { type: 'image/png' },
            ),
          );
          return transfer;
        }, png);
        await image.locator('.p-fileupload-content').dispatchEvent('drop', { dataTransfer: drop });
        await expect(image.locator('erp-file-field')).toContainText('dropped.png');
        await drop.dispose();
        await image.getByRole('button', { name: text('savePhoto'), exact: true }).click();
        await expect(image.locator('img')).toHaveAttribute('src', /^data:image\/png;base64,/);
        await image.getByRole('button', { name: text('editPhoto'), exact: true }).click();
        await image.getByRole('button', { name: text('removePhoto'), exact: true }).click();
        await expect(image.locator('img')).toHaveCount(0);
        await image.getByRole('button', { name: cancel, exact: true }).click();
        await expect(image.locator('img')).toHaveCount(1);
        await image.getByRole('button', { name: text('editPhoto'), exact: true }).click();
        await image.getByRole('button', { name: text('removePhoto'), exact: true }).click();
        await image.getByRole('button', { name: text('savePhoto'), exact: true }).click();
        await expect(
          image.getByRole('button', { name: text('editPhoto'), exact: true }),
        ).toBeVisible();
        await expect(image.locator('img')).toHaveCount(0);
        assert.equal(photo, null);
        // A failed GET is not treated as an empty image or permission to overwrite it.
        failPhoto = true;
        await page.reload();
        await expect(image.getByText(text('photoLoadFailed'), { exact: true })).toBeVisible();
        failPhoto = false;
        await image
          .getByRole('button', { name: core[language]['actions.retry'], exact: true })
          .click();
        await expect(
          image.getByRole('button', { name: text('editPhoto'), exact: true }),
        ).toBeVisible();
        await personal.getByRole('button', { name: text('edit'), exact: true }).click();
        await personal
          .getByRole('textbox', { name: text('lastName'), exact: true })
          .fill('Unsaved');
        await owner.getByRole('tab', { name: text('changePassword'), exact: true }).click();
        const discardDialog = page.getByRole('dialog');
        await expect(discardDialog).toBeVisible();
        await expect(
          owner.getByRole('tab', { name: text('personalInfo'), exact: true }),
        ).toHaveAttribute('aria-selected', 'true');
        await discardDialog
          .locator('erp-button')
          .getByRole('button', { name: cancel, exact: true })
          .click();
        await expect(
          personal.getByRole('textbox', { name: text('lastName'), exact: true }),
        ).toHaveValue('Unsaved');
        await owner.getByRole('tab', { name: text('changePassword'), exact: true }).click();
        await discardDialog
          .getByRole('button', { name: core[language]['messages.discardChanges'], exact: true })
          .click();
        await password.getByRole('button', { name: text('changePassword'), exact: true }).click();
        const current = password.locator('input[autocomplete="current-password"]'),
          next = password.locator('input[autocomplete="new-password"]');
        await expect(current).toHaveAccessibleName(text('currentPassword'));
        await expect(next).toHaveAccessibleName(text('newPassword'));
        await current.fill('Wrong123!');
        await next.fill('Changed123!');
        await password.getByRole('button', { name: save, exact: true }).click();
        await expect(
          password
            .locator('erp-text-field .error')
            .getByText(text('currentPasswordInvalid'), { exact: true }),
        ).toBeVisible();
        const geometry = await page.evaluate(() => ({
          x: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          y:
            Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) -
            innerHeight,
        }));
        assert.ok(geometry.x <= 1 && geometry.y <= 1, JSON.stringify(geometry));
        if (width === 390 && mode === 'light')
          await page.screenshot({ path: path.join(output, language + '-390.png') });
        rejectPassword = false;
        await current.fill('Correct123!');
        await password.getByRole('button', { name: save, exact: true }).click();
        await expect(page).toHaveURL(origin + '/login');
        assert.equal(logoutCount, 1);
        signedIn = true;
        await page.goto(origin + '/change-password');
        await expect(password).toBeVisible();
        await expect(image).toHaveCount(0);
        await page
          .getByRole('button', { name: core[language]['menu.settings'], exact: true })
          .click();
        await page
          .locator('.p-popover')
          .getByRole('button', { name: new RegExp('^' + core[language]['general.profile']) })
          .click();
        await expect(page).toHaveURL(origin + '/profile');
        await expect(image).toBeVisible();
        assert.deepEqual(errors, []);
        results.push({
          language,
          mode,
          width,
          height,
          geometry,
          personalValidationSave: true,
          photoPreviewSaveRemoveUndo: true,
          photoReadFailureRetry: true,
          passwordFieldErrorLogout: true,
          dedicatedPasswordRoute: true,
          accountMenuProfile: true,
          nativeDropAndValidation: true,
          fixtureOnly: true,
        });
        console.log(JSON.stringify(results.at(-1)));
        await context.close();
      }
  await fs.writeFile(
    path.join(output, 'results.json'),
    JSON.stringify(
      { dateUtc: new Date().toISOString(), fixtureOnly: true, cases: results },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}

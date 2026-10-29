import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { configureApi, readApiEnvironment, resolveApiOrigin } from './configure-api.mjs';

const values = {
  ERP_API_TARGET: 'host',
  ERP_API_LOCAL_URL: 'https://localhost:7037',
  ERP_API_HOST_URL: 'https://shabanhrms.runasp.net/',
};

test('selects the configured host, normalizes its trailing slash and accepts a local override', () => {
  assert.deepEqual(resolveApiOrigin(values), { target: 'host', origin: 'https://shabanhrms.runasp.net' });
  assert.deepEqual(resolveApiOrigin(values, 'local'), { target: 'local', origin: 'https://localhost:7037' });
});

test('rejects unknown or missing targets and missing URLs rather than silently falling back', () => {
  for (const target of ['staging', '', 'HOST']) assert.throws(() => resolveApiOrigin(values, target));
  assert.throws(() => resolveApiOrigin({}));
  assert.throws(() => resolveApiOrigin({ ERP_API_TARGET: 'local' }));
});

test('enforces the existing HTTPS-origin-only browser authentication contract', () => {
  for (const origin of ['http://localhost:7037', 'https://example.com/api', 'https://example.com/?a=1',
    'https://example.com/#fragment', 'https://user:password@example.com', 'invalid']) {
    assert.throws(() => resolveApiOrigin({ ...values, ERP_API_HOST_URL: origin }));
  }
});

test('loads .env then .env.local then process overrides; emits only the public origin', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'erp-angular-api-'));
  try {
    fs.writeFileSync(path.join(root, '.env'), 'ERP_API_TARGET=host\nERP_API_LOCAL_URL=https://localhost:7037\nERP_API_HOST_URL=https://example.com\n');
    fs.writeFileSync(path.join(root, '.env.local'), 'ERP_API_TARGET=local\nPRIMEUI_LICENSE_KEY=synthetic-private-value\n');
    assert.equal(resolveApiOrigin(readApiEnvironment(root, {})).target, 'local');
    assert.equal(resolveApiOrigin(readApiEnvironment(root, { ERP_API_TARGET: 'host' })).target, 'host');
    configureApi('host', root, {});
    const file = path.join(root, 'src/config/api.generated.ts');
    assert.match(fs.readFileSync(file, 'utf8'), /apiOrigin: string = "https:\/\/example.com"/);
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /PRIMEUI|synthetic-private-value|LOCAL_URL/);
    const modified = fs.statSync(file).mtimeMs;
    configureApi('host', root, {});
    assert.equal(fs.statSync(file).mtimeMs, modified);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

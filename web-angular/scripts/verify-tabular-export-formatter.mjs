import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { read, utils } from 'xlsx';

// Synthetic requests to the loopback-only host using real Reporting controllers/CQRS/writer.
// Fixture authentication is deliberately separate from the production browser-auth pipeline.
const origin = 'http://127.0.0.1:7358';
const output = path.resolve(import.meta.dirname, '../../.codex-tmp/angular-collection-export');
const rows = [{ Name: 'مصر، "اختبار"\r\nسطر ثان', Value: '=1+1', Count: 7, Active: true }];
const results = [];
async function request(endpoint, mode, data = rows) {
  return fetch(origin + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(mode ? { 'X-ERP-Export-Fixture': mode } : {}),
    },
    body: JSON.stringify(data),
  });
}

for (const [endpoint, mode, expected] of [
  ['/api/v1/global-data-exports/csv/fixture/en', null, 401],
  ['/api/v1/global-data-exports/csv/fixture/en', 'denied', 403],
  ['/api/v1/global-data-exports/csv/fixture/en', 'tenant', 403],
  ['/api/v1/export/exportCsv/fixture/en', 'global', 403],
]) {
  const response = await request(endpoint, mode);
  assert.equal(response.status, expected, `${endpoint}/${mode}`);
  results.push({ endpoint, mode, status: response.status });
}

for (const [prefix, mode] of [
  ['/api/v1/global-data-exports/', 'global'],
  ['/api/v1/export/', 'tenant'],
]) {
  for (const format of ['csv', 'xlsx']) {
    const action = mode === 'global' ? format : format === 'csv' ? 'exportCsv' : 'exportExcel';
    const endpoint = prefix + action + '/fixture/ar';
    const response = await request(endpoint, mode);
    assert.equal(response.status, 200);
    const buffer = Buffer.from(await response.arrayBuffer());
    const book = read(buffer, { type: 'buffer', raw: true });
    const parsed = utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1 });
    assert.deepEqual(parsed[0], Object.keys(rows[0]));
    // Spreadsheet readers normalize embedded CRLF to LF in XLSX cells.
    assert.equal(parsed[1][0].replace(/\r\n/g, '\n'), rows[0].Name.replace(/\r\n/g, '\n'));
    assert.equal(parsed[1][1], format === 'csv' ? "'=1+1" : '=1+1');
    assert.equal(String(parsed[1][2]), '7');
    assert.equal(String(parsed[1][3]).toLowerCase(), 'true');
    if (format === 'csv') {
      assert.ok(buffer.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])));
      assert.ok(buffer.toString('utf8').endsWith('\r\n'));
      assert.ok(buffer.toString('utf8').includes('"مصر، ""اختبار""\r\nسطر ثان"'));
    } else {
      assert.equal(book.Sheets[book.SheetNames[0]].B2.f, undefined);
    }
    results.push({ endpoint, mode, status: 200, format, rows: parsed.length - 1 });
    const invalid = await request(endpoint, mode, []);
    assert.equal(invalid.status, 400);
    results.push({ endpoint, mode, status: 400, reason: 'empty table' });
  }
}
await fs.mkdir(output, { recursive: true });
await fs.writeFile(
  path.join(output, 'formatter-results.json'),
  JSON.stringify(results, null, 2) + '\n',
);
console.log(
  `Reporting formatter passed ${results.length} synthetic authorization/file/validation cases`,
);

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectSource } from './architecture-rules.mjs';

test('shared PrimeNG import and template are allowed', () => {
  assert.deepEqual(inspectSource('src/app/shared/ui/button.ts', 'import { ButtonDirective as P } from "primeng/button"; const template = `<button pButton>Save</button>`;'), []);
});
test('aliased, dynamic and re-exported feature bypasses are rejected', () => {
  for (const source of ['import { Button as Alias } from "primeng/button";', 'const component = import("primeng/table");', 'export { Select as Alias } from "primeng/select";']) {
    assert.ok(inspectSource('src/app/modules/example.ts', source).includes('shared PrimeNG control bypass'));
  }
});
test('only the theme owner can configure PrimeNG and templates cannot bypass shared adapters', () => {
  assert.deepEqual(inspectSource('src/theme/provider.ts', 'import { providePrimeNG } from "primeng/config";'), []);
  assert.ok(inspectSource('src/app/modules/example.ts', 'const template = `<button pButton>Save</button>`;').includes('shared template control bypass'));
});
test('AST distinguishes forbidden types and storage from innocent text and comments', () => {
  assert.deepEqual(inspectSource('src/app/example.ts', '// any localStorage\nconst label = "any";'), []);
  assert.ok(inspectSource('src/app/example.ts', 'let value: any;').includes('untyped any'));
  assert.ok(inspectSource('src/app/example.ts', 'window.localStorage.getItem("token");').includes('undeclared browser storage'));
});
test('feature templates must compose shared form and fields', () => {
  for (const source of ['const template = `<form novalidate></form>`;', 'const template = `<input pInputText />`;']) {
    assert.ok(inspectSource('src/app/modules/example.ts', source).includes('shared form/field bypass'));
  }
  assert.deepEqual(inspectSource('src/app/modules/example.ts', 'const template = `<erp-form><erp-text-field /></erp-form>`;'), []);
});
test('features cannot depend on shared folder internals', () => {
  assert.ok(inspectSource('src/app/modules/example.ts', 'import { TextField } from "../../shared/ui/forms/fields/text-field";').includes('shared internals import; use the public API'));
  assert.deepEqual(inspectSource('src/app/modules/example.ts', 'import { TextField } from "../../shared/ui/public-api";'), []);
});
test('only application composition can inject a business context into generic Shell',()=>{
  const source='import { FiscalContextControl } from "../modules/accounting/fiscal-year-context/public-api";';
  assert.ok(inspectSource('src/app/shell/context.ts',source).includes('business module composition belongs in the app root, not Shell'));
  assert.deepEqual(inspectSource('src/app/composition/authenticated-routes.ts',source),[]);
  assert.deepEqual(inspectSource('src/app/shell/layout/main-shell.ts','import { tenantWorkspaceAllowed } from "../../platform/modules/public-api";'),[]);
});

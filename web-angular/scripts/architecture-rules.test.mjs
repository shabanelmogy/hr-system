import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectSource, inspectTemplate } from './architecture-rules.mjs';

test('shared PrimeNG import and template are allowed', () => {
  assert.deepEqual(inspectSource('src/app/shared/ui/button.ts', 'import { ButtonDirective as P } from "primeng/button"; const template = `<button pButton>Save</button>`;'), []);
});
test('collection shells and external templates stay behind the shared public API',()=>{
 for(const markup of ['<p-table />','<p-paginator />','<p-checkbox />','<table></table>']){
  assert.ok(inspectTemplate(markup,'src/app/modules/example.html').includes('shared collection/control bypass'));
  assert.ok(inspectSource('src/app/modules/example.ts','const template=`'+markup+'`;').includes('shared template control bypass'));
 }
 assert.deepEqual(inspectTemplate('<erp-data-table /><erp-card-list />','src/app/modules/example.html'),[]);
 assert.deepEqual(inspectTemplate('<p-table />','src/app/shared/ui/collections/table.html'),[]);
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
test('chart capability uses its lazy public entry and keeps native engines inside Shared',()=>{
  assert.deepEqual(inspectSource('src/app/modules/example.ts','import { CollectionChartView } from "../../shared/ui/charts/public-api";'),[]);
  assert.ok(inspectSource('src/app/modules/example.ts','import { ChartRenderer } from "../../shared/ui/charts/chart-renderer";').includes('shared internals import; use the public API'));
  assert.ok(inspectSource('src/app/modules/example.ts','import Chart from "chart.js/auto";').includes('shared chart engine bypass'));
  assert.deepEqual(inspectSource('src/app/shared/ui/charts/chart-renderer.ts','import Chart from "chart.js/auto";'),[]);
});
test('composition can use the lightweight feedback public entry without importing native hosts',()=>{
  assert.deepEqual(inspectSource('src/app/app.ts','import { FeedbackNotifications } from "./shared/ui/feedback/notifications.public-api";'),[]);
  assert.ok(inspectSource('src/app/app.ts','import { FeedbackNotifications } from "./shared/ui/feedback/feedback-notifications";').includes('shared internals import; use the public API'));
});
test('only application composition can inject a business context into generic Shell',()=>{
  const source='import { FiscalContextControl } from "../modules/accounting/fiscal-year-context/public-api";';
  assert.ok(inspectSource('src/app/shell/context.ts',source).includes('business module composition belongs in the app root, not Shell'));
  assert.deepEqual(inspectSource('src/app/composition/authenticated-routes.ts',source),[]);
  assert.deepEqual(inspectSource('src/app/shell/layout/main-shell.ts','import { tenantWorkspaceAllowed } from "../../platform/modules/public-api";'),[]);
});
test('module header and page must share the authenticated catalog provider',()=>{
  const source='@Component({providers:[ModuleCatalogState]}) class ModuleWorkspace {}';
  assert.ok(inspectSource('src/app/platform/modules/pages/module-workspace.ts',source).includes('module catalog provider belongs in authenticated composition'));
  assert.deepEqual(inspectSource('src/app/composition/authenticated-routes.ts',source),[]);
});
test('shared controls must enhance interactive widgets with PrimeNG',()=>{
  assert.ok(inspectTemplate('<button type="button">Go</button>').includes('native button bypass; use shared action or PrimeNG directive'));
  assert.deepEqual(inspectTemplate('<button pButton type="button">Go</button><erp-option-select />'),[]);
  for(const template of ['<select></select>','<input type="radio">','<button type="button">Go</button>'])assert.ok(inspectSource('src/app/shared/ui/control.ts','const template = `'+template+'`;').some(message=>message.startsWith('native')));
  assert.deepEqual(inspectSource('src/app/shared/ui/control.ts','const template = `<p-select /><p-radiobutton /><button pButton type="button">Go</button>`;'),[]);
});

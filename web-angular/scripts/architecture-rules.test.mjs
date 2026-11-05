import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectSource, inspectTemplate } from './architecture-rules.mjs';
import { inspectProject } from './dependency-graph.mjs';

test('barrel cycles are rejected, while type-only and lazy edges are independent', () => {
  const source = new Map([
    ['src/app/platform/auth/session.public-api.ts', 'export { Page } from "./pages/page";'],
    ['src/app/platform/auth/pages/page.ts', 'import { State } from "../session.public-api"; export class Page {}'],
  ]);
  assert.ok(inspectProject(source).some(reason => reason.includes('circular value dependency')));
  source.set('src/app/platform/auth/pages/page.ts', 'import type { State } from "../session.public-api"; export class Page {}');
  assert.deepEqual(inspectProject(source), []);
  source.set('src/app/platform/auth/pages/page.ts', 'const load = () => import("../session.public-api"); export class Page {}');
  assert.deepEqual(inspectProject(source), []);
});

test('configured aliases cannot bypass ownership rules', () => {
  const sources = new Map([
    ['src/app/shared/ui/example.ts', 'import { State } from "@auth/state";'],
    ['src/app/platform/auth/state.ts', 'export class State {}'],
  ]);
  assert.ok(inspectProject(sources, { paths: { '@auth/*': ['./src/app/platform/auth/*'] }, pathsBasePath: process.cwd() }).some(reason => reason.includes('lower layer')));
});

test('owner dependencies cannot enter another owner internals or reverse layers', () => {
  for (const [file, source] of [
    ['src/app/shared/ui/example.ts', 'import { Country } from "../../../modules/reference-data/state/country";'],
    ['src/app/modules/accounting/example.ts', 'import { Country } from "../reference-data/services/country-service";'],
    ['src/app/platform/auth/example.ts', 'import { Country } from "../../modules/reference-data/services/country-service";'],
    ['src/theme/example.ts', 'import { AuthSession } from "../app/platform/auth/session.public-api";'],
  ]) assert.ok(inspectSource(file, source).length, file);
});

test('external feature forms obey the same shared field policy as inline forms', () => {
  assert.ok(inspectTemplate('<form><input pInputText /><textarea /></form>', 'src/app/modules/example.html').length);
});

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

# D28 bounded context-menu acceptance — 2026-10-30

Bounded requested correction Verified. Complete S1-A14 Phase06 remains Not Verified;
this proof does not close the full capability/performance/source matrix.

Implemented generic ContextMenuPanel over native PrimeNG ContextMenu. Public typed
actions/translated label/optional AppIcon/disabled/separator, ID activation and
dismissal, native body append/keyboard and shared opaque tokens. Duplicate IDs and
disabled/removed/separator commands do not activate. MyDataGrid supplies captured
immutable source/row/visible column/raw value; separate built-in/row ID namespaces
preserve existing guarded actions and reject stale/dismissed callbacks.

Cell-value filter uses existing controlled filtersChange. Text/number/boolean use
equals; canonical dates use dateIs, only when allowed by column definitions. Zero
and false remain typed; no guessing from formatted HTML/localized dates. Explicit
CollectionColumn.filterValue maps Countries status and date columns. Other column
groups and toolbar status/search remain intact; remote owner queries page1. Null/
undefined/blank/unsupported values have no invalid filter command. Existing native
column filter menus remain the keyboard alternative for exact entry.

Executed full Angular check:68 files/397 tests,4configuration and11architecture,
types/catalog/tokens/fonts/build all pass; initial498.70kB/129.75kB transfer, budgets
unchanged. Pure tests cover merging/zero/false/dates/limits; actual shared composition
tests capture current versus stale/dismissed commands and generic menu guards.

Actual authenticated Countries browser8: EN/AR × light/dark ×390/1440. Driver
web-angular/scripts/verify-countries-screen-browser.mjs --context-only; durable
CELL_CONTEXT_RESULTS.json. Real right-click opens the native menu with visible
filter/View SVG icons and separated text; opaque viewport-bounded surface. Native
ArrowDown/Enter executes and Escape closes without request. Starting on server
page2, exact text filtering issues one read at page1 and native column menu shows
the same equals/value. Numeric0, Boolean false, dateIs and combined independent
criteria are sent to the existing read endpoint; null UpdatedOn omits filtering
and retained View opens detail. Screenshot inspection includes dark compact RTL.
Existing command browser8 also passes after shared reuse: Create/Edit/Archive/
Restore/Bulk, pending/dirty/inline errors/Toast/Modal/read-only/uncertain no replay.
All command writes intercepted; no host business writes or deployment.

Corrections found by execution: dynamic menu opening must wait for Angular
afterNextRender so updated child input/model exists; microtask-only opening was too
early. Existing Countries Reset merged absent optional defaults and retained column
filters; it now replaces criteria with canonical defaults, covered by state/browser
tests. Native keyboard tests use documented ArrowDown then Enter rather than
focusing an arbitrary item without native active-item state. JSDOM fixtures that
now mount ContextMenu provide matchMedia; no runtime browser polyfill was added.

MCP final ContextMenu usage valid (zero generated-metadata issues). Current
ContextMenu command/item-template examples supplied the composition; native metadata
does not validate rendering or domain behavior. Sources:
https://primeng.dev/contextmenu ; https://angular.dev/guide/components/dom-apis ;
https://angular.dev/guide/signals . Existing unrelated ngModelOptions metadata limit
retained. No new UI/icon package, API endpoint/entity/schema/native work; migration
N/A. Retained API1162/0/3 is earlier unchanged-source evidence, not rerun live proof.

SQL-backed canonical core resources gained only contextMenu/filterByCellValue EN/AR.
Catalog21sources/7266keys/20Angular namespaces, hash
9f3caf4c0af16a038be6ba233d6665a98d87910924550e7ede4a10c6f68528f5.
PROD-019 owns matching host publication/SQL overrides. Complete Table matrix remains
FOLLOW-016; chart/managed Crystal-PDF/import/full Countries acceptance still Required.
Touch long-press/native-device acceptance is not claimed by mouse/keyboard viewport
tests. Two inherited planning warnings concern unrelated education-module and
erp-platform-template v2 contracts. No new release-only finding hidden in chat.

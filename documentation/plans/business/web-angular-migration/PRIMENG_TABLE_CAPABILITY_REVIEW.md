# PrimeNG collection capability review

Reviewed2026-10-29, Africa/Cairo. Exact installed PrimeNG22.1.4 and Angular22.2.3.
This is current-source research for S1-A3, not an implemented Angular Grid or an
approval to enable every capability. Collection runtime remains blocked by its
preflight contract. Retained Next/API/Mobile sources are unchanged.

## 1. Product boundary and evidence

The available tabular component is `Table` / `p-table` (`primeng/table`).
PrimeUI's current official comparison still marks the separate PRO DataGrid and
Sheet products as Roadmap. They are not the source of the capabilities below.

- [Official Table examples](https://primeng.dev/table).
- [Official PrimeUI product comparison](https://primeui.dev/pricing), checked2026-10-29.
- [Official TreeTable](https://primeng.dev/treetable).
- [Official DataView](https://primeng.dev/dataview).
- [Official FilterService](https://primeng.dev/filterservice).
- [Official changelog](https://primeng.dev/changelog).
- Installed declarations: `web-angular/node_modules/primeng/types/primeng-table.d.ts`
  and `primeng-types-table.d.ts`; actual implementation:
  `web-angular/node_modules/primeng/fesm2022/primeng-table.mjs`.
- Retained contract: Next `data-grid/core/MyDataGrid.tsx`, `core/types.ts`,
  `toolbar/DataGridToolbar.tsx`, `toolbar/GridOptionsButton.tsx`,
  `navigation/GridFooter.tsx`, `navigation/recordNavigation.ts`,
  `core/pagination.ts`; Countries `CountriesDataGrid.tsx`, `countryPageQuery.ts`
  and `shared/hooks/useServerListState.ts` were reviewed.

## 2. Verified capability inventory

Availability means documented/exposed in installed22.1.4, not browser acceptance
in this repository. A template or external owner requirement is stated explicitly.

| Capability | Installed mechanism / evidence | ERP integration boundary |
| --- | --- | --- |
| Dynamic typed columns | columns/value inputs, header/body templates | Shared column definitions; domain types remain feature-owned |
| Cell content | body templates | Shared fields, badges, icons/actions; no feature Grid shell |
| Caption/header/footer | Table templates | Retain shared toolbar, feedback and footer contracts |
| Three density levels | size small/default/large | Generic user option, token-driven spacing |
| Grid lines, striping, hover | showGridlines, stripedRows, rowHover | Optional shared display settings |
| Conditional row/cell appearance | body template classes/styles | Feature supplies semantic status; shared visuals |
| Single selection | selectionMode, selection, dataKey | Active record is distinct from bulk selection |
| Multiple/range selection | multiple/metaKeySelection; keyboard support | Explicit scope and selection policy |
| Checkbox/radio selection | TableCheckbox, TableHeaderCheckbox, TableRadioButton | PrimeNG controls, accessible names |
| Page-only select-all | selectionPageOnly | All server results require an owner/API selection contract |
| Selection events | selectionChange, onRowSelect/onRowUnselect | Callbacks do not authorize mutations |
| Pagination | paginator, first, rows, totalRecords, onPage | Controlled owner is the only page-state writer |
| Pager placement/templates | paginatorPosition top/bottom/both, templates | Record navigation remains our additional shared control |
| Page-size/jump controls | rowsPerPageOptions and paginator options | Keep source defaults5/10/25/50 and normal10 unless contract differs |
| Single/multiple sort | sortField/order, multiSortMeta, sortMode | API allowlist and capabilities decide actual server ordering |
| Initial/removable/custom sort | sort bindings, customSort, sortFunction | Never silently locally sort one remote page |
| Global/column search | filters, globalFilterFields, filterDelay, filterLocale | Shared search/field/operator UX; map supported server criteria |
| Text/numeric/date/boolean filters | ColumnFilter plus match modes | Template-based PrimeNG inputs; parse typed values |
| Multiple constraints | ColumnFilter operator/rule UI | AND/OR per-field UI is not an arbitrary nested query builder |
| Custom filter match functions | FilterService.register | Browser predicate is not an API capability |
| Lazy remote events | lazy, lazyLoadOnInit, onLazyLoad | Owner performs actual requests, cancellation and stale guards |
| Vertical/horizontal/flex scroll | scrollable, scrollHeight | Keep scrolling inside panel; no whole-page overflow |
| Sticky header | scrollable Table layout | Verify at actual viewport/RTL |
| Frozen columns on either side | FrozenColumn, alignFrozen | Shared columns option; verify RTL placement |
| Frozen rows | frozenValue | Displayed rows are not authoritative account totals |
| Virtual rows | virtualScroll, virtualScrollItemSize/options/delay | Fixed row-size contract and measured performance required |
| Lazy virtual rows | virtual scrolling plus lazy events | Fetch ranges remotely; virtual rendering alone does not reduce fetched data |
| Column resize | resizableColumns, columnResizeMode fit/expand | Shared min-widths and containment |
| Column/row reorder | reorderableColumns, reorder directives/events | Row-order persistence is business-owned; not implied by a sort |
| Show/hide columns | dynamic column list/template composition | Shared chooser; protected identity/actions stay usable |
| Grouped column headers | rowspan/colspan templates | Presentation, not pivot calculation |
| Row grouping | rowGroupMode subheader/rowspan, groupRowsBy | Correct server ordering/group boundaries required for paged data |
| Collapsible groups | group header/expansion templates | Group counts/aggregates must identify their data scope |
| Row details/master-detail | expandedRowKeys, row toggler/expansion templates | Lazy detail loading and permissions remain owner concerns |
| Cell editing | EditableColumn/CellEditor; edit callbacks | Shared typed fields, validation, save/cancel and API concurrency required |
| Whole-row editing | editMode=row, EditableRow/init/save/cancel directives | Row draft lifecycle; no direct mutation of authoritative rows |
| Context menu | ContextMenu integration, contextMenuSelection | Keep direct accessible actions as well |
| CSV export | exportCSV, selectionOnly/allValues, separator, filename, exportFunction | Exports supplied/filtered/selected browser values, not all remote results |
| Persistent Table state | stateKey, stateStorage, save/restore events | Built-in uses browser local/session storage; not enabled under current policy |
| Loading/empty UI | loading/showLoader, templates, Skeleton composition | Reuse shared error/forbidden/empty/retry states |
| Accessibility | keyboard, selection/filter/expansion ARIA, paginator locale | Custom templates/editors still need explicit accessibility verification |
| Design tokens/pass-through | Table/ColumnFilter pass-through declarations and theme | One shared adapter consuming @app/tokens |

## 3. Additional composition, not built-in business capability

- **TreeTable** is a separate hierarchical component suitable for account trees
  and other real hierarchies. Row expansion in Table is not a hierarchy engine.
- **DataView** supports list/grid templates with paging/sorting. Card layout still
  needs shared responsive composition; Table does not automatically become cards.
- **Database Editor** in the current official Table samples demonstrates a richer
  composition using Table, Menu, Checkbox, Drawer and Select. It is a UI example;
  it does not provide ERP persistence, arbitrary SQL schema changes or authorization.
- **XLSX/PDF/print/managed reports** need the existing ERP export/report capability
  or a separately selected adapter. The installed Table's built-in exporter is CSV.
- **Pivoting, automatic aggregation/formulas, Excel-style range fill/clipboard and
  undo/redo** are not claimed as built-in Table guarantees. Group header/footer
  templates can display calculated values; the calculation still needs an owner.
- **Server-wide select-all, complete filtered export, overall totals, audited bulk
  actions, permissions, validation and concurrency** are ERP contracts, not Table
  switches. Page totals and all-results totals must never be confused.

## 4. Proposed shared ERP coverage

These are proposals for the next frozen runtime contract, not Required/Deferred
delivery promises. User asked to inspect the maximum available options first.

1. Standard collection shell: shared toolbar/search/field/operator/filter slot,
   controlled server paging/sort, separate active and bulk selection, options for
   density/columns/width/order/freeze, existing feedback, reset, footer and
   first/previous/next/last record navigation, bilingual/RTL/tokens/keyboard.
2. Opt-in capabilities per actual screen: multiple sort, advanced constraints,
   grouping, detail expansion, inline cell/row editors, context menu, row reorder,
   virtual/lazy scrolling. A screen enables only what its API and workflow support.
3. Reuse existing platform services for export/reports, session/context, permissions
   and future preference persistence; no BFF/global store/query engine is introduced.

Shared ownership stays under `web-angular/src/app/shared/ui/`; feature consumers
use its public API. Raw p-table use in features remains a bypass. The wrapper must
expose coherent typed options/templates rather than blindly forward every vendor
input. Future Table/TreeTable/DataView adapters must share criteria/footer/feedback
contracts where appropriate, not copy one another.

Concrete current API boundary: Countries exposes one `sortBy`/`sortDirection`
and one `searchField`/`searchOperator`, plus explicit status/currencyCode/hasStates.
Its reviewed `countries-api-contract.md`, current `countryService.getPage` and
`toCountryPageQuery` agree on this. Table multi-sort and arbitrary per-field AND/OR
rules therefore cannot be advertised as current server-supported Countries
features. They need their own reviewed owner/API contract before activation.

## 5. Acceptance still required before runtime claims

No performance limit is inferred from a10000-row demo. Benchmark the exact columns,
editors and row count selected by a consumer. Virtual row height, frozen columns,
grouping, expansion, RTL and responsive behavior require combination tests, not
independent checkbox claims. Recent22.1.4 fixes include virtual rendering and
resetPageOnSort; use this installed version and preserve its regression coverage.

Current stage: source/API/UI-capability audit completed; Phase06 not claimed.
Next step: freeze the coherent shared-control contract and its allowed combinations,
finish Phase00, then authorize bounded runtime under the existing plan gates.
Broader migration notes FOLLOW-012/014/015 and PROD-002/017/019/RISK-018 retain
their own scope; this research adds no production or business runtime claim.

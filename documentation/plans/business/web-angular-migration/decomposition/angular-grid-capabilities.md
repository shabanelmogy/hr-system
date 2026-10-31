# Complete shared PrimeNG Table capabilities — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A14 — Complete shared PrimeNG Table capabilities |
| Child Feature ID | angular-grid-capabilities |
| Child feature name | Complete shared PrimeNG Table capabilities |
| Owner | Platform Angular Shared; consumer/API rules remain feature-owned |
| Depends on | angular-collection-foundation and angular-collection-criteria-foundation Closed |
| Execution status | Queued |
| Runtime authorization | Authorized bounded S1-A14 after405Phase00 recipe/planning checks; CAPABILITY_MATRIX fixes G0-G3; remaining G4 release-only PROD-002/017/019/RISK-018; no consumer/API/schema/native runtime |

## 1. Child boundary and outcome

Requester explicitly requires the reusable MyDataGrid to support the installed
PrimeNG Table capabilities, while matching web-next appearance exactly. Deliver
a coherent typed shared adapter and a development fixture harness; consumers enable
capabilities through configuration/public templates, without feature-local grids.
This is one technical component kit, independently verifiable with neutral fixtures.
Actual Countries query API/host extension and shell/sidebar journey remain the
existing angular-countries-read-workspace correction after this dependency closes.
No business writes, domain/schema/native rewrite, AR, TreeTable or separate PRO
DataGrid product is authorized by this generic Table kit.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.shared.advanced-grid | Web | Development-only grid fixture harness; excluded from production | Verify complete reusable Table adapter and source fidelity | Configured local/remote collections; typed templates and events | P-001 | C-02 table; C-01 shared fields/editors/dialogs | web-next/src/shared/components/data-grid/core/MyDataGrid.tsx | Adapted | Table Required; Cards existing compatibility Required; Chart/Report/Import/new TreeTable Excluded | Loading/empty/error/forbidden/stale/pending/edit-invalid; all scoped | No new offline store | Neutral deterministic records; explicit local fixture and remote-range fixtures | Shared grants none; callers authorize queries/actions; reset on scope changes | EN/AR,390/1440,5palettes,keyboard/focus/contained scroll | No header styling deviation; requested advanced controls are explicit additions |
| platform.shared.advanced-grid | Mobile | No new native route | Retain current native table library | No native runtime change | N/A — no UI | Existing native controls retained | mobile-react/src/shared/components/data-table/AppDataTable.tsx | Excluded | New native UI Excluded | Existing behavior retained | Existing policy retained | No new mocks | No new permissions/schema | Compact browser belongs to Web | No native rewrite |

## 3. Closest existing reference

Read PRIMENG_TABLE_CAPABILITY_REVIEW.md, current installed22.1.4 declarations and
implementation, actual Next PageHeader/MultiView header/DataGridToolbar/Columns/
GridOptionsButton/MyDataGrid/GridFooter and existing Angular shared controls.
Exact source geometry/typography/colors/spacing must be measured at the same
viewport. Availability in documentation is not evidence of working integration.

## 4. Reuse and composition contract

Extend MyDataGrid,CollectionFrame,PageHeader,ActionButton,OptionSelect,shared fields,
PopoverPanel,DialogPanel,feedback,ScrollViewport and current controller. PrimeNG
stays internal. Public typed config/templates/events cover coherent behavior;
no blind vendor prop forwarding, raw-grid bypass or feature shell clone.
Preserve defaults and existing callers. New visible captions are canonical EN/AR
SQL-backed catalog keys; no local translation dictionary or version bypass.

## 5. Screen and workspace contract

Required installed Table capabilities: typed dynamic columns and cell/header/footer
templates; density/gridlines/striping/hover/conditional visuals; active row distinct
from single/multiple/range/checkbox/radio selection; page-only select-all and explicit
selection policy; controlled pagination/page-size/jump/record navigation; single/
multiple/initial/removable/custom sort; global/column search; typed text/numeric/
date/boolean column filter menus and per-field AND/OR constraints; custom match
registry for explicit local data; lazy remote query events; contained horizontal/
vertical/flex scroll and sticky header; left/right frozen columns and frozen rows;
fixed-height virtual and lazy virtual ranges; resize fit/expand and column/row
reorder; column visibility and grouped headers; subheader/rowspan grouping and
group expansion; row detail expansion; cell/row editing through shared fields and
owner validation/save/cancel; context menu with direct accessible actions; safe
CSV export of supplied/selected data; typed presentation state save/restore through
an owner adapter; loading/skeleton/empty/error/retry; accessibility/locale/tokens.

Each capability receives actual implementation, meaningful tests and browser proof
in CAPABILITY_MATRIX.md; unsupported vendor combinations must be rejected explicitly,
not silently degraded. Business aggregation/pivot computation, all-server export,
all-server selection and remote persistence remain caller/API contracts, not
fabricated from a current page. Browser local/session storage stays disabled;
state capability uses an explicit owner persistence adapter.

## 6. Typed transport and server criteria

Shared has no HTTP/domain DTO. Explicit local mode may filter/sort supplied local
records; remote mode emits typed query/filter/sort/range state and never computes
authoritative server totals or locally filters a remote page. Per-field AND/OR
constraints are typed and bounded, not arbitrary nested SQL expressions. Consumers
declare supported fields/operators/types; backend serialization/translation remains
their responsibility. Countries current API is single-search/single-sort; its
follow-on correction must add real supported server query semantics before enabling
multiple conditions on hosted business data. No fallback that silently ignores rules.

## 7. Create, edit, view, and lifecycle contract

Editor drafts never mutate authoritative rows. Owners supply schemas, permissions,
concurrency and callbacks. Shared fields/errors/focus/unsaved/pending guards remain
the authority; invalid primary actions explain errors. No automatic write replay.
Context actions and reorder are callbacks, not grants or implicit persistence.
Presentation restore validates version/columns/scope and cannot restore data/grants.

## 8. UX states, permissions, offline, and mock data

All capabilities operate only on supplied current authorized source. Identity/
scope/criteria changes clear stale rows/selection/editors/menus/pending effects.
Reject invalid IDs, filter values/types/modes, sort/field names, ranges, restored
state and incompatible config. Keep known zero distinct from unknown counts;
errors and403 have shared feedback. Harness contains no production business writes.

## 9. Concurrency, transactions, and consistency

Captured scope/query revision owns callbacks and virtual ranges; late responses
cannot paint another scope. Controlled state has one writer. Coalesce vendor input
initialization events and preserve current default desc/no duplicate request proof.
Generic editing requires owner confirmation and safe cancel/identity replacement.

## 10. i18n, RTL, accessibility, and responsive behavior

No visual redesign: current Next title/action header, search selectors, toolbar,
column headers, spacing, dimensions, fonts and colors are the baseline. Added native
advanced controls are requested additions only. Source reference/candidate captures
and measured geometry must agree at the same scope/viewport. Verify keyboard, menu
focus, selection, resize/reorder alternatives, RTL pin/scroll and mobile Drawer.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current source and generic ownership audit | No HTTP/schema; complete typed owner query boundary | This contract |
| 2 | Web | Active | Phase00 and frozen capability matrix | Shared adapter/harness and all Required capabilities | This contract |
| 3 | Mobile | Queued | Web source evidence | Native retained; new native UI Excluded | This contract |
| 4 | Integrated live verification | Queued | Prior stages | Chrome fixtures/source comparison/benchmarks; explicit limits | This contract |
| 5 | Documentation and closure | Queued | Phase06 Verified | Canonical books/manifest/matrix/technical education/handoff | This contract |

## 12. Verification contract

Next-step rule: only this Active exact frozen shared kit may enter runtime after Phase00 checks; consumer API/host and sibling work remain independently gated.

Meaningful behavior tests; full Angular check; current shared callers regressions;
5palettes×2modes×2languages×390/1440; complete native filter/query/edit/selection/
layout/virtual/export/state flows; same-viewport Next header measurements/captures.
Benchmark exact fixture10000 rows and record DOM window bounds and environment,
without a universal performance promise. Test supported combinations such as frozen
columns+RTL+scroll and filtering+virtual ranges+scope replacement. No native device,
hosted Countries query or full pilot claim from generic fixture proof.

## 13. Child exit gate

- [x] Current capability review and exact-source matrix frozen before runtime.
- [x] Phase00 books/current-only manifest/recipe/planning entry passed (405 recipes).
- [ ] Every Required capability has implementation and executed evidence.
- [ ] Source header fidelity and supported combinations pass browser proof.
- [ ] Phase06 Verified before Phase07 technical education and closure.

Requester priority2026-10-30: remaining generic extras Queued while actual Countries reference-screen integration is Active. Current 345unit/40visual+8focused/8collections proof remains bounded progress, not complete matrix closure.

Current D28 bounded execution: CELL_CONTEXT_FILTER_CONTRACT.md in the feature package; remainder of complete-matrix acceptance stays Not Verified. Prior Phase00 ownership and existing typed filters remain unchanged; generate/check updated contract before runtime.

D28 bounded filter/icons verification completed; complete matrix Not Verified. Current proof is CELL_CONTEXT_ACCEPTANCE.md; no whole-feature closure.

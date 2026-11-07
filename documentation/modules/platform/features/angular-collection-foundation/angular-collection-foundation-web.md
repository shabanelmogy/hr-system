# Shared Angular collections — Angular implementation profile

## 1. Ownership

Header-selection maintenance2026-11-05: MyDataGrid renders one controlled
page-selection Checkbox in the selection th, with grouped-header rowspan,
all/partial/disabled states and an accessible mixed announcement. Single/radio
and selection-disabled modes omit select-all. CollectionFrame places its shared
count/Clear summary in CollectionFooter's generic content slot for Grid; Cards
keep the existing default bar. Owner callbacks and source/query semantics remain
unchanged. [Current verification](HEADER_SELECTION_2026-11-05.md) supersedes only
selection placement; historical acceptance retains its dated scope.

### Current maintenance — 2026-11-05

MyDataGrid delegates query normalization/deferred sorting, context-menu leases,
expansion/grouping and geometry to per-instance GridQueryState, GridContextState,
GridExpansionState and GridGeometry. indexGridTemplates caches projected
cell/header/footer lookup per content-query or key change and preserves first-match
semantics. Source/query/row identity guards, viewport lifecycle and the public
MyDataGrid contract remain with their existing owner. CSV export reuses downloadBlob.
Helpers stay internal to Shared; business pages continue to use the curated public API.

The approved decomposition and exact verification limits are recorded in
[the current execution report](../../../../guides/web/architecture/ANGULAR_COMPONENT_DECOMPOSITION_2026-11-05.md).
Full Angular check: 98 files / 560 tests, 30 architecture checks, lint, strict types/templates
and production build passed. Grid browser acceptance for this increment is one
smoke case, not the full capability matrix. Initial 574.45 kB retains RISK-020.
API, Next.js, Mobile and persistence are unchanged; migration/domain UI audit is N/A.
Historical sections below retain their own dated acceptance.

Platform Web Shared owns a generic collection presentation kit, not entity data, permissions, API queries or business rules. MyDataGrid and CardList share toolbar/footer/feedback contracts. Root/feature callers retain scope and data ownership. No Next/native runtime is rewritten.

## 2. Current source

Reviewed current MyDataGrid/types, toolbar/search/GridOptions, footer/pagination/record-navigation, Countries query conversion and native AppDataTable. Existing Angular actions/text/select/popover/feedback/scroll and token adapter are reused. PrimeNG installed Table22.1.4 is available; PRO Grid/Sheet are not adopted. PRIMENG_TABLE_CAPABILITY_REVIEW distinguishes availability from acceptance.

## 3. Domain and persistence

Technical presentation only. No new entity, schema, grants, route ownership, business mutation, SQL selection model or browser persistent Table state. Query/result scope is an opaque caller contract. Native/data-entry/report/import business behavior is excluded. Canonical bilingual labels use the existing UI catalog and API resource generator.

## 4. Bounded outcome

One coherent standard collection kit plus a development-only harness: typed Table and Cards, shared search/registered selectors/filter/action slots, finite feedback, controlled remote paging/single-sort, record navigation, active row separate from page-only selection, density and column visibility. Detailed frozen contract is SHARED_COLLECTION_CONTRACT.md. No universal CRUD/query/editor engine.

## 5. Platform decisions

Web standard Table/Cards/toolbar/footer/feedback and synthetic technical harness Required. New native UI Excluded; existing native controls retained. Chart/Report/Import/export/tree/offline/persistent vendor state Excluded. Multi-sort/constraints/grouping/virtual/expansion/user pin/resize/reorder/context menus Deferred FOLLOW-016; editors also FOLLOW-014. Every option requires actual owner/server/combination evidence.

## 6. Source and criteria contract

Caller query: scopeKey/criteriaKey/pageIndex/pageSize. Result repeats identity plus readonly rows, authoritative total or null and hasNextPage. Shared renders only ready matching result; retains count during loading only for same scope/criteria. Caller alone writes page/search/filter/sort and owns debounce/HTTP/cancellation/out-of-range recovery. No implicit server page clamp, local page-only sorting/filtering or invented count.

## 7. Shared reuse

Current presentation maintenance2026-11-05 adds shared ActionMenuButton, composing
the existing ActionButton and PrimeNG Menu popup. Callers supply typed stable IDs,
translated labels/icons, permission-filtered items, pending and command callbacks.
Shared guards removed/disabled commands and duplicate IDs; it owns no domain data
or authorization. Existing MyDataGrid single-row mode retains its public contract,
with a 220px minimum for text-only search and 540px for rich field/operator search.
Toolbar overflow remains local on small viewports; default responsive layout is
unchanged. The actual consumer is GlobalTemplateList. Current evidence and rules:
documentation/modules/reporting/features/global-crystal-template-manager/MANAGER_ACTION_MENU_2026-11-05.md
and documentation/guides/web/architecture/ANGULAR_SHARED_COMPONENTS.md.

Reuse existing ActionButton/TextField/OptionSelect/PopoverPanel/FeedbackState/ScrollViewport/public icons and @app/tokens. Internal PrimeNG Table/Paginator/Checkbox adapters live under Shared; feature bypasses rejected by architecture checks. Generic templates/slots supply row/card/actions/empty content, never a feature-local look-alike shell. No unnecessary wrapper duplicating an existing control.


D41 composition maintenance2026-11-04: CollectionFrame now composes the internal CollectionOptionsDialog with the existing gridOptions slot and forwards the same controlled inputs/events. MyDataGrid delegates presentation signals/snapshot/reset/order/pin to createGridPresentation; DOM measurement, native events, owner criteria, rows and public API remain with their existing owners. Helpers remain internal; no root store or persistence.
Reusable policy: documentation/guides/web/architecture/ANGULAR_COMPONENT_COMPOSITION.md. Current evidence: documentation/modules/platform/features/angular-collection-foundation/COMPONENT_COMPOSITION_REPORT.md. Earlier acceptance snapshots retain their original scope/date; no API/domain/schema/native behavior changes.

D41 final acceptance: architecture16/full scan, strict app/spec,448 unit tests and production build passed;86 bounded fixture browser cases across Grid8/Countries8/actions8/Report8/login10/language20/Shell24. Production initial572.16kB; existing RISK-019500kB warning remains. Portable current evidence: angular-collection-foundation/verification/component-composition-summary.json. API/native/hosted/pixel acceptance retain their existing scope.

## 8. States and lifecycle

Required initial loading/replacement, zero/empty, error/retry, forbidden, stale/invalid result, density/column reset, keyboard/focus and bounded scrolling. Active record and page-only bulk selection are distinct. Keep intended record target across only its matching page response; discard on scope/criteria/size/error/unrelated page. Unknown total disables Last and uses hasNextPage without fabricating totals.

## 9. Authorization

No new actor/grant or data fetch in the kit. Caller supplies already verified scope and permissions/actions. Shared does not authorize mutations. Table slots cannot supply a trusted company or bypass feature permission/read-only rules. Synthetic neutral fixtures are not real Countries or production mock data.

## 10. Consistency and state

Component-scoped Signals/computed hold only ephemeral UI presentation and activation/selection. Caller remains sole remote-state/page writer; no NgRx/global cache/session store introduced. Pure helpers and matching response envelopes mask old scope/query/page synchronously. Context changes reset local selection and pending focus/navigation. Browser storage stays disabled.

## 11. Verification and acceptance

Phase06: **Verified** for the bounded S1-A3 technical kit. IMPLEMENTATION_REPORT.md
owns exact commands,119 Angular tests/10 architecture/4 configuration checks,
40 collection browser cases, final8 keyboard and8 layout cases, Next8 comparisons,
retained Next11 tests/type-check, API40/catalog7 and login10/context24/language20.
Portable measured evidence and paired source captures are under verification/.
No Countries, hosted new SQL labels, native UI or overall release claim is implied.

## 12. Operations and release

No database migration or business data creation. Any new canonical core labels require synchronized generated API catalog before hosted translation override acceptance; retain strict version matching (PROD-019). Local generic fixture proof does not claim hosted business/API acceptance. Hosted/provider G4 remains PROD-002/017/019/RISK-018. Advanced controls are FOLLOW-016, future editable consumers FOLLOW-014.

## 13. Localization and accessibility

Use owning canonical core EN/AR captions, locale number formatting, source toolbar/header/row/footer sizes, token colors, RTL logical layout and actual PrimeNG controls. Table owns internal horizontal/vertical scroll; Cards reuse ScrollViewport. No whole-page overflow, inaccessible checkbox actions, native application dialogs or hardcoded business captions. Missing generic captions follow the catalog generator, not a second translation store.

## 14. Execution gate

Phase00 books/existing-only manifest and285 recipe/planning entry passed before
bounded runtime authorization. Actual runtime sources/tests/verification are now
registered; Phase06 Verified follows executed checks, not scaffolding. Remaining
G4 resource deployment/provider/release checks retain PROD-002/017/019/RISK-018.
Customer Education is N/A for this technical kit. Future business consumers remain gated.

## 15. Handoff

Use the Shared public API and SHARED_COLLECTION_CONTRACT. IMPLEMENTATION_REPORT
records deliberate PrimeNG/generic harness differences and exact proof. No native
runtime or API business contract/schema was changed. API profile retains strict
catalog matching and requires matching host resource deployment (PROD-019).
Native profile retains AppDataTable; its five business UI audit journeys are N/A.
Current required-files manifest contains actual existing sources only. Closure
and the next sole Active preparation owner are canonical in ROADMAP/RESUME.

S1-A11 current shared evolution2026-10-30: optional pure typed public-criteria codec/component-scoped Router adapter now available through Shared data. Existing CollectionSort aliases the single CriteriaSort definition; controlled source remains unchanged and generic projected action spacing/wrapping is shared through collection-slots.scss.252unit/criteria40+8/collection8/navigation8/login10/language20 acceptance belongs to angular-collection-criteria-foundation/IMPLEMENTATION_REPORT.md; actual business/privacy/API/export scope still owner/S3. No domain/API/schema/native/resource change.

S3-A2 shared evolution2026-10-30: optional bounded search, typed card header/footer,
responsive columns/entity surface, inline progress and badge appearances preserve
defaults. MyDataGrid coalesces transient vendor field/order initialization into one
committed controlled pair. Actual Countries consumer and generic collection8/home14/
language20/context24/reporting8 acceptance: angular-countries-read-workspace/
IMPLEMENTATION_REPORT.md. Domain data/score/permissions remain feature-owned.

# S1-A3 — frozen shared collection contract

Scope: one coherent generic collection presentation kit and development-only
harness before Countries. Source/API semantics were reviewed after
PRIMENG_TABLE_CAPABILITY_REVIEW.md. This is no authorization for Countries CRUD,
reports/imports, another vendor Grid, new API lists or a global query store.

## Public components and ownership

Shared exports `MyDataGrid<T>` (erp-data-table), `CardList<T>`, typed cell/card
templates, and their common toolbar/footer/feedback composition. PrimeNG Table,
Checkbox, Paginator and existing shared actions/select/text/popover/scroll are
internal adapters. Features must not reconstruct these shells or use raw p-table.
Cards and Table share the same criteria/paging/feedback contract; domain card and
cell content remains a typed template. This is not a switch-based universal CRUD
component, form generator, business filter engine or persistence layer.

Caller owns scope/permission, API validation/cancellation, search debounce,
committed criteria, page and sort, data, callbacks and mutations. Shared owns
rendering, ephemeral display settings, row activation/page-only checkbox selection
and focus. Signals/computed are appropriate for this presentation state; no
coordinated business aggregate or NgRx/global cache is introduced.

## Controlled source and stale-result boundary

Query identity contains opaque nonempty scopeKey, criteriaKey, zero-based
pageIndex and positive pageSize. A result repeats these fields with readonly
rows, authoritative total or null (unknown), and hasNextPage. A caller-supplied
finite state is loading/ready/error/forbidden. Body rows render only for a ready
result matching current scope, criteria and page/size. Old responses cannot flash
after company, query or page replacement. Shared performs no HTTP request.

An earlier authoritative count may be displayed during replacement loading only
when scope/criteria match. Unknown is displayed as Unknown, never zero or an
invented all-results count. Caller is the only page-state writer and owns
out-of-range recovery after authoritative response. No automatic clamp/reset
effect emits a competing page command. Validate page bounds/unique stable row IDs
and finite counts; invalid source renders an error, not fabricated rows.

## Toolbar, criteria and slots

Reuse shared TextField/OptionSelect for controlled search value, optional registered
field/operator choices, and clear. Emit user intent once; no local filter/sort of
a downloaded server page. Caller performs debounce and API conversion. Changing
search/sort/filter resets page only in caller logic. Generic toolbarFilters and
toolbarContent remain available without another shell. Owner actions use shared
buttons and supplied permissions/read-only policy. Toolbar remains usable with
loading, empty/error/forbidden feedback. A typed emptyContent template may supply
domain feedback; no business messages are embedded in Shared.

## Paging and record navigation

Default page size10, options5/10/25/50, matching source defaults. Known totals use
the PrimeNG Paginator adapter; unknown totals use shared PrimeNG-backed previous/
next controls and page-size select without a fake total or last-page action.
All emit one controlled page request; a size change emits page0/new size together.

Record First/Previous/Next/Last is separate from page movement and checkbox bulk
selection. Keep an active record, initialize the first visible row, and retain
an intended absolute record target across a requested page until its matching
result arrives. Last is disabled for unknown totals. Next at an unknown boundary
can request the next page only when hasNextPage. No record is skipped when a
replacement page has not acquired an active row. Pending requests/targets are
discarded on scope/criteria/page-size or unrelated page replacement/error.

Checkbox select-all applies only to the current visible page and names that
scope. It never claims every server result. Row activation is independent;
buttons/links/checkboxes inside cells do not activate another row. Keyboard
activation/navigation and direct footer controls are Required. Clear activation/
bulk selection on scope/criteria changes; reconcile IDs on page changes. Owner
bulk mutations and all-results selection remain separate contracts.

## Capability matrix

| Capability | Web in S1-A3 | Native in S1-A3 | Enforcement / reason |
| --- | --- | --- | --- |
| Typed dynamic columns/cell templates | Required | Excluded new runtime | Owner columns/content, stable IDs |
| Shared toolbar/search/registered field/operator/filter/action slots | Required | Excluded | Controlled intents, caller validates API capabilities |
| Remote single sort / none | Required | Excluded | Explicit sortable columns; lazy Table; never local server-page sort |
| Known/unknown paging/counts and record navigation | Required | Excluded | One page writer and correct unknown bounds |
| Table / Cards / typed card scaffold | Required | Excluded | Common criteria/footer/feedback, separate content adapters |
| Three densities, column visibility/reset, static widths/min-widths | Required | Excluded | Ephemeral presentation, keep at least one/protected column |
| Horizontal Table scroll, bounded vertical panels, RTL, keyboard | Required | Excluded | Existing ScrollViewport for Cards; Table's own scroll container |
| Page-only checkbox selection and active row | Required | Excluded | Separate state and explicit scope |
| Loading/empty/error/retry/forbidden | Required | Excluded | Existing FeedbackState plus typed domain empty template |
| User resize/reorder/pin, complex grouped headers | Deferred | Excluded | FOLLOW-016; consumer-specific width/RTL combination proof first |
| Multi-sort / multiple constraints / grouping | Deferred | Excluded | FOLLOW-016; owning API contract first, Countries currently single only |
| Virtual/lazy range rows/frozen rows/detail expansion | Deferred | Excluded | FOLLOW-016; actual range/height/performance/detail owner first |
| Cell/row editing, row reorder persistence | Deferred | Excluded | FOLLOW-014/016; actual forms/dirty/concurrency and business owner first |
| Context menu and server-wide selection | Deferred | Excluded | FOLLOW-016; accessible direct action and selection contract first |
| Vendor CSV/whole-filtered export/XLSX/PDF/print | Excluded | Excluded | Owner export/report contract; no page-only export pretending all data |
| Chart/Report/Import and specialist adapters | Excluded | Excluded | Separate pilot/specialist slices, no fake buttons |
| Persistent vendor/browser Table state | Excluded | Excluded | Current no local/session-storage policy |
| TreeTable/Sheet/PRO Grid/pivot/formulas | Excluded | Excluded | Different workflow/product; Table is the adopted adapter |

Density and column visibility preserve source MyDataGrid behavior. Optional
resize/reorder/pin were inventory proposals, not previously Required scope; each
future option receives its own actual consumer and combination proof. This kit's
new controls stay coherent and small rather than forwarding every vendor input.

## Localization, presentation and dependencies

Generic captions belong to canonical core EN/AR, with existing pagination/actions
keys reused. Any missing collection labels are added bilingually through the
existing catalog generator and embedded API resource. Preserve SQL text scopes,
revision/reset and permissions; no translation store redesign. New catalog hash
requires synchronized API deployment before claiming hosted translation override
acceptance (PROD-019). Never silently accept an incompatible catalog version.

Source geometry target: toolbar controls36–40px, standard rows52px, compact36px,
comfortable68px, header56px, footer minimum52px, responsive padding4/8px. Preserve
canonical tokens/fonts and logical RTL. Columns may horizontally scroll inside
the Table; whole-page overflow is a regression. Mobile footer wraps without
hiding controls. Owner cell/card content may wrap and exceed minimum row height;
no fixed-height virtualization is claimed.

## Verification and bounded entry

Meaningful pure/unit tests cover stale source and counts, invalid IDs, unknown
boundaries, selection separation/reset, navigation across pages/error/races and
controlled intents. Technical harness uses synthetic domain-neutral records only,
never sample Countries or a production fixture generator. It demonstrates both
adapters and all finite states, small/wide EN/AR/light/dark, keyboard/focus,
density/visibility, filter slots, loading replacement and unknown totals.
Compare source toolbar/footer/paging/card composition at matching viewports and
record deliberate PrimeNG differences. No actual business API/DB/UI acceptance
is implied by this technical fixture.

Initial277 baseline and285 registered Phase00/entry recipe checks passed before
bounded runtime. Phase06 Verified evidence is in IMPLEMENTATION_REPORT.md; final
canonical manifest contains actual runtime and portable verification sources. G0–G3 are frozen for this generic client kit; no API/schema/
grant changes. G4 hosted/resource/provider release checks remain PROD-002/017/019
and RISK-018; advanced owned follow-ups remain FOLLOW-012/014/015/016. Overall
plan stays Draft. Phase06 must record actual verification before education.

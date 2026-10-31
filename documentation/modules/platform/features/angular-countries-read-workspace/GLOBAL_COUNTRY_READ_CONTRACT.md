# Frozen global Countries read workspace

Plan web-angular-migration / S3-A2 — Countries read workspace. Single coherent
read-only Countries workflow, after S3-A1 source audit Verified/Closed. Domain
owner ReferenceData; migration evidence Platform. No business meaning, API/schema,
write path, native implementation or license change. ActiveReports Excluded DEC-028.

Current correction addendum (2026-10-30): the original frozen baseline below is
retained as provenance. ADVANCED_FILTER_CONTRACT.md adds the bounded read-only
query endpoint and actual shell/sidebar entry. D22 overrides the extra visible
record-navigation bar: Countries renders one native PrimeNG Paginator; D23
explicitly enables shared record navigation inside its templateLeft slot, including
page1of1. The default remains opt-in for other consumers. CURRENT_GRID_REVIEW.md and its current results own
the latest executed correction proof. No full-pilot or deployed-query claim.

## Existing relationship and bounded scope

Reuse current /api/v1/countries page and /{id} detail, super_admin plus exact
Countries:View. Zero reads without both; no role-only or wildcard bypass. No tenant
module entitlement or company payload is added. Read-only browser control presence
does not grant API access. New authenticated /dev/countries is development-only;
business route is Excluded here until complete pilot acceptance S3-A8. Production
does not include the preview. Native five views retained, new native UI Excluded.

Required here: Grid/Cards with shared toolbar/search field/operator/status/sort,
column visibility/density options, footer/paging/record navigation; active/archived/
all status badges, six fields/codes, state count and audit display; detail-by-ID
read in shared dialog/form, loading/retry/empty/forbidden/error, keyboard and scoped
lifetime. Full pilot create/edit/lifecycle/chart/report/import are Required in
their queued S3-A3..A8 contracts; no disabled placeholders or full-pilot claim.
Standalone CSV/XLSX export is Excluded from current Countries source. Template/
PDF downloads belong to their required children. No report button in this child.

## Typed service and immutable data key

Service is the sole feature HTTP owner, exact configured HTTPS origin, cookies,
GET only and10second timeout. Parse unknown responses with installed zod/mini;
no compile-time cast of untrusted JSON. Separate list/detail models; no mutations,
unused endpoints, shared React DTO imports, BFF, tokens or raw HTML/error dump.

UI starts pageIndex0,size10,createdOn desc,status active,search empty/all/contains.
UI sizes5/10/25/50; API query accepts1..5000. Explicit mapper sends pageNumber+1,
pageSize,search/searchField/searchOperator/status/sortBy/sortDirection. Current
API-only currencyCode/hasStates filter contracts are retained in typed query but
not invented as new visual controls. Search200 UTF-16 units; unsupported sort/field/
operator/status/oversized text never starts HTTP. Source ordering has Id tie-break.
No opt-in URL persistence in this child: current Next controller does not serialize
criteria to the URL. Draft search input remains visible while invalid; valid
search text is debounced300ms as current shared list, criteria changes reset page0.
Search field/operator/status/sort changes issue current criteria once. Do not fetch
whole datasets or locally re-filter/re-sort a server page. Grid/Cards share one
owner and page; view switching makes no duplicate read. Refresh coalesces pending.

Response items unique positive int32 IDs, typed strings/nulls/date/isDeleted,
statesCount only on list; detail no synthetic count or children. Validate complete
page metadata: positive currentPage/pageNumber/pageSize, nonnegative totals/pages,
boolean hasPrev/hasNext. Match request page/size, items<=pageSize, unique IDs and
authoritative row/total semantics; allow an empty out-of-range page, then clamp
once only after that actual ready response. No previous-page rows during loading.
Optional code strings preserve current bytes/null; do not treat empty/null/0/false
as another meaning. Dates accept current server ISO timestamp semantics and format
with current locale as the source does; no UTC rewrite of timestamps.

## State, permission and failure behavior

Use existing createScopedRead with immutable captured identity+criteria. A new
identity/criteria masks old data synchronously; switchMap cancels previous HTTP.
Null identity/loading clears rows and detail.403 is forbidden for current identity,
with no retry bypass;401/network/timeout/malformed response is safe visible error,
with manual safe-read retry. Server remains authoritative. Current Country DTOs
carry no expectedRowVersion; this read child makes no write/concurrency claims.

Only current allowed visible rows can open detail. Detail captures actor+ID,
cancels on replacement/close/destroy/permission change and cannot paint late bytes.
New identity closes the prior detail before asynchronous effects. Close is allowed
during a pending read and cancels it; no unsaved prompt for a read-only form.
404 detail has safe missing/error feedback and retry/close, with no stale list-row
fallback. Role/permission loss prevents opening or retrying prior content. Locale
changes repaint text/dates; no reread because these read DTOs are bilingual.

## Shared-first UI and permitted generic extensions

Use existing MyDataGrid/CardList public API, not raw PrimeNG Table or a local shell.
Keep all existing search/options/footer/navigation controls. Put status/reset in
generic toolbarFilters/content slots. Use PageHeader,OptionSelect,ActionButton,
StatusBadge,ProgressMeter,DialogPanel,FormContainer,TextField,FeedbackState and
ScrollViewport where appropriate. Use shared card shell and domain-only content.

Existing shared controls are close: add an optional maxLength to CollectionSearch
with generic field validation/message and no request from invalid search; preserve
all existing default behavior. Add showSubmit defaulttrue to FormContainer so a
read-only view has a Close action and no fake Save. Guard hidden submit callbacks.
If current CardList slots cannot match the reviewed header/footer, extend generic
card header/footer template projection through existing SurfaceCard, with typed
generic template context and unchanged default title/body. No Country formula,
permission or HTTP belongs in shared code. Meaningful compatibility tests required.

Country owns quality score (50+15 per present name+5 per code/phone/currency,
capped100), bilingual names, flags/codes, archived badge, state count and view
callback. Full code/name/null/date/state fields appear in Grid and Cards/detail
where the actual source does. Dialog uses shared readonly inputs/form lifecycle,
not a feature form-shell clone. All visible strings use existing core and
reference-countries EN/AR SQL-backed catalogs; unused retained AR keys are not
rendered or treated as an integration. No new catalog keys expected.

## Verification and exit

Before runtime: four current applied books/final current-only manifest, request/
evidence, G0-G3 for this exact read scope and397recipe/planning entry checks.
Remaining G4 PROD-002/017/019/RISK-018 are release-only here; specialist/real engine
RISK-017/008 do not change the frozen read contract and gate their own children.

Test query/parser/metadata, HTTP origin/credentials/cancel/timeout, state identity/
permission/criteria/debounce/clamp/detail/403/retry/destroy and non-trivial shared
extensions. Full Angular check, own397recipe/planning/diff, browser actual shared
controls/paging/Grid/Cards/detail/context/logout,5palettes/light-dark/EN-AR/390-1440.
Compare required shared controls, rows/cards and detail against current Next at
same viewport/data; record intentional differences due this bounded no-write scope.
Unresolved visual differences are regressions. No full Countries acceptance from
this read child. API74/Next13 source-audit tests are retained; new API/native/Next
runtime absent. Distinguish inherited RISK-012 and manual hosted release checks.
Phase06 Verified before customer/technical education and closure.

Shared compatibility detail: ProgressMeter may receive an optional explicit accent for owner-defined quality scores; its existing usage-threshold default remains unchanged. No Country rule enters Shared. Primary references: https://angular.dev/api/common/NgTemplateOutlet and https://angular.dev/guide/http/making-requests confirm typed template context and subscription-owned HTTP cancellation.

## Requester navigation correction2026-10-30

Data button on Super Admin dashboard opens the existing shared navigation, not a direct country jump. Sidebar hierarchy Data → Global Geography → Countries is composed from current authorized implemented screens. Country selection opens the dev-only preview within the authenticated shell; no placeholder siblings or production business route. Shell owns navigation/context; shared frame/list own expansion, search, keyboard and mobile Drawer. Current verification reopened until full shell-entry and regression acceptance.

## Exact header fidelity and PrimeNG column menus — requester correction

The requester rejects adapted header styling: copy current Next PageHeader/MultiView header, DataGridToolbar and centered column header geometry, typography, labels, icons, spacing and colors through existing shared components. Newly requested PrimeNG display=menu filters are the sole added visual control. Bind one active text-column condition (six current API operators,200characters) to the existing server query; status remains independently supported. AND/OR/add-rule controls and arbitrary unsupported fields are Excluded from this current hosted contract, not client-side page filtering. Current visual acceptance is Not Verified until same-viewport source comparison and native menu/server paging proof.

Latest requester expansion: one-condition-only advanced filtering decision above is superseded. Complete shared Table capabilities and source-identical appearance are Required through S1-A14; actual Countries multiple-constraint server query/host support and shell-entry verification are Required on resuming this child. No silently ignored criteria or local filtering of a remote page.

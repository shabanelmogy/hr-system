# Shared collection export implementation request

Plan: web-angular-migration; exact slice S4-A4a — Shared all-filtered Excel and CSV export. Operating mode: existing shared capability extension. Owning Platform UI/Reporting formatting. Source contract: documentation/plans/business/web-angular-migration/decomposition/angular-collection-export.md. Final current-only manifest: required-files.json.

Extend existing Reporting formatting service/CQRS; Platform owns reusable Angular orchestration. Reuse existing source-data services under their own modules. No new bounded context, database entity or schema. TenantMember explicitly denies super_admin; the global formatter must have a distinct GlobalDataExports:Export grant and super_admin role. Do not weaken the tenant route.

Reporting generates files from submitted scalar dictionaries; it does not fetch collection rows. Angular now captures domain-owned filters and reads every matching page before sending the complete projection to the existing formatter. PageHeader owns one shared Excel/CSV action for Grid and Cards. Countries, States, Districts, Tenants, Tenant Administrators, Audit Trail, System Error Logs and the global report manager consume the shared contract. Audit Trail retains Grid-only presentation; Tenant Administrators retains Cards-only presentation; export does not add unsupported views.

Allowlisted ordered scalar columns/labels and rows. Capture fileName/culture/format and source query identity.100000rows,200columns,2000000cells,8MiBrequest envelope; no silent truncation. Dedicated domain caps remain authoritative, including5000ErrorLogs.

Source View and formatter Export grants are independent. Domain owner supplies filtered pagination; formatter only creates a file. Validate/escape CSV, reject complex values and unsafe filenames, bound requests and preserve Arabic unicode. No selected/current-page substitution.

Web embedded P-001 Export Required in current collection headers. New native/PDF/import/chart/CRUD/offline persistence Excluded. Existing native/Next consumers retained; backward-compatible CSV correctness applies to existing formatter use.

Retain tenant Excel/CSV POST actions. Separate global formatter in Reporting with super_admin+GlobalDataExports:Export. Current verified actor selects route; exact credentials/CSRF/status/MIME/size/timeout. Known-total/cursor/local sources use captured actual filters/order and fail on count drift, duplicate IDs/cursor cycles or limit overflow.

PageHeader/ActionMenuButton/notifications and shared export-port/orchestration. Reporting service implements injected file-generation port; composition binds it. No shared→Platform/Reporting dependency, no UI HTTP, no local Grid/Card look-alike. Feature adapters own source queries/field projections.

Unavailable/empty/loading/cancelled/sourcefailure/limit/formatterfailure/forbidden/success are distinct. No automatic replay, native alerts or raw exception bodies. Header remains bounded and accessible at390/900/1440 EN/AR light/dark, including900x640.

Export never mutates visible page/selection/filter state. Actor/filter/order/grant/locale replacement and destruction cancel all stages and stale downloads/feedback. Existing API lacks atomic multi-request snapshot isolation; detect observable drift and document that limit. No DB transaction/jobs introduced.

Canonical EN/AR keys and generators, captured labels/culture, Arabic XLSX direction and UTF8BOM CSV. Reuse menu keyboard/focus/RTL behavior. No outer page overflow.

Version2 contract freezes G0owner/G1P-001embedded/G2typedboundaries/G3verification. S4-A4 predecessor client/education Closed. This current-only manifest/books/recipes must generate/check before runtime. Existing release-only catalog/report gates retain exact scope.

Phase06 Verified2026-11-07 for the bounded local client and formatter integration. Full npm run check passed997tests/195files and32architecture tests. Reporting252tests passed; the unchanged full API source retains the1331pass/3opt-in-skip receipt recorded by angular-account-profile. The final browser matrix passed12EN/AR Light/Dark390/900/1440cases, including900x640:312parsed CSV/XLSX files across8owners, every projected cell compared,12cancel/denial cases and12recovery files. The loopback real Reporting controller/CQRS/writer passed12authorization/file/empty-input cases. Zero outer overflow. Evidence and45source hashes are in verification/verification-2026-11-07.json. The Countries development build preserves its production gate. Hosted acceptance remains PROD-032; no real business writes or deployment occurred.

No dependencies, schema changes, migrations or business-data writes are introduced. Hosted coordinated endpoint/client publication, catalog permission seeding/assignment and real browser-auth acceptance remain PROD-032. Existing tenant formatter authorization is preserved. Local loopback fixture authentication proves controller role/grant boundaries, not hosted Cookie/CSRF acceptance.

Phase07 completed after Phase06 Verified and540recipe check. Arabic customer education is documentation/plans/business/web-angular-migration/education/angular-collection-export.md.

S4-A4a bounded API/Web/integrated acceptance is Verified. New native functionality is Excluded and existing native consumers are retained; no device acceptance is implied. Documentation and Arabic education are Closed for the bounded local implementation. The final Super Admin review remains Required; production Countries and hosted/provider gates are separate and open.

# Shared collection export — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A4a — Shared all-filtered Excel and CSV export |
| Child Feature ID | angular-collection-export |
| Child feature name | Shared all-filtered Excel and CSV export |
| Owner | Platform Angular collection orchestration; Reporting owns file formatting API |
| Depends on | S4-A4 Error Logs and Settings client/education Closed907tests |
| Execution status | Active — source preflight |
| Runtime authorization | User2026-11-06 explicitly requests reusable API Excel/CSV, all matching filtered pages, PageHeader placement serving Grid/Cards. G0-G3 are frozen below. Runtime starts only after Phase00 books/manifest/generation/check and source review. |

## 1. Child boundary and outcome

Add one reusable header Export menu for Excel/CSV independent of Grid/Cards. Export
all authorized rows matching the captured filters and ordering, never just a loaded
page or selected rows. Reuse existing Reporting ExportExcelService and CQRS; no
second writer or client spreadsheet encoder. Existing dedicated domain export
limits remain authoritative, including5000ErrorLogs. Ordinary collection export
uses a finite100000row/200column/2000000cell/8MiBrequest safety envelope, with an
explicit user error and no truncated download if exceeded. No new dependencies,
entities, schema, background job, offline store, native UI or PDF capability.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Pattern | Reuse | Status | Capability decision | Authority / feedback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| shared.collection-export | Web | Existing collection PageHeader | Download all filtered data as Excel/CSV | P-001 embedded action | PageHeader, ActionMenuButton, notifications | Adapted | Export Required; no new CRUD/Import/Chart/Report | Source View plus formatting Export grant; pending/cancel/empty/error/success |
| shared.collection-export | Mobile | Existing native screens | Retain current source | N/A retained | Existing native design system | Excluded | New native export Excluded | No native rewrite; compact browser is not device acceptance |

## 3. Closest existing reference

Reporting ExportController/ExportRequests/ExportExcelService are the existing
formatting owner. Next useCollectionExports/useExportPipeline supplies proven
projection/feedback discipline but currently sees loaded row models; it is not
evidence of all-pages export. Angular ErrorLogExportState supplies scoped
download cancellation; Countries/States/Districts service/query owners supply
actual page/criteria contracts. Do not copy domain fields across owners.

## 4. Reuse and composition contract

PageHeader renders a typed optional export menu through existing ActionMenuButton.
Shared collection-export orchestration captures an immutable authorized context,
columns, locale and a domain-owned page source. Shared UI never calls HTTP or
imports Platform/Reporting. A shared file-writer port is supplied by application
composition and implemented by the owning Reporting Angular service. Feature
state/adapters own source query/permissions; pages only bind context/callbacks.
Reuse existing external resources, component folders, dates and projection helpers.

## 5. Screen and workspace contract

Header Export remains available in Grid and Cards when its capability is allowed.
It offers Excel and CSV with accessible names, dropdown indication, bounded
pending feedback, cancel and translated empty/failure/completion messages. It
does not create a duplicate Grid/Card toolbar. No outer page overflow. Do not
render export on data-entry-only pages or treat nested detail tables as separate
domain collections. Current collection owners are Countries,States,Districts,
Tenants,TenantAdmins,SystemAudit,ErrorLogs and Reporting manager/catalog where
their source has a collection. Owner-specific endpoints/grants/row limits apply.

## 6. Typed transport and server criteria

Retain existing tenant POST /api/v1/export/exportExcel/{fileName}/{culture} and
exportCsv equivalents with TenantMember+Analytics:Export. They are file generators
from submitted scalar dictionaries, not data-query endpoints. CSV must quote
comma/quote/newline, use CRLF and UTF8BOM, and neutralize spreadsheet formula text.
Excel preserves safe scalar values and Arabic worksheet direction.

The existing tenant policy explicitly denies super_admin. Add a separate global
formatter endpoint in Reporting, role super_admin AND GlobalDataExports:Export,
declared under its own Global module-catalog submodule. No removal or weakening of
tenant authorization. The formatter reads no business database and cannot grant
source-data access. Tenant/global client adapter selects the correct endpoint
using current verified identity; CSRF/credentials/timeout/content-type/size/status
checks apply. Global permission has bilingual labels and startup seeding follows
the existing module catalog. No migration or schema change.

Source pagination keeps all captured filters/sort/archived status. Known-total
pages check consistent count, page identity and duplicate row IDs. Cursor pages
check repeated cursors/duplicates and a finite envelope. Local complete arrays
apply the owning feature's existing local criteria across the full collection.
Changing page alone does not change the export criterion; actor/query/grant/locale
replacement or destruction cancels and suppresses all late download/feedback.

## 7. Create, edit, view, and lifecycle contract

Export is a read-only operation despite POST file generation. It never mutates
entities or calls Save. Capture only allowlisted scalar columns, exclude actions,
checkboxes/hidden security data and diagnostics by default. Column labels follow
the captured locale; duplicate headers cannot overwrite a cell. Filename is safe
and extension matches format. Empty results show guidance without an empty-file
request. Current dedicated log-export5000limit remains enforced.

## 8. UX states, permissions, offline, and mock data

Separate unavailable/empty/loading/pagefailure/limit/formatterfailure/forbidden/
cancelled/success. No automatic replay. Source permission and formatter permission
are both required. Dirty/pending business forms are not reset by export. No log or
export payload persistence, raw server exception display or native alerts.
Synthetic fixtures only; no production writes or real data downloads in acceptance.

## 9. Concurrency, transactions, and consistency

Export does not change visible paging/selection/query state. One explicit operation
per owner. Abort page reads/file generation on cancellation. The current APIs do
not provide an atomic multi-request database snapshot: detect changed totals,
duplicate IDs/cursors and report failure rather than imply snapshot isolation.
No new database transaction or server export job is introduced. Source API limits
and scopes stay owned by their current modules.

## 10. i18n, RTL, accessibility, and responsive behavior

Canonical core EN/AR keys and generators; Arabic file labels/direction and CSV
unicode work. Existing shared button/menu keyboard/focus/RTL remain authoritative.
390/1440/light/dark fixture acceptance covers Grid/Cards/header export, cancellation,
all-pages criteria and files opened/parsed by standard test readers.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Active | Existing source/authorization identified | Formatter/CSV/range/auth tests and source contracts | Owning API book |
| 2 | Web | Queued | API contract stable | Shared header/adapter/all-page owners and full/browser gates | Owning Web book |
| 3 | Mobile | Queued | Web complete | Retained source boundary; new native Excluded | Owning Mobile book |
| 4 | Integrated live verification | Queued | Client/source complete | Local fixture server files; no hosted data writes | Evidence ledger |
| 5 | Documentation and closure | Queued | Phase06 Verified | Arabic education/canonical generation/check | Master book |

## 12. Verification contract

Meaningful API tests for CSV escaping/formulas/empty/envelope, Excel data/Arabic,
unchanged tenant and new global authorization. Shared orchestration tests prove
all-pages filters, order, empty, limits, count drift, cursor cycles, scope/criteria
cancellation and no stale download. Header interaction tests and actual fixture
browser matrices prove Grid/Cards share one menu and parsed files contain all
matches. Full Angular gates, required API solution gates, source review and shared
regressions. No dependency install or live database mutation is needed.

## 13. Child exit gate

- [x] Existing formatter/source page owners and real tenant/global permission boundary identified.
- [x] User chooses all filtered pages and header placement for both Grid/Cards.
- [x] Active P-001 action composition; native/PDF/new domain/schema Excluded.
- [ ] Phase00 canonical books/request/current-only manifest/recipes/check reviewed before runtime.
- [ ] API then Web clients, complete acceptance and owner regressions Verified.
- [ ] Phase06 Verified, Arabic education/Phase07 and next Super Admin handoff.

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
| Execution status | Closed — bounded local API/Web acceptance and Arabic education; hosted rollout remains PROD-032 |
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

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| shared.collection-export | Web | Existing collection PageHeader | Download all filtered data as Excel/CSV | Paged/scoped read and file generation | P-001 | Embedded action; no new form | web-next/src/shared/hooks/useCollectionExports.ts | Adapted | Export Required; retain existing views; no new CRUD/Import/Chart/Report | Pending/cancel/empty/error/forbidden/success; retain drafts | Online only; no payload storage | Synthetic fixtures only | Source View plus formatter Export; tenant/global independent | EN/AR390/1440/lightdark; shared menu/focus | API file writer reused; all-pages loading added by request |
| shared.collection-export | Mobile | Existing native screens | Retain current source | No new native operation | N/A retained | No new form | mobile-react/src/platform/reporting | Excluded | New native export Excluded | Retained native states | Retained policy | No new generator | Existing native authorities | Compact browser is not device acceptance | Explicit Angular enhancement; native rewrite excluded |

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
| 1 | API | Verified | Existing source/authorization identified | Formatter/CSV/range/auth tests and source contracts | Owning API book |
| 2 | Web | Verified | API contract stable | Shared header/adapter/all-page owners and full/browser gates | Owning Web book |
| 3 | Mobile | Verified | Web complete | Retained source boundary; new native Excluded | Owning Mobile book |
| 4 | Integrated live verification | Verified | Client/source complete | Local fixture server files; no hosted data writes | Evidence ledger |
| 5 | Documentation and closure | Closed | Phase06 Verified | Arabic education/canonical generation/check | Master book |

## 12. Verification contract

**Next-step rule:** System UI texts/Settings host, operational tools and the final
Super Admin review stay Queued until this exact export slice is verified and closed.

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
- [x] Phase00 canonical books/request/current-only manifest/recipes/check reviewed before runtime.
- [x] API then Web clients, bounded local acceptance and owner regressions Verified; hosted rollout PROD-032 remains open.
- [x] Phase06 Verified, Arabic education/Phase07 and next Super Admin handoff; final whole-Super-Admin review remains open.

Phase00 promotion2026-11-06: existing-only manifest/four books/516recipe check and planning pass; independent source review has no unresolved P1/P2 inG0-G3. Exact API/Web export slice runtime is now authorized; overall migration readiness and external publication remain separate.


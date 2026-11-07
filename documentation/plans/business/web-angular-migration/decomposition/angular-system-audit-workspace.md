# System Audit Trail — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A3 — Super Admin System Audit Trail parity |
| Child Feature ID | angular-system-audit-workspace |
| Child feature name | Super Admin System Audit Trail parity |
| Owner | Platform system audit reading; each module owns its records |
| Depends on | angular-tenant-admins-workspace Verified client and education; shared Grid/forms/dialog/transport |
| Execution status | Closed — Verified Angular client and Phase07 education |
| Runtime authorization | D42 existing-source parity; G0-G3 resolved by inspected source below; Phase00 generation/check/planning required before runtime; remaining G4 release-only PROD-019/028/025/RISK-020 |

## 1. Child boundary and outcome

Implement /super-admin/audit-trail matching the current Next page: system-wide,
read-only cursor-paged Grid; record-key search; module, dependent entity, action,
from/to date filters; refresh; per-entry detail with field old/new changes table.
List has six columns: time, action, record, module, user, change count. No new
audit writer, event stream, schema, API, dependency or native rewrite.

Cards/Tree/Chart/Report/Import/Export/create/edit/delete/restore/mock generator are
Excluded by the actual source. The existing per-record/company audit dialog is a
different consumer and is Excluded from this system-only client slice. Other
Super Admin operational viewers/settings and final parent review remain Required.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-audit | Web | /super-admin/audit-trail | Inspect authoritative system record history | Read-only server collection with cursor and details | P-001 | C-02 Grid; C-01 read-only shared detail dialog; toolbarFilters criteria | web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx; components/AuditTrailTable.tsx; components/AuditTrailDetailsDialog.tsx | Adapted | Grid/Table/Detail Required; Cards/Tree/Report/Import/Export/Chart and all mutations Excluded | Initial/background/empty/error/retry/403/invalid date range; detail loading/retry/not-found/403; no dirty or write conflict | Online authoritative; no persisted history/cache | Excluded by source; fixtures test-only | super_admin AND SystemAuditTrail:View; global server-derived scope | EN/AR390/1440/light/dark; keyboard row Enter, contained Grid scroll, visible focus and dialog close | Existing shared Angular widgets/scroll/layout, strict payload validation; no MUI wrapper copy |
| platform.system-audit | Mobile | Existing mobile-react/src/platform/tools/audit-trail | Retain existing native audit behavior | Current native page/detail | N/A | New native conversion Excluded | mobile-react/src/platform/tools/audit-trail | Excluded | All new native surfaces Excluded | Retained existing native states | Retained policy | No new generator | Existing native scope and grants | Compact Web is not native-device acceptance | No domain/schema/native change |

## 3. Closest existing reference

Actual Next AuditTrailPage/Table/DetailsDialog/hooks/service/types/formatting own
scope, fields, actions and pagination. Countries supplies only the shared Grid
composition, toolbar/filter slots, header, feedback, detail/dialog and source
discipline. Do not copy Countries CRUD, total-count query, lifecycle, imports or
reporting into audit. Existing shared collections already support unknown totals.

## 4. Reuse and composition contract

Use MyDataGrid public API, PageHeader, DialogPanel, RecordSummary, StatusBadge,
OptionSelect, DateField, FeedbackState and shared buttons/formatting. Search uses
the existing generic toolbar search contract. Feature pages provide typed data,
permissions and callbacks. Focused components for criteria, collection, details
and changes compose existing shells; no local table/modal/fetch implementation.
Retain native PrimeNG Table paging/column controls/footer/record navigation;
projected columns select stable keys via collectionColumn. No form engine.

Source-parity clarification: both Next audit Grids retain MyDataGrid's checkbox
selection and record-navigation defaults. Angular must enable the existing shared
capabilities on the list and changes Grid. Selection has no business mutation or
bulk action. Its controls must not open the detail dialog. Checkbox grids keep
selection empty initially while activating the first record, as in the source.

Verified shared gap: RecordSummary currently supports title/description/a single
metadata text only. Extend its existing public API with optional typed fields:
id, label, value, optional fullWidth and direction. Keep existing summary inputs
and empty-fields default unchanged. Render semantic dl/dt/dd with shared responsive
two-column layout, text escaping and wrapping. Feature supplies translated labels,
empty-value text and formatted domain values. Tests cover default compatibility,
labeled values, arbitrary snapshot text and logical direction/fullWidth. This
resolves the independent preflight P2; no feature-local metadata shell is allowed.

## 5. Screen and workspace contract

One Grid view, fixed server page size50, newest-first server order, no sortable or
advanced-column-filter affordance unsupported by this API. Unknown total stays
null, never invented from loaded pages. Composite moduleCode:id row identity;
equal IDs in different modules are distinct. Only known previous and exact next
cursor pages can be selected, no random page fetching/offset conversion.
Unknown-total footer retains explicit cursor-page next/previous controls alongside
record navigation, as in the actual Next footer. Enabling record navigation must
not remove the direct page controls. Last-record navigation remains unavailable
without an authoritative total. Shared wrapping contains these controls on mobile.

Search record key is trimmed/debounced300ms and bounded200characters. Filter
changes reset page/cursor chain. Selecting a new module resets entity selection;
entity options come from the authoritative filters endpoint, deduplicated/sorted.
Action choices Created/Modified/Deleted/Restored plus all. From/to are local calendar
days converted to UTC start/end, matching Next dayjs behavior including DST. Invalid
dates or inverted range suppress GET and show actionable shared feedback. Refresh
must not reuse an earlier filter/actor cursor or relabel stale data as current.

## 6. Typed transport and server criteria

GET /api/v1/system-audit-trail with optional moduleCode/entityName/entityKey/action/
fromUtc/toUtc/cursor and pageSize50; GET /filters returns modules/entityNames;
GET /moduleCode/id returns entry plus field/oldValue/newValue changes. Exact200,
bounded timeout, credentials and URL encoding through current API infrastructure.
No tenant/company filter, user selector or mutation is added: source UI lacks them.
Server resolves global scope and module ownership; client never decodes cursors.

Validate unknown bodies, allowed action literals, positive safe integer IDs,
nonnegative changeCount, ISO timestamps, nullable text, arrays and duplicate
composite keys; reject malformed shapes instead of coercing them to defaults.
Detail must match requested moduleCode/id. Cursor is opaque nonempty bounded400
or null; don't encode field content into URLs beyond the actual query contract.

### Permission Action Matrix

| Action | Exact authority | Client barrier |
| --- | --- | --- |
| Route/sidebar/list/filters/refresh/search/page | super_admin AND SystemAuditTrail:View | Guard and actor-scoped state; fail closed; 403 masks stale snapshots |
| Open/retry detail | Same exact role and grant | Current row composite identity/current actor, cancellation on replacement |
| Any write/export/report/import | Excluded by actual source | No placeholder control, request or invented permission |

## 7. Create, edit, view, and lifecycle contract

No create/edit/delete lifecycle in this read-only workflow. Detail metadata displays
module, record key, user and timestamp; server changes show field/old/new values,
translated known fields with humanized fallback and a translated empty value.
Local detail changes table supports10/25/50pagination over the already returned
detail array. Unknown labels are rendered as text, never trusted HTML. User label
uses userName then userId then translated System. Actions use shared semantic colors.
Fresh detail and retry use the owning service, no field history inferred from lists.

The detail Grid has local single-column sorting on field/oldValue/newValue,
matching AuditTrailDetailsDialog's sortable columns. Sort the full returned
changes array before pagination, preserve original-index row IDs and stable ties,
and reset to the first page when sort changes. Null values sort before text in
ascending order and after text in descending order; compare raw snapshot values,
not translated display labels. A new detail snapshot resets local sort/page.
Use a small shared local-collection adapter over the existing MyDataGrid source
contract; keep its remote/lazy semantics and all existing consumers unchanged.
No list sorting, new GET, offset conversion, dynamic schema or Grid shell is
introduced by this detail-local behavior.

The detail Grid also retains the source's client text filtering. One active
condition can target field/oldValue/newValue using contains/notContains,
equals/notEquals, startsWith/endsWith, isEmpty/isNotEmpty or isAnyOf. Conditions
use raw snapshots; empty means null/undefined/empty string, not a translated empty
label. Text input values are trimmed, comparisons ignore case, equality/isAnyOf
use base-sensitive search collation as in the installed MUI comparator. Apply the
filter to the full snapshot before sorting/pagination; reset page and selection
on criterion changes, and reset the filter on a new snapshot. No GET is sent.
Compose a shared text-filter popover from existing shared fields/options/buttons;
the toolbar provides column/operator selection and an add/remove value list for
isAnyOf. This replaces MUI's filter-panel placement while preserving its nine
operators. Remote GridFilters/API criteria are unchanged. The cursor list keeps
all local/advanced column filters disabled.

## 8. UX states, permissions, offline, and mock data

Actor-scoped list/filter/detail reads synchronously mask stale authority and cancel
in-flight streams on replacement/destruction. 401/403 never display old history or
enable an unauthorized retry. Errors use translated bounded guidance, no raw
ProblemDetails/internal exceptions. Initial/background/empty/error and invalid
date states remain distinct. Close detail cancels its read. No offline persistence
or automatic repeated requests; fixtures are test-only and source never imports them.

An audit-owned actor denial is shared by list/filter/detail: any401/403 masks all
history/choices and blocks subsequent requests for that same actor. Detail denial
retains a terminal forbidden dialog until the user closes it, with no selected
metadata or changes. This display outcome grants no authority. Actor replacement
clears the outcome and cannot inherit an old denial or response.

## 9. Concurrency, transactions, and consistency

Read-only snapshot and cursor consistency are API-owned. No rowVersion/write
transaction/realtime subscription is invented. Criteria and actor identity own the
page-chain lifetime. Do not combine pages fetched for different filters or actors.
Refresh invalidates obsolete cursors and any detail that no longer belongs to the
visible current result. Cursor/next-page errors must not advance to missing data.
No SQL/schema changes or production business writes are needed for this client.

## 10. i18n, RTL, accessibility, and responsive behavior

Use existing platform-advanced-tools auditLog resources and shared core; author any
new visible key in both canonical Next EN/AR inputs then generate Angular catalog.
PROD-019 owns hosted publication. Shared date/calendar/locale behavior, Grid keyboard,
labels/focus, dialog Escape/close, RTL logical styling and no outer scrollbar.
Column widths/rendered values/toolbar/filter/paging/detail are compared against
actual current Next at390/1440in both modes/languages; document intentional shared
Angular widget differences and fix missing data/actions.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing controller/query/source inspected | Exact global scope/grant/cursor/detail semantics; no API change | angular-system-audit-workspace-api.md |
| 2 | Web | Verified | D42/S4-A3 and Phase00 generation/check/planning | Complete Required Grid/filter/detail and full checks/browser | angular-system-audit-workspace-web.md |
| 3 | Mobile | Verified | Web verified | Retained-source boundary verified; new native conversion Excluded | angular-system-audit-workspace-mobile.md |
| 4 | Integrated live verification | Verified | Client ready | Fixture and real read-only hosted surface verified; no hosted business writes or native-device acceptance | angular-system-audit-workspace-evidence.md |
| 5 | Documentation and closure | Closed | Phase06 Verified | Arabic education/manifest/generated books/parent handoff; final reconciliation | angular-system-audit-workspace-review.md |

## 12. Verification contract

**Next-step rule:** error logs/settings/system UI texts/advanced-tool siblings stay
Queued until this feature's Required runtime, Phase06 acceptance, education and
canonical documentation closure are complete. Do not treat a menu, DTO or passing
shared harness as acceptance of the complete viewer.

Meaningful tests cover malformed payloads, composite IDs, opaque cursor chain,
fixed50/unknown-total Grid, parent-dependent filters, calendar UTC/DST/invalid range,
scope/readOnly/403/cancel/stale response, detail mismatch/empty changes/retry and
shared paging/keyboard. Full npm run check and same-viewport rendered Next/Angular
EN/AR/modes/390/1440matrix. Real hosted GET only; don't write audit rows to manufacture
data. Native unchanged; mock generator Excluded. Independent scoped source review.

## 13. Child exit gate

- [x] G0 existing global source/permissions/ownership and G1 P-001 Grid/detail selected.
- [x] G2 existing API/cursor/shared contracts and G3 verification/no schema change frozen.
- [x] Phase00 current-only manifest/books/request/recipes generation/check/planning pass500recipes before runtime; two inherited unrelated planning warnings.
- [x] Required implementation/tests/browser/source review pass: full844 tests/158files; Angular8+32 and Next8 matrices; four owner regressions; no P1/P2.
- [x] Phase06 Verified with exact hosted/native/external limits; hosted GETs200/200/200 and owned logout204; no business writes.
- [x] Phase07 Arabic education follows Verified; final canonical generation/check closes the child before sibling runtime.

Remaining G4 release-only PROD-019/028/025/RISK-020 do not excuse a client defect or
authorize API/native/schema redesign. Error logs/settings/system UI text/advanced
tools and the final comprehensive Super Admin audit remain Required.


Historical foundation checkpoint2026-11-06 (superseded by full client acceptance below): typed contracts/read-only service/calendar criteria, actor/criteria cursor read state, scoped detail/filter reads and shared RecordSummary optional metadata are implemented with focused tests. No audit page/route/browser/Phase06 acceptance yet. Next exact action: compose shared Grid/filter/detail components and guarded route/nav, then required fixtures/current-source/hosted read-only/full gates and closure.

Final foundation gate800tests/148files passes; four owner browser smoke regressions pass; independent authority findings repaired/reviewed. Checkpoint FOUNDATION_2026-11-06.md and portable receipt are registered. Actual audit consumer/browser acceptance remains Required, not inferred from this foundation.

Current client acceptance2026-11-06: Phase06 Verified within the authorized Angular client scope on 2026-11-06. Full npm run check passes 844 tests/158 files, 30 architecture and four configuration tests plus format/lint/catalog/tokens/fonts/types/build. Angular positive matrix eight cases, negative matrix 32 cases and rendered current Next reference eight cases pass. All nine detail text operators, local sort/page, checkbox isolation, explicit cursor pages and record navigation are covered. Four full-journey owner smoke regressions pass (Tenant Management, Tenant Administrators, States, Districts). Hosted list/filters/detail return 200 with 31 records/three modules/six changes; the actual authorized Angular route renders, owned logout returns 204, and business writes remain zero. Independent scoped review has no unresolved P1/P2. Current report/portable receipt: SYSTEM_AUDIT_WORKSPACE_2026-11-06.md and verification/SYSTEM_AUDIT_WORKSPACE_2026-11-06.json. Foundation and pre-filter checkpoints remain historical. Initial 578.82kB/transfer148.38kB warning remains RISK-020. Arabic education is complete; final documentation reconciliation precedes the next sibling.

Final canonical generation/check passes500recipes and planning checks pass with the two inherited unrelated v2-contract warnings. S4-A4 source preflight is the next active child; no successor runtime before its own Phase00.

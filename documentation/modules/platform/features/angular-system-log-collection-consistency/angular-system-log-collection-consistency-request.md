# System log collection consistency implementation request

Operating mode: existing-feature change. Plan web-angular-migration, exact authorized slice S4-A4b — System log collection consistency. Owning module Platform; contract documentation/plans/business/web-angular-migration/decomposition/angular-system-log-collection-consistency.md. Current source manifest required-files.json.

Existing Platform Audit/Error reads are the business owners. Shared Angular collections own all pagination/card presentation. BuildingBlocks may own the neutral typed filter mechanism used by both reads. Preserve independent module audit stores; no foreign table/DbContext, domain entity or schema change.

Verified: both grids lack column filter configuration; Error cards repeat six metadata paragraphs; shared footer selects native known-total markup and separate unknown-total buttons. User explicitly requires real column filters, compact cards and one consistent shared pagination policy. This is an approved change beyond retained Next parity.

Optional columnFilters JSON on existing GET requests; maximum14unique fields,4rules/group,16KiB JSON,200characters/text value. Typed allowlists and exact AND/OR semantics; see the frozen contract for every field. Unknown/malformed values reject; no arbitrary SQL/property interpretation. Existing requests remain compatible.

Apply predicates before count/Take/cursor merge/page/export. Audit UserName resolution belongs in Platform and passes resolved ids to module-owned sources; module filters remain neutral. Error IP remains system-only. Preserve dedicated5000export cap and independent View/Details/Export/Settings grants.

Web collection refinement Required. Existing Next/native requests retained with optional API criteria; new native/Next UI Excluded from this Angular request. Managed RPT/PDF and consolidated Settings are independently Required successors. Import/Chart/new writes/offline Excluded.

Current GET /api/v1/system-audit-trail is cursor-paged; GET /api/v1/system-error-logs has known count/page/pageSize. Retain actual pagination, source scopes and newest-first ordering. Reset paging/cursor history on criteria changes; never filter one loaded page or fabricate total counts.

Reuse MyDataGrid filter APIs, CardList, RecordSummary, SurfaceCard, PageHeader, shared feedback and CollectionFooter. Extend shared presentation generically and backwards compatibly; no feature-specific footer/CSS workaround. UI components bind owner state and never HTTP.

Keep existing loading/empty/error/forbidden/invalid states. Compact cards retain summary/time/severity and source/service/action/status/user/duration/client/browser with permitted View. Long values remain accessible. Identical footer sizing, order, RTL and responsive wrapping across Grid/Cards and total modes.

Read-only; no transactions, migrations, business writes or permission widening. Actor/query replacement aborts and masks stale data/export/detail. Validate finite payloads and match modes before database work. Preserve audit time-module-id keyset ordering.

Reuse owner/core EN/AR labels, generators and existing UI accessibility. PrimeNG Paginator metadata is consulted; generated API validation is not browser acceptance. Verify390/1440/lightdark/keyboard and no outer scroll with synthetic rows.

G0owner/G1P-001/G2typedboundedcriteria/G3tests are frozen by the contract. This is initial current-only Phase00 evidence, not runtime acceptance. Root source review must confirm file ownership, scope and acceptance before promotion. Existing unrelated worktree/export preserved; parent goal Paused.

Phase06 Not Verified. Required RED/GREEN filter/scope/null/date/number/AND-OR/paging tests; API solution gates; full Angular check; actual query fixture browser evidence and shared footer owner regressions. Historical921Angular tests belong to the prior navigation maintenance, not this refinement.

No dependency install, commit/push/merge/deploy or hosted business mutation. No new database schema. Any host-only rollout/manual check receives central PROD note evidence, not an implied hosted pass. Research sources: PrimeNG current Paginator metadata and MDN CSS Grid auto-fit/minmax.

Required Arabic education after Phase06 Verified only. Current guide updates describe verified behavior; do not register future education as existing evidence.

S4-A4b is the sole Active implementation preflight by direct requester priority. Export implementation stays preserved/Queued and not accepted; parent goal stays Paused. Managed Error RPT/PDF then consolidated Settings are next exact contracts. Health/docs/jobs and final review remain Required.

# System log collection consistency — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A4b — System log collection consistency |
| Child Feature ID | angular-system-log-collection-consistency |
| Child feature name | System log collection consistency |
| Owner | Platform owns log/audit queries; BuildingBlocks owns neutral filter mechanics; Angular shared collections own presentation |
| Depends on | Existing S4-A3/S4-A4 clients and shared collection controls |
| Execution status | Active — implementation preflight |
| Runtime authorization | Blocked for preflight-only until existing-source books/manifest/check/review; requester2026-11-06 explicitly authorizes these bounded changes |

## 1. Child boundary and outcome

Correct shared pagination consistency, compact System Error Logs cards, and add
real server-backed column filters to both System Audit Trail and System Error Logs.
This is a user-authorized extension of existing read workflows. It does not resume
the paused overall migration goal or accept unfinished collection export. Separate
successors own System Error Logs managed RPT/PDF reports and consolidated Settings.
No new entity, schema, dependency, domain write, client engine or offline store.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-log-collections | Web | /super-admin/audit-trail and /super-admin/error-logs | Find matching events and navigate consistently | Read-only remote collections | P-001 | Existing shared column-filter controls; no data-entry form | web-angular/src/app/shared/ui/collections/my-data-grid/my-data-grid.ts | Adapted | Existing Grid/Cards/Detail retained; column filters Required; new Report successor; Import/Chart Excluded; export retained | Preserve loading/empty/error/forbidden; invalid filters block request; no business draft | Online only | Synthetic fixtures | super_admin and existing View grants; Details/Export independently unchanged | EN/AR light/dark390/1440, keyboard, no outer scroll | User requires actual column filters beyond original Next |
| platform.system-log-collections | Mobile | Existing native tools | Retain current behavior | Existing native read clients | N/A retained | Existing controls | mobile-react/src/platform/tools/error-logs | Excluded from new UI | Existing capabilities retained; new native column filters Excluded | Existing states retained | Existing policy | Existing fixtures | Existing scope | No device acceptance inferred | Angular request; backward-compatible optional API criteria |

## 3. Closest existing reference

Use existing MyDataGrid filter UI, Countries filter grouping semantics, shared
CollectionFooter and RecordSummary. Error Logs Next/cards are workflow evidence;
Audit uses a merged cursor collection and must retain that contract. Do not add
local-page filtering, fabricated totals, audit writes or another Grid/footer.

## 4. Reuse and composition contract

Shared owns pagination visuals for known and unknown totals, typed filter UI,
compact metadata rendering and card typography. Feature state owns criteria,
permissions and callbacks. Platform owns validation/query meaning and resolves
audit user filters before asking module sources. A neutral typed column-filter
contract/predicate belongs in BuildingBlocks only because both owning queries use
it. No cross-module DbContext/table access. Native consumers may omit new criteria.

## 5. Screen and workspace contract

One shared paginator arrangement: centered record/page controls, edge page-size
settings, identical sizes/spacing/RTL/focus and responsive wrapping in Grid/Cards.
Unknown totals display unknown and disable unsupported last navigation; explicit
cursor-page navigation remains available. Never fabricate a known total.
Error cards retain summary/date/severity and all existing metadata, render metadata
compactly through shared presentation, use container-fitting tracks and contained
scroll, and preserve the permitted detail action.

## 6. Typed transport and server criteria

Add an optional bounded columnFilters JSON string to existing GET criteria. The
payload is a list of field groups with operator and/or and up to4 scalar rules.
Groups combine with AND; individual group rules use the selected AND/OR. Maximum
14 unique fields,4rules per field,16KiB JSON and200text characters per value.
Reject malformed JSON, duplicate/unknown fields, unsupported match modes, unsafe
numbers and inverted ranges. Text supports contains/notContains/startsWith/endsWith/
equals/notEquals; numeric/date fields use their shared UI's documented typed rules.
Normalize nulls deliberately; no arbitrary property reflection or SQL text.

Audit filterable columns: occurredOn,action,record,moduleCode,userName,changeCount.
Record means EntityDisplay with EntityKey fallback; username uses resolved display
name with UserId fallback. Evaluate predicates before per-module Take and merged
cursor paging, preserving newest/time-module-id ordering and scope. Module-owned
audit sources receive neutral validated filters and resolved user-id matches.
Error filterable columns: occurredOnUtc,source,severity,userName,service,action,
statusCode,durationMs,client,browser,summary,ipAddress. Details is an action and has
no filter. Apply existing toolbar criteria AND column filters before count/page/
dedicated export; preserve known total, cap5000 for export and system-only IP.
Do not change existing DTOs or default behavior when filters are omitted.

## 7. Create, edit, view, and lifecycle contract

Read-only query extension. Changing/resetting a column filter resets paging and
cursor history, retains view selection, cancels stale requests/downloads and keeps
the same current actor authority. View requires the existing exact grants;
Details/Export/Settings remain independently guarded. No Save/Create/Delete added.

## 8. UX states, permissions, offline, and mock data

Invalid criteria use shared translated guidance without request or partial local
results. Changing from Grid to Cards retains matching criteria. Shared footer
changes apply to all consumers and require owner regressions. Shared metadata
compactness is optional and backward compatible. API default/native/Next requests
are unchanged; no API client is required to send filters. No schema migration.

## 9. Concurrency, transactions, and consistency

No business writes, locks or new transaction. SQL predicates precede pagination;
do not filter only the returned page. Audit cursor authority and independent
module schemas remain. API limits are finite, cancellations are scoped, diagnostics
and raw server exceptions never enter notification text. No report dataset in
this child and no opportunistic permission expansion.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse existing core column-filter labels and owner field labels in EN/AR. New
visible strings, if required, come from canonical catalogs and generators.
Controls keep accessible labels/keyboard behavior; long card values remain
available in the detail view and accessible full text. No native alerts.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Exit gate |
| --- | --- | --- | --- |
| 1 | API | Queued after preflight | Typed validation, SQL-before-paging, scope/cursor/filter tests and solution gates |
| 2 | Web | Queued | Shared presentation and both real filtered collection clients, full Angular gates |
| 3 | Mobile | Queued | Retained optional-contract compatibility; new native UI Excluded |
| 4 | Integrated live verification | Queued | Actual local API/query fixtures and EN/AR/lightdark/responsive browser evidence |
| 5 | Documentation and closure | Queued | Current manifests/books/education/generation/check; explicit external release note |

## 12. Verification contract

RED/GREEN tests for filter validation/AND-OR/null/date/number/scope/paging and
cursor resets. Browser proves applied server filters in both collections, no
current-page substitute, compact cards, identical footer layout and keyboard
navigation across known/cursor totals. Run full Angular check, relevant API module
tests and full solution gates. Shared Countries/States/Districts/Tenant footer
regressions remain mandatory. Synthetic evidence only; no hosted business writes.
Deployment/manual acceptance is separate and receives a stable central note.

## 13. Child exit gate

- [ ] Phase00 current-only evidence and source review promote runtime.
- [ ] API then Web and retained native boundary verified.
- [ ] Integrated query/browser/owner regressions pass.
- [ ] Documentation and Arabic education close this exact child before the report successor.

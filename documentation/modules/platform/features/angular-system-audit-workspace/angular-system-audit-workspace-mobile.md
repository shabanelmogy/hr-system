# System Audit Trail — retained native profile

## 1. Ownership

Platform system audit reading aggregates module-owned immutable history. D42/S4-A3 existing-source parity; no writer/domain/schema/API redesign.

## 2. Verified source and target

VERIFIED CURRENT: the guarded /super-admin/audit-trail route and sidebar, authoritative cursor list, filters, structured metadata and local changes Grid are implemented and accepted. Next/API/native sources remain the workflow authority. Source review omissions in sorting/selection/navigation/local text filtering and cursor-page controls were repaired before acceptance. Phase00 passed 500 recipes/planning before runtime; final acceptance is recorded separately from the historical foundation.

## 3. Data contract

List item: moduleCode/id/entityName/entityKey/entityDisplay/action/userId/userName/occurredOn/correlationId/changeCount. Detail: entry+field/oldValue/newValue changes. Filters: modules/entityNames. Composite moduleCode:id identities. Nullable text preserved; action literals strict, IDs positive safe integers, timestamps valid.

## 4. Business rules

Read-only existing API. Global role super_admin AND SystemAuditTrail:View. Fixed50page size, opaque cursor, unknown total and deterministic server newest order. Search record key; module-dependent entity, action, local calendar start/end converted UTC. No data-entry invariant or write concurrency added.

## 5. Platform capability decisions

Angular Grid/Table and read-only field-change detail Required. Cards/Tree/Chart/Report/Import/Export and all mutations/mock generator Excluded by current Next page. New native work Excluded; existing native audit retained. Company/per-record audit consumer is outside this system-only slice.

## 6. Transport and criteria

Existing GET /api/v1/system-audit-trail, /filters, /moduleCode/id. Exact200, encoded path, credentials, finite timeout and unknown payload validation through owning service. No invented total/offset, no cursor decoding or new endpoint. Client sends only source UI filters and pageSize50. Actor and criteria own page-chain cancellation/cache.

## 7. Shared composition

MyDataGrid, PageHeader, DialogPanel, RecordSummary, OptionSelect, DateField, StatusBadge and FeedbackState compose small owner components. Both Grids retain shared checkbox selection and record navigation; only detail changes enable local sorting and filtering. createLocalCollection adapts a complete immutable snapshot to the shared remote-style source contract without adding transport. It filters before sorting/paging, preserves original-index IDs, resets criteria on a new snapshot and avoids repeating sorting on page-only changes. CollectionTextFilter composes the shared popover/options/text fields/buttons and supports all nine source text operators, including add/remove values for isAnyOf. It does not change remote GridFilters or API codecs. Source MUI filter-panel placement is adapted to one shared toolbar popover. The source list remains unsortable and has no local/advanced column filters. RecordSummary optional typed semantic fields and the shared unknown-total header remain backward compatible. PrimeNG MCP metadata validates the checked Table bindings only; Angular/browser checks own actual behavior.

## 8. States and lifetime

Initial/background/empty/error/retry/forbidden/invalid calendar range; independent detail request/error/not-found/empty changes. Actor replacement synchronously masks and cancels old history. Filter changes reset cursors. Unauthorized retry suppressed. List/filter/detail share one actor denial for401/403; terminal detail-forbidden retains feedback with selected metadata masked until close. Observed failing/passing integration tests cover authority propagation and terminal feedback; follow-up source review has no unresolved P1/P2. No offline persistence/realtime/write/dirty workflow.

## 9. Consistency and effects

Existing query handler merges registered module sources newest-first with stable module/id tie-break and one-extra-row next cursor. No write transaction/session/notification effect. Do not combine actor/filter snapshots. Pending cursor errors cannot advance to unavailable data. Fresh detail must match selected composite identity.

## 10. Localization and accessibility

auditLog labels are existing core keys, not platform-advanced-tools. The invalid date-range label remains platform-advanced-tools. Shared collection-filter additions have EN/AR source keys and are generated through the canonical company UI catalog then the Angular consumer. RTL, keyboard row activation/navigation, escaped snapshots, focus restoration and contained scrolling remain required across 390/1440 and both themes.

## 11. Implementation preflight

Version2 contract has resolved G0 source/role/global scope, G1 P-001 Grid/read-only detail, G2 API/shared reuse and G3 checks/no schema change. Phase00 current-only books/request/manifest/recipes generation/check/planning must pass before runtime. Remaining G4 is release-only PROD-019/028/025/RISK-020.

## 12. Verification

Phase06 Verified within the authorized Angular client scope on 2026-11-06. Full npm run check passes 844 tests/158 files, 30 architecture and four configuration tests plus format/lint/catalog/tokens/fonts/types/build. Angular positive matrix eight cases, negative matrix 32 cases and rendered current Next reference eight cases pass. All nine detail text operators, local sort/page, checkbox isolation, explicit cursor pages and record navigation are covered. Four full-journey owner smoke regressions pass (Tenant Management, Tenant Administrators, States, Districts). Hosted list/filters/detail return 200 with 31 records/three modules/six changes; the actual authorized Angular route renders, owned logout returns 204, and business writes remain zero. Independent scoped review has no unresolved P1/P2. Current report/portable receipt: SYSTEM_AUDIT_WORKSPACE_2026-11-06.md and verification/SYSTEM_AUDIT_WORKSPACE_2026-11-06.json. Foundation and pre-filter checkpoints remain historical. Initial 578.82kB/transfer148.38kB warning remains RISK-020.

## 13. Operations and release

No domain/database change or EF migration. Existing external PROD-019 localization publication, PROD-028/025 reporting and RISK-020 bundle warning retain exact scope; none excuses an audit client defect. No commit/push/merge/deployment.

## 14. Customer education

Phase07 Arabic customer education is complete after Phase06 Verified: documentation/plans/business/web-angular-migration/education/angular-system-audit-workspace.md. It covers search/dependent criteria/calendar days, opaque cursor navigation, detail local paging/sorting/nine text operators, separate checkboxes, authority failures and exact hosted/native limits. The existing-only manifest registers the guide and current receipts.

## 15. Handoff

System Audit Trail client, verification, Arabic education and canonical closure are complete. Generation/check passes500recipes and planning checks pass with two inherited unrelated warnings. S4-A4 Error Logs/Settings source preflight is the next active child; no successor runtime before its own Phase00. Error logs/settings, system UI texts, advanced tools and the comprehensive whole-Super-Admin review remain Required; the parent goal remains Active. No commit/push/merge/deployment is claimed.

Dated refinement2026-11-06: S4-A4b adds real bounded server column filters, shared pagination presentation and compact Error cards. Its own Phase06/Phase07 are Closed; see angular-system-log-collection-consistency/verification/acceptance-2026-11-06.json. Historical counts above are retained for their original acceptance, not current gate totals. Hosted SQL rollout remains PROD-030. S4-A4c managed reports is Active; this does not imply report completion.

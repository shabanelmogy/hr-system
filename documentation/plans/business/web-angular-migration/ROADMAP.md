# Angular Web Migration — Proposed Delivery Roadmap

Status: Draft overall; exactly one feature is Active. S2-A2 module discovery is Verified/Closed; S2-A3 role home is Verified/Closed; S2-A4 company context is Verified/Closed; S2-A5 working-year context is Verified/Closed; S2-A6 application context navigation is Verified/Closed; S1-A3 shared collection foundation is Verified/Closed; S1-A4 reference selection is Verified/Closed; S0-API-01 assessment is Verified/Closed; S1-A5 local form close is Verified/Closed; S1-A6 unsaved navigation/context is Verified/Closed; S1-A7 date-only field is Verified/Closed; S1-A8 numeric field is Verified/Closed; S1-A9 boolean field is Verified/Closed; S1-A10 multiline is Verified/Closed; S1-A11 collection criteria is Verified/Closed; S1-A12 scoped read is Verified/Closed; S1-A13 exit assessment is Closed; S3-A0 global Crystal/PDF minimum is Verified/Closed; S3-A1 source-only preparation is Verified/Closed; S3-A2 bounded Countries read is Verified/Closed; remaining S1-A14 powers are Queued; S3-A3 Create/Edit Verified/Closed; S3-A4 lifecycle Verified/Closed; D28 context filter/icons Verified; remaining S1-A14 Queued; D29–D32 S3-A3 form/record correction Verified/Closed; S3-A5 Chart Verified/Closed; S3-A6 Report Verified/Closed; S3-A7 Import preflight Active.
R1 session correctness and R2 browser transport are Verified/Closed. S1-A0 Angular
toolchain/localization runtime and its documentation are Closed. S1-A1 shared
theme/action and licensed browser verification are Closed. S1-A2 text/form runtime
and browser verification are Closed. S2-A0 login and shared validation badges are
Verified/Closed. S2-A1 application shell/preferences is Verified/Closed.

**ACTIVE_FEATURE_STEP:** `angular-countries-import-view`

Latest handoff: [RESUME](RESUME.md), updated2026-10-31. The requester selected the
existing hosted test API for Angular/mobile testing. Tracked web-angular/.env now
selects host/local (default host), with explicit npm start/build overrides;
actual hosted csrf/login/catalog/refresh/logout now pass. PROD-017/019 retain wider host/release checks. S2-A6 is Verified/Closed including final PrimeNG/scroll/responsive refinements; S1-A3 is closed within its technical kit; new catalog resource deployment is PROD-019. S1-A4 is technically Verified/Closed; S0-API-01 assessment is Verified/Closed with typed-service fallback; S1-A5 local form close is Verified/Closed; S1-A6 unsaved navigation/context is Verified/Closed; S1-A7 date-only field is Verified/Closed; S1-A8 numeric field is Verified/Closed; S1-A9 boolean field is Verified/Closed; S1-A10 multiline is Verified/Closed; S1-A11 collection criteria is Verified/Closed; S1-A12 scoped read is Verified/Closed; S1-A13 exit assessment is Closed; S3-A0 global Crystal/PDF minimum is Verified/Closed; S3-A1 source-only preparation is Verified/Closed; S3-A2 bounded Countries read is Verified/Closed; remaining S1-A14 powers are Queued; S3-A3 Create/Edit Verified/Closed; S3-A4 lifecycle Verified/Closed; D28 context filter/icons Verified; remaining S1-A14 Queued; D29–D32 S3-A3 form/record correction Verified/Closed; S3-A5 Chart Verified/Closed; S3-A6 Report Verified/Closed; S3-A7 Import preflight Active.

| Feature unit | Status | Current work | Runtime boundary |
| --- | --- | --- | --- |
| platform-browser-authentication | Closed | R1/R2 technical API Verified and documented | Final Release 1157/0/0, Next 38/native 1; DEC-027 Closed; release/provider scope remains central |
| angular-localization-foundation | Closed | S1-A0 Verified; 205 recipes and 76-source manifest/handoff passed | Actual Angular runtime/services; SQL-backed translation consumer acceptance FOLLOW-012 |
| angular-theme-foundation | Closed | Phase 06 and documentation Verified/Closed | Shared theme/action, 30 tests, repeat 40 browser cases and licensed production build pass. Community key activated; FOLLOW-013 Verified |
| angular-form-foundation | Closed | S1-A2 Phase 06 Verified; documentation/handoff | Shared text/password CVA and organized Shared folders; 38 unit tests/40 browser cases, 417.05 kB build pass |
| angular-password-sign-in | Closed | S2-A0 runtime/validation badges/documentation Verified | Real default/login, Cookie auth/session, current Next design and shared validation badges; 55 unit/6 architecture tests, 40 shared browser cases, 8 reference pairs, actual API/SQL and production artifact pass |
| angular-application-shell | Closed | S2-A1 frame/preferences Phase 06 Verified; canonical handoff | Current Next frame and personal preferences; no business dashboard/module launcher/context transition claim |
| angular-module-navigation | Closed | S2-A2 Phase 06 Verified; 69 tests/14 browser + actual API and 8 Next tile comparisons | Server-permitted modules and areas; no business child screen or role dashboard completion |
| angular-role-home | Closed | S2-A3 Phase 06 Verified; 77 tests, production14 + actual API and exact8 metric comparisons | Source role landing and actual read-only global summary |
| angular-company-context | Closed | S2-A4 Phase06 Verified; Angular90/company14 and actual SQL/tab/logout | Shared context selector and trusted session/read/text coordination |
| angular-fiscal-year-context | Closed | S2-A5 Phase06 Verified; Angular99/architecture7, production15 and actual UI/SQL/tab/reload/restoration | Shared context and lazy Accounting composition |
| angular-module-context-navigation | Closed | S2-A6 Phase06 Verified and education/closure | Angular109/architecture9, context24, retained Next13/native7 and actual hosted catalog/navigation/reload/refresh/logout |
| angular-collection-foundation | Closed | S1-A3 Phase06 Verified; technical handoff and canonical closure | Angular119/architecture10/config4, collection40+final8/layout8, source8, API40/catalog7, retained Next11 and regressions |
| angular-reference-selection-foundation | Closed | S1-A4 Phase06 Verified; canonical closure | Angular127/architecture10/config4, reference40+final8, forms40 and retained regressions; no business lookup/native UI |
| angular-api-contract-generation-proof | Closed | S0-API-01 Verified assessment and typed-service fallback | Actual hosted spec,109 generated files/strict compile/determinism,4 projection/13 transport checks; raw runtime adoption rejected |
| angular-form-close-foundation | Closed | S1-A5 Phase06 Verified and canonical closure | Angular138/architecture10/config4, close40+final8, forms40/reference8/login10/context24/language20; local close only |
| angular-unsaved-navigation-foundation | Closed | S1-A6 Phase06 Verified and canonical closure | Angular160/architecture10/config4; route40+final8/context8 and retained regressions; registered owners only |
| angular-date-field-foundation | Closed | S1-A7 Phase06 Verified and canonical closure | Angular173, date40+final8/timezone10, API43/catalog7 and retained regressions; date-only technical input only |
| angular-numeric-field-foundation | Closed | S1-A8 Phase06 Verified and canonical closure | Angular188, numeric40+8/forms40 and retained regressions, API43/catalog7; exact input only, owner financial mapping separate |
| angular-boolean-field-foundation | Closed | S1-A9 Phase06 Verified and canonical closure | Angular198, boolean40+8 and fresh regressions/API43/catalog7; strict false/true and native readonly proof |
| angular-multiline-field-foundation | Closed | S1-A10 Phase06 Verified and canonical closure | Angular206, multiline40+8 and fresh form/field/date/login/language regressions; same Shared TextField/template |
| angular-collection-criteria-foundation | Closed | S1-A11 Phase06 Verified and canonical closure |252unit/criteria40+8/collection8/navigation8/login10/language20; bounded public criteria/URL/history, generic projected action spacing |
| angular-scoped-read-lifetime-foundation | Closed | S1-A12 Phase06 Verified and canonical closure |264unit/read40+8/context24/home14/company14/fiscal15/login10/language20; finite snapshot/current invalidation/teardown |
| angular-foundation-exit-assessment | Closed | S1-A13 read-only assessment Verified |373recipe/planning; foundation mechanisms reviewed, reporting prerequisite before complete Countries, no full S1/release claim |
| angular-managed-reporting-adapter | Closed | S3-A0 bounded global Crystal/PDF Phase06 Verified and technical handoff |295unit/PDF40+8/login10/language20/context24/API17/localization43/catalog7;473.99kB; no full Countries/manager/native/live claim. ActiveReports Excluded DEC-028 |
| angular-countries-pilot-preparation | Closed | S3-A1 source-only audit/decomposition Phase06 Verified | Current source snapshot/API74/Next13/389recipes/planning;7child contracts; no runtime/UI/schema change |
| angular-grid-capabilities | Queued | S1-A14 shared Table capabilities implementation | User-required complete Table powers and exact Next visual fidelity; FOLLOW-016; no consumer API fiction |
| angular-countries-read-workspace | Closed | S3-A2 bounded read corrections Verified | Current Angular362/build; actual-route8 and shared collection8; centered native record navigation, edge settings and stable focus (D24/D25) and read-dialog correction passed; full source/host acceptance remains Not Verified; other pilot children Required |
| angular-countries-edit-workflow | Closed | S3-A3 Countries create and edit workflow | Six-field shared form with detail loading, errors/focus/summary, unsaved protection, dev mock data, safe pending/uncertain outcomes, current scoped list reconciliation. |
| angular-countries-lifecycle | Closed | S3-A4 Countries archive and restore | Shared confirmation for archive/restore/bulk, exact action authority and read-only barriers, active current-page selection, dependency failures, no hard deletion. |
| angular-countries-chart-view | Closed | S3-A5 Countries page-scoped charts | Shared chart adapter and four charts: currencies,creation timeline,states count and states coverage; total matching versus visible-page labels, locale/theme/responsive/empty/loading. |
| angular-countries-report-view | Closed | S3-A6 Countries managed report integration | Compose the existing Reporting global Crystal/PDF owner in the Countries view, preserving independent applied criteria, source/hash/permission/cancel and mobile open/download behavior. |
| angular-countries-import-view | Active | S3-A7 Countries XLSX import | Reusable bounded XLSX file/template/parser/preview/row status and validation composition. One valid-row batch, no invalid-row upload, duplicate feedback and uncertain-submission recovery. |
| angular-countries-pilot-acceptance | Queued | S3-A8 Countries complete pilot acceptance | Complete current-source comparison across all five views and actions, realtime invalidation/reconnect, source/layout/paging/focus/full lifecycle/host/production-size acceptance. Enable business route only after complete coverage. |
| All later foundation/platform/business units | Queued | No sibling start | Follow dependency/gate order |

Current execution contract: [angular-countries-import-view](decomposition/angular-countries-import-view.md). Source/API/Phase00 only; Import runtime remains gated. S3-A6 Report bounded acceptance Verified/Closed; full422tests, Report40+8/source8/command8/Chart8/standalone8. S3-A5 Chart and D29–D32 command corrections retain verified bounded proof. Full source pixel/host/pilot/Table matrix remains Not Verified.

Completed assessment: [S1-A13 report](../../../modules/platform/features/angular-foundation-exit-assessment/ASSESSMENT_REPORT.md).
Completed scoped read: [S1-A12 report](../../../modules/platform/features/angular-scoped-read-lifetime-foundation/IMPLEMENTATION_REPORT.md).
Completed criteria: [S1-A11 report](../../../modules/platform/features/angular-collection-criteria-foundation/IMPLEMENTATION_REPORT.md).
Completed multiline: [S1-A10 report](../../../modules/platform/features/angular-multiline-field-foundation/IMPLEMENTATION_REPORT.md).
Completed boolean field: [S1-A9 report](../../../modules/platform/features/angular-boolean-field-foundation/IMPLEMENTATION_REPORT.md).
Completed numeric field: [S1-A8 report](../../../modules/platform/features/angular-numeric-field-foundation/IMPLEMENTATION_REPORT.md).
Completed date field: [S1-A7 report](../../../modules/platform/features/angular-date-field-foundation/IMPLEMENTATION_REPORT.md).
Completed registered-draft transitions: [S1-A6 report](../../../modules/platform/features/angular-unsaved-navigation-foundation/IMPLEMENTATION_REPORT.md).
Completed local-close proof: [S1-A5 report](../../../modules/platform/features/angular-form-close-foundation/IMPLEMENTATION_REPORT.md).
Completed ERP-01 assessment: [report](../../../modules/platform/features/angular-api-contract-generation-proof/IMPLEMENTATION_REPORT.md).
Completed reference proof: [S1-A4 report](../../../modules/platform/features/angular-reference-selection-foundation/IMPLEMENTATION_REPORT.md).
Completed collection proof: [S1-A3 report](../../../modules/platform/features/angular-collection-foundation/IMPLEMENTATION_REPORT.md).
Completed S2-A6 evidence: [implementation report](../../../modules/platform/features/angular-module-context-navigation/IMPLEMENTATION_REPORT.md).
This marker identifies the sole feature owner. Exact bounded entry and technical
results are in its contract and [completed company-context report](../../../modules/platform/features/angular-company-context/IMPLEMENTATION_REPORT.md).
The following S0/R1/R2 entries retain their historical sequence; current statuses
are the table above and the current contracts. No overall readiness claim.

S0 progress (2026-10-28): authentication source/endpoint/credential investigation
completed in [AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md), with 31
Platform and 50 retained Web tests passing. D17 secure API Cookies are requester-approved;
[BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md) defines target transport.
DEC-027 slice/binding proof and RISK-018 remain open. Remaining S0 proofs/inventory and all runtime
execution gates are unchanged; the audit itself verified no runtime feature.

Phase 00 continuation: three integration probes passed (JWT/chunk capacity, real
SQL optimistic concurrency, trusted Chromium HTTPS/CORS/antiforgery). See the
[measured proof report](../../../modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md).
Primitive feasibility is resolved; exact runtime gate/session policy reconciliation
and actual browser endpoint/client acceptance remain pending under DEC-027/RISK-018.

Subsequent R1 result: existing session adapter repair is Verified, including 11 real
SQL adapter scenarios and full Release **1139 passed / 0 failed / 0 skipped**.
Retained Next 28/native 1 focused regressions passed. Current evidence:
[SESSION_IMPLEMENTATION_REPORT](../../../modules/platform/features/platform-browser-authentication/verification/SESSION_IMPLEMENTATION_REPORT.md).
Same feature remains Active; next API increment is browser Cookie transport.
No Angular foundation/UI or sibling feature is activated by this result.

R2 result: API Cookie transport is **Verified** with actual trusted Chromium/
Identity/SQL route acceptance and full Release 1157 passed, zero failed/skipped.
DEC-027 is Closed for this API binding; RISK-018 retains provider limitation.
The API feature is now Closed after documentation/handoff; Angular foundation is
the current unit, followed by shared theme/controls and login/shell with the current design.
No further API preparation round is required before that bounded foundation entry.

S1-A0 result: `web-angular` created with strict standalone/zoneless Angular 22.
It consumes the current SQL-backed localization API and unchanged schema-3 web
catalog, with scope-safe runtime/pipe and revision-based write/reset service.
Three files / 14 tests, strict types, catalog and architecture checks and production
build pass (295.40 kB initial). No business UI/theme/PrimeNG integration is claimed.
Actual signed-in consumer/SQL persistence acceptance is FOLLOW-012 at S2/S4.

## Dependency order

| Stage | Outcome and scope | Depends on | Exit evidence | Relative effort |
| --- | --- | --- | --- | --- |
| S0 Baseline and architecture proof | Classify all routes/views/partials; freeze API/permission map, DEC-027 direct authentication, package peers, license entitlements; prove form/table/translation/vendor adapters | Planning review; no-BFF DEC-025 selected | Decisions resolved for authorized slice; baseline ledger; no placeholder counted as complete | M |
| S1 Angular foundation | Independent app/build/CI; owner boundaries, theme/tokens, locales, transport/query policy, shared forms/table/cards/feedback | S0 | Strict template/type/build tests, shared behavior tests, no raw-grid/form bypass | L |
| S2 Platform access and shell | Direct API authentication/session, all current auth journeys, context transitions, launcher/guards/navigation, preferences | S1; DEC-027 | Fixture and live API auth/scope tests; late-response and refresh-race tests; compact/wide EN/AR | L/XL |
| S3 Reference pilot | Reporting adapter minimum first, then complete Countries; then States and Districts separately | S2; specialist proof | Countries Grid/Cards/Chart/Report/Import (ActiveReports viewer/designer Excluded by DEC-028); archive/restore/bulk; States parent dependency; all permissions and paging | L/XL |
| S4 Remaining Platform and ReferenceData | Address Types/company geography; users/roles/permissions; tenants/admins/invitations; profile/settings/localizations; logs/tools/offline operations | S3; each actual dependency | One feature accepted at a time; exact data-scope and override catalogs; no feature omitted because similar CRUD exists | XL |
| S5 Accounting current scope | Currencies/fiscal years, ledger setup hub, singleton company settings, accounts/hierarchy, dimensions/books/journals/rates/determination | S3/S4 context; actual lookup dependencies | Current implemented resource paths classified and ported; settings not turned into generic DTO; hierarchy/concurrency evidence | XL |
| S6 HR organization | Branches/departments/divisions/cost centers; titles/levels/positions/descriptions | S4; required Accounting lookups | Structured children create/edit/view/list/mock; tree move and cycle/permission tests; responsive direct Move alternative | XL |
| S7 HR operational flows | Workforce plans/budgets/envelopes/requests/amendments/trace; attendance devices/users/punches/pull runs; recruitment | S5/S6 as actual dependency graph requires | Workflow/permission/trace and device API evidence; Kanban pattern review before UI | XL |
| S8 CRM, files and specialist closure | Appointments; remaining managed Crystal/PDF reports/manager, file/media integrations, global search/notifications and specialist tools | S2; specialist adapters proven early | Calendar/realtime/date behavior, representative reports and file MIME/range/upload tests; no roadmap vendor feature assumed available | L/XL |
| S9 Full parity and release readiness | Close every inventory row; full cross-feature acceptance, security/accessibility/performance, deployment/recovery, customer education | All required features | No unexplained gap; live API/DB evidence; independent Next/Angular builds; release-only checks recorded | L |

Effort labels indicate uncertainty/relative size, not elapsed days or a commitment.
Detailed ERP acceptance is owned by [ERP_ACCEPTANCE](ERP_ACCEPTANCE.md), not by
duplicated rules in individual workstream summaries. The requester authorized
ERP-01..ERP-12 as applicable requirements, with the timing below.
Reporting/file/calendar proof begins in S0, even if business UI completion is later.
Cross-module/report/lookup dependencies can advance a child contract earlier; all
adjustments must be recorded here, with only one feature Active after authorization.

Requester-approved Sigma details are owned by
[SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md), SIG-01..SIG-08. S1 exit additionally
requires SIG-01/02/03/06/07/08 foundation harnesses. These are integrated into the
existing foundation contracts, not eight new engines or standalone features.
SIG-05 is proven on the first structured editor (with relevant shared mechanics
covered in S1); SIG-04 is proven on the first attachment-enabled feature, even if
that consumer precedes S8. Neither may be postponed to a later stage merely
because that stage names files or structured data.

## Feature units, not bulk conversion

- S1: separate contracts for toolchain/governance, transport/query, shared forms,
  shared collections and localization/theme as their responsibilities require.
  Theme integration consumes `@app/tokens` via one PrimeNG adapter, verifies all
  five palettes/light-dark and adds Angular to package sync/CI without palette duplication.
  Map SIG-01/02 to transport/query, SIG-03 to feedback/shell, SIG-06 to collections,
  SIG-07 to shared compatibility/localization and SIG-08 to layout/table/dialog
  contracts; use the same acceptance authority rather than copying its criteria.
- S2: coherent contracts for direct API authentication, auth journeys, work context
  and access/navigation; no BFF/gateway workstream or speculative session infrastructure.
- S3: separate Countries, States and Districts contracts. The Countries pilot is
  not accepted as CRUD-only while its Required views remain missing.
- S4–S8: one coherent workflow per contract; do not combine all HR screens or all
  ledger resources into a generic CRUD contract. Use actual API/source boundaries.
- S9: integration/release evidence, not permission to repair unrelated domain scope.

## Mandatory per-feature acceptance checklist

In addition to the checklist, each child records its applicable ERP-01..ERP-12
IDs, owner, status, test command/run and live evidence or N/A with reason.
Record applicable SIG-01..SIG-08 IDs the same way. S2/S3 and subsequent consumers
verify actual runtime composition; passing S1 harnesses alone does not close them.

1. Source route, API/CQRS, exact permission actions, scope and owning books reconciled.
2. Required/Deferred/Excluded capabilities decided per platform; current gaps classified.
3. Active UI Pattern selected with exact reference; resolve DEC-026 where relevant.
4. Shared UI audit and approved Angular adapter selection; no local visual shells.
   Record the D06 state mechanism, scope/lifetime and complexity reason; preserve
   the same pattern for similar features without imposing traditional NgRx Store.
5. List/filter/sort/paging, selection/footer/record navigation and Grid/Card parity.
6. Dedicated structured create/edit/view and realistic mock-data journeys.
7. Field/server validation, first invalid focus, enabled submit and dirty protection.
8. Empty/loading/error/forbidden/read-only/conflict/uncertain-result behavior.
9. Session/context isolation, mutation guards, cache/lookup/realtime invalidation.
10. EN/AR/RTL/themes, compact/wide, keyboard/accessibility and comparison captures.
11. Unit/integration/browser fixture tests plus live .NET/data verification as applicable.
12. Canonical Angular evidence, existing Next/Mobile classification, manifest/recipes
    and generated outputs reconciled; customer education after Verified.

## Baseline change protocol

Record the source commit plus relevant working-tree changes and route/feature
acceptance ID when each child starts. New Next/API changes receive an explicit
impact classification. Reconcile affected Angular behavior before child closure;
do not silently copy a moving branch and call it parity. No fixed deadline until
S3 and one complex S5/S6 journey provide measured implementation/verification effort.

## ERP requirements by delivery point

| Delivery point | Required work / evidence |
| --- | --- |
| S0 | ERP-01 representative versioned OpenAPI generation proof; freeze actual amount/date/wire conventions; inspect current concurrency/idempotency/lifecycle/audit contracts; identify real gaps and owners. |
| S1 | ERP-02 generic reference selector and typed owner adapters; ERP-03 keyboard/error/focus contract; ERP-04 shared structured-editor harnesses; generator/config/stale-output check if proof succeeds. |
| S2 | Direct auth/context cancellation, no stale scope result, safe pending/uncertain write behavior; preserve exact existing API guarantees. |
| S3 | Full pilot demonstrates lookup selection/search/parent behavior, conflict/duplicate/result handling where applicable, typed transport and production-size/request baseline. |
| S4–S8 | ERP-04..ERP-11 verified against each real workflow: structured edit/reload, precision/date edges, lifecycle authority, actual audit, reports/import/export and scale. |
| S9 / before first external production data | Close coverage and applicable live tests; ERP-12 isolated restore/integrity proof, diagnostics/redaction and recovery/rollback ownership under existing production note IDs. |

Generated client assessment and a backup restore are not new product modules.
No BFF, new queue/cache server or generic workflow engine is added. A missing
domain/API guarantee becomes an explicit owning-slice gate, not an unreviewed
Angular workaround or permission to redesign the ERP during conversion.

## Sigma details by delivery point

| Delivery point | Required work / evidence |
| --- | --- |
| S0 | Reconcile external examples with actual ERP contracts and pinned Angular/PrimeNG/Zoneless compatibility; no Sigma package/auth/constants adopted. |
| S1 | SIG-01 finite bootstrap/watch; SIG-02 route/session lifetime; SIG-03 progress ownership; SIG-06 criteria round-trip; SIG-07 compatibility suite; SIG-08 layout harness. Cover SIG-05 shared confirmation/draft mechanics where part of foundation. |
| S2 | Integrate SIG-02/03/07/08 with actual auth/context/navigation and shell; prove rejected/accepted navigation, visible dialog progress and overlay behavior. |
| S3 | Verify SIG-01/02/03/06/07/08 against actual pilot data, parent lookups, list/editor return and applied export criteria. |
| First structured editor | SIG-05 child cancel/commit and confirmation race proof with stable identities; subsequent structured editors inherit the same contract. |
| First attachment-enabled feature | SIG-04 confirmed/failed/uncertain save, staged-file ownership, discard and server orphan handling under the actual API; advance the file adapter if this is before S8. |
| Dependency upgrades and S9 | Re-run affected SIG-07 shared compatibility and SIG-08 browser/accessibility checks; close applicable SIG evidence across the feature ledger before release. |

Final user refinements accepted: PrimeNG-only shared widgets, themed ScrollArea, full desktop context text and compact icon-only controls with Tooltip. Updated context24 and affected regression/live proofs passed; S2-A6 and S1-A3 Closed; S3-A0 reporting minimum is Verified/Closed; S3-A1 preparation Closed; Historical standalone S3-A2 proof is retained; its correction and S3-A3 are now Queued behind current Countries screen priority. No S1 exit/Countries acceptance is claimed.

DEC-028: ActiveReports is Excluded by explicit requester cancellation; no future Angular viewer/designer/SDK placeholder. Existing source references are historical/current-source evidence only.

Historical standalone S3-A2 Phase06 proof2026-10-30 is retained in its report/books/manifest. Requester correction reopened its acceptance; S3-A2/S3-A3 are now Queued behind current Countries screen priority. Other children stay Queued; DEC-028 excludes ActiveReports.

Requester navigation correction2026-10-30: S3-A2 reopened only for Dashboard Data → existing sidebar hierarchy → Countries preview inside the authenticated shell. Direct country shortcut rejected; no production business route or sibling/write runtime. Prior standalone acceptance retained, current shell-entry acceptance pending. S3-A3 preflight queued until this correction closes.

Latest requester correction2026-10-30: historical S1-A14 bounded implementation (now queued for remaining generic powers); S3-A2 correction queued on this dependency, not accepted. Exact Next appearance is mandatory. Native PrimeNG advanced filters include real AND/OR contract; Countries API/host follow-on must implement actual global query semantics.


Requester priority override2026-10-30: complete the actual Countries screen in all
details as the migration reference before proceeding to other business screens.
S3-A2 read/shell/header/column-filter integration is the sole Active step now.
S1-A14 keeps its validated reusable progress but remaining generic extras are Queued;
its full closure no longer blocks actual Countries UI integration. Next complete
the existing Countries edit/lifecycle/chart/report/import children and full pilot
acceptance sequentially, without dummy view buttons or omitted source workflows.
Current hosted API supports one text condition plus status; native column menus
must use that real contract until the true combined-query API is implemented and
published. Full advanced filtering remains Required before full Countries acceptance.

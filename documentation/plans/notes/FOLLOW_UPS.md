# Follow-ups

Non-blocking improvements that should be revisited, but are not yet formal Deferred
business scope.

### FOLLOW-027 — collection view preference source parity

Observed 2026-11-06 during S4-A4 Error Logs source preflight. Next's
`useViewLayout.tsx` stores only an allowlisted presentation string in localStorage
and synchronizes same-tab/storage events. Error Logs, Tenant Management, Countries,
States and Districts supply explicit storage keys. At discovery their Angular page
owners used an initial `signal('grid')` without restoring the preference.

Owner: Angular shared collections + Web Architecture. Surface: Web. Priority:
High. Status: Verified2026-11-06. Original impact: choosing Cards/another permitted view was lost on a
route remount/reload, unlike the reviewed source. Reason not fixed in this note:
The shared primitive and all five consumers are now implemented and accepted. Trigger:
implement the generic shared view-preference primitive during S4-A4, apply it to
every verified applicable collection owner, and close this note with meaningful
storage/allowlist/blocked-storage tests and rendered remount proof before the final
whole-Super-Admin acceptance. Target: current D42 goal, not a later release.
Persist no business payload, credentials, private logs or draft form values;
permission/dirty guards remain authoritative and unavailable views fall back
safely. Earlier screen receipts remain historical; none proves this preference.
Interim evidence2026-11-06: shared createViewPreference, four existing consumers, unit14/2files, browser16EN/AR390/1440 reload/sync/fallback (wide also SPA leave/back), and clean independent source review. Error Logs consumer and full gate subsequently passed; this note is Verified. Closure evidence: SYSTEM_ERROR_LOGS_2026-11-06.json; full907tests/177files and Error Logs browser8complete. All five owners are implemented; only allowlisted view strings persist. Canonical authority:
`documentation/plans/business/web-angular-migration/decomposition/angular-system-error-logs-workspace.md`;
`web-next/src/shared/hooks/useViewLayout.tsx`;
`web-next/src/platform/tenants/components/TenantManagementMultiView.tsx`;
`web-next/src/modules/reference-data/geographical-information/countries/components/CountriesMultiView.tsx`;
corresponding States/Districts MultiView sources and Angular page owners.

### FOLLOW-026 — scope and closure

Observed during the approved Angular structure-only maintenance on 2026-11-05.
The report-view behavior and its 14 focused unit tests cover projected PDF
links and tab lifetime, but they do not replace a complete fresh browser run. The
legacy script originally stopped at its old PDF-link locator. The current revision
selects sidebar links, opens Options for the actual download and returns to Search
for field interactions, retaining all failure, validation, cancellation and Blob-URL
assertions. All eight focused EN/AR, light/dark, 390/1440 fixture cases passed on
2026-11-05. Owner: Angular QA + Reporting UI owner. Status: Verified. Reopen on a
report-view/sidebar contract or harness regression. Hosted/Crystal and physical-
browser acceptance remain separate. Current source hashes and executed receipts:
`documentation/modules/reporting/features/global-crystal-template-manager/verification/REPORT_TEMPLATE_SIDEBAR_2026-11-05.json`.
The original structural increment and its limits are in
[the execution report](../../guides/web/architecture/ANGULAR_COMPONENT_DECOMPOSITION_2026-11-05.md).

| ID | Surface | Area | Follow-up | Owner | Priority | Status | Trigger / due condition | Related source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FOLLOW-027 | Web | Collection view preference parity | Restore only an allowlisted view string through a generic shared primitive; apply all verified consumers and prove remount behavior. | Angular shared collections + Web Architecture | High | Verified | All five owners, unit/storage boundaries,16preference+8ErrorLogs browser cases and current907test full gate | `web-next/src/shared/hooks/useViewLayout.tsx`; `documentation/plans/business/web-angular-migration/decomposition/angular-system-error-logs-workspace.md` |
| FOLLOW-026 | Web | Reporting browser harness after sidebar composition | Updated current sidebar PDF selectors and real Options/Search interactions; all eight focused lifecycle cases passed2026-11-05 with failure, validation, cancellation and URL-revocation checks retained. New RPT sidebar workflow passed12additional production-fixture cases. | Angular QA + Reporting UI owner | Medium | Verified | Reopen on report-view/sidebar contract or harness regression; hosted/Crystal acceptance remains independently gated | `documentation/modules/reporting/features/global-crystal-template-manager/verification/REPORT_TEMPLATE_SIDEBAR_2026-11-05.json`; `web-angular/scripts/verify-reporting-browser.mjs` |
| FOLLOW-025 | Cross-platform | Historical Reporting raw-log availability | Requester-authorized current-evidence baseline preserves the inventory of 122 unavailable historical logs and removes only their nonexistent current requiredFiles entries. Existing sources/receipts stay required; the generator remains strict. Historical raw-log availability remains Open, independently of documentation generation. Never claim recovered logs or fresh runtime acceptance from this adjustment. | Reporting documentation owner + QA | Medium | Open | Before relying on any unavailable historical raw log for runtime/release acceptance; recover genuine originals or execute and retain a new scoped run | `documentation/modules/reporting/CURRENT_EVIDENCE_BASELINE_2026-11-05.md`; `documentation/modules/reporting/verification/CURRENT_EVIDENCE_BASELINE_2026-11-05.json` |
| FOLLOW-023 | API | Crystal rejected catalog descriptors | Corrected2026-11-01: runtime omits unaddressable identities, ERP preserves rejected oversize metadata without allowing import/download, and null/malformed/importable oversize cases fail closed.5new Reporting cases and real .NET10-client to .NET48-IIS mixed catalog/hash download proof pass. | Reporting API + Crystal Runtime + QA | High | Verified | Reopen on descriptor-contract or source-download regression; hosted publication remains PROD-028/029 | `documentation/plans/business/managed-crystal-reporting-reliability/RUNTIME_CORRECTION_RESULT_2026-11-01.md` |
| FOLLOW-022 | Web | Angular professional Clean Code hardening | CC-01..07 implemented and Verified: semantic lint, four stronger TS flags, selected Angular diagnostics, resolved owner/HTTP/stable-column guards, narrower public APIs, focused shared/feature extraction and typed test contracts. Final472unit tests/26architecture cases/122browser cases pass;84component folders;zero static or mixed cycles. | Angular Architecture + QA | High | Verified | Reopen on new quality-gate violations or a new owner/contract requirement; full pilot/release remains independently gated | `documentation/plans/business/web-angular-migration/CLEAN_CODE_IMPLEMENTATION.md` |
| FOLLOW-021 | Web | Countries current browser harness acceptance | Current PageHeader/settings/toolbar/row/record selectors and full40palette read matrix plus8lifecycle and8actual-controls interaction cases passed2026-11-01. Current253case fixture acceptance has portable receipts; prior failures remain attributed. | Angular QA | Medium | Verified | Reopen on source/control/selector regression; hosted Crystal remains PROD-028 | `documentation/modules/platform/features/angular-countries-pilot-acceptance/verification/FINAL_ACCEPTANCE.md` |
| FOLLOW-020 | Web | Retained Next preview bootstrap | Historical source preview stalled before hydration. Requester D35 stops Next review as an Angular prerequisite; temporary Next config/E2E experiments reverted. No Next repair claimed. Preserve old diagnostics; revisit only in a separately requested Next task. | Next Web rendering + QA | Medium | Deferred | Explicit Next work or its separately owned release investigation; not an Angular acceptance gate under D35 | `documentation/modules/platform/features/angular-countries-import-view/SCOPE_CHANGE.md` |
| FOLLOW-019 | Web | Angular initial bundle warning | Narrow shared unsaved public entry removes unnecessary eager data graph. Final post-D37 production build496.26kB/130.28kB transfer passes unchanged500kB warning and1MB error budgets, without warning. Historical larger measurements remain below as history. | Web Architecture | Medium | Verified | Reopen if initial bundle exceeds unchanged budget or eager shared graph regresses | `documentation/modules/platform/features/angular-countries-pilot-acceptance/verification/CLEAN_CODE_FULL_CHECK.txt` |
| FOLLOW-018 | Web | Historical verification-log portability | Checkout885753c1 references23 historical .log files absent from Git. Record exact unavailable paths in S3-A7 preflight evidence; remove nonexistent paths from current required-file manifests while retaining existing JSON/screenshots/reports. Historical result claims remain attributed to their reports, not rerun proof. | Web Architecture + QA | Medium | Open | Restore original logs from source workstation or replace with fresh owner-scoped runs before relying on raw historical logs/full release evidence | `documentation/modules/platform/features/angular-countries-import-view/verification/ENTRY_PORTABILITY.md` |
| FOLLOW-017 | Web | Angular scoped lookup/live consumer acceptance | Existing scoped read foundation does not complete a real business lookup or SignalR subscription. Before actual consumer acceptance, register typed immutable scope identity, finite validated service snapshot/timeout, separate authorized watcher and teardown, hint coalescing/reconnect/missed-event reconciliation, old-response masking, selected-label retention and explicit local/page loading/retry. S1-A12 generic helper technically Verified264unit/read40+8/current context24/home14/company14/fiscal15/login10/language20; actual business acceptance remains separate. | Angular Shared + feature service owner + QA | High | Open | First actual S3 lookup/live consumer and each relevant route/session/context boundary; before SIG-01/02/03 consumer Verified | `documentation/plans/business/web-angular-migration/SIGMA_ACCEPTANCE.md`; `documentation/modules/platform/features/angular-scoped-read-lifetime-foundation/SCOPED_READ_CONTRACT.md` |
| FOLLOW-016 | Web | Advanced Angular collection capabilities | S1-A3 baseline is shared Table/Cards, controlled single-sort/paging/search, selection, density/visibility and feedback. S1-A11 opt-in typed public criteria/URL bridge technically Verified252unit/40+8browser; actual per-list privacy approval/API wire mapping/editor-return/export scope remains required in S3. User resize/reorder/pin, multi-sort/constraints/grouping, virtual/range/frozen/detail, context menu and server-wide selection remain owned opt-ins, not implied by PrimeNG availability. Editing also requires FOLLOW-014. | Angular Shared + consumer/API owner | Medium | Open | First actual consumer and supported API/selection/height/RTL/performance contract before enabling each option | `documentation/modules/platform/features/angular-collection-foundation/SHARED_COLLECTION_CONTRACT.md` |
| FOLLOW-015 | Web | Remaining Angular authenticated workspace parity | S2-A1 responsive frame/preferences, S2-A2 permitted module/area discovery and S2-A3 role home/read-only tenant summary and S2-A4 secure company transition with cross-tab coordination and S2-A5 personal working-year context and S2-A6 shared application context navigation are Verified. Full business navigation/actual child screens, management/drill-down, profile/photo and search/notifications remain Required under exact subsequent contracts and real API/browser acceptance. No fake metrics or dead routes. The earlier NG0912 wrapper identity collision is resolved by a unique AuthenticatedApplication selector in the States increment;24Shell regressions pass. This does not close the remaining workspace parity items. | Angular Web + Platform owners | High | Open | Next matching S2 contract and before declaring full S2 parity | `documentation/plans/business/web-angular-migration/ROADMAP.md`; `decomposition/angular-application-shell.md` |
| FOLLOW-014 | Web | Angular remaining shared form compatibility | S1-A2 proves text/email/password CVA and submit/error/focus. S2-A0 additionally verifies shared ValidationSummary badges, preference select and actual scope-choice dialog for login; these are not business select/repeater/dirty editor proof. S1-A4 single ReferenceField/CVA/form discovery and S1-A5 local close/discard/Shared modal are technically Verified (138 unit;40+8 close browser; regressions). S1-A6 registered-draft Router/company/year/logout integration now technically Verified:160 unit, route40+final8/context8 and retained regressions. Actual future business editors must register semantic state and verify each journey; unregistered editors and hard reload/tab close/external document recovery are not protected. Hard-reload/save/recovery policy remains required before full unsaved parity. Actual ERP-02 consumers remain S3. Required remaining multi/date/reference consumer controls, structured repeaters, dirty navigation and dialog/overlay/CVA acceptance stay governed by ANGULAR_ARCHITECTURE and SIG-07/08; register exact contracts and verify each before its first consumer/full S1 closure. S1-A7 strict manual date input covers0001..9999; vendor calendar is guarded to0100..9999 with translated helper because native Date constructors remap years0..99; revisit only with a real earlier-year calendar requirement/vendor fix. PrimeNG22.1.4 locale changes emit NG0956 weekday tracking warnings; no vendor patch, revisit on upgrade. S1-A8 exact string NumericField technically Verified with188unit/numeric40+8/forms40; currency/group formatting/steppers and actual business numeric consumers remain required where their contracts need them. Exact API numeric transport remains FOLLOW-003/ERP-07, not inferred from field precision. S1-A9 strict Checkbox/Switch field technically Verified198unit/40+8browser; actual business flags/requiredTrue/permissions remain owner-specific. Native readonly activation is guarded in Shared. S1-A10 existing TextField multiline technically Verified206unit/40+8browser; actual domain multiline consumers and opt-in autoResize remain owner-specific requirements. No rich text/structured child editor parity inferred. | Angular Web + QA | High | Open | Next applicable S1 shared-form/control contract and before corresponding business editor is Verified | `documentation/plans/business/web-angular-migration/ANGULAR_ARCHITECTURE.md`; `documentation/plans/business/web-angular-migration/SIGMA_ACCEPTANCE.md`; `documentation/guides/web/architecture/ANGULAR_SHARED_COMPONENTS.md` |
| FOLLOW-013 | Web | Angular PrimeNG local license activation | Verified 2026-10-28: requester supplied local Community key; generated ignored configuration without printing its value. Licensed build passes (415.52 kB initial); repeat 40-case browser matrix passes and fresh-page screenshot inspection confirms invalid-license notice absent without bypass. Phase 06 Verified. | ERP owner + Angular Web | High | Verified | Reopen on key/entitlement replacement or a reproduced license notice; deployed CI/hosting must configure its own authorized input | `documentation/modules/platform/features/angular-theme-foundation/IMPLEMENTATION_REPORT.md` |
| FOLLOW-012 | Web | Angular persisted translation consumer acceptance | Login/context wiring and actual authorized system runtime read Verified under S2-A0 on 2026-10-28. Remaining Settings consumer acceptance: save a permitted text through real API, reload Angular to observe SQL persistence, verify company/permission isolation, stale revision/placeholder denial and Reset. Foundation unit/service tests are not live UI proof. | Angular Web + QA | High | Open | S2 login/context wiring and S4 localization Settings; before declaring those consumers Verified | `documentation/plans/business/web-angular-migration/LOCALIZATION_PARITY.md`; `documentation/modules/platform/features/angular-localization-foundation/IMPLEMENTATION_REPORT.md` |
| FOLLOW-011 | API | Intermittent SQL integration gate | Two SQL integration tests failed in the first 2026-10-28 full Release run, then both passed individually and the complete repeat passed 1127/0 with one intentionally excluded browser probe. Root cause not established; retain diagnostic logging on recurrence. | API + QA | Medium | Open | Next reproduced SQL gate failure or before relying on CI stability for release | `documentation/modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md` section 5 |
| FOLLOW-001 | Cross-platform | Governance | Keep Phase 13 architecture/documentation manifest synchronized with route/module changes. | Web Architecture | High | Open | Every structural change | `documentation/guides/web/architecture/frontend-architecture-manifest.md` |
| FOLLOW-002 | Cross-platform | Planning | Register existing business plans in `PLAN_REGISTRY.md` without moving canonical files unnecessarily. | Architecture/Product | Medium | Open | When each plan is next reviewed | `documentation/plans/PLAN_REGISTRY.md` |
| FOLLOW-003 | Cross-platform | Generated API contract parity | S0-API-01 assessment Verified2026-10-29: actual hosted381 paths/344 schemas, scoped32/35, ng-openapi-gen1.1.0 strict compile/determinism and13 transport assertions. Raw adoption rejected: required/nullability, typed ProblemDetails extensions, binary response metadata, Cookie/CSRF integration, colliding JSON aliases and61 any-policy files. Continue typed owner services with runtime validation and scoped contract tests. Broader exhaustive parity remains open; reconsider generation only after exact owner metadata/security/no-any fixes and representative acceptance. | Web + API Architecture | Medium | Open | Before each migrated owner service and before reconsidering generation; whole-API registry milestone | `documentation/guides/web/WEB_API_READINESS_REVIEW.md`; `documentation/plans/business/web-angular-migration/ERP_ACCEPTANCE.md`; `documentation/modules/platform/features/angular-api-contract-generation-proof/IMPLEMENTATION_REPORT.md` |
| FOLLOW-004 | API | Legacy naming in persisted contracts | `HrManagementSystem` remains only where renaming breaks stored data or issued tokens: JWT issuer/audiences (`HrManagementSystem`, `HrManagementSystem.Web`, `:realtime`), the attendance credential data-protection purpose `HrManagementSystem.AttendanceDevices.Credentials.v1`, and the development-only JWT key placeholder. Rename only as a coordinated migration (re-issue tokens; re-protect stored credentials with the old purpose as a fallback reader). | API Architecture | Medium | Open | Owner approves the token/credential migration window | `Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/DependencyInjection.cs`, `Modules/HR/ErpSystem.Modules.HR.Infrastructure/Features/Attendance/Devices/Services/AttendanceDeviceSupport.cs` |
| FOLLOW-005 | API | HR infrastructure layout | HR registers services through `Dependencies/*Service.cs` (`AddDatabaseservice`, `AddEntitiesService`, `AddErrorsService`, `AddMapsterService`) instead of the module convention (`DependencyInjection.cs` + `Mapping/`, as generated by `New-ErpModule.ps1`). Behaviour is correct; align the structure when HR infrastructure is next touched. | API Architecture | Low | Open | Next HR infrastructure change | `Modules/HR/ErpSystem.Modules.HR.Infrastructure/Dependencies` |
| FOLLOW-006 | Mobile | Inherited failures | Verified 2026-10-27: generic Ledger Setup save/lifecycle/column memoization now follows React Compiler inference; the offline screen test models edit authority and covers denial. The complete check passes types, lint, architecture, 90-route/253-member contracts, i18n, foundation/release checks and 194 suites / 593 tests. Coverage is 25.56/17.85/21.30/28.14 percent (statements/branches/functions/lines), above unchanged floors; Android export passes. The newly surfaced missing Message Logs View/Export catalog constants are aligned without enabling the queued native feature. Subsequent SDK compatibility is verified under FOLLOW-008; dependency security remains RISK-013 and native acceptance remains PROD-026. | Mobile | Medium | Verified | Reopen on a reproduced Ledger Setup/compiler or offline-policy test regression | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `documentation/modules/accounting/features/accounting-ledger-setup/accounting-ledger-setup-mobile.md` |
| FOLLOW-007 | Web | Supplemental full-suite runner | The incomplete 2026-10-17 run is superseded by verified 2026-10-27 evidence: the complete two-worker coverage run finishes with 215 files / 751 tests passing. The native Node shared-Grid suite runs through check:architecture, and the obsolete standalone Settings-link expectation is corrected against the approved navigation contract. No coverage floor is lowered; detailed evidence is RISK-012. | Web + QA | Medium | Verified | Reopen on a reproduced full-run collection/runtime failure | `web-next/vitest.config.ts`; `documentation/plans/notes/KNOWN_RISKS.md` (RISK-012) |
| FOLLOW-008 | Mobile | Expo SDK patch alignment | Verified 2026-10-27: all 15 SDK57 package mismatches are aligned, including Expo 57.0.31 and Router 57.0.29. Clean npm ci installs 1,135 packages and their actual versions match the lockfile; expo install --check and Doctor 21/21 pass. Full Mobile check passes 194 suites / 593 tests with unchanged coverage floors; dependency compatibility, disposable Android prebuild and React Compiler Android export pass. The xcode gate follows its current PBX identifier API after removal of the unused uuid dependency. Security-audit findings are separately tracked by RISK-013; native acceptance remains PROD-026. | Mobile + Release | Medium | Verified | Reopen on an Expo compatibility mismatch or subsequent SDK/native dependency change | `mobile-react/package.json`; `mobile-react/package-lock.json`; `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md` |

| FOLLOW-009 | Web | Countries development SSR | Isolate the intermittent style-prefixer SSR fallback described below; reference Grid/Cards client rendering passes. | Web shared UI / rendering infrastructure | Medium | Open | Next Countries/shared-rendering change or next Web release gate | `documentation/modules/reference-data/features/countries/countries-web.md` |
| FOLLOW-010 | Mobile | SQLCipher transaction bootstrap | Verified 2026-10-28: after the per-connection SQLCipher key correction, the requester reloads the development client and confirms the application opens. No database/key reset is performed. Eight focused regressions and the full 194-suite/598-test gate pass; Android export passes. This closes the reported bootstrap failure only; real offline business-write acceptance remains PROD-026. | Mobile + QA | High | Verified | Reopen on a reproduced encrypted bootstrap/transaction connection regression | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `mobile-react/src/core/offline/database.ts`; `database.test.ts` |

## FOLLOW-011 — Intermittent SQL integration gate

Observed during S0-AUTH verification on 2026-10-28: the first full Release run
reported 1125 passed, two failed and one skipped. The failures were
`ModuleMigrationIntegrationTests.InstalledModuleMigrations_ApplyOnCleanDatabase_AndSecondRunIsIdempotent`
and `ErrorLogPersistenceTests.Sql_retention_cleanup_preserves_boundary_and_is_bounded_and_settings_races_are_audited_atomically`.
The quiet original log did not preserve exception details. Both tests then passed
in a targeted run, and a complete run with TRX diagnostics passed 1127 tests,
zero failures, one intentional browser-preflight skip. No source correction was
made between these runs. The new browser probe separately passed when enabled.

Owner/priority/status/trigger are in the canonical row. Cause is unknown; do not
attribute it to a product defect, environment saturation or the new isolated probe
without evidence. On recurrence retain full exception/TRX details, correlate SQL
and test concurrency, and correct the owning test/fixture/product only after
diagnosis. No timeout increase, serialization workaround or ignored failure was
introduced. A later green run is evidence of recovery, not proof of root-cause closure.

R2 recheck on the same date retained TRX diagnostics. Platform/Architecture and
all 187 integration tests passed, but HR's
`WorkforcePlanAggregateConcurrencySqlTests.ChildOnlyAggregateUpdate_AdvancesParentRowVersion_AndRejectsStaleOverwrite`
failed while opening SQL with pre-login handshake connection timeout (initialization
16719ms, handshake 23ms). Its immediate targeted recheck passed. No HR source,
connection timeout or serialization setting was changed; underlying cause remains
unproven. This is an observed environment connection failure, not evidence of a
browser-auth lifecycle defect. Retain it when assessing the full gate.

## FOLLOW-009 — Countries development SSR style-prefixer fallback

- **Surface:** Web.
- **Owner:** Web shared UI / rendering infrastructure.
- **Status:** Open.
- **Source/context:** 2026-10-18 supplemental shared-Grid compatibility browser runs; /super-admin/geography/countries rendered Grid/Cards successfully but Next development SSR logged Stylis/Emotion prefixer regex stack overflow and recovered through client rendering. Observed twice with different prefixer expressions; the final six-case rerun did not reproduce it.
- **Impact:** The reference UI works after recovery, but this is not proof of healthy reference SSR. No corresponding Error Logs route failure was observed; ownership/cause is unresolved, not labelled inherited.
- **Reason not addressed now:** Mandatory Grid reuse changes no Countries source or style-prefixer dependencies; a rendering/dependency investigation requires an isolated reproduction and separate verification from the bounded filter correction.
- **Reopening trigger:** Next Countries/shared-rendering change or next Web release gate, whichever comes first; reproduce cold development SSR and compare a production start before closure.
- **Target milestone:** Next Web release gate.
- **Related sources:** documentation/modules/reference-data/features/countries/countries-web.md; documentation/modules/platform/features/error-logs/error-logs-evidence.md; installed @emotion/cache/src/prefixer.ts and stylis/src/Prefixer.js.
- **Closure evidence:** Pending isolated reproduction/root-cause correction and clean SSR/runtime verification.

FOLLOW-016 scheduling update2026-10-30: requester explicitly requires complete PrimeNG Table capabilities and exact web-next appearance. Canonical owner is now web-angular-migration / angular-grid-capabilities (S1-A14), current Active bounded implementation after Final Phase00; current-source CAPABILITY_MATRIX and proof are required before closure. Country server-query consumption and shell navigation are the existing S3-A2 correction, not implicit from generic availability. Existing browser-storage/security/owner API boundaries remain.


FOLLOW-016 implementation progress2026-10-30: shared Grid current gate passes60files/
345tests,40visual+8focused capabilities and8collection caller regressions; durable
evidence is angular-grid-capabilities/verification/. This is a subset, not closure.
Required remaining work includes local/custom matches, virtual ranges/10000-row
benchmark, shared draft editors, row order, exact actual-screen Next comparison and
full supported combinations. Before closure explicitly validate native dataKey
compatibility, mixed typed IDs that coerce to the same vendor key, and typed group
values used as expansion keys. S3-A2 consumer API/host/sidebar proof remains separate.

FOLLOW-016 requester priority2026-10-30: remaining S1-A14 extras are Queued; actual Countries full-screen reference takes priority through existing S3 children. Preserve current generic proof and extend shared controls as needed by the actual screen. Do not gate visible Country header/menus on unrelated virtual/editor powers.

FOLLOW-017 progress2026-10-31: actual Countries immutable-actor SignalR watcher/reconnect/coalesced finite background reads and disposal verified in S3-A8 bounded tests/browser. Other business lookup/selected-label consumers remain independently required; no blanket closure.

FOLLOW-019 current measurement2026-10-31: S3-A8 initial502.19kB/132.13kB transfer,2.19kB over unchanged500kB warning (1MB error unchanged). Background read/typed row tracking fixes repeated visible loading; no hosted latency or clean size gate claim. Production-size optimization remains required before full pilot.

FOLLOW-019 current measurement2026-10-31 after shared scrollbar maintenance: initial502.95kB; exact transfer is in angular-module-context-navigation/verification/global-scroll/BUILD.txt.2.95kB above unchanged500kB warning,1MB error unchanged. This visual maintenance does not close production-size acceptance.

## FOLLOW-022 — Execution ownership and closure

- Source/context: requester2026-10-31 asks for substantial professional Clean Code work after D37 resource/folder cleanup. Current source audit and primary documentation research are recorded in web-angular-migration/CLEAN_CODE_HARDENING.md.
- Owner: Angular Architecture + QA. Status: Verified. Priority: High.
- Impact: semantic linting, stricter data contracts, narrower dependencies and focused responsibilities improve maintainability as ERP modules grow. This is not evidence that current normal checks fail or that all probe diagnostics are runtime defects.
- Historical review boundary: the first review recorded the proposal only. The requester subsequently explicitly authorized all findings to be implemented. That implementation and its verification now supersede the earlier review-only status.
- Reopening trigger/target milestone: the next Angular technical-hardening delivery starts with Batch A, then follows the documented dependencies within the existing migration. Preserve S3-A8 as sole active business feature and its outstanding hosted-report gate.
- Closure evidence: CLEAN_CODE_IMPLEMENTATION.md, CLEAN_CODE_CHECK.txt, CLEAN_CODE_CURRENT.json, CLEAN_CODE_BROWSER_RESULTS.json and CLEAN_CODE_TOOLING.json record the actual zero-warning lint, strict types/templates,26architecture/dependency cases,472unit tests,122browser cases,84component folders and495.64kB production build. All CC-01..07 findings are Verified for this maintenance. No new hosted report or full-pilot/release claim; PROD-028 remains independently open.

FOLLOW-017 Countries consumer update2026-11-01: actual hosted create/edit/import
post-commit changes reach an independent authenticated session. Offline missed
change/reconnect and archive/restore/bulk reconcile correctly. Seven real cases
pass; test records archived and both sessions logged out. Consumer-specific proof:
angular-countries-pilot-acceptance/verification/final/hosted-isolated-writes.json.
Other lookup/selected-label consumers remain Open. FOLLOW-018 historical missing
logs are not restored; new current acceptance has its own portable raw receipts.

## FOLLOW-024 — Angular versioned global Crystal manager

- Surface: Reporting/Angular. Owner: Reporting + Angular Architecture + QA.
- Status: Open — implementation/technical gates Verified; actual hosted browser/native acceptance pending.
- Requester confirmed Angular, super_admin within editable modules, upload/replace/
  inspect/download, immutable versions and explicit publication. Direct-file overwrite rejected.
- Current evidence: archive, role ACLs, company consumer, discovery compatibility and
  shared presentation corrections are implemented. 1223 API tests passed, 0 failed, 3 existing opt-in browser skips across 12 projects; Reporting 188; architecture 70. Angular full check: 499 tests/89 files, 26 architecture cases, format/lint/strict types/templates/catalog and production build passed. Next reporting: 30 tests plus permission-catalog parity, type-check and architecture passed. Mobile full check: 601 tests/195 suites passed; repository-wide coverage remains limited (28.34% lines), not feature-specific acceptance.
  Both additive migrations applied; configured grant schema inspected. Registration dialog layout now passes40production-build fixture cases across EN/AR, five palettes, light/dark and desktop/mobile, including actual RTL/LTR horizontal scroll. Remaining manager/host/native acceptance stays open; REGISTRATION_LAYOUT_2026-11-02.md records this bounded proof.
- Canonical plan: documentation/plans/business/global-crystal-template-management/PLAN.md.
  Current report: PARITY_IMPLEMENTATION_2026-11-02.md; portable receipts under the owning feature verification/.
- Next exact action: requester publishes ErpSystem.Api with existing profile; publish
  Crystal too for the earlier specific error taxonomy. Refresh authenticated session
  for new exact global permissions, then run actual EN/AR/RTL/responsive/grid/file/
  create/import/version/revalidate/publish/download, archive, role ACL and company journeys;
  inspect the actual authenticated hosted deployment-candidates response body, with a real
  compatible RPT. Angular dev server was not started by this work; prior stop persists.
- PROD-028/025/RISK-008 retain independent report/native acceptance; current deployed
  Countries files still reject source metadata. Mocks cannot close this requirement.
- Closure: integrated actual journeys Verified and canonical Phase06/07 completed;
  source/menu/migration existence alone is insufficient. No queued sibling activated.

### FOLLOW-024 — registration source correction2026-11-02

Existing-file rejection correction2026-11-02: the current hosted RPTs have valid OLE signatures and matching hashes, but native inspection rejects database connection metadata. Read-only Crystal10 RDC metadata confirms Command tables/crdb_ado.dll and no Language parameter; the first report also lacks State schema fields. Inspection/storage now preserve SourceRejected, including exact legacy-message compatibility, with no private-file/report/version side effects. Full ERP1223tests pass (188Reporting,70architecture),3existing browser skips; independent Crystal build/contract harness pass. No schema, permission or source-policy change. Original RPTs unchanged; requester installs Crystal2013 before further designer work. FOLLOW-024/native acceptance remains Open.


### FOLLOW-024 — manual View binding revision2026-11-02

The active GCT-1 now includes manually entered global SQL View binding, metadata-only drafts and designer preparation. Reporting migration20261102120604 was applied and its actual configured schema inspected; full ERP1239passed/3existing skips, Reporting203/architecture70, Angular504tests/90files and8production-build fixture browser cases pass. Source: documentation/plans/business/global-crystal-template-management/MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md. Existing real hosted/native acceptance remains open; requester publishes API/Angular. View Builder is DEF-027. No actual native-valid RPT/PDF or production View creation is claimed.


### FOLLOW-024 — development dialog display2026-11-02

The empty-form screenshot was reproduced with valid mock source responses on the existing development server; Angular console.error identified an outdated class missing viewMessages while its external template referenced it. The watcher was retriggered without source-content changes or process restart. Existing-dev and production fixture journeys each pass8cases; this does not prove authenticated hosted/native acceptance. Canonical correction: documentation/plans/business/global-crystal-template-management/DESIGNER_DEV_DISPLAY_2026-11-02.md.


### FOLLOW-024 — database Views2026-11-02

Database selection and three all-column LEFT JOIN ReferenceData Views are implemented
and applied to configured Development storage. ERP1244/Reporting207/Architecture70/
Integration189, Angular509/91 and16 fixture browser cases pass; native/host acceptance
remains Open. Current receipt: Reporting feature verification/database-view-discovery/.
Requester publishes API/Angular; any distinct Host database needs the committed
ReferenceData migration. Existing source binding and native policy remain enforced.
SCHEMABINDING requires explicit future View migrations; extra SQL fields do not expand
the current native contract. DEF-027 owns future Builder/contract expansion. The
earlier401 has not been diagnosed by the subsequent400 InvalidView response.


### FOLLOW-024 — ready-made RPT priority2026-11-03

Requester selected ready-made RPT upload/inspection/publication/real PDF display as
the next active check. Further empty-template preparation and the proposed base-design
library are DEF-028; see its canonical scope/reopening trigger in DEFERRED_ITEMS.md.
No new native proof is recorded; FOLLOW-024 and PROD-028 remain Open.


### FOLLOW-024 — Command push-data2026-11-03

Requester retains the RPT Command; GCT-1 now accepts design connection metadata and
binds one named table explicitly to API-supplied rows, retaining exact fields and
parameters. Current scope/build/harness/ERP evidence is COMMAND_PUSH_DATA_2026-11-03.md
in the global-crystal-template-management plan. Status remains Open: local native
ReportDocument initialization fails, and no real current RPT/PDF or zero-database-call
proof was obtained. After requester publication, verify known/filtered/empty API
rows with the design database unavailable. A successful upload alone is insufficient.
DEF-028 and DEF-027 stay Deferred; no remote deployment or RPT conversion performed.


### FOLLOW-024 — complete connection-ignore2026-11-03

Requester explicitly supersedes the retained password check. GCT-1 ignores all
connection properties; its current technical evidence/user-file diagnosis is
CONNECTION_IGNORE_2026-11-03.md in global-crystal-template-management. The deployed
previous Command-support build is confirmed, but the complete-ignore revision has
not been deployed by this work. Exact Countries.1.rpt has no table in read-only
Crystal10 metadata and fails native single-source validation; Countries.test.rpt
fails native saved-data validation. Known Command fixture passes source/schema but
lacks Language. Original files unchanged; no actual PDF acceptance. Status remains
Open pending requester publication and valid designed-report rendering. DEF-028/
DEF-027 remain Deferred. Runtime code and framework tests cannot close native proof.


### FOLLOW-024 — API-data container2026-11-03

Requester removes connection and saved-data admission gates; earlier instructions
to clear cached rows or rebind XSD are superseded. Current GCT-1 scope,1250-test
serial full-suite proof and native limits are CONTAINER_DATA_2026-11-03.md and
verification/container-data/. User publishes Crystal/ERP, then verifies original
Countries.tests.rpt with known/filtered/empty API rows and unavailable design DB.
No native PDF/cache/zero-SQL claim or remote deploy. Status remains Open; RISK-019
records that original source downloads retain original cached contents. DEF-028/
DEF-027 remain Deferred.


### FOLLOW-024 — optional RPT Language2026-11-03

GCT-1 now allows zero RPT parameters and conditionally sets Language if present.
Render input ar/en, fields and canonical fingerprint stay unchanged. Native build/
harness covers all5 no-Language profiles and parameter compatibility. No ERP/client
rerun or successful new native inspection/PDF is claimed. Requester publishes only
Crystal for this revision. Current scope/evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md
and verification/optional-rpt-language/. Status remains Open, Phase06 Not Verified.


### FOLLOW-024 — first user-confirmed display2026-11-03

Requester confirmed successful report display with data. Canonical evidence and
limits: FIRST_REPORT_DISPLAY_2026-11-03.md / feature section28. This positive outcome
is user-reported; no independent PDF/cache/empty/filter/ACL/locale acceptance or exact
version/hash was captured in the confirmation turn. Basic display is no longer an
unachieved user outcome. Overall status remains Open and Phase06 Not Verified for
the broader acceptance. DEF-028/DEF-027 remain Deferred, not automatically resumed.


### FOLLOW-024 — explicit viewer publication2026-11-03

GCT-1 removes implicit publication/rendering of unmanaged deployment files for
Super Admin. Viewer consumption now requires a valid active managed published
version; company grants remain separate. Draft/archived manager visibility and
existing-file registration are preserved. Canonical scope and current technical
evidence: global-crystal-template-management/PUBLISHED_VIEWER_CATALOG_2026-11-03.md
and feature section29 / verification/published-viewer-catalog/. Requester publishes
ErpSystem.Api and verifies the hosted selector; no remote deployment performed.
Status remains Open for the broader acceptance matrix and Phase06 Not Verified.

FOLLOW-024: requester now confirms the selector displays published reports only.
Full ERP1251tests passed with3existing opt-in browser skips;34existing Angular
report tests passed for the language follow-up. No independent hosted/native
acceptance expansion. Current receipt: verification/published-viewer-catalog/.


### FOLLOW-024 — restored native direction2026-11-03

Requester-authorized restoration of the historical API direction stage: Arabic
basis retained, English coordinates mirrored, centered field/text alignment,
legacy horizontal/vertical/diagonal line policy and drawing bounds. Summary Info
Title(ar)/Subject(en) labels already work and are verified separately in Angular.
Canonical scope/evidence: RESTORE_DIRECTION_2026-11-03.md / feature section30 /
verification/restore-direction/. Publish CrystalReportGeneratorApi; compare actual
AR/EN PDFs with fields, images, charts and rules. Automated geometry/call-order
checks are not native visual proof. Status remains Open and Phase06 Not Verified.


### FOLLOW-024 — selector Summary Info diagnosis2026-11-03

Requester confirms direction changed; selector name remains the reported issue.
Hosted native inspection and independent OLE properties agree the local
Countries.tests.rpt candidate has no Title/Subject. The current published-source
match is unconfirmed. Exact evidence and non-destructive upload/publish workflow:
SUMMARY_NAMES_2026-11-03.md / feature section31 / verification/summary-names/.
No runtime change, test rerun or full native shape acceptance claim. Remains Open.

FOLLOW-024 update: actual authenticated published catalog is now observed directly;
countries-tests version1 has null summaryTitle/summarySubject and the English
selector shows the Countries.tests fallback. The requester no longer needs to
copy Network. No runtime/data/preference change. Source byte equality remains
unverified; persisted-name emptiness is verified. See current section31 receipt.


### FOLLOW-024 — confirmed duplicate replacement2026-11-04

GCT-1 now implements the approved filename/entity duplicate warning and one atomic
replacement/publication, retaining original versions/ACLs/View. SQL rollback and
fixture-based EN/AR browser evidence are recorded under feature section32 and
verification/duplicate-replacement/. Publish ErpSystem.Api and Angular assets;
then verify a real duplicate/cancel/replacement, updated Summary Info selector,
old source download and native AR/EN PDFs with the intended authorized roles.
These hosted writes were not performed by the agent. Status remains Open; Phase06
Not Verified, Phase07 not started and DEF-027/028 remain Deferred.

### FOLLOW-024 — vertical-line correction2026-11-04

The requester's current GCT-1 correction supersedes English vertical suppression
with atomic RAS line mirroring. Actual local native AR/EN fixture PDFs, endpoint/
cross-section/style/visibility assertions and the complete classic contract/HTTP
harness now pass. Original RPT SHA256 is unchanged; no source save or deployment.
Current scope: VERTICAL_LINES_2026-11-04.md; feature section33 and
verification/vertical-lines/verification.json. Publish CrystalReportGeneratorApi
and check the intended hosted RPT in both languages. Local fixture proof does not
close broader integrated/hosted acceptance. Status remains Open; overall Phase06
Not Verified, DEF-027/028 remain Deferred and Phase07 is not started.

### FOLLOW-024 — native PDF viewer theme2026-11-04

Requester explicitly retains native iframe after discussing PDF.js and confirms
preview plus Open PDF in a new tab for printing. Shared application toolbar/frame
colors now follow tokens; iframe inherits color-scheme without changing report
bytes. Edge's browser-owned PDF toolbar can remain light; this is an accepted
browser limitation, not a guarantee of full native dark controls. No renderer SDK
or dependency change delivered. Canonical technical proof:
`documentation/modules/reporting/features/global-crystal-template-manager/verification/pdf-viewer-theme/verification.json`.
Angular-only rollout uses the normal Angular build; no API/Crystal publication is
required for this styling correction. Broader integrated/hosted acceptance remains
Open. No deployment, server start/restart or live writes occurred.


### FOLLOW-024 — shared report sidebar/pagination2026-11-04

Bounded Angular correction: shared document actions in sidebar Search/Options tabs,
active-border RTL policy and Countries' existing record-navigation configuration
in all manager grids. The proposed footer redesign was withdrawn; shared footer
source is unchanged. Technical
proof is global-crystal-template-manager/verification/sidebar-actions/; overall
hosted/integrated acceptance remains Open. Rollout owner Operations/Reporting must
synchronize Angular with ErpSystem.Api embedded UI catalog fingerprint
13210765d2afb878148664cdfe80c76fd187a4c66b2d8e4160baf9d24be1e219.
Verify actual hosted embedded/standalone reports and manager pagination after
publication. No agent deployment, server restart, live writes or Crystal service
change. Accepted native PDF toolbar theme limit remains.

### FOLLOW-024 — main manager column filters2026-11-04

Existing Countries shared controls now cover all six main Angular report catalog
columns with server-side bounded POST /manage/query. Deploy Angular with
ErpSystem.Api and synchronized localization catalog; Crystal service unchanged by
this query change. Operations/Reporting must verify real hosted query responses,
permissions, total counts, paging and Apply/Clear EN/AR before hosted acceptance.
Technical proof: global-crystal-template-manager section36 and
verification/column-filters/verification.json. Full Angular530tests and Reporting231
pass; full API solution1269passed/1failed/3skipped. Unchanged Platform
MessageLogTests.ActualSenderRecordsTruthfulOutcomeWithoutReplayOrLiveSecrets
configuration case fails under suite load (missing recorded row); isolated9case
diagnostic passes. Platform/QA owns investigation before claiming a green solution
gate; root cause not established, no unrelated code changes. Status stays Open,
Phase06 Not Verified, DEF-027/028 Deferred; no Phase07 or deployment.

### FOLLOW-024 — report search sidebar/icons2026-11-04

Bounded Angular correction verified in global-crystal-template-manager section37
and verification/search-sidebar-layout/: consistent sidebar form/order, matching
keyboard/visual Search-Reset order, source action in Options and shared icons.
Full Angular531tests and16production-fixture browser cases pass. No API/schema/
Crystal change or deployment; publish Angular UI for this correction. Prior API
query rollout and full-suite finding remain section36. Operations/Reporting owns
hosted visual/permission acceptance; status Open, Phase06 Not Verified,
DEF-027/028 Deferred. No Phase07 closure.

### FOLLOW-024 — manager action/metadata review2026-11-04

Bounded Angular presentation under GCT-1 verified in global-crystal-template-manager
section38 / verification/manager-actions-metadata/: toolbar action hierarchy, shared
icons and labeled persisted metadata. Next field parity reviewed; no new API/schema
contract. Angular531tests and6production-fixture browser cases pass, alongside the
section37 report sidebar16cases (8production standalone,8development embedded).
Operations/Reporting owns hosted EN/AR permissions and visual acceptance after UI
publication. No deployment, live report write or server startup. Section36 API
rollout and inherited full-suite finding stay separate. Status Open, Phase06 Not
Verified, DEF-027/028 Deferred; Phase07 not started.

### FOLLOW-024 — shared manager Button Group 2026-11-04

Requester follow-up verified in global-crystal-template-manager section39 and
verification/manager-button-group/: shared PrimeNG groups for create and downloads,
logical RTL edges and compact stacking. Angular 532 tests and six fresh production-
fixture browser cases pass. Operations/Reporting owns hosted visual/permission
acceptance after Angular publication. No API/schema/Crystal change or deployment;
section36 prior API rollout/full-suite finding remains separate. Status Open,
Phase06 Not Verified, DEF-027/028 Deferred, Phase07 not started.

### FOLLOW-024 — Verify Database and automatic publication, 2026-11-07

The requested server-driven RPT verification and automatic new-version publication
is implemented with preserved history, Upload+Publish authority, current-contract
checks and compensation. Reporting 252 and full ERP Release 1331 tests pass (3 opt-in browser skips).
Crystal host Release build and the current contract/HTTP boundary harness pass
using the installed Visual Studio MSBuild. The earlier dotnet-msbuild missing-target
error and stale September DLL are superseded by this current build, without any
tool installation or system configuration change. Operations/Reporting must deploy
the current host and verify a real compatible RPT and database connectivity before
native VerifyDatabase acceptance. The SDK's
VerifyDatabase requires an active design datasource connection; normal pushed-data
rendering is not that proof. See global-crystal-template-manager/
VERIFY_DATABASE_AUTOMATION_2026-11-07.md. Status remains Open.

### FOLLOW-012 — Super Admin system-text editor correction, 2026-11-07

The Angular Language/Translation workspace now mirrors SystemLocalizationsPage
source/language/status/server paging/edit/reset against existing system-ui-localizations
endpoints. Local automated receipts are under angular-super-admin-settings/
verification/language-translation/. Hosted actual-role persistence/reload remains
owned by Platform/Angular QA under this existing follow-up. Deploy Angular with
the API's matching generated catalog under PROD-019; no remote write is claimed.

### FOLLOW-015 — Super Admin final audit account gap, 2026-11-07

Current source confirms no Angular profile/photo/password owner or routes, while
web-next ProfilePage/ProfileTabs and AccountController implement those self-service
journeys. This remains Required under the user's all-Super-Admin parity goal.
Register the exact account execution contract and Phase00 before runtime; reuse
the existing own-user API, shared forms/file controls and session lifecycle.
The complete requirement matrix and production Countries/export acceptance gaps
are recorded in angular-super-admin-final-review/PARITY_AUDIT_2026-11-07.md.
The parent goal remains Active; this finding is not reclassified as release-only.

Account successor resolution2026-11-07: angular-account-profile is bounded
Verified/Closed on Angular997/195, API1331+3opt-in skips,12 account fixture browser
cases and8 current Next references. Own information/photo/password and TopBar entry
are implemented with Arabic education and portable receipt. This closes the
account client gap above; FOLLOW-015 still owns its other workspace items and
PROD-019 owns coordinated catalog publication. Real account writes/deployment are
not claimed. All-filtered export acceptance is Active before final Super Admin review.

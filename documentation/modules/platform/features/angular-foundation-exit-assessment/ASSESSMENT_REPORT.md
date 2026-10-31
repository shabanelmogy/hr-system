# S1-A13 foundation exit / pilot readiness assessment

Phase06 assessment decision: **Verified**2026-10-30, read-only evidence collection.
This verifies the assessment, not full S1/S2/business migration or release readiness.
Overall plan remains Draft. No runtime/API/domain/schema/native/resource change.

## Decision and exact next prerequisite

Current Shared mechanisms support the next bounded **reporting adapter preparation**.
Do not start Countries CRUD as the complete S3 pilot. ROADMAP explicitly requires
reporting adapter minimum first, then Countries Grid/Cards/Chart/Report/Import and
required designer path/archive/restore/bulk, then States/Districts separately.
Reporting runtime remains blocked until its source/API/permission/binary/lifecycle/
mobile-browser/renderer and exact Phase00 contract is frozen and checked.

Countries CountryReportPage imports Reporting public ManagedCrystalReportView with
entityKey=countries, scope=global and NameAr/NameEn filters. The current module uses
crystalReportService listGlobal/renderGlobal, with entityKey/expectedSha256 from
selected report rowVersion and language/approved filters; application/pdf Blob,
120000ms timeout. Shared ReportViewer creates/revokes Blob URLs and uses iframe.
This is a source candidate for a framework-neutral minimum viewer, not proof that
the Angular lifecycle, MIME/content/status/cancel/revoke/mobile fallback is correct.
Another ServerReportViewerClient imports ActiveReportsJS React Viewer; do not infer
that the Countries managed-Crystal consumer requires that unrelated SDK. Designer
entry/ownership/entitlement must still be traced independently under RISK-017.
No new package/licence/purchase/rendering decision has been authorized by this review.

## Current-source acceptance matrix

| Requirement | Verified current foundation evidence | Remaining exact acceptance |
| --- | --- | --- |
| Independent Strict/Zoneless client/build | angular.json/strictTemplates/strict TS, current264unit/types/build474.00kB within500kB | Remote CI/environment/deploy not inferred |
| Architecture/shared-first | AST+external HTML checks10, shared public API, actual PrimeNG widgets and current scopes | Each future feature consumes shared shells; no raw-grid/form bypass |
| Theme/fonts/resources | @app/tokens installed/sync includes all3clients;14fonts; five palettes/modes/EN-AR390/1440 browser evidence | PROD-019 matching hosted resource/SQL smoke; no new resource in this assessment |
| Direct secure session/context | DEC-025/027 browser/API proofs + fresh context24/company14/fiscal15/login10 | PROD-002/017/019/RISK-018 release/host authority remains |
| Forms/error/focus/local/global draft | Shared form/summary/fields, close and registered navigation reports; current264unit + retained form40 | FOLLOW-014 actual business forms/structured children and hard-reload recovery when applicable |
| Collection presentation | MyDataGrid/CardList/toolbar/filter/footer/record nav, fresh collection8; projected8px action spacing | FOLLOW-016 advanced options and actual server volume/export scope |
| SIG-01 finite bootstrap/separate watch | S1-A12 helper15/read40+8; actual observer teardown and scope/identity guards | FOLLOW-017 actual service/lookup/watch/reconnect/selected-label/loading policy in first consumer |
| SIG-02 owner lifetime | Scoped read + registered transitions + context owner regressions | Recheck actual pilot request/binary/scope lifetime |
| SIG-03 loading ownership | Shared FeedbackState/FormContainer/actions and current read/context proof | Each actual list/editor/report names page/dialog/background loading owner |
| SIG-06 applied criteria/URL | S1-A11 codec38/Router8/browser40+8; false0null/draft/history/one-request | Actual S3 typed wire/privacy/return/export criteria, FOLLOW-003/016 |
| SIG-07 compatibility | Shared text/reference/date/numeric/bool/multiline/IME/clear/locks/errors/focus and palette/browser suites | Actual consumer and upgrades; date locale NG0956 remains FOLLOW-014 |
| SIG-08 scroll/fixed actions | Collection/close/context current browser layouts and nested overlay proof | Actual report/import/child-editor layouts at compact/wide viewports |
| ERP-01 typed contracts | Raw generator rejected by proof; typed owner unknown parsing/cookies/CSRF retained | FOLLOW-003 actual service DTO/error/binary/concurrency mapping; Countries lacks RowVersion in prior source assessment |
| ERP-02/03/04 | Generic selection/CVA/keyboard/validation/draft building blocks | Owner lookup/schema/structured editor contracts; not business UI by DTO changes |
| ERP-05/06 writes | Duplicate/pending/local draft mechanisms only | Actual concurrency/atomicity/uncertain-write/server authority before mutation acceptance |
| ERP-07 amounts/dates | Exact numeric text/date-only foundation evidence | Per-owner API precision/timezone/financial rules; no global2-decimal or Number coercion |
| ERP-08/09/10/11 | Scope/lifecycle/feedback and controlled source mechanisms | Actual archive/restore/bulk/audit/volume/investigation/report/import/export contracts |
| SIG-04/05 | Local draft/race mechanics; no new attachment/structured business editor here | Mandatory at first applicable consumer; not delayed merely to S8 |
| ERP-12/release | Production note registry/protocol | PROD-023 restore/recovery and other production gates; configured CI is not executed remote proof |

## CI and evidence provenance

.github/workflows/angular-ci.yml configures Node24.18.1, npm ci, token checks and
npm run check with PRIMEUI_LICENSE_KEY secret reference. It does not run browser
acceptance, and no remote CI run/secret configuration is claimed. tokens sync source
currently lists web-next/mobile-react/web-angular; architecture's old two-client
statement is updated from this verified source. Local264unit/10architecture/4config/
types/catalog/tokens/14fonts/build and fresh read40+8/context24/home14/company14/
fiscal15/login10/language20 are inherited S1-A12 evidence, not rerun for unchanged code.
Current captured source SHA256 entries accompany this assessment. Source is main
a2c56412 plus local dirty changes, not a committed handoff. No push/deploy performed.

No feature regression found in this read-only assessment. Full API/Next/native
suites not rerun; RISK-012 installed Next dependency drift remains. Date vendor
NG0956 remains FOLLOW-014. Actual Reporting adapter absence/compatibility is
RISK-017 and the next preparation, not a surprise release-only waiver. Overall
Implementation Ready/G0-G4 and full S1 closure are not claimed. Existing release
checks stay canonical, no duplicated note or new hypothetical approval flow.

## Assessment boundary and handoff

No UI route/mock/API write/schema migration or business capability added. Web and
mobile new UI Excluded for this assessment; existing client behavior retained.
Domain five-point UI/EF audit N/A read-only evidence. Next feature owns reporting
source reconciliation and freezes the smallest adapter before runtime. Reuse Shared
layout/feedback/fields and separate Reporting authorization/transport from a generic
report host; do not reproduce React wrappers or assume PrimeNG supplies a renderer.

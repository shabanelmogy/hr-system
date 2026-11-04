# Countries pilot acceptance — review applied profile

## 1. Ownership

ReferenceData owns Countries business rules; Platform owns migration evidence and generic realtime adapter. Exact S3-A8 only; existing Angular five-view runtime is the reference.

## 2. Current source

CountryReadState uses finite createScopedRead page/detail and refreshes own writes. No Angular realtime connection existed at entry. The current implementation adds the Platform lease and Countries background reconciliation; see ANGULAR_REALTIME.md and verification/CURRENT_ACCEPTANCE.md. Existing CountryChangedJob/RealtimeEntityChanged/GeneralHub and BrowserAuthController supply all required server contracts.

## 3. Persistence

No API/domain/SQL changes. Existing global Countries contracts and server constraints remain. EF migration is N/A because no persisted meaning/schema changes.

## 4. Business rules

Exact super_admin/Countries:View read authority is rechecked by Countries; write/report/import rules retain S3-A3..A7 owners. Events are hints only. PILOT_CONTRACT.md freezes lifetime, reconciliation, duplicate and retry behavior.

## 5. Platform options

Web Grid/Cards/Chart/managed Report/Import and existing actions Required for final pilot. New native UI Excluded; current native client retained. Standalone Grid export/AR/offline writes Excluded. No Next execution prerequisite under D35.

## 6. Transport

Existing browser Cookie realtime-token endpoint and authorized company SignalR hub; lazy @microsoft/signalr official client. No BFF, persisted token or replay. Full contract in PILOT_CONTRACT.md.

## 7. Shared composition

Reuse MyDataGrid, CardList, PageHeader, forms/dialogs, FeedbackState, tokens and existing localization. Platform public API exposes a generic hint/status stream. Feature owns resource selection, authority and read refresh. No new visual control in this increment; PrimeNG MCP consultation is required before later shared-control changes.

## 8. States

Connection connecting/connected/disconnected/denied; finite HTTP snapshot remains usable during connection failure. All current loading/empty/error/forbidden/draft/uncertain states retained. One trailing read refresh handles hints during load. Background reconciliation keeps ready data and same-ID row elements/focus; failures remain explicit.

## 9. Security and identity

Each subscription captures immutable actor; predicate checks prevent late import/token/start/events. Auth replacement disposes hub; 401/revocation use existing context synchronization,403 latches denied. No event-driven record updates or storage.

## 10. API evidence

Read-only audit: BrowserAuthController realtime-token, GeneralHub authorization/groups, RealtimeEntityChanged envelope and CountryChangedJob after-commit permission audience. No API runtime changes. Hosted connection proof is not supplied by source inspection.

## 11. Verification

2026-10-31: bounded realtime/loading increment passes full Angular check79files/464tests,4configuration and12architecture tests, types/templates/catalog/tokens/fonts and production build. Real installed SignalR client passes9 HTTPS browser cases: EN/AR at390/1440, remote bursts, malformed/other-resource/duplicate hints, one trailing pending read, reconnect, editor/import drafts, revocation, no-view, token403, initial503retry and hub401/403. The four presentation cases verify exactly one initial loading episode, ready rows during background reconciliation, same row DOM and keyboard focus, and visible forbidden feedback. Import smoke1 and import journeys5 including keyboard page-size/next paging pass. Initial502.19kB/132.13kB transfer warns2.19kB above unchanged500kB threshold (FOLLOW-019); no hosted speed or full-pilot pass is claimed. Complete pilot Phase06 remains Not Verified; prior S3-A2..A7 receipts remain historical. FOLLOW-021 records broader legacy read-harness drift.

### D37 technical maintenance — Clean Code

Requester-approved D37 adopts external component HTML/SCSS and readable typed TS throughout Angular. See ANGULAR_CODE_STYLE.md and verification/CODE_STYLE_ACCEPTANCE.md. The authorized continuation organizes78component files and their colocated resources/tests (261files) into matching folders, updates curated imports/manifests, and adds a folder rule/CLI flat:false. This is resource/formatting maintenance, without business/API/schema changes. Existing shared APIs, Angular forms/signals and ownership remain. Hosted read/security receipt confirms read/realtime/authority but managed report catalog503 remains PROD-028; complete pilot remains Not Verified.

### FOLLOW-022 verified code hardening

Requester-authorized CC-01..07 fixes implemented in shared owners and feature presentation utilities. Semantic lint/strict compiler/resolved dependency gates pass; component folders remain enforced. Final 84files/472unit tests,26architecture/dependency cases and122bounded browser cases pass. Initial495.64kB passes unchanged budget. Current implementation and source/receipt manifest: documentation/plans/business/web-angular-migration/CLEAN_CODE_IMPLEMENTATION.md. No API/domain/schema/Next/native change or full-pilot/live-report closure.

### Current final acceptance — 2026-11-01

Non-report Countries acceptance is Verified: fresh full Angular check passes
84unit files/472tests,26architecture/dependency cases and495.64kB initial build.
253current intercepted browser cases include the five-palette/mode/language/size
matrices and current actions, keyboard, filters, lifecycle/import/realtime failures.
Seven actual hosted cases prove UI create/edit/XLSX import, remote post-commit
delivery, offline missed-change reconnect and owned-record archive/restore/bulk.
Both sessions logged out; test IDs7,8,9 are archived, with no pre-existing record
modified. Fresh hosted read/security passes; actual report catalog remains503
CrystalReport.CatalogUnavailable, so full Phase06 remains Not Verified/Phase07
not started and route stays development-only. This supersedes earlier missing
palette/size/hosted-delivery evidence, not the separate release obligations.
See verification/FINAL_ACCEPTANCE.md and verification/final/SUMMARY.json.

## 12. Rollback and limits

Remove own Angular realtime adapter/consumer/dependency and docs; no database rollback. Business route remains development-only until full exit. PROD-019/023,RISK-016/017,FOLLOW-016/017/018/019 retain exact boundaries.

## 13. Localization and accessibility

No new translation key. Shared MyDataGrid now uses built-in rowTrackBy and viewport-bounded logical-sticky feedback, verified in EN/AR and compact/wide. Preserve EN/AR,RTL,all five palettes and existing shared controls. Any subsequent feedback uses current shared public API and catalog.

## 14. Readiness and authority

Exact G0-G3 and release-only remaining G4 recorded in PILOT_CONTRACT.md; bounded runtime starts only after registered current-file Phase00 passes. Overall migration Draft. D35 excludes required Next work.

## 15. Closure

S3-A8 remains Active solely for current hosted managed-report acceptance PROD-028.
Non-report pilot acceptance is Verified2026-11-01; complete Phase06 Not Verified,
Phase07 not started and business route remains development-only. Native runtime
remains intentionally Excluded; no new API/domain/schema/Next/native source.
Production release and optional Shared Grid powers retain their separate owners.

# Managed reporting minimum — Angular Web target

## 1. Ownership

### Header actions and bounded viewer maintenance — 2026-11-08

GlobalReportView exposes its current PdfViewer action template as `headerActions`.
Embedded consumers opt into `externalActions` and render that exact template in
their existing PageHeader. Standalone reporting renders it in its own title card.
The generic PdfViewer toolbar appearance keeps translated link names/titles,
compact text/icon presentation and44px coarse-pointer targets. The existing Blob
lease, open/download behavior, error masking and revocation remain authoritative.
Countries/States/Districts compose this through Reporting's public API; System
Error Logs receives an optional header-template callback through its existing
composition adapter, without importing the Reporting owner into Platform.
The reference workspace reduces its sidebar/gap to260px/16px and stacks bounded
criteria/document rows below54rem of actual content width. Its existing scroll
viewport owns criteria scrolling. Existing RPT source download/upload permissions
and dialogs remain in the sidebar. No API/schema/permission/Next/Mobile change.
The sidebar omits its tab strip when no RPT source operations remain; criteria
stay directly available, and permission-controlled source actions restore tabs.
The existing standalone `verify-reporting-browser.mjs --focused` harness now
targets header links and intercepted built assets. It retains eight EN/AR,
Light/Dark open/download/lifecycle checks with exact downloaded fixture bytes.
The standalone route explicitly selects the authenticated fill workspace; its
facade supplies the available-height contract to GlobalReportView. The direct
development route falls back to100dvh. Neither route relies on an auto-height
ancestor to size the PDF panel. Standalone browser acceptance checks bounded
full-height workspace geometry as well as horizontal containment.

Entity initialization correction2026-11-06: GlobalReportState starts catalog reads only after setEntity configures the consumer. A State workspace no longer issues an incidental Countries catalog request before its input effect. Existing entity switch, form reset, ACL and PDF semantics remain; the regression failed before the fix and27focused report tests pass afterward. Current full/client/browser evidence is owned by angular-states-workspace/STATES_WORKSPACE_2026-11-06.md. No Reporting API, native or provider deployment change.

### Report sidebar version management — 2026-11-05

Requester-authorized report sidebar actions retain the granted RPT source download
and add a deferred entry to the existing template upload/version dialogs. Exact
entity/reportKey resolution and immutable SourceId/version-token matching precede the existing
management and report Upload ACL checks. A new version does not publish itself.
The viewer refreshes after closing details; session/selection changes destroy the
scoped editor and cancel pending work. No API, database, permission or other-client
contract change is introduced. The [owning sidebar contract](../../../../modules/reporting/features/global-crystal-template-manager/REPORT_TEMPLATE_SIDEBAR_2026-11-05.md)
records source, verification and acceptance limits.

### Current composition maintenance — 2026-11-05

GlobalReportView composes the new feature-owned GlobalReportCriteria through the
existing reportCriteria slot. The child receives a typed FieldTree<ReportFilters>,
catalog presentation, pending/conflict flags and emits selection/reset requests.
The parent remains the sole form, validation, submission, auth-context reset and
GlobalReportState owner. Shared FormContainer and fields preserve error focus,
native Signal Forms submission and server-field errors. Existing Reactive Forms
compatibility boundaries elsewhere in reporting remain explicit.

Current verification: full Angular check (98 files / 560 tests) and production build pass;
the focused GlobalReportView suite passes 14 tests, including sidebar action placement,
tab lifetime, validation and context reset. That increment initially stopped at the
legacy script's outdated download-link selector. Subsequent sidebar maintenance
updated the script and passed all eight focused lifecycle cases; FOLLOW-026 is
Verified. The current sidebar receipt records the full567-test gate and 12 new
production-fixture cases, without claiming hosted or physical-device acceptance.
Source/verification details:
[current execution report](../../../../guides/web/architecture/ANGULAR_COMPONENT_DECOMPOSITION_2026-11-05.md).
API/Next/Mobile/persistence are unchanged; no new engine or domain capability.

Reporting owns global Countries catalog/auth/service/controller; Shared generic validated PDF resource/layout. No tenant/report-manager/designer/API business ownership transfer.

Districts integration2026-11-06: the existing typed Reporting owner additionally
supports exact StateAr/StateEn filters only for districts. Native Signal Forms
retains200char bounds, beneath-field server alias mapping, reset/entity/actor
cleanup and shared PDF lifecycle. Countries/States requests stay NameAr/NameEn.
District labels load only when needed. Evidence is the District workspace report
and receipt; fixture PDFs do not close PROD-028/025 real-provider acceptance.

## 2. Existing-System Relationship Review

Current global controller/query/validator/handler/storage/renderer and Next ManagedCrystalReportView/ReportViewer/Countries reviewed. Native print/sharing retained. Countries canonical ActiveReports claim differs from current wiring: RISK-016/017, not silent exclusion.

## 3. Frozen minimum

GLOBAL_PDF_CONTRACT implemented and Phase06 Verified for the global Countries PDF minimum before pilot. Full Countries and the managed Crystal report manager remain Required in later slices. ActiveReports viewer/designer/SDK/authoring is Excluded by DEC-028; it is not a future acceptance gate.

## 4. Reuse

Existing Shared forms/reference/actions/feedback/PageHeader/SurfaceCard; no existing PDF host, so generic branded-PDF viewer/lease/workspace justified. Reporting public API composes domain data.

## 5. Platforms/views

Web P-001/C-01 dev/reports authenticated global proof Required; production Countries route and tenant manager/designer/upload/publish/new native UI Excluded from this child. Browser compact fallback Required.

## 6. API and permission

Exact global GET/catalog and POST/render, super_admin+GlobalCrystalReports:View, no tenant entitlement; expectedSha256 selected source hash, NameAr/NameEn200 (plus StateAr/StateEn200 for districts only) and en/ar. HTTPS/cookie CSRF current middleware.

## 7. Business Rules Matrix

Server auth/hash/filter/render authoritative; Reporting parser/controller/HTTP/identity/applied filters; Shared validated bytes/lease/layout. No permission from UI, auto replay or new API semantics.


D41 composition maintenance2026-11-04: GlobalReportView now references external global-report-view.html and .scss. Its Signal Forms model, service/state ownership, submission/PDF lifetime, embedded/standalone contracts and lazy Reporting entry remain unchanged.
Reusable policy: documentation/guides/web/architecture/ANGULAR_COMPONENT_COMPOSITION.md. Current evidence: documentation/modules/platform/features/angular-collection-foundation/COMPONENT_COMPOSITION_REPORT.md. Earlier acceptance snapshots retain their original scope/date; no API/domain/schema/native behavior changes.

D41 final acceptance: architecture16/full scan, strict app/spec,448 unit tests and production build passed;86 bounded fixture browser cases across Grid8/Countries8/actions8/Report8/login10/language20/Shell24. Production initial572.16kB; existing RISK-019500kB warning remains. Portable current evidence: angular-collection-foundation/verification/component-composition-summary.json. API/native/hosted/pixel acceptance retain their existing scope.

## 8. Edge Cases & Validation Matrix

Malformed/duplicate/empty catalog, permission0requests,200/201 Unicode filters, draft/apply/reset/selection/language/scope/CSRF/late bytes/revoke,400/401/403/409/413/503/MIME/signature/100MiB/fallback and destroy. Contract owns outcomes/tests.

## 9. Consistency

One current immutable auth+selection/hash+language+applied render key. Unsubscribe cancels/suppresses late CSRF/HTTP/validation. Clear/revoke old PDF on replacement or identity loss, no iframe-load success inference.

## 10. Resources/security

Four reports.* bilingual core captions through existing SQL-backed runtime/generator; matching API resource deploy PROD-019. Optional csrf renewal on existing narrow bridge, old default retained. No API/domain/schema/native change.

## 11. Verification

Latest sidebar maintenance2026-11-05: full Angular check567tests/98files,
architecture30, lint/format, strict app/spec types and production build pass.
The existing consumer SourceId and version-token envelope is matched exactly to
the chosen management record before upload. Current browser receipt:
`documentation/modules/reporting/features/global-crystal-template-manager/verification/REPORT_TEMPLATE_SIDEBAR_2026-11-05.json`.
Earlier counts below belong to their own dated increments; hosted/native release
and historical raw-log availability remain separately owned.

Phase06 Verified2026-10-30 for GLOBAL_PDF_CONTRACT bounded minimum. IMPLEMENTATION_REPORT.md and verification/ own current295unit/full check,PDF40+8,login10/language20/context24,API17/localization43/catalog7 and limits. No full Countries/managed-manager/native/physical/live acceptance.

Phase00 four current books/manifest/381recipes/planning before runtime. Full Angular264baseline+unit/HTTP/browser40+8 and retained regressions; reporting/localization focused API/catalog tests after resource change. No live/physical-device claims.

### S3-A6 Countries Report — 2026-10-31

Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.16kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

Countries consumes GlobalReportView and globalReportAllowed through Reporting's
public API, lazy inside the existing collection workspace. Exact Countries:View
workspace authority and super_admin + GlobalCrystalReports:View gate visible/direct
Report entry; current read-only actors may render. Losing authority destroys the
embedded report and falls back to Grid. Header Refresh reloads report catalog/source
and regenerates; other views keep existing refresh. Header Filter controls report
criteria without discarding form/selection or rerendering. No nested PageHeader.
Reporting keeps existing catalog/service/PDF validation/cancellation. Applied filters
and selected report now belong to the immutable actor; replacement clears them and
draft fields. Explicit reload regenerates even if source/hash is unchanged. Shared
ReportWorkspace reference appearance uses280px sidebar/gap64 and contained scrolling;
FormContainer sidebar appearance keeps Search/Reset full width; PdfViewer fill mode
retains safe open/download, capability fallback, lease cleanup and finite inline area.
Existing standalone report defaults remain compatible; no new package or translation key.

Updated actual consumer proof: documentation/modules/platform/features/angular-countries-report-view/verification/CURRENT_REPORT_ACCEPTANCE.md. Prior S3-A0 acceptance remains historical; current full-pilot/live limits retained.

## 12. Operations

RISK-016 source drift, RISK-017 managed PDF/other specialists/physical-browser, existing RISK-008 real RPT/PDF, PROD-002/017/019/RISK-018 release checks. Overall Draft, no SDK/license purchase.

## 13. UI Pattern

P-001/C-01 technical criteria+PDF report workspace, shared fields/errors/scroll/responsive/5palettes/EN-AR. Always explicit open/download fallback; safe created Blob URL only, no arbitrary iframe sources.

## 14. Readiness

G0-G3 frozen for global-only minimum; remaining production checks G4 release-only here.381Phase00 before bounded runtime. Full pilot and other Reporting capabilities remain independently gated.

## 15. Handoff

S3-A0 bounded runtime Phase06 Verified/Closed; Phase07 technical education and handoff completed afterward. S3-A1 read-only Countries preparation follows. Technical education after Phase06 Verified, actual Countries/managed Crystal manager acceptance separate; ActiveReports is Excluded.

Requester correction2026-10-30 DEC-028: Angular ActiveReports viewer/designer/SDK/authoring/license scope Excluded, with no placeholder. Managed Crystal/PDF remains the current bounded minimum; historical source/designer parity statements do not override this explicit cancellation. Existing other clients/API unchanged.


Maintenance 2026-11-04 — D07/D39: Report criteria use native Signal Forms. submitSearch awaits the exact submitted RenderSpec in the existing scoped render pipeline; replayed prior results cannot end it. Context/language replacement cancels acceptance. Owned backend errors map to native fields; no second render request or parallel error store. API/Next/Mobile runtime and persistence are unchanged; migrations and cross-platform domain UI audit are N/A for this client-only maintenance. Current verification and limits: `documentation/modules/platform/features/angular-form-foundation/SIGNAL_FORMS_IMPLEMENTATION_REPORT.md`. Historical verification in section 11 refers to its dated increment.

# Frozen S3-A6 Countries managed Crystal/PDF contract — 2026-10-31

## 1. Ownership

Reporting owns global deployment catalog/render/security; ReferenceData owns Countries composition; Platform owns migration evidence; Shared owns generic layout/form/PDF. Existing global API/schema/native unchanged.

## 2. Existing-system relationships

Reviewed current CountryReportPage, CountriesMultiView, ManagedCrystalReportView, ReportViewer, existing Angular GlobalReportView/State/Service, ReportWorkspace, FormContainer, PdfViewer and global API controller/query/validator/handler. Reuse existing owner; no parallel report implementation.

## 3. Scope and platform decisions

S3-A6 Web Report Required inside authenticated Countries preview. Native rewrite Excluded; existing native retained. Browser compact/open/download Required. Report authoring/tenant manager/new endpoints/schema/ActiveReports Excluded. Import and full pilot remain separate Required children.

## 4. Reuse and implementation shape

Extend Reporting GlobalReportView with embedded mode, controlled criteria visibility and explicit reload. Keep standalone /dev/reports compatible. Feature supplies translated catalog/unavailable captions and header actions only. Shared ReportWorkspace reference appearance, FormContainer sidebar appearance and PdfViewer fill mode own recurring responsive layout.

## 5. Transport and authority

GET /api/v1/global-crystal-reports?entityKey=countries, POST /{sourceId}/render with entityKey=countries, expectedSha256=selected rowVersion, language en/ar and approved NameAr/NameEn nonempty filters only. HTTPS Cookie/CSRF, existing10000/120000ms finite deadlines, binary MIME/signature/size validation and no automatic replay. No tenant entitlement or invented per-user Run grant for this global deployment source.

## 6. Permission Action Matrix

Countries workspace entry still requires super_admin + Countries:View. Report option/direct callback requires the same plus exact GlobalCrystalReports:View. API independently requires super_admin + GlobalCrystalReports:View. Tenant read-only may read/render PDFs; Create/Edit remain independently guarded. Revocation immediately masks/destroys report and returns to Grid; no unauthorized catalog/render request.

## 7. Business Rules Matrix

Catalog source ID and SHA256 remain authoritative; select first or retained eligible report. Draft NameAr/NameEn filters are separate from Grid criteria; each max200, client shared validation/focus and server field errors. Search applies draft once; explicit Reset clears/applies once (existing S3-A0 approved behavior). Language/selection renders last applied values. Hiding criteria retains draft/applied/selection and makes no request. Parent Refresh reloads catalog/hash then renders; theme changes do not rerender PDF.

## 8. Edge Cases and Validation

Test empty/malformed/failed catalog/retry, empty/invalid MIME/signature PDF,400 field error/201 length,403 latch,409 source conflict requiring explicit catalog refresh, pending duplicate submission, late CSRF/render/signature results, identity/permission/view changes, URL lease revoke, EN/AR/RTL/five palettes/compact/wide, unsupported inline preview/open/download. Strengthen applied selection/filter and draft ownership across immutable actor replacement; never carry old actor criteria into new actor requests.

## 9. Lifetime and consistency

Reuse scoped catalog read, typed cold Observables and switchMap render cancellation. Current owner identity/report ID/hash/applied criteria/language identify one result. Leaving Report destroys its state/form/PDF lease; old results stay masked and cannot revive. Re-entering Report creates fresh report criteria; Grid criteria/paging stay unchanged. No business write/DB transaction/unsaved entity workflow.

## 10. Localization and accessibility

Existing canonical SQL-backed core/reference-countries captions and token palettes. No new visible strings expected; do not bypass DB translation or loosen catalog hash. One Countries PageHeader, no nested report header in embedded mode. Shared noValidate/field errors/summary/first invalid focus, enabled Search, native link semantics, labeled iframe and themed shared scroll. Native unchanged; no new mobile route.

## 11. Verification

Phase06 Not Verified. Entry source/API contract is reviewed; runtime follows only after current-only manifest/books/recipe registration and generation/check/planning. Required: meaningful shared/state/consumer tests, full Angular check/budgets, actual authenticated Countries Report browser40 plus focused failure/authority/fallback cases8, current Next source comparisons8, retained command and Chart regressions8. No live Crystal engine or hosted business write inferred from fixtures.

## 12. Impact Matrix

Reuse existing Reporting service/API contracts/native. Extend shared layout/form/PDF compatibly, Reporting view/controller ownership and Countries view/header integration. Add focused owner/shared/consumer tests and browser driver. No new dependency/catalog key expected. API/schema/migrations N/A; PROD-019/023 and RISK-008/017 retain actual deployment/engine/device/full-pilot gates.

## 13. UI Pattern and fidelity

P-001 Countries collection with embedded Report (active catalog reference). Current Next CountryReportPage + ReportViewer is baseline: NameAr,NameEn,report selector then Search/Clear; desktop sidebar280px/gap64, compact stacked, PDF region fills contained workspace. Header Filter controls sidebar in Grid/Cards/Report; Chart remains without filters per D33. Shared explicit open/download safety controls remain from approved S3-A0; no ActiveReports imitation.

## 14. Readiness and bounded authorization

G0 ownership/scope, G1 permissions/filter/source rules, G2 transport/cancellation/security and G3 shared/UX/platform contracts are frozen in REPORT_SOURCE_CONTRACT.md and exact v2 S3-A6 contract. S3-A5 dependency Closed. Remaining G4 issues concern live deployment/engine/device/realtime/full-pilot only and cannot change this read-only source contract. Exact S3-A6 runtime authorized after entry gates; no sibling runtime.

## 15. Handoff

Sole Active S3-A6 source/API reviewed, entering Web after Phase00 checks. Phase06 Not Verified; no education/closure yet. Continue exact current contract, keep user4210, use isolated4220 fixture preview; no live host writes/deploy/commit/push. Import stays Queued.

Current native PrimeNG Button link and ScrollArea basic metadata/examples consulted before shared changes. Metadata API section for ScrollArea was unavailable; routed basic example supplies compound selectors, existing ScrollViewport source/Angular/browser checks remain authoritative. No PDF component is invented in PrimeNG. Retain existing shared native PDF lease/links/iframe and documented browser fallback. Sources: https://primeng.dev/button ; https://primeng.dev/scrollarea ; https://angular.dev/guide/http/making-requests ; https://developer.mozilla.org/en-US/docs/Web/API/Navigator/pdfViewerEnabled .

## MCP validation record

ScrollArea compound usage validates with zero metadata issues. Button native anchor
usage reports six unknown-prop findings for href/target/rel/referrerpolicy/download.
Those are native HTML anchor attributes, and the routed official Button link example
explicitly uses href/target/rel with pButton. Retain the documented directive and safe
native attributes; do not remove security or download behavior to satisfy a component-
only metadata table. No full Button validation pass is claimed. Exact native template
is separately checked by Angular compilation and actual PDF open/download/browser tests.
The ScrollArea api section lookup was unavailable; the routed basic example and
installed source were consulted. Metadata validation never certifies browser behavior.


## Completed bounded verification

Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.19kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

Current source CountryReportPage/ManagedCrystalReportView/ReportViewer was rendered
at identical viewports/locales/modes with the same synthetic report catalog and PDF.
Verified independent NameAr/NameEn criteria, report selector, first catalog report,
source SHA256 request, desktop280px sidebar/gap64, compact stacked layout and global
permission rule. Source fixture lacks the report grant, so browser interception adds
GlobalCrystalReports:View to that fixture session only; no real permission is changed.
Retain the approved S3-A0 draft/applied correction: language/selection uses applied
values; Reset clears and applies once. Angular uses the existing shared labeled fields,
validation/counters, native PrimeNG controls and explicit safe PDF Open/Download bar;
Next uses its MUI field/iframe presentation. Label/input heights and button styling
are not certified pixel-identical; remaining source visual reconciliation is S3-A8,
not implicitly closed by bounded Report behavior acceptance. Native browser PDF
internals are opaque: iframe assignment is not proof that an RPT engine rendered.
PDF-disabled cases prove fallback/download bytes; valid synthetic PDF is not real RPT output.

S3-A6 bounded integration Verified/Closed after Phase07 education. Next sole Active
child S3-A7 Countries XLSX Import source/API/Phase00 only, independently runtime-gated.
S3-A8 full pilot/source visual/realtime/host/scale, S1-A14/FOLLOW-016 complete Table
powers and PROD-019/023/RISK-008/017 remain open. ActiveReports Excluded DEC-028.


Measured source spacing correction: current Next theme.spacing=8 converts the
ReportViewer numeric MARGIN_BETWEEN=8 to64px, not8px. REFERENCE_RESULTS records
a64px desktop and compact gap. Angular reference workspace now uses64px
with finite contained height; the source gap mismatch is corrected. Shared field/
button geometry remains under RISK-016/S3-A8 full-source visual acceptance. See
https://mui.com/system/spacing/ for numeric spacing transformation.

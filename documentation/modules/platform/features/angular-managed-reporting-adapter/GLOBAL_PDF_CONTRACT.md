# Frozen managed reporting minimum — global Countries PDF

S3-A0 existing migration bounded minimum before Countries. Reporting owns catalog/
authorization/typed service/controller; Shared owns generic validated PDF lease/
viewer/layout only. Evidence lives under Platform because parent migration module
is Platform. G0-G3 fixed for this exact child;381recipe/planning Phase00 before
runtime. Remaining G4 PROD-002/017/019/RISK-018 release-only for this minimum.
RISK-017 managed PDF/other specialists and RISK-016 source drift remain Required for full pilot; ActiveReports is Excluded by DEC-028.

## Existing-System Relationship Review

Countries source currently wires CountryReportPage to ManagedCrystalReportView/global
Crystal PDF. Global controller/query/validator/handler/storage/renderer inspected.
No tenant store or mutations: deployment RPT files, countries/states/districts server
allowlist. Minimum UI here supports Countries only; no placeholder States/Districts.
Separate ActiveReports React Viewer exists. Countries canonical web book still
claims a published ActiveReports viewer/designer, but current Countries folder and
MultiView do not wire that path. Record mismatch, source mismatch stays recorded, while DEC-028 explicitly cancels the Angular
ActiveReports target; do not buy or port that SDK. Reporting tenant manager/designer/
upload/publish/version CRUD and ActiveReports integration Excluded in this bounded
minimum; tenant managed-report manager remains Required later; ActiveReports viewer/designer/SDK is explicitly Excluded by requester decision DEC-028.
Native ManagedCrystalReportView uses Expo print/sharing/sensitive-file cleanup;
native rewrite Excluded, browser compact/native-PDF fallback Required here.

## Current API and exact permission matrix

| Action | Route/contract | Actor/action | Scope |
| --- | --- | --- | --- |
| Catalog | GET /api/v1/global-crystal-reports?entityKey=countries | super_admin case-insensitive + exact GlobalCrystalReports:View | Global; no Reporting tenant entitlement |
| Render | POST /api/v1/global-crystal-reports/{64hex sourceId}/render | Same actor/action, cookie CSRF required | Global, server authoritative |
| Open/download generated PDF | Current validated response only | Same current actor and context/selected render identity | Local ephemeral Blob URL |

Catalog DTO: id/entityKey/reportKey/displayName/nullable summaryTitle/summarySubject/
description/currentVersionNumber/booleans isPublished/isArchived/rowVersion/updatedOn.
Strict runtime parse unknown, exact countries entity,64lowercasehex id+rowVersion,
unique IDs, at most1000 entries (deployment default bound); reject malformed result,
not partial items. No role-only or wildcard bypass. Server403 hides data immediately.
Render body: entityKey=countries, expectedSha256=current selected rowVersion,
language en|ar, filters NameAr/NameEn strings only, max200 each. Empty removes filter,
no trim or arbitrary criteria/operator. Existing API global hash protects deployment
source changes;409 clears PDF and requires explicit catalog reload, no blind replay.
400/401/403/404/409/413/503/error bytes remain typed safe feedback. If server supplies
owned field errors map them beneath those shared fields; unknown errors remain
form-level. Do not expose raw exception/HTML as a message.

BrowserAuthenticationMiddleware validates Origin/HTTPS/CSRF on cookie POST. Existing
BrowserMutationSecurity remains authority; generically add optional csrf(renew=false)
flag delegating resetCsrf when true. Report requests use fresh token, default other
consumers unchanged. No auto auth refresh/retry/replay. CSRF10s owner timeout then
render120s; withCredentials true. RxJS unsubscribe cancels POST and suppresses a
late CSRF Promise before it can start POST. Validate stale identity after asynchronous
work, not merely visual disable. No API behavior/schema/domain/EF change.

## PDF trust/lifetime and UI reuse

No existing Angular report/PDF host exists in Shared public API. Add generic Shared
PdfDocument validator/lease/viewer plus ReportWorkspace layout; reuse PageHeader,
SurfaceCard/FormContainer/TextField/ReferenceField/ActionButton/FeedbackState.
Validate Blob application/pdf and first5bytes %PDF-, nonempty up to100MiB (configured
backend ceiling; backend default50MiB). Immutable branded document returned only by
validator; no arbitrary URL input and no caller bypassSecurityTrustResourceUrl.
Shared creates object URL from validated bytes only, marks that exact resource URL
trusted for iframe, revokes on replacement/null/destroy/error/scope/language/selection
or request change. Mask old document synchronously before deferred cleanup runs.
Native browser PDF embed, no new renderer SDK/package/license. Always offer explicit
Open PDF (new tab noopener/noreferrer) and download links from current lease; never
auto-open popup or download. Check navigator.pdfViewerEnabled; false/unsupported
shows translated fallback. Capability is not a guarantee all devices embed; physical
device/CSP smoke remains PROD-017/RISK-017. Iframe title/referrerpolicy explicit.
No iframe.load claims successful PDF rendering; acceptance verifies transport,
signature/resource/lease/fallback with representative PDF, not internal browser UI.

P-001/C-01 technical /dev/reports authenticated global proof Required; production
business route Excluded until Countries contract. Existing report design adapted:
criteria panel + PDF area, responsive stacked compact, shared search/reset/report
selection/language/errors. Selected first eligible catalog report renders once;
selection/language rerender last applied filters, draft input applies only Search.
This intentional applied/draft correction follows SIG-06 rather than implicit draft
application on selection. FormContainer Save/Search stays enabled for validation;
pending duplicate action busy-blocked. Reset clears both fields and renders once.
No business unsaved entity draft here; filters do not mutate report/template data.

## Rules, edges, consistency and impact

One owner current auth readIdentity+selection+hash+language+applied-filter render key.
Use Signals + RxJS cancellation/controller, no global cache/NgRx. Catalog source
createScopedRead uses current immutable auth identity; contextChanging null masks
all old data. Catalog/selection reload, revoked role/permission, identity/language
change and destroy cancel pending render, discard late validation/CSRF/HTTP results,
clear/revoke old document. Same inputs do not loop; explicit Search permits refresh.
No auto server write/transactions/notifications. Authenticated session guards entry;
service/API still authoritative. Cold typed Observables, no HTTP in visual component.

API services only Reporting; Shared has no business permissions/entity/HTTP/auth.
Current token/font/PrimeNG palette/SQL i18n reused. Four bilingual reports.* captions
for open/fallback/source-changed/invalid-PDF use canonical core generation and embedded
API resource; no relaxed fingerprint. Publish/matching SQL check stays PROD-019.
No API business/schema/native/domain modification;5point domain/EF audit N/A.

Edges:zero/empty/malformed/duplicate catalog, no permission (zero requests), retained
selection/version reload, Unicode200/201 filter errors, draft versus applied, reset,
language/selection/current scope during render/CSRF/signature validation,403/409/
400 field errors/PDF MIME/signature/empty/size/late result/cancel/destroy/revoke,
PDF-disabled fallback/open/download/title/EN-AR/compact-wide/scroll/focus. No automatic
retry after conflict or expired authorization. Whole reporting manager/new tenant
renderer/chart/import/designer/actual Countries CRUD Excluded from this minimum.

## Verification and release limits

Pure parser/permission/filter/PDF unit; HttpTestingController cookies/CSRF/body/
binary/timeout/cancel tests; controller stale identity/key/source errors/lifetime;
actual DOM PDF resource replacement/revocation tests. Full Angular baseline264+
tests/types/architecture/catalog/tokens/fonts/build500kB. Authenticated browser
five palettes/light-dark/EN-AR390/1440 matrix40+focused8 full report/lifecycle/error/
fallback/transport flows; login10/language20/context24 affected regression.
API reporting focused tests for source contract and localization43/catalog7 for
new resource; canonical381recipe/planning/diff gates before Verified. No live host
render/physical device/SQL write/remote CI/production entitlement inferred from mocks.
Real Crystal RPT/backend health proof RISK-017 and existing managed-report RISK-008;
exact full Countries source drift RISK-016 remains required. No new package purchase.

Primary references: https://angular.dev/best-practices/security (resource trust),
https://angular.dev/guide/http/making-requests (Blob response/unsubscribe),
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/pdfViewerEnabled ,
https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static .

Scope authority2026-10-30 DEC-028: requester canceled ActiveReports. It is Excluded, not Deferred, with no runtime package, authoring UI, designer, license purchase or placeholder. Global managed Crystal/PDF minimum continues. Parent ActiveReports parity references are superseded; no removal from retained clients/API implied.

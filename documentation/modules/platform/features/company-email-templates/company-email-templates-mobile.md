# Company email templates — Mobile profile

## 1. Ownership
Platform clean feature: domain/read ports, application use cases, validated data adapter/online repository, composition, query hooks, presentation. Thin RouteGuard app adapter; no transport calls in UI.

## 2. Shared components
Reviewed company localization/native library. AppScreen/AppListScreen/AppDataTable/AppDataCard/AppFilterFormButton/AppSelectField/AppStatusBadge/AppModal/AppStateView reused. Global route header avoids duplicate local title. New generic AppHtmlPreview public sub-API.

## 3. Product difference
Explicit user decision: preview only. Create/edit/reset/offline mutation Excluded even with grants. Web edits; no native write repository/hooks/buttons/placeholders.

## 4. Navigation/matrix
Administration > Email Templates, /email-templates, exact View/company route guard; platform/tenant-administration module mapping. Hidden MainDrawer registration, Administration launcher and breadcrumbs own discovery. Matrix synchronized:90 routes/35 endpoint files/253 members repository-wide.

## 5. List/filter
Shared Table/Cards with one server state, search/language/status filter form/clear/apply/page/size controls. Both views show localized name, effective subject, state badge and preview. No local paging or duplicate view state.

## 6. Detail
Shared full-screen modal shows definition/final subject/preview explanation/token descriptions/sample values. Selected template/language requests sample HTML only. No live token/recipient lookup. Context/filter changes close selection.

## 7. HTML host
AppHtmlPreview uses installed react-native-webview13.16.1; static about:blank HTML, CSP, JS/storage/files/cookies disabled. originWhitelist=['*'] required for inline HTML; independent callback permits about:blank only, preventing external handoff. Web fallback inert sandbox iframe. Shared retry, nested scrolling; no editor/network-resource host.

## 8. Authorization
View required at route/queries/callbacks; global/missing scope cannot fetch. No fallback to settings/languages grants. Backend authoritative. All three constants remain available in role management; native screen consumes View only.

## 9. Offline
Online authoritative reads. Repository checks connectivity and exposes shared retry feedback. No SQLite template/token persistence, outbox or replay. Tested offline denial/restored connectivity.

## 10. Transport
Literal endpoints GET list/POST preview. GET criteria in params; preview language only. Zod validates unknown rows/variables/rendered HTML contracts before domain use. No unchecked rendered response.

## 11. State/cache
User/tenant/company/criteria keys. Selected template/language preview gcTime0. Context workspace remount isolates selection. No save/reset service. Repository tests under data preserve application/domain dependency rules.

## 12. Locale/layout
Paired EN/AR feature/navigation/role labels. Theme RTL; rendered HTML lang/dir/mobile viewport. Scrollable modal metadata and nested HTML scrolling/minimum generic canvas cover long/landscape composition. Real phone/tablet/light/dark/RTL/touch/landscape remain PROD-026 manual acceptance.

## 13. Mock
Editor generator Excluded. Required deterministic screen/adapter fixtures and server sample values implemented. No fabricated saved overrides/company identity/revision exposed.

## 14. Five-point audit/tests
Creation/edit Excluded. Viewing final subject/HTML/variables implemented. Table/Cards/filter/search/paging/status implemented/tested. Mock sample preview/fixtures implemented; no editor generator.44 tests/nine suites pass: adapters/repository/screen/no-mutation/permissions/offline/HTML fencing plus related Administration/localization regressions. Types/architecture/contracts/i18n/Android export pass.

## 15. Acceptance
Mobile Verified for authorized automated scope. Full check retains six inherited LedgerSetupResourceScreen compiler memoization lint errors FOLLOW-006; changed-file lint clean. Expo Doctor flags existing15 patch mismatches FOLLOW-008. Android export success is not physical-device acceptance. PROD-026 and PROD-027 remain manual release gates; inherited failures are not erased.


Message Logs relationship2026-10-21: trusted company resolution extracted into IAccountEmailScopeResolver/AccountEmailScopeResolver and reused by renderer and actual sender. Template language/content/link/fallback contracts and both template UIs are unchanged. Sender now records bounded secret-free observational company attempts through the separate message-logs slice and uses a narrow SMTP transport seam; no replay or global template editor introduced. Current delivery tests are rerun with that slice.

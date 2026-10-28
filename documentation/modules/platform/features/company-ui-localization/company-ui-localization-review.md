# Company UI localization — review

Implementation status: Verified for the requester-authorized automatic scope. Existing global API resource editing remains a separate feature; physical native acceptance remains PROD-026.

## 1. Ownership
Platform owns one current-tenant/current-company localization settings aggregate. Clients own only shipped resource registration and a transient overlay.
## 2. Approved scope
English and Arabic only: a company default, registered-key overrides, reset, and authenticated runtime delivery for Web and Mobile. Equal base/target cultures are allowed for custom-baseline comparison.
## 3. Domain
`CompanyLocalizationSettings` is unique by TenantId/CompanyId, defaults to English, and has one integer revision across the default and overrides.
## 4. Rules
Scope correction 2026-10-17: the explicit catalog policy classifies every entry as system, company, or shared. Company settings/text queries/runtime omit system entries; direct set/reset is forbidden even at the store boundary. Old system overrides remain dormant and audited history is retained. Global geography and Super Admin/tenant-management keys are system-owned; Address Types and tenant user/role/permission management retain their company/shared ownership. A global Super Admin UI editor is Excluded by explicit requester choice.

The trusted actor supplies scope. Source/language/key must be in the generated catalog; a non-empty value of at most 4,000 characters must preserve the exact placeholder multiset. Reset removes the override.
## 5. Client decisions
Web server-paged grid and shared row/default forms are implemented; Web Cards, reports, import/export, tree and chart are Excluded. Mobile table/cards/forms are implemented. No durable offline override cache exists.
## 6. Contracts
`GET settings`, `GET texts`, `GET runtime`, `PUT default`, `PUT text`, and `POST reset` are under `/api/v1/company-localizations`. Scope never comes from the request. Runtime requires a strict per-client catalog fingerprint; a mismatch does not return overrides.
## 7. UI composition
Web composes `PageHeader`, `MyDataGrid`, `MyForm`, shared fields and confirmation UI. The runtime bridge is mounted in `MainShell`; Mobile composes `AppListScreen`, cards and `AppForm`.
## 8. States
The Web editor handles loading, server paging, empty, error/retry, permission/read-only, conflict, dirty form and reset confirmation. Runtime errors restore static resources and English fallback.
## 9. Scope and security
View/Edit/Reset/SetDefault are independent TenantAdministration permissions. Runtime is `[TenantMember]`; Platform correctly excludes `super_admin` because `TenantMemberAuthorizationHandler` rejects that role. Store reads/writes independently validate active company, tenant membership and company access.
## 10. Persistence and side effects
The Platform aggregate uses scoped filters, unique settings/override indexes, a company lock, expected revision and one atomic security-audit write. After a changed commit it dispatches company-audience realtime cache invalidation; no-op dispatches nothing and dispatch failure cannot undo committed data/audit. It does not write filesystem resources or revoke sessions.
## 11. Verification
Phase 06 is Verified for the authorized automatic scope. Native device acceptance remains PROD-026; supplementary full Web Vitest completion is FOLLOW-007.
## 12. Reuse
The implementation reuses Web i18next static/lazy registration, `SessionContext` transition ownership, and the shared RTL listener in `useThemeSettings`.
## 13. Localization/accessibility
All feature-visible text has EN/AR sources. Language precedence is explicit user preference, then company default, then English. Scope/logout reset baselines; registered lazy namespaces reapply eligible overlays. The existing i18n `languageChanged` listener updates document direction and MUI/Emotion RTL.
## 14. Delivery
API, Web and Mobile automatic stages and customer education are complete. The Arabic education pack is `documentation/plans/business/platform-user-permissions-and-company-localization/education/company-ui-localization.md`. PROD-026, FOLLOW-006 and FOLLOW-007 remain centrally tracked.
## 15. Evidence and closure
`required-files.json` lists actual runtime, tests, catalogs, configuration and education evidence. Recipes 00–07 are registered. Closed for the exact requester-authorized automatic scope; native and broad repository gate exceptions remain separately owned.

Corrective verification (2026-10-27): the API test expectation now includes the
existing company-owned Message Logs namespace in the 21-source embedded catalog
and verifies its entry scope. The 19 focused localization tests and all 337
Platform tests pass; the subsequent Release solution gate passes 1,125/1,125 tests
with no skips, using a configured local SQL test instance. This maintenance
changes test evidence only; no domain,
schema, API or Web/Mobile behavior changes. The current automatic/mobile/release
gate status is owned by the central notes, including `FOLLOW-006` and `PROD-026`.



Navigation reconciliation (2026-10-18): the existing company configuration destination is grouped under Settings, independent from Administration operational viewers. Physical route, exact permissions, company scope and save/dirty contracts are unchanged. Mobile Settings parent is reachable for a user holding a configuration-child view grant; the child remains separately guarded. Navigation evidence: documentation/modules/platform/features/error-logs/error-logs-evidence.md.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

System UI extension (2026-10-19): the catalog protocol is now version 3 and includes explicit nullable systemPermissions per registered entry; authority metadata participates in client fingerprints. Company/shared/system eligibility and actor-derived company contracts remain unchanged. The existing editor/controller and runtime registry support a separately authorized global mode/layer, documented by feature system-ui-localization; global responses never simulate company scope. Additional Web criteria use shared MyDataGrid.toolbarFilters, and native Table/Cards/forms retain their shared composition. New global scopes/labels are excluded from company customization. Publish matching API/Web/Mobile catalog artifacts together.

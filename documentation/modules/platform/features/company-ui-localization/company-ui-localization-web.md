# Company UI localization — web

Web implementation status: Verified for the authorized automatic scope.
## 1. Ownership
`platform/company-localizations` owns API contracts, service, React Query hooks and P-001 page composition.
## 2. Scope
The route is `/administration/company-localizations`; it is separate from advanced-tools global API localization.
## 3. Contracts
Service methods call only the company-localizations endpoints, validate Zod responses and compare response scope to the session.
## 4. Querying
Keys include tenant, company and user; write success invalidates that scope. Runtime carries the Web catalog fingerprint.
## 5. UI composition
The page uses shared PageHeader, grid, form fields, `MyForm` and confirmation dialog for default, edit and reset.
## 6. Permissions
View/Edit/Reset/SetDefault are checked from session permissions; no client scope identifiers are submitted.
## 7. States
Server paging, loading, error/retry, conflict and dirty/recoverable editing are handled through existing shared primitives.
## 8. Runtime overlay
`SessionContext` clears resources synchronously before scope transition/logout; `CompanyLocalizationBridge` applies only matching response scope and rejects late resources through request generation checks. A theme/direction remount never clears current-company resources. Runtime errors restore the shipped baseline.
## 9. Resource registration
Scope correction: the generated ownership policy also guards every overlay application, including lazy namespaces. The editor consumes only API-eligible sources, discards rows from a stale excluded source, and safely selects an eligible replacement. System-only global geography/tenant-management sources and mixed-source system navigation keys cannot be customized by a company. Tenant administration and shared labels retain their existing behavior. No new visual shell or Super Admin editor is introduced.

`companyUiResources` captures static baselines, overlays only existing safe leaf keys and reapplies to lazy module namespaces.
## 10. Language/RTL
Explicit i18next cookie preference wins; otherwise company default then English. Existing `useThemeSettings` listens to i18n language changes and updates document direction plus MUI/Emotion RTL; no parallel RTL path was added.
## 11. Super-admin behavior
The runtime query remains disabled for super-admin because API TenantMember authorization rejects super-admin principals.
## 12. Verification
Scope-correction verification: full Web check and both type checks pass; Web runtime/source focused tests pass (5). Three production-build Chromium scenarios pass: system sources/mixed keys excluded, edit/runtime/reset preserved, and Arabic default/RTL preserved at 390px. The initial new test used an incorrect Mobile source label and was corrected against the actual shipped text; no application fix was needed.

Fifteen focused resource/service/bridge/validation/realtime tests passed; full Web check passed with one inherited warning. Isolated `ERP_E2E=1 npm run build` passed (compile 55s, TypeScript 79s) and includes the company-localizations route. Two browser scenarios passed in 47.7s: English text save→runtime→reset, and Arabic default behavior where explicit EN cookie wins while absent preference selects Arabic RTL with no body overflow at 390px. Screenshots were inspected at desktop EN and phone AR. Supplementary full Vitest is FOLLOW-007, not a failed feature check.
## 13. Accessibility/localization
New UI labels exist in EN/AR and shared components retain form errors, focus and confirmation behavior.
## 14. Delivery
Web automatic stage is complete; Phase 06 is Verified for the authorized automatic scope.
## 15. Risks
A fingerprint mismatch safely retains static text until matching API/client deployment is available.



Navigation reconciliation (2026-10-18): the existing company configuration destination is grouped under Settings, independent from Administration operational viewers. Physical route, exact permissions, company scope and save/dirty contracts are unchanged. Mobile Settings parent is reachable for a user holding a configuration-child view grant; the child remains separately guarded. Navigation evidence: documentation/modules/platform/features/error-logs/error-logs-evidence.md.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

System UI extension (2026-10-19): the catalog protocol is now version 3 and includes explicit nullable systemPermissions per registered entry; authority metadata participates in client fingerprints. Company/shared/system eligibility and actor-derived company contracts remain unchanged. The existing editor/controller and runtime registry support a separately authorized global mode/layer, documented by feature system-ui-localization; global responses never simulate company scope. Additional Web criteria use shared MyDataGrid.toolbarFilters, and native Table/Cards/forms retain their shared composition. New global scopes/labels are excluded from company customization. Publish matching API/Web/Mobile catalog artifacts together.

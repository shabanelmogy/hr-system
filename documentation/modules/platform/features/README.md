# Platform feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use documentation/system/ as the
single source for the documentation workflow.

| Feature | Status | Evidence |
| --- | --- | --- |
| User Administration | Implemented | Platform `UsersController`, CQRS user queries/commands, scoped persistence stores, Web users route, Mobile Administration screen, and cross-client response-contract tests |
| Role Administration and Permissions | Implemented | Platform role CQRS/controllers and module-catalog ownership metadata, Web module-first P-006 editor, Mobile responsive module selector plus screen cards, and API/Web/Mobile contract/presentation tests |
| Company Geographic Scope | Implemented | [review](company-geographic-scope/company-geographic-scope-review.md) · [API](company-geographic-scope/company-geographic-scope-api.md) · [web](company-geographic-scope/company-geographic-scope-web.md) · [mobile](company-geographic-scope/company-geographic-scope-mobile.md) |
| Tenant Module Entitlements | Implemented | [review](tenant-module-entitlements/tenant-module-entitlements-review.md) · [API](tenant-module-entitlements/tenant-module-entitlements-api.md) · [web](tenant-module-entitlements/tenant-module-entitlements-web.md) · [mobile](tenant-module-entitlements/tenant-module-entitlements-mobile.md) |
| Authentication and sessions | Implemented (no feature book yet) | `AuthController`, `AccountController`, `GoogleAuthController`; tenant/company selection; web login and mobile sign-in |
| Browser authentication transport | Phase 00 evidence registered; runtime blocked | [review](platform-browser-authentication/platform-browser-authentication-review.md) · [API](platform-browser-authentication/platform-browser-authentication-api.md) · [Web](platform-browser-authentication/platform-browser-authentication-web.md) · [Mobile](platform-browser-authentication/platform-browser-authentication-mobile.md) · [readiness findings](platform-browser-authentication/platform-browser-authentication-evidence.md) |
| Tenants and tenant administrators | Implemented (no feature book yet) | `TenantsController`, `TenantAdminsController`; web `super-admin/(platform)/tenants`; mobile `tenant-management` |
| User invitations | Implemented (no feature book yet) | `UserInvitationsController` |
| Module catalog | Implemented (no feature book yet) | `ModulesController` (`/api/v1/modules`, tenant entitlements) |
| Files, notifications, localization | Implemented (no feature book yet) | `FilesController`, `NotificationsController`, `LocalizationController` |
| Security audits | Implemented (no feature book yet) | `SecurityAuditsController` |
| Audit trail (every create/change/delete/restore) | Implemented | `AuditTrailController`; guide: [AUDIT_TRAIL.md](../../../guides/api/AUDIT_TRAIL.md) |
| API keys, offline operations, background jobs | Implemented (no feature book yet) | `ApiKeysController`, `OfflineOperationsController`, `BackgroundJobsController` (Hangfire dashboard at `/hangfire`) |

Add further entries only when the corresponding runtime and verification evidence
exists, and mark future ideas as Planned or Deferred.

## Feature folders

Every file of a feature lives in its folder. Generated phase packets are
never edited by hand.

| Feature | Files |
| --- | --- |
| `company-geographic-scope` | [Review](company-geographic-scope/company-geographic-scope-review.md) · [API](company-geographic-scope/company-geographic-scope-api.md) · [Web](company-geographic-scope/company-geographic-scope-web.md) · [Mobile](company-geographic-scope/company-geographic-scope-mobile.md) · [Request](company-geographic-scope/company-geographic-scope-request.md) · [Evidence](company-geographic-scope/company-geographic-scope-evidence.md) · packets: [00](company-geographic-scope/generated/PHASE-00-discovery-evidence.md) [01](company-geographic-scope/generated/PHASE-01-domain-api.md) [02](company-geographic-scope/generated/PHASE-02-web-client.md) [03](company-geographic-scope/generated/PHASE-03-mobile-client.md) [04](company-geographic-scope/generated/PHASE-04-domain-actions.md) [05](company-geographic-scope/generated/PHASE-05-integration-runtime.md) [06](company-geographic-scope/generated/PHASE-06-final-reconciliation.md) |
| `tenant-module-entitlements` | [Review](tenant-module-entitlements/tenant-module-entitlements-review.md) · [API](tenant-module-entitlements/tenant-module-entitlements-api.md) · [Web](tenant-module-entitlements/tenant-module-entitlements-web.md) · [Mobile](tenant-module-entitlements/tenant-module-entitlements-mobile.md) · [Request](tenant-module-entitlements/tenant-module-entitlements-request.md) · [Evidence](tenant-module-entitlements/tenant-module-entitlements-evidence.md) · packets: [00](tenant-module-entitlements/generated/PHASE-00-discovery-evidence.md) [01](tenant-module-entitlements/generated/PHASE-01-domain-api.md) [02](tenant-module-entitlements/generated/PHASE-02-web-client.md) [03](tenant-module-entitlements/generated/PHASE-03-mobile-client.md) [04](tenant-module-entitlements/generated/PHASE-04-domain-actions.md) [05](tenant-module-entitlements/generated/PHASE-05-integration-runtime.md) [06](tenant-module-entitlements/generated/PHASE-06-final-reconciliation.md) |

- [Company user permission grants](user-company-permissions/user-company-permissions-review.md): additive company-scoped direct grants and inherited/effective editor; runtime evidence is feature-scoped.
- [Company UI localization](company-ui-localization/company-ui-localization-review.md): Closed for the requester-authorized automatic scope with Phase 06 Verified and Phase 07 education; PROD-026/FOLLOW-006/FOLLOW-007 remain explicit.

- [Platform Settings](platform-settings/platform-settings-review.md): user-approved Administration > Settings workspace, actual shared tabs and independent existing configuration editors.
- [Angular localization foundation](angular-localization-foundation/angular-localization-foundation-review.md): S1-A0 technical client port; strict Angular application, existing SQL translation API/catalog adapters and 14 passing tests. [Implementation/acceptance boundary](angular-localization-foundation/IMPLEMENTATION_REPORT.md); actual consumer acceptance FOLLOW-012.
- [Angular theme foundation](angular-theme-foundation/angular-theme-foundation-review.md): S1-A1 shared token/PrimeNG theme/action, actual local Community key activated; FOLLOW-013 Verified and technical documentation Closed. [Implementation report](angular-theme-foundation/IMPLEMENTATION_REPORT.md).
- [Angular form foundation](angular-form-foundation/angular-form-foundation-review.md): S1-A2 shared text/password CVA, form submission/error/focus and organized Shared folders; 38 unit tests/40 browser cases pass. [Implementation report](angular-form-foundation/IMPLEMENTATION_REPORT.md); Phase 06 Verified, remaining shared acceptance FOLLOW-014.

- [Angular password sign-in](angular-password-sign-in/angular-password-sign-in-review.md): actual default login with current Next design, secure Cookie session and generic shared validation badges. [Implementation/verification](angular-password-sign-in/IMPLEMENTATION_REPORT.md); Phase 06 Verified, documentation/handoff is current.

- [Angular application shell](angular-application-shell/IMPLEMENTATION_REPORT.md): S2-A1 Verified/Closed, shared responsive frame and PrimeNG preferences.
- [Angular module navigation](angular-module-navigation/IMPLEMENTATION_REPORT.md): S2-A2 Verified/Closed, actual permitted catalog/guarded module and area routes.
- [Angular role home](angular-role-home/IMPLEMENTATION_REPORT.md): S2-A3 Verified/Closed, role landing and actual read-only tenant summary; management/context workflows retain their own next steps.

- [Angular company context preflight](angular-company-context/angular-company-context-review.md): sole Active S2-A4 source/proof investigation; existing browser endpoint reused, no runtime implementation claim.

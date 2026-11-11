# Super Admin system session — corrective specification

## Authority and status

Requester decision2026-11-09: Super Admin must not depend on a Tenant. Owner:
Platform API/Security, with Angular and retained Next/Mobile consumer owners.
Canonical tracking: FOLLOW-032. The independent system-session correction is now implemented locally; its current
verification and rollout boundary are recorded in the canonical execution document
`documentation/modules/platform/features/platform-browser-authentication/SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md`. This reopens the shared session
contract and its readiness gates; no sibling feature is activated by this document.

## Verified incident and authorized recovery

- Requester supplied hosted login401 with `Authentication.NoTenantAccess`.
  Current source emits it after successful password checks and no eligible Tenant.
- Hosted health and CSRF returned200 with exact HTTPS4210 allow-origin and
  credentials=true. This incident is distinct from the earlier Origin403 failure.
- The database selected by publish-owned Platform/default connection settings
  contained memberships for user/admin/superadmin in `demo`, each with one company
  link. `demo.IsActive=false`, lifecycle Active(0), subscription Active(2), ending
  2026-12-31; UpdatedOn2026-11-09T09:09:53.0861899. Who disabled it and why were not
  investigated or established.
- Requester explicitly approved reactivation. A guarded transaction changed only
  IsActive and UpdatedOn for exactly one matching `demo` row. UpdatedOn became
  2026-11-09T09:17:06.7375506 UTC. Memberships, passwords, permissions, subscription
  and schema were unchanged.
- Real installed-Chrome calls to the hosted API independently verified all three
  demo roles: login200/authenticated, session200, logout204, session after logout401.
  Remote TLS validation, CORS, CSRF and Cookies were real. Only the local origin
  document was intercepted; no application server started or Angular UI pass claimed.
- All sessions still carried `demo` and a positive company ID. Reactivation restores
  existing access; it does not implement the newly clarified independent system
  session. Sanitized receipt: `.codex-tmp/login-recovery-2026-11-09/verification.json`.

## Historical source constraints before correction

| Owner / symbol | Verified constraint |
| --- | --- |
| PlatformIdentityLoginAdapter.PasswordLoginAsync | Membership is required before the Super Admin check |
| IssueSuperAdminSessionAsync | Chooses a company from an eligible Tenant |
| PlatformIdentitySessionAdapter.IssueSessionAsync / RefreshAsync | Company access required at issuance and rotation |
| PlatformIdentityServiceCollectionExtensions.ValidateSessionAsync | JWT requires TenantId and positive CompanyId |
| SessionValidationService / PlatformContractSource | Session validity depends on live Tenant/company eligibility |
| GetAuthenticationSessionContextQueryHandler | Rejects missing Tenant or selected company |
| JwtAuthenticationTokenService.ValidateExpiredAccessToken | Expired-token parsing requires Tenant/company coordinates |
| Angular AuthSession.message | Every401 becomes invalid-credentials feedback |
| web-next/src/lib/auth/session.ts | Session parser requires nonempty Tenant and positive company |

API owners above are under `api/Modules/Platform/`. Next and native bearer consumers
must be reviewed alongside Angular when changing this shared contract.

## Required behavior and scope

| Case | Required outcome |
| --- | --- |
| Active confirmed Super Admin without memberships/company | Sign in to system administration |
| No Tenants, or all inactive/suspended/cancelled | System login/session remains available to eligible Super Admin |
| Admin/User | Existing membership, company and subscription requirements retained |
| Disabled/archived/locked administrator, changed stamp or revoked session | Denied |
| System role removed after login | Existing system session and refresh denied through live role verification |
| Global administration/shared reference data/global templates | Existing exact permissions and global ownership retained |
| Company-owned ERP data | System login grants no implicit cross-company access; existing scope gates retained |

Contract frozen by the corrective execution workflow: explicit system/company
session scope; absent selected Tenant/company for system sessions; synchronized DTO
nullability, JWT claims, refresh persistence and client parsers. Do not create dummy
Tenant/company records to satisfy old validators. The corrective execution defines explicit empty/0 DTO metadata and absent JWT
coordinates for system scope. It reuses refresh storage without a schema migration.
The incident recovery itself remains separate historical evidence.

Keep signature/audience/lifetime, live identity/security stamp/role, owned refresh
session, absolute expiry, rotation/reuse/races, logout, Cookie size admission,
HTTPS/Origin/CSRF and rate limits. Reuse Angular shared login/form/feedback and
service/state ownership. System headers/localization must not borrow a company.
No impersonation, BFF, new Mobile administration UI or broad authorization bypass.

## Acceptance and gates

Actual SQL/API proof must cover no-membership/all-Tenants-inactive login, system
Session/refresh/reload/logout, role removal/disabled/locked/stamp/revoked/expired
denial, forged scope, ordinary-user scope denial and company-owned endpoint isolation.
Run required API gates, retained Next/native regressions and Angular full gates with
EN/AR system headers/error feedback. Hosted acceptance remains a separate check.
Reconcile the canonical execution contract, applied books, manifests and generated
packets before declaring the correction delivered.

Full documentation baseline already fails on the missing Reporting evidence file
`documentation/modules/reporting/features/managed-crystal-contract-registry/verification/entity-fingerprint/logs/fingerprint-angular-check.log`
(`entity-fingerprint-repair-45`). No evidence was invented or skipped. This inherited
failure is separate from the authentication source finding and incident recovery.

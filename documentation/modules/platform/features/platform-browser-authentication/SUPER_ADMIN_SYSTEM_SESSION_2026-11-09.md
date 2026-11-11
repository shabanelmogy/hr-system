# Independent Super Admin system session — corrective execution

## Authority and current scope

Requester explicitly authorized implementation on 2026-11-09 (FOLLOW-032).
This reopens the existing Platform authentication owner as corrective maintenance.
API, Angular and retained Next/native parsers are Required. New administration
screens, impersonation, cross-company entry and offline system sessions are Excluded.
Historical R1/R2 results remain historical, not proof of this correction.

## Existing-system relationship and frozen contract

| Concern | Decision |
| --- | --- |
| Owner | Existing Platform login/session adapters, claim material and session-validation policy |
| JWT | New `session_scope=system`; no tenant/company/name/plan claims. Company sessions keep existing coordinates and add `session_scope=company`. Legacy company JWT without the discriminator remains valid only with complete positive coordinates. Unknown/mixed scope fails closed. |
| Response | Add `sessionScope`; system responses retain string/int wire compatibility using empty tenant/company metadata, CompanyId=0, Companies=[], empty subscription status and no read-only subscription. These explicitly mean absent scope, never a Tenant/company record. |
| Persistence | Existing owned refresh rows have a non-FK CompanyId integer. Reserve 0 exclusively for system sessions; no dummy records, schema or migration. Signed scope plus persisted session/company pairing and live system role prevent conversion into a company session. |
| Login | Validate password, active lifecycle, confirmed email and lockout first; eligible Super Admin enters system before querying memberships. |
| Validation/refresh | Require live non-deleted system Super Admin role, active lifecycle/account, stamp, owned non-revoked unexpired session. Preserve absolute expiry, rotation/reuse grace, concurrency and logout behavior. |
| Company data | No company claims; existing TenantMember/permission/entitlement/context guards remain. No new switch/impersonation authority. |
| Claims | System claim material includes only live system roles and their permissions; tenant roles/direct company grants are excluded. Role claims cannot overwrite identity/session/scope coordinates. |
| Clients | Explicitly recognize system scope, reject mixed/unknown scope, retain company validation. Angular global shell reuses current role-aware composition and localization. Native offline lease must never manufacture company scope. |
| Compatibility | Existing scoped sessions remain bounded by original expiry; newly authenticated Super Admin uses system scope. Deploy API and client parser updates together. |

## Rules, edges and impact

Membership-free or all-Tenants-inactive system login is allowed; ordinary accounts
retain active Tenant/company requirements. Disabled, archived, unconfirmed,
locked, stamp-changed, role-removed, expired/revoked/mismatched system sessions
are denied. System context returns no company list and no invented subscription.
No credentials, security stamps or connection strings belong in evidence output.

API contracts and clients change; database schema/aggregate storage does not.
Rollback retains schema and revocations; reauthentication may be required when
rolling back a client/API pair. No hosted configuration/data writes are required.

## Readiness and verification

G0 ownership, G1 explicit scopes, G2 existing persistence/concurrency, G3 existing
shell/parser adaptation and G4 named acceptance are resolved for this bounded
correction. Required verification: real migrated SQL login without memberships,
session context, JWT/live validation, refresh/rotation/logout, live-role/account
denials, forged/mixed scope, ordinary-account isolation, company endpoint denial,
Angular/Next/native parser regressions and full API/Angular gates.
Hosted deployment/acceptance remains separate from local implementation.
Full documentation baseline is blocked by FOLLOW-033; scoped generation never
constitutes a complete repository documentation pass.

Implementation is complete locally. API and Angular verification passed; the
complete cross-platform repository gate remains non-green because of the
inherited Mobile and documentation findings below. Hosted acceptance remains
Open under PROD-034; no deployment or hosted system login is claimed.

## Measured local verification and limits

| Gate | Actual final result |
| --- | --- |
| API restore + Release build | Passed, explicit isolated artifacts; final incremental build0 warnings/0errors |
| Complete API solution | 1363 passed,0failed,3existing opt-in browser/HTTPS skips; test projects serialized after an initial SQL create timeout under load |
| Actual system SQL lifecycle | All three SuperAdminSystemSessionTests pass inside Integration195/0fail; migrated disposable local SQL2017, real Identity password, signed JWT, registered Bearer callback and live SQL changes |
| Angular full check | Passed: format, typed lint, config/theme/fonts/catalog/architecture/cycles/types,1023tests/197files and production build |
| Angular browser |24/24: company user and explicit membership-free system Super Admin, EN/AR, light/dark,390/900/1440; built-production fixtures, reload/language/appearance/logout, no horizontal overflow and no system company header |
| Retained Next |24tests/2files passed; type-check passed |
| Native |Typecheck/lint/architecture/contracts/i18n/foundation/release source gates pass; auth remote/schema/offline suites pass. Full test gate602pass/1fail: unchanged missing GlobalDataExports:Export permission, FOLLOW-034. No complete native pass claimed |
| Documentation |Scoped canonical generation/check passes8recipes. Full baseline fails on missing Reporting fingerprint evidence, FOLLOW-033. Planning passes with inherited migration warnings |

The first full Angular run timed out in the unchanged Countries Chart composition
test at5000ms (FOLLOW-031); the final complete rerun passes without assertion or
timeout changes. Earlier MessageLog and SQL-create timing failures do not replace
the final full API result. Initial build retries encountered full C temporary
storage and a still-running test DLL lock; TEMP/TMP moved to ignored G scratch and
final API projects ran sequentially. No unrelated user process was stopped.

The historical shell fixture expected a flat Settings navigation entry. The
current composition groups Settings under Administration; MainShell supplies Home,
and ordinary Home navigation redirects to
the app chooser. The fixture now asserts the correct resulting URL, then reopens
its module before continuing shell checks. This changes test navigation only.
It follows the documented [Playwright URL assertions](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-url)
and [Angular redirect behavior](https://angular.dev/guide/routing/redirecting-routes).
Production build retains existing initial/Sass budget warnings; the native lint
warning belongs to the unchanged Reporting availability test. No gate is suppressed.

The complete API gate also regenerates the existing token-capacity.json with the
actual added session discriminator. The measured size increase is retained as
current evidence; existing Cookie admission limits are unchanged. These synthetic
role-count samples remain measurements, not a maximum-role deployment guarantee.

## Requirement coverage

| Requirement | Evidence |
| --- | --- |
| No memberships or company needed; system context/refresh/replay/logout | `MembershipFreeSuperAdmin_LoginContextRefreshLogout_UsesSystemScopeOnly` |
| Inactive Tenant does not block Super Admin; ordinary identity still denied | `InactiveTenant_DoesNotBlockSystemLogin_ButOrdinaryAccountsRemainDenied` |
| Live role/account/stamp changes deny callback validation and refresh | `SystemSession_LiveRoleAndAccountChanges_RevokeValidationAndRefresh` |
| Scope coordinates fail closed; valid legacy company compatibility retained | `ScopeCoordinates_FailClosedExceptLegacyCompanyAndExplicitSystem` and `SystemScope_RequiresLiveRoleAndUnscopedSession_WithoutTenantEligibility` |
| No company grants/tenant roles/reserved claim injection | `SystemClaims_ExcludeCompanyGrantsTenantRolesAndReservedRoleClaimInjection` |
| Module loading without Tenant only for live system authority | `PlatformQueries_UseExecutionContextAndPreserveMissingTenantUnauthorizedSignal` |
| Company endpoint isolation | Real SQL principal fails `TenantMemberRequirement`; existing full Platform permission-authorization regressions pass |
| Client parsing/global header/reload/logout/offline prohibition | Registered Angular/Next/native parser tests, native `clears a previous offline lease pointer and never caches a system session`, and24case browser receipt |

## Rollout

Publish current ErpSystem.Api and matching Angular/retained client parser changes.
Sign out and sign in again for the new system session; existing company sessions
are not silently converted. No EF model/schema/migration or Tenant/company seed is
needed. Verify the real hosted browser lifecycle/global administration and scoped
data denial using a controlled system actor. PROD-034 owns this pending evidence.
The API build and Angular dist are local artifacts; no deployed version claim is made.

Portable commands/results: `verification/system-session-2026-11-09/verification.json`
and colocated `.txt` logs. No credentials, private connection strings, Cookies or
real access tokens are included. Historical parent feature/provider acceptance
and FOLLOW-033/034 remain separate; this correction does not close the parent plan.

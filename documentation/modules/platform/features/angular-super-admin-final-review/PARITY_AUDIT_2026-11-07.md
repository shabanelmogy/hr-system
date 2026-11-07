# Super Admin parity audit — 2026-11-07

## 1. Scope and completion rule

The active user goal remains all existing Super Admin workflows from web-next,
with States and Districts as the explicitly selected Basic Data scope and
Language/Translation parity. Company Basic Data and HR organization are excluded
by the user's earlier scope decision. The prior turn made progress: it completed
the report verification implementation and system-text editor and produced fresh
full-gate and browser evidence. This audit does not mark the parent goal complete.

Inspect current source and executed evidence independently of historical Closed
labels. A registered route, DTO or successful compilation is insufficient proof
of its complete user journey. Native/hosted checks remain separate from synthetic
browser verification.

## 2. Requirements and current evidence

| Requirement | Reference / Angular owner | Current evidence and next action |
| --- | --- | --- |
| Countries, five views and full lifecycle | Next CountriesPage; Angular geographical-information/countries | Existing implementation and pilot books exist. Its only registered Angular route is dev/countries behind isDevMode; production sidebar omits it. The canonical S3-A8 contract explicitly requires complete report acceptance before promoting the business route. Production availability is incomplete; preserve the gate until its evidence is satisfied. |
| States and Districts, five views and parent selection | Next StatesPage/DistrictsPage; Angular states/districts public APIs | Existing client, source tests and browser receipts recorded in their owning workspace books. Recheck current cross-owner journeys in final regression; no assumed missing CRUD engine. |
| Tenant dashboard and management | Next TenantDashboardPage/TenantManagementPage; Angular tenants/management | Current guarded list and full-page create route, structured editor and source receipts exist. Final audit must retain the user's full-page Add Tenant adjustment and module/capacity contracts. |
| Tenant administrators | Next TenantAdminManagementPage; Angular tenant-admins | Current Cards/create/edit/delete, assignments/default tenant and state tests exist. No restore action is implied by another entity's lifecycle. |
| System audit trail | Next AuditTrailPage; Angular system-audit | Existing cursor queries, filters/columns/detail and shared collection evidence; hosted advanced SQL acceptance remains PROD-030. |
| System Error Logs and settings | Next ErrorLogsPage/ErrorLogSettingsPage; Angular system-error-logs | Existing Grid/Cards, details/copy, separate retention grant/revision, managed Report View. Real provider RPT/PDF remains PROD-031. |
| Language/Translation | Next SystemLocalizationsPage in system mode; Angular language-translation | 20 focused tests and 12 production-asset synthetic browser cases in the settings receipt. Current review found a role-incomplete route guard and absent /super-admin/ui-texts compatibility link; regression tests reproduced both. Correction reuses one feature-owned access policy and redirects to the sole editor. |
| One Settings entry | Next settings and requester override; Angular authenticated routes/MainShell | Source review and failing component test proved Shell appended preferences after composition already supplied Settings. Remove the duplicate sidebar entry; TopBar retains its personal preferences popover. Browser must count the actual rendered Settings buttons. |
| Health, API Docs and actual Hangfire dashboard | Next advanced-tools; Angular advanced-tools | Existing current operational receipt proves bounded client behavior. Real host dashboard/cookies/CSP/actions remain PROD-006/007/019, not proved by synthetic documents. |
| Global Crystal manager and Verify Database | Next Reporting and requested server extension; Angular reporting | Current protected action, immutable new version, auto-publish and compensation have Reporting252/API1331/Crystal current-DLL harness evidence. Real RPT design-database verification remains FOLLOW-024/PROD-028. |
| All-filtered Excel/CSV from shared header across Grid/Cards | User-approved extension; angular-collection-export | Bounded Phase06 Verified/Phase07 Closed: Angular997/195, Reporting252,312parsed files across12EN/AR/theme/size matrices, every cell compared, cancellation/denial and12formatter boundary cases. Hosted rollout remains PROD-032. |
| Own profile, photo and change password | Next platform/auth/profile/ProfilePage.tsx, ProfileTabs.tsx, profile-header/ProfileHeader.tsx and ProtectedChangePasswordPage.tsx | Original missing-owner finding resolved under S4-A7: /profile, /change-password, photo/personal/password components and actual TopBar action are bounded Verified/Closed. Current receipt: angular-account-profile/verification/verification-2026-11-07.json. |

## 3. Account workflow source preflight

The verified existing API owner is Platform AccountController at
api/Modules/Platform/ErpSystem.Modules.Platform.Presentation/Features/Security/Authentication/V1/AccountController.cs.
Its route is AccountInfo/[action], not the Next BFF's /api/account-info path.
GetInfo and GetUserPhoto read the authenticated user's ID; UpdateInfo,
UpdateUserPicture and ChangePassword are PUTs, returning 204 on success. Photo
upload is multipart ProfilePicture or Remove=true. Do not introduce a new API,
role or Users:Edit grant for self-service. Inspect browser Cookie/CSRF admission
and the actual validator/storage rules before selecting Angular request paths.

The source personal-information form edits userName/firstName/lastName, trims them,
requires lengths 3..50, and preserves the read-only email. Password change requires
current/new values, the existing password policy, a different new password and
logout after success. The image journey includes load/fallback, preview, save,
remove and undo; it cannot be replaced with a static avatar. Shared FileField,
IdentityAvatar, ContentTabs, PageHeader, FormContainer, TextField, feedback and
unsaved protection already exist and must be reused. API/user identity fences,
ambiguous writes and stale response cancellation are required. Real account or
password writes are not performed merely to run fixture acceptance.

## 4. Bounded navigation verification

The three regression tests initially failed on the real route tree/MainShell:
missing compatibility route, permission-only guard admitting tenant_admin and
two Settings entries. The corrected focused run passes 23 tests across six files,
including the existing 20 translation tests. Full Angular and production-asset
browser results are now recorded in [the bounded receipt](navigation-verification-2026-11-07.json):
full npm run check passed with 974 tests / 191 files and 32 architecture tests;
all 12 EN/AR Light/Dark390/900/1440 cases passed the existing translation journeys
plus actual /super-admin/ui-texts redirect and a single rendered Settings entry.
No shared PrimeNG widget
behavior changes in this correction; it changes feature policy/composition only.

## 5. Ordered next work

Current checkpoint after this audit: S4-A7 account implementation, final technical
gates and Arabic education are now complete within the bounded client scope.
The portable account receipt records997 Angular/1331 API tests,12 fixture browser
and8 current-source reference cases. The account gap in section2 describes the
original finding and is superseded by this resolution. All-filtered export acceptance is also now bounded Verified/Closed; production Countries and host/provider checks stay open.

1. Navigation correction complete: full Angular/browser gates and bounded receipt
   are registered without overwriting historical verification claims.
2. Finish exact own-account preflight/decomposition and implement personal info,
   photo and password as a coherent self-service workflow; verify source-equivalent
   actions, validation, errors, dirty protection, EN/AR/themes and compact layout.
3. Resume the retained all-filtered export acceptance under its exact contract.
4. Reconcile production Countries acceptance and remaining real-host/provider
   checks, then run the final cross-screen audit against this original scope.

The parent remains Active. No whole-Super-Admin closure, deployment or live write
is asserted by this audit.

## 6. Final current-source reconciliation and hosted reads

The final current Angular gate passes997tests/195files,32architecture tests and
production build. Local all-filtered export and own-account findings are resolved
under their exact owner receipts. API1331/3existing opt-in skips remains the full
unchanged-runtime gate; focused Reporting252was rerun for export acceptance.
No runtime source was changed during the hosted read-only investigation below.

The actual Next Super Admin navigation was compared with Angular composition,
including shell/public-api.ts (which owns /super-admin and /home), tenant and
Administration grouping, separate Language/Translation, standalone Global Report
Manager, and the /super-admin/ui-texts compatibility redirect. User-requested
full-page Add Tenant and shared header/back-arrow/inner-scroll contracts remain
intentional adaptations. Tenant Administrators uses Cards; Audit Trail uses Grid;
no unsupported views were added to satisfy a test fixture.

Fresh hosted-origin and actual Chromium receipts establish exact HTTPS4210
CSRF200/CORS, untrusted-origin403, Cookie login/session200, owned logout204,
Health200, Hangfire200 and an actual embedded Hangfire document. These supersede
the earlier origin-denial observation, without claiming job actions, revocation
or every operational acceptance case. No session secrets, user data, PDF bytes,
report source bytes or business mutations were recorded.

The hosted Countries management list has one active published report, version3.
It is persisted Valid but its validation fingerprint does not match the current
contract descriptor. The consumer catalog is200/empty. Current source explicitly
requires IsValidFor(current fingerprint); Angular already maps the mismatch to
NeedsRevalidation. This is a verified current reason for exclusion, not a missing
Angular view or permission workaround. Deployment-candidate discovery returns503;
its runtime cause requires the owning deployed service evidence. Native Verify
Database/revalidation/publication and actual AR/EN PDFs are not verified here.
The Countries production route gate is preserved.

Portable receipts: hosted-origin-probe-2026-11-07.json, hosted-read-2026-11-07.json,
and ../angular-collection-export/verification/verification-2026-11-07.json.
The read-only harness is web-angular/scripts/verify-super-admin-hosted-read.mjs;
run with Node's --experimental-transform-types because it reuses the actual typed
report parser/body builder. It performs one existing demo sign-in per run and an
owned logout, without automatic retries or business mutations.

Remaining whole-goal acceptance is explicitly open: Countries current-contract
native report/provider proof and production route promotion (PROD-028/FOLLOW-024),
System Error Logs real managed RPT/PDF (PROD-031), hosted advanced-filter SQL
(PROD-030), hosted export rollout (PROD-032), system-text persisted catalog rollout
(FOLLOW-012) and remaining operational/security matrices (PROD-006/007/019).

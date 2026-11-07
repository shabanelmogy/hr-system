# Angular own-account — applied master review

## 1. Ownership

Platform self-service account; plan web-angular-migration/S4-A7. Current source
and target Angular behavior remain separate. Phase00 passed540-recipe/planning
checks; the authorized Angular implementation now exists and final verification
is active. Whole-Super-Admin parity remains a separate open audit.

## 2. Source and relationship

Next platform/auth/profile owns ProfilePage, ProfileTabs, ProfileHeader,
PersonalInfo, ChangePassword and useProfileImage. AccountController and
UserProfileStore are the API owner. Next account-info is only a BFF alias.

## 3. Domain and persistence

Existing own-user profile/photo/password. No table, migration, permission or API
capability added. Native runtime retained.

## 4. Business rules

Personal fields trim3..50; email/roles read-only. Source password inputs cap50
characters; Signal Forms owns that metadata and validation rather than a duplicate
template maxLength binding. Image jpeg/png10MB and server
inspection. Existing password policy, min8 and new!=current.204 confirms save.
Server owns identity/username uniqueness. No profile concurrency revision exists.

## 5. Platform decisions

Angular personal/photo/password and TopBar entry Required. List/Grid/Cards/Tree/
Report/Import/Export/Chart Excluded. Next retained; new native UI Excluded.

## 6. Transport

Actual AccountInfo GET/PUT routes, HTTPS Cookie credentials/Origin/CSRF. DTO/status
validation. No UI HttpClient/fetch or copied Next BFF dependency.

## 7. Composition

P-005 independently saved own-user panels. Reuse PageHeader/BackButton/ContentTabs,
FormContainer/TextField/FileField/IdentityAvatar/feedback/ScrollViewport and
UnsavedChanges. No form engine or feature-local shared widget copy.

## 8. States

Loading/error/retry/no-photo fallback, view/edit/undo, pending/dirty, actor loss,
field rejection and uncertain writes. Never auto-replay photo/password mutation.

## 9. Consistency

Capture actor/payload and cancel/mask stale results. Independent panel drafts.
Auth owner refreshes displayed identity and explicitly logs out after password
success. Do not pretend a client revision provides server concurrency protection.

## 10. Localization and layout

Canonical EN/AR resources/generators, RTL/themes,390/900/1440 and short windows.
Inner content scrolling, first-invalid focus and enabled invalid Save.

## 11. Phase00

Current-source references/contract/rules/edges/impact are registered in the request
and manifest. Generation/check/planning and source review passed before runtime.
Native existing ProfileScreen/profile-endpoints were reviewed and retained.

## 12. Verification

Phase06 decision: **Verified** for the bounded Angular account client on2026-11-07.
The [portable final receipt](verification/verification-2026-11-07.json) records the
full Angular check:997 tests/195 files,32 architecture tests and successful
format/lint/types/catalog/build. Initial581.99KB retains RISK-020. API Release
build passed with0 errors/78 analyzer warnings;1331 tests passed with3 existing
opt-in browser skips. Seven policy tests passed. The implementation has21 account
tests plus shared FileField and
ContentTabs proofs. A real browser reproduced premature native-tab activation;
the shared external-commit option fixes it and keeps rejection/pending on the
original tab. Twelve production-asset fixture cases exercise information invalid
Save/focus/save, photo preview/save/remove/undo/read-error/retry, dirty tab consent,
server PasswordMismatch under the current-password field and post-success logout,
actual TopBar profile navigation and the independent password-only route.
Eight current Next rendered cases cover EN/AR,Light/Dark,390/1440 reference fields,
photo controls and security tab with zero account writes. Full final gate and
source hashes are recorded in the receipt after successful final execution. All12
Language/Translation browser regression cases also pass on the final artifact;
focused Countries8 passes and the final full gate covers that inherited test.
Earlier
navigation974-test evidence is not account UI acceptance.

## 13. Operations

No deployment or real account/password mutation for fixture acceptance. Reference
rendering used one existing demo sign-in across isolated contexts and owned logout;
the initial per-case sign-ins hit429, so the final harness avoids repeated logins.
Hosted catalog409 during reference rendering remains PROD-019 and is not hidden by
source screenshots. FOLLOW-015 owns overall account/workspace parity.

Account labels are registered under the explicit platform-auth/accountProfile
system-text policy, with no additional screen permission for own-account text.
The existing global editor authority is unchanged. Policy generation/check tests
preserve unknown-prefix denial; coordinated catalog rollout remains PROD-019.

## 14. Education

Phase07 Arabic education is complete after the Phase06 Verified decision:
documentation/plans/business/web-angular-migration/education/angular-account-profile.md.
It explains all fields/actions, explicit photo save/remove/undo, password policy
and logout, per-field errors, dirty/pending/uncertain recovery and reusable shared
tab/dropzone rules. The final manifest registers the existing guide.

## 15. Handoff

The bounded account client is Closed after its technical/browser/reference and
documentation gates. Next activate retained all-filtered collection export
acceptance under S4-A4a. Production Countries and real-host/provider checks remain
separate required work; the original whole-Super-Admin goal remains Active.

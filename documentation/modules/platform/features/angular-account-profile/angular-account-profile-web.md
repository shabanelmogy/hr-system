# Angular own-account — Web profile

## 1. Current versus target

Next implements own-account; Angular now has its own typed service/state,
personal/photo/password components, authenticated routes and TopBar entry. Final
bounded acceptance is recorded independently from whole-Super-Admin completion.

## 2. Reference

Next ProfilePage/ProfileTabs/ProfileHeader, PersonalInfo/ChangePassword,
userProfileService/useProfileImage and TopBar SettingsMenu.

## 3. Routes

Required /profile and /change-password, authenticated only. One password editor
for route/tab. Actual TopBar profile navigation.

## 4. Boundaries

platform/account-profile service/state/types/validation/components and curated
public API. Shell/root composition integrate menu/routes. No HTTP in visual UI.

## 5. Personal data

userName/firstName/lastName view/edit/undo/save, trim3..50. Email/roles read-only.
Signal Forms/shared fields, server errors beneath identified fields.

## 6. Photo

Load/fallback/preview/upload/remove/undo/save. jpeg/png10MB; release object URLs on
replacement/cancel/actor loss/destroy. Failed write preserves staged choice.

## 7. Password

Current/new with existing policy, min8, different and no trimming. No credential
storage/logging. Confirmed success clears drafts and calls AuthSession logout.
Unknown outcome locks the command for explicit recovery, not automatic replay.

## 8. Lifetime

Immutable actor capture, cancel/mask stale results, exact204 writes, independent
panel drafts. Shared unsaved guard covers tabs/routes/logout.

## 9. Shared composition

P-005, PageHeader/BackButton/ContentTabs/FormContainer/TextField/FileField,
IdentityAvatar/feedback/ScrollViewport. PrimeNG MCP before any shared extension.

## 10. Presentation

Canonical EN/AR keys/generators, RTL/themes,390/900/1440/short-window acceptance,
keyboard/focus/errors, enabled invalid Save and contained scrolling.

## 11. Implementation

Phase00 registration/check completed before runtime. External resources and
component folders, readable Prettier source, no dependency installation or
speculative abstraction. Existing API contracts remain unchanged.

## 12. Verification

Meaningful schema/status/CSRF/multipart, validation/actor/dirty/uncertain, photo
lifecycle/password logout tests are implemented. Browser fixtures cover12
EN/AR/theme/390/900x640/1440 cases and current Next source rendering covers8 cases.
The shared external tab commit was added after actual browser failure showed
activation before discard consent. Exact success counts/logs remain owned by the
final receipt. Source reference supports the existing account data/actions; shared
Angular page-header/back-arrow and contained scrolling follow the user's later
application-wide policy, so Next's outer-scrolling page is intentionally adapted.

## 13. Phase00

Manifest registers existing reference/shared/API evidence only. New Angular runtime
paths enter after creation. No future evidence or premature Phase06 claim.

## 14. Operations

No real account writes/deployment for fixture testing. FOLLOW-015 remains open.

## 15. Delivery

Phase06 Verified and Arabic education are complete for the bounded client; the
portable receipt records997 Angular tests and current browser/source evidence.
Retained export/production Countries acceptance and the final whole-goal audit
remain open. No hosted deployment or real account mutation is claimed.

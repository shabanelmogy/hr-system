# Angular own-account — retained API profile

## 1. Scope

Existing AccountController authenticated own-user API is reused;
no endpoint/domain/schema change or Users:Edit permission for self-service.
The existing generated UI catalog gains the accountProfile labels and explicit
shared self-service authority metadata; full API gates cover that resource update.

## 2. Routes

GET AccountInfo/GetInfo and GetUserPhoto; PUT UpdateInfo, UpdateUserPicture and
ChangePassword under the same AccountInfo prefix. Next BFF alias is not a direct
Angular endpoint.

## 3. Data

Info id/email/userName/firstName/lastName. Photo nullable base64/contentType.
Info PUT id/userName/firstName/lastName, photo multipart ProfilePicture or
Remove=true, password currentPassword/newPassword. Writes return204.

## 4. Validation

Existing profile validator trims names3..50 and checks username. Upload validator
allows jpg/jpeg/png10MB with name/signature inspection. Identity owns passwords.

## 5. Security

Server derives authenticated ID. Browser middleware validates trusted HTTPS Origin
and CSRF for Cookie mutations. No client ID can authorize another account.

## 6. Persistence

UserProfileStore owns updates/photo replacement. Existing schema retained;
no migration or database write needed for this client preflight.

## 7. Concurrency

No rowVersion/expectedRevision. Client pending/actor fences do not create a server
concurrency guarantee. Unknown outcomes require recovery, never password replay.

## 8. Effects

ProfileUpdated/ProfilePictureUpdated effects already exist. Identity password
adapter returns success; source UI separately performs browser logout.

## 9. Compatibility

Existing Next/Mobile contracts unchanged. Do not redesign API for client convenience.

## 10. Evidence

Controller/profile messages/store/validators, browser middleware and owned
PlatformUserProfileCqrsTests are the current preflight evidence.

## 11. Preflight

Existing API sufficient for source parity. Angular implementation and acceptance
pending; source review is not proof of a live password/photo write.

## 12. Tests

Service request/status/schema/CSRF tests and synthetic UI required. Full API gate
only if API source changes; prior solution pass does not prove account UI parity.

## 13. Runtime

Use current configured HTTPS origin and transport. No new process/dependency.

## 14. Release

Existing Origin/publication configuration remains PROD-019. No host changes.

## 15. Status

API source reviewed; generated account catalog/policy is current and full API
Release1331 tests pass with3 existing opt-in browser skips. Angular account Phase06
is Verified within its final receipt. Real account mutations/deployment are not claimed.

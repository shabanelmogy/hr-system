# Angular own-account implementation request

## 1. Scope

Plan web-angular-migration / S4-A7 / angular-account-profile. Existing user authorization covers all Super Admin parity. Execute the registered version2 contract for own personal information, photo and password, /profile, /change-password and TopBar entry. No new API/domain/schema/native work. Phase00 review/check required before runtime.

## 2. Existing-System Relationship Review

| Area | Existing owner and decision |
| --- | --- |
| Business | Platform AccountController/Profile messages/UserProfileStore/Identity adapter, own-user self-service; reuse |
| Authority | Server User.GetUserId and verified browser session; no Users:Edit grant |
| Transport | AccountInfo/action GET/PUT; Next account-info is BFF alias; HTTPS Cookie Origin/CSRF |
| UI | Existing PageHeader/BackButton/ContentTabs/FormContainer/TextField/FileField/IdentityAvatar/feedback/UnsavedChanges; reuse |
| Angular owner | Add platform/account-profile service/state/types/components and curated APIs; shell/composition menu/routes |
| Database/native | No model, migration or native runtime change |

## 3. Business Rules Matrix

| Rule | Primary owner | Error/outcome | Required test |
| --- | --- | --- | --- |
| Own account only | AccountController/session |401/403 or cancelled old actor | Identity replacement and direct route |
| Trim required names/userName3..50 | Existing validator; Signal Form mirrors | Under-field validation/duplicate username | Invalid Save and API field mapping |
| jpg/jpeg/png10MB | API upload/signature validator | Specific image failure | Type/size/multipart/remove/preview cleanup |
| Current password/new policy/min8/new!=current | Identity owner and source form | Field/security failure | Policy/current-password/same-value |
| Confirmed save only204 | Service/API | Unexpected response uncertain/rejected | Exact status, CSRF and no auto-replay |
| Password success logs out | Existing AuthSession | No stale signed-in screen | Success and failed-logout recovery |
| Independent panel drafts | Feature state/shared unsaved | No silent discard | Tab/route/logout/pending cases |

## 4. Edge Cases & Validation

| Category | Scenarios/decision | Enforcement | Verification |
| --- | --- | --- | --- |
| Empty/malformed | Invalid/null info; no-photo null is valid | Zod/form/service | Parser and fallback |
| Scope/permissions | Actor change/logout401/403 during work | Session/captured actor | Mask and cancel |
| Concurrency | No server revision; duplicate/stale response | Pending/actor fence | No manufactured rowVersion; uncertain lock |
| Photo lifecycle | Invalid file, replace/remove/undo/destroy | File state and URL cleanup | UI and cleanup tests |
| Cross-field | Current equals new password | Signal Form | Specific newPassword error |
| Effects | Identity refresh versus another dirty draft | Auth/state | No draft loss; explicit password logout |
| Numeric/date/collections | N/A: no such source fields | No invented controls | Scope review |
| Offline/retry | Online authority; no password queue | Service/state | Failure/retry without mutation replay |
| Accessibility/responsive | Invalid Save enabled, first field focus | Shared form/theme | EN/AR Light/Dark390/900/1440 and short windows |

## 5. Impact Matrix

| Surface | Classification | Impact |
| --- | --- | --- |
| Domain/API/persistence | Reuse | Existing contracts unchanged; no migration |
| Angular service/state | Add | Typed self-service and independent save lifecycles |
| Shell/routes | Extend | Real profile/password routes and menu action |
| Shared UI | Reuse | Generic photo-display extension only for demonstrated gap after MCP |
| Localization | Reuse/Extend | Existing owning EN/AR resources and generators |
| Next/Mobile | Reuse | Reference/native behavior unchanged |
| Reports/import/export/grid/chart | N/A | Excluded for own-account on both platforms |
| Tests/docs | Add | Current-only manifest, service/state/browser and full Angular gates |

## 6. Verification and delivery

API source review, Angular, retained Mobile, integrated fixture/browser, then documentation/education. No live profile/photo/password writes to satisfy synthetic acceptance. Phase06 Not Verified until actual evidence. Full Angular check/scoped review mandatory; API full gate if its source changes. Detailed fields, wire paths, workflows and acceptance are in the version2 contract.

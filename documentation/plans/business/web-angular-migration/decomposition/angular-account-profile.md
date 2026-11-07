# Authenticated account profile — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A7 — Own account profile and password parity |
| Child Feature ID | angular-account-profile |
| Owner | Platform Web; existing Platform self-service API |
| Execution status | Closed — bounded Phase06 Verified and Arabic education complete |
| Runtime authorization | Authorized exact Angular account slice after current source/rules/impact review, existing-only manifest/four books and540-recipe/planning checks passed; no API/domain/native change |

## 1. Child boundary and outcome

Complete the actual own-account workflow available to Super Admin in web-next:
personal information view/edit/undo/save, profile photo view/preview/upload/remove/
undo/save, and current-password/new-password change followed by session logout.
Provide /profile, /change-password and the TopBar account-menu profile entry.
This is one coherent self-service account workflow with separate saves, not user
administration, role management or another authentication engine. No API schema,
database migration, permission, native capability or dependency upgrade is needed.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.account-profile | Web | /profile and TopBar | View and edit own information/photo | Singleton own-user data and independent saves | P-005 | Shared PageHeader, ContentTabs, FormContainer, TextField, FileField, IdentityAvatar, ScrollViewport and feedback | web-next/src/platform/auth/profile/ProfilePage.tsx; profile-tabs/ProfileTabs.tsx; profile-header/ProfileHeader.tsx | Adapted | Detail Required; Grid/Table/Cards/Tree/Report/Import/Export/Chart Excluded | Loading/error/retry; image fallback; forbidden actor loss; dirty/pending/uncertain; server validation | Online authoritative | Valid local draft only in development; synthetic account in tests | Verified own session; no Users:Edit grant; immutable actor capture | EN/AR Light/Dark 390/900/1440 and short820 boundary; keyboard, labelled controls and first-invalid focus | Angular shared controls and no outer scroll follow project rules; preserve every source action |
| platform.account-password | Web | /change-password and profile security tab | Change own password and sign out | Security singleton command | P-005 | Shared Signal FormContainer/password TextField and feedback; dedicated route composes same owner | web-next/src/platform/auth/profile/change-password/ProtectedChangePasswordPage.tsx; profile-tabs/change-password/ChangePassword.tsx | Adapted | Detail Required; Grid/Table/Cards/Tree/Report/Import/Export/Chart Excluded | Invalid-field errors, server current-password failure, pending, uncertain outcome and actor loss | Online authoritative | Synthetic test inputs; no real password mutation for fixture verification | Verified own session; no admin reset permission | EN/AR themes/compact/wide, keyboard, password autocomplete and no exposed credentials | No duplicated password implementation between route and tab |
| platform.account-profile | Mobile | Existing own-account routes | Retain current native own-account behavior | Existing implementation | N/A | Native runtime unchanged | mobile-react/src/platform/auth | Excluded | New Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native behavior retained | Existing policy | Existing fixtures | Existing authenticated scope | Existing native accessibility | Angular migration only; no domain/API change |
| platform.account-password | Mobile | Existing own-account security route | Retain current native password behavior | Existing implementation | N/A | Native runtime unchanged | mobile-react/src/platform/auth | Excluded | New Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing native behavior retained | Existing policy | Existing fixtures | Existing authenticated scope | Existing native accessibility | Angular migration only; no domain/API change |

## 3. Closest existing reference

The exact Next paths in section2 supply fields, actions, source account service and
photo workflow. Angular TranslationEditorState supplies immutable actor capture,
shared FormContainer integration, field-error mapping, dirty protection and
uncertain-write locking; it does not supply account rules or translation revision.
Angular tenant-admin account fields demonstrate existing password/text shared
controls. Shell owns menu composition/navigation and verified session lifecycle.

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Header and back action | shared/ui/PageHeader and BackButton public APIs | Reuse | Account page card and arrow before title; no page-local header shell |
| Independent panels | shared/ui/ContentTabs public API | Reuse | Personal information and password with explicit dirty/pending guard before switch |
| Input, validation, focus and errors | shared/ui/FormContainer, TextField, FileField | Reuse | Native Signal Forms; Save stays enabled while invalid and shows errors under fields |
| Photo display | shared/ui/IdentityAvatar, existing file input and shared action controls | Reuse; extend generically only for an evidenced display gap | No raw PrimeNG duplicate; consult PrimeNG MCP before any shared change |
| Read and mutation lifecycle | shared/data/createScopedRead, CommandFailure, UnsavedChanges | Reuse | Service owns typed credentialed transport; state owns captured actor, pending, cancellation and drafts |
| TopBar | shell/layout/main-shell and existing popover/actions | Extend composition | Profile navigation closes popover; current logout/preferences remain |

## 5. Screen and workspace contract

Profile has a shared page header, account identity/photo panel and two tabs for
personal information and password. Personal fields are userName, firstName and
lastName; email and roles remain read-only. View mode, Edit, Undo/Cancel and Save
match the reference. The photo panel loads existing image or initials, stages a
new JPEG/PNG preview, supports removal and undo, and saves explicitly. Do not
clear an existing image on failed save. Keep independent draft ownership so a
successful info save cannot silently discard a photo/password draft.

The dedicated /change-password route uses the same security editor with the same
rules and post-success sign-out. No list, report, import, export, chart, role or
user-management placeholder is included.

## 6. Typed transport and server criteria

Inspect and use AccountController's actual AccountInfo/action routes with HTTPS,
Cookie credentials and existing browser-mutation CSRF. Next's /api/account-info
is a BFF alias and must not be copied into Angular direct API transport.

GET GetInfo returns id/email/userName/firstName/lastName. GET GetUserPhoto returns
nullable profilePicture/contentType. Reject malformed values and unsafe image
types; accept the real no-photo response as fallback. PUT UpdateInfo sends
id/userName/firstName/lastName but the server's authenticated user is authoritative.
PUT UpdateUserPicture is multipart ProfilePicture or Remove=true; the existing
API allows jpg/jpeg/png with maximum10MB and performs signature inspection.
PUT ChangePassword sends currentPassword/newPassword. Writes require204; unexpected
success envelopes/statuses must not be presented as confirmed persistence.

Use service/state separation; no HttpClient/fetch in components, no credentials in
storage/URL/logs, no manufactured rowVersion/retry/idempotency guarantee.

## 7. Create, edit, view, and lifecycle contract

Trim and require the three personal fields, each3..50 characters, matching current
source/client and server validators. Server username duplicate and field errors
remain authoritative and map under their corresponding field where identified.
Password requires the existing policy, minimum8 characters and new != current;
do not trim password values. Preserve read-only email and do not write identity
roles/permissions from this form. Image preview URLs must be released on replace,
cancel, actor loss and destroy. Load failure offers retry without inventing a
saved photo. After confirmed password success, clear sensitive drafts and use the
existing AuthSession logout/invalidation path; never retain a stale signed-in UI.

## 8. UX states, permissions, offline, and mock data

Own-user identity is sufficient; do not require Users:View/Edit. Mask and cancel
old reads/writes on identity replacement. Pending blocks duplicate writes and
draft discard. 401/403 clears unauthorized data. Validation rejection retains
draft and field messages. Timeout/network/unknown result locks the affected
submission until explicit reload or authentication recovery; no automatic replay
of a password or photo mutation. Development mock data covers only non-sensitive
valid drafts; never generates a fake saved account/photo result.

## 9. Concurrency, transactions, and consistency

Existing API has no profile expectedRevision. Document that limitation instead of
pretending client revisions protect server writes. Capture immutable actor and
payload for submission, ignore responses from a replaced actor and preserve
independent panel drafts. Register semantic dirty/pending state with shared
UnsavedChanges and route/tab/close guards. Use the auth owner to refresh displayed
identity after profile save without silently discarding another draft. Verify
security/session behavior after password change against the existing API adapter.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse existing core/platform-auth catalog keys; add any missing visible strings
in both owning Next resources and regenerate existing catalogs. External HTML and
SCSS in one folder per component. Shared responsive shell keeps scrolling inside
the intended content panel. Verify EN/AR, Light/Dark,390/900/1440 and short windows,
menu open/closed, field labels, error links, keyboard focus and photo action names.
No disabled invalid Save or browser-native validation dialogs.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing self-service owner located | Actual wire/security reviewed; shared catalog policy generated, full Release1331 tests pass with3 opt-in skips | AccountController and final receipt |
| 2 | Web | Verified | Phase00/current manifest and API source review pass | Full997 tests/195 files and32 architecture tests; all source account actions | Final receipt/source |
| 3 | Mobile | Verified | Angular-only scope | Existing native ProfileScreen/profile-endpoints reviewed; no native runtime/domain change | Owning mobile profile |
| 4 | Integrated live verification | Verified | Client gates pass | Angular12 fixture cases, current Next8 reference cases, Language12 regression, Countries8; no live account writes | verification/verification-2026-11-07.json |
| 5 | Documentation and closure | Closed | Phase06 Verified | Canonical books/manifest/Arabic education/generation/planning | Feature package |

## 12. Verification contract

Test typed request paths/statuses/CSRF/multipart; malformed info and nullable photo;
field validation/errors; password policy/current!=new; invalid Save focus; explicit
photo preview/remove/undo; actor cancellation; no duplicate mutation; dirty tab,
route and logout; confirmed password logout and ambiguous password handling.
Browser acceptance executes real controls for all panels across the responsive/
language/theme matrix using synthetic intercepted API responses. Read-only real
API acceptance must not mutate a real profile/photo/password. Full npm run check,
scoped source review and current documentation checks are mandatory.

## 13. Child exit gate

- [x] Current Next route/menu/profile/photo/password and existing API owners located.
- [x] Whole-goal account gap and existing FOLLOW-015 ownership recorded.
- [x] Phase00 books/current-only manifest/request/review and exact active handoff pass.
- [x] Every required account journey, negative state and responsive matrix verified within the stated fixture/source scope.
- [x] Full quality gates, canonical evidence and Arabic education finalized.

**Next-step rule:** Finish documentation/education closure, then resume the retained
export acceptance under its exact contract. Whole-Super-Admin review remains queued;
this bounded account result does not close hosted/native/provider acceptance.

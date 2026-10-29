# Angular shared text fields and form submission

Verified 2026-10-28 for exact S1-A2. Phase 06 **Verified** for technical shared
text/email/password and submit/error/focus primitives. Documentation/handoff is
Active. Login, business editors, dialog/dirty navigation, select/date/reference
and repeaters are not implemented or accepted by this unit (FOLLOW-014).

## Implemented source and reuse

Requester asked to split shared folders. Existing sources now live under
shared/ui/buttons and shared/ui/forms/fields, with styles/tests beside them.
FormContainer and form-errors live under forms. The root shared/ui/public-api
remains the stable consumer import; narrow internal public APIs compose shared
owners. No empty future folders. Architecture tests reject feature imports of
internal shared files. [Shared component guide](../../../../guides/web/architecture/ANGULAR_SHARED_COMPONENTS.md)
owns the current map and usage contracts.

TextField is a ControlValueAccessor backed by the caller's typed Reactive Form.
The shared control owns value display, null/reset/disabled/readonly, input/clear
and IME composition, password reveal, label/help/error IDs and accessible focus.
Model writeValue does not emit back to the form; clear emits once; reveal does not
change the model. Control events notify Angular for async errors/touch/disable
under zoneless rendering. Rebinding observes the new control and unsubscribes
the old one. A caller replacing the control/tree must notify its own template
through a signal/observable/markForCheck, per Angular's form update contract.

FormContainer composes projected header/content/footer and the existing public
ActionButton. Save stays enabled when invalid. Submit marks touched, displays
specific errors under each bound field and error-summary links, then focuses the
first rendered invalid field. Native validation is disabled with noValidate.
Pending validation waits for its result, read-only/save-pending blocks duplicate
submissions and an immediate guard covers the interval before parent pending
input reaches the child after a valid callback. Caller owns actual save/permissions.

applyServerFieldErrors maps exact dot/bracket paths including nested groups/arrays,
preserves existing errors and returns unknown paths for visible form feedback.
Editing removes that control's server error without discarding other errors.
No API-specific error envelope or conflict retry is hidden in shared presentation.

PrimeNG InputText joins the single token adapter using its individual preset.
Spacing/font/focus/border/error values reuse @app/tokens; clear/reveal actions have
separate 44px targets and logical layout without overlapping the input. Current
catalog and SQL override runtime remain unchanged; all fixture labels/actions
reuse existing namespaced en/ar keys. No new business key/schema/translation DB.

The /dev/forms fixture has two distinct compositions (access-like and nested
profile-like), no HTTP, fake authentication or business data. Production route
replacement excludes the fixture and both preview chunks. It must not be mistaken
for an implemented login or profile screen. Feature validators remain caller-owned;
fixture validators are in the development fixture validation module.

## Verification and practical limits

| Gate | Observed result |
| --- | --- |
| npm --prefix web-angular run check | Passed: current token/font/catalog, architecture, app/spec types, template compilation, behavioral tests and production build |
| Angular tests | 6 files / 38 passed; 8 new form/CVA cases and 30 retained localization/theme/action cases |
| Architecture tests | 6 passed: raw/aliased/dynamic vendor bypass, inline raw form/input and shared internal imports; legitimate public/shared use allowed |
| Production initial bundle | 417.05 kB raw / 108.72 kB estimated transfer; unchanged 500 kB warning budget passes |
| Chromium form matrix | 40 combinations pass: all 5 palettes x light/dark x EN/AR x 390/1440 widths |
| Actual browser interactions | Invalid Save enabled, field/summary errors and focus links, email validator, reveal/value, clear/reset, pending duplicate block, nested server error, async patch and in-place language/RTL change |
| Browser geometry | Input/action minimum targets, clear/reveal non-overlap, error below input, font/semantic page background, no horizontal overflow, no native dialogs or page errors |
| Retained Next shared field/form regressions | 3 files / 6 tests passed: formErrorSummary, formFieldError, EditableTextField |
| API / Mobile | No runtime/schema/token-value change; no EF migration or full suites rerun in this client-only unit |

Unit tests cover model patches without echo, null/reset/disabled/touched, IME final
commit exactly once, clear, password reveal/readonly, server errors and nested
bracket paths, unknown feedback, pending/duplicate saves, async validator/focus and
replacement control events. Test fixtures use normal Angular scheduled rendering,
not fixture.detectChanges to hide missing notifications.

Browser command: npm --prefix web-angular run verify:form-browser, with the local
development server at https://localhost:4210. Isolated Chromium contexts and local
HTTPS certificate bypass are used for this technical fixture; it is not actual
direct-API Cookie/CSRF/security acceptance. The canonical sanitized matrix summary
is verification/browser-summary.json. Local output/screenshots are under
.codex-tmp/angular-forms; screenshots were inspected in English wide/light and
Arabic narrow/dark before handoff. Community key remains ignored/local and unlogged.

## Corrections based on documented behavior

The initial duplicate-submit regression caught two valid events before the parent
pending input rendered. A synchronous guard now spans that interval and releases
after Angular's next render; the regression then passed:
[Angular afterNextRender](https://angular.dev/api/core/afterNextRender).

The initial replacement-control fixture mutated a plain control tree without
notifying its owner template; it did not rebind. It now supplies the replacement
through a signal and verifies later errors render on the new control. Shared
fields subscribe to actual bound control events. This follows
[Angular reactive forms under zoneless](https://angular.dev/guide/zoneless#reactive-forms-in-zoneless-applications),
not forced detection or a mirrored form-value store.

The first browser visibility assertion sampled the type before its scheduled
render. A separate probe confirmed correct rendered behavior; locator assertions
now await the expected state as documented by
[Playwright assertions](https://playwright.dev/docs/test-assertions).
No timeout increase, weakened application assertion or library downgrade.

References also reviewed before runtime:
[Reactive Forms](https://angular.dev/guide/forms/reactive-forms),
[ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor),
[PrimeNG InputText](https://primeng.dev/inputtext).

## Acceptance boundary and handoff

This technical form stage does not introduce a business create/edit/view/list/mock
journey on Web or Mobile; the five-point domain UI audit is N/A on both. No new
entity, permission, database column or API exists to migrate. Existing Next/native
runtime stays current. Primary form actions remain enabled when invalid, errors
and focus are shared, and no native validation popup is used.

FOLLOW-014 owns remaining shared controls, repeaters and dirty/dialog acceptance
at their exact contracts and before corresponding first consumers/full S1 closure.
FOLLOW-012 retains actual signed-in Angular SQL translation save/reload acceptance.
PROD-017/019 retain deployed origins/hosting. Phase 06 Verified here does not close
those notes or the whole S1 stage. Rollback affects this new Angular source,
adapter/checks and folder references only; no data rollback or production operation.
Education N/A for this technical unit; documentation/handoff is Closed; subsequent S2-A0 is the current feature.

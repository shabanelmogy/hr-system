# Angular shared components

Current source: web-angular/src/app/shared/ui. Ownership is generic presentation,
field/control integration and form behavior. Business rules, permissions, API
services and feature validators stay with their feature. Platform localization and
the single theme adapter remain their existing owners.

## Current structure

```text
shared/ui/
  public-api.ts
  buttons/
    public-api.ts
    action-button.ts
    action-button.scss
    action-button.spec.ts
  forms/
    public-api.ts
    form-container.ts
    form-container.scss
    form-container.spec.ts
    form-errors.ts
    fields/
      text-field.ts
      text-field.scss
```

Feature/dev consumers import from shared/ui/public-api. Internal shared owners can
compose the narrower sibling public API. Do not use export-star barrels or expose
tests. Tests/styles stay beside their implementation. Folder names describe
responsibilities, not a generic components/services/utils collection. Future
dialogs/feedback/layout/collections get a folder only when an authorized reusable
implementation exists; do not scaffold empty trees.

## Existing components

| Public API | Generic responsibility | Caller responsibility |
| --- | --- | --- |
| ActionButton | Native button type, busy/disabled/selected state, focus, translated label, full-width | Domain callback, permission, actual operation pending |
| TextField | Text/email/password CVA, label/help/error IDs, clear/reveal, readonly/disabled, IME and zoneless control updates | Typed control, validators and translated error messages, required label marker, autocomplete policy |
| FormContainer | Projected header/content/footer, native noValidate, touched errors and summary links, first invalid rendered focus, pending/read-only submit guard | Typed form, feature title/action/feedback, save pending and actual authorized submit |
| applyServerFieldErrors | Exact nested dot/index field matching, preserve client errors, return unknown paths | API-specific error parsing and unmatched form feedback |
| clearServerFieldError | Remove only server error without discarding other validator errors | No business conflict/forced replay decision |

All data-entry validation belongs to typed Angular Reactive Forms, as decided in
ANGULAR_ARCHITECTURE section 5. React-specific react-hook-form/zodResolver rules
describe the retained Next client. Do not add a second validation engine to the
Angular field. required is an accessible visual marker, not an implicit validator.
For numeric/date/select/structured data, wait for the proper shared adapter;
TextField deliberately accepts text/email/password only.

## Form composition contract

Bind the feature's typed control using [formControl] on erp-text-field. The caller
supplies translated label/help/messages and keeps the primary submit available
while invalid. FormContainer marks touched, shows field messages and error-summary
links and focuses the first rendered invalid field on submit. Inputs carry
aria-required/invalid/describedby; native constraint validation is disabled.

Content is projected into the shared form. Optional formHeader and formActions
slots add genuinely feature-specific content. FormContainer owns the primary
submit ActionButton. It does not own a Dialog, navigate away, call a business API,
inspect permissions or make a discard decision. readOnly blocks submission;
readOnly must also be passed to fields where text must be inspectable without edit.
The caller owns actual pending-save state and supplies it immediately on validSubmit.
The shared form guards the render interval before that input arrives.

Server messages identified by a field path go through applyServerFieldErrors.
Unknown paths return to the caller for visible feedback; do not silently swallow
them or turn a domain conflict into a field validator. A local edit removes that
control's server message only. Successful save/reset remains caller-owned.

Angular Reactive Form mutations do not automatically notify zoneless views.
TextField observes its bound control events and notifies Angular; FormContainer
observes form events for summary/state. A caller replacing a FormControl or dynamic
control tree must notify its own template (signal/observable/markForCheck), so the
new control binding reaches the shared field. This is not a duplicate value store.
Tests verify natural scheduled rendering without fixture.detectChanges.

## Boundaries and remaining acceptance

P-015 public authentication uses the reviewed current Next Login/AuthLayout visual
baseline. Shared form/field/button may gain generic plain/floating/icon/projected
slots needed by the actual consumer; the login page never recreates their lifecycle.

check:architecture uses the TypeScript AST to reject raw PrimeNG imports,
aliases/dynamic/re-export bypasses, inline raw form/input templates and imports of
shared internal files from feature code. It has six focused regression cases.
Inline template tag checks are a bounded policy scan, not a full external-template
architecture proof. Extend it with tests as real feature templates are introduced.

Current two technical fixtures at /dev/forms verify composition without business
data or auth. They are absent from the production route file and bundle. Shared
text/form verification does not complete select/date/reference lookup, structured
repeaters, dialog focus/dirty navigation or the full SIG-07/08 contract. Those are
Required before their actual consumer; FOLLOW-014 centrally owns the remaining
shared-form acceptance schedule.

Canonical feature report: Platform/angular-form-foundation/IMPLEMENTATION_REPORT.md.
Existing SQL-backed UI translations remain FOLLOW-012 for actual signed-in consumer
acceptance. Local PrimeNG activation is Verified under FOLLOW-013. Production
origin/hosting acceptance remains PROD-017/019.

## Shared validation badges and authentication adoption

`ValidationSummary` (`erp-validation-summary`) is a generic exported Shared forms
component, added at the requester's explicit follow-up. `FormContainer` composes it
automatically for invalid submissions; feature forms must not recreate its banner,
count, badges or error links. It accepts readonly `ValidationIssue[]` with `id`,
`label`, `message`, and emits `issueSelected(id)`. It owns presentation only;
`FormContainer` still validates, observes errors, focuses the first invalid field
and resolves selected IDs to the corresponding shared field. Errors remain beneath
their inputs, submit remains enabled when invalid, and no native validation UI is
introduced. Count/badges update when errors clear. Empty issues render no alert.

The badge header and accessible count announcement use existing core translations
included in generated bootstrap resources, so a standalone Shared consumer does not
flash untranslated keys before a route's lazy core resources load. Source strings
continue to come from the canonical web/API catalog; never edit generated JSON.
Labels/messages render as text, with keyboard focus, RTL, wrapping, both theme modes
and semantic shared error tokens. The public export is under `shared/ui/public-api`.

The actual sign-in consumer also adopts generic plain form/full submit/icon slots,
floating field prefix/max-length/counter, action description/quiet/icon options,
preference `OptionSelect` and `ChoiceDialog`. These do not introduce a general
business select CVA, dirty editor or repeatable collection contract. See the
Platform `angular-password-sign-in/IMPLEMENTATION_REPORT.md`; FOLLOW-014 remains
open for those independently scoped controls.

## Authenticated frame and PrimeNG preferences

ApplicationFrame owns responsive 64/280 navigation, 64/56 header and mobile Drawer lifecycle; NavigationList owns accessible generic search/actions. Shell supplies identity, translated labels, entries and slots. Shared PopoverPanel owns opening/dismissal/focus; PalettePicker owns native radio semantics for the five public token palettes. IdentityAvatar, ContextBadge, PageHeader and SurfaceCard are reusable presentation. ActionButton supports generic aria-expanded/controls/hasPopup; TextField supports generic hidden label and placeholder. Feature pages must consume these public exports.

OptionSelect now wraps actual PrimeNG Select with controlled readonly option/value input and registered value emission, accessible label and body overlay. It is a personal-preference control, not a general business select CVA. Scoped currentColor keeps the closed selected value correct on colored headers and neutral surfaces; global tokens own overlay/selected colors. Shared partial theme must retain mask.transitionDuration so leave animation releases overlays and scroll locks. See angular-application-shell/IMPLEMENTATION_REPORT.md for 24 shell and 20 selector cases.

## Shared application discovery

LauncherGrid/LauncherTile provide generic translated navigation cards with native links, icon/accent/contrast input, responsive module/area variants and RTL arrows. Platform supplies only known permitted internal hrefs; Shared never calls the catalog or inspects permissions. FeedbackState supplies generic loading/status, empty, error/forbidden and action presentation; callers own retry/navigation. ApplicationFrame.navigationVisible is generic and defaults true. ModuleWorkspace owns component-scoped catalog state/cancellation, not Shared. See angular-module-navigation/IMPLEMENTATION_REPORT.md for source geometry, actual API and scope tests.

## Scoped reads and dashboard presentation

Shared data/public-api exposes createScopedRead for component-scoped read identity/cancellation/finite state/retry. Callers supply identity/authorization and a finite service observable; services own transport/schema/timeout. Module and tenant-summary states consume it; no global auth/query store is added. Shared MetricCard renders translated display values, ProgressMeter wraps PrimeNG ProgressBar with bounded percentage/label, and StatusBadge wraps PrimeNG Tag. SurfaceCard's optional compact/fill/icon/accent and frame fillContent compose bounded read dashboards without duplicating shells. Strong MUI secondary maps to token brand2, not the quiet secondary surface. Platform-owned namespaces must load explicitly; dashboard uses platform-tenants with core fallback and a finite caption boundary.

## Company context integration

OptionSelect also supports a generic context appearance, icon/description,
busy/disabled and external commit. Its Reactive FormControl keeps the visible
selection at the caller's verified value until that caller commits. The default
preference behavior and 20-case language/color/keyboard matrix remain compatible.
This does not establish a general business select CVA. FeedbackState supports
generic inline feedback in addition to its default page layout.

Protected scoped reads consume AuthSession.readIdentity, which is paused during
context verification; header display alone consumes the last verified user.
Platform owns invalidation-only cross-tab notifications and authoritative API
revalidation, not Shared or feature pages. New editable consumers must first
satisfy FOLLOW-014's shared dirty-context gate. See angular-company-context's
canonical report for 90 unit tests, 14 production context cases and actual
Angular/SQL Cookie transport proof; saved translation editor acceptance remains
FOLLOW-012.

## Module context composition

Shell exposes generic context-component and feedback InjectionTokens. Only the lazy app composition imports business modules. Accounting supplies its public working-year control/state; Shell imports no Accounting DTO/service. Platform runScopedContextUpdate serializes module context work with company/logout, verifies API identity and resumes scoped reads only after CSRF/localization. Module writes obtain CSRF through the narrow public BrowserMutationSecurity facade. Shared OptionSelect supports generic emptyLabel/invalid; its context value remains externally committed. Fiscal-year report records99 unit/7 architecture tests,15 production scenarios and actual UI/SQL/tab/reload/restoration. Future editable consumers still require FOLLOW-014.

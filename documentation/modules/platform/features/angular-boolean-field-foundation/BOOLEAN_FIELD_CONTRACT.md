# Frozen strict boolean field contract

S1-A9 existing migration/Platform Shared only. G0-G3 fixed for exact generic kit;
341 recipes/planning and four books/current-only Phase00 before runtime. Remaining
G4 PROD-002/017/019/RISK-018 release-only; overall plan Draft. No business flag
policy, permissions, API/domain/schema/native/tri-state/group permission editor.

## Existing-system relationship and reuse

Graphify/current sources: Angular only has collection Checkbox and preference radio,
no shared data-entry boolean. Those collection controls remain internal. Native
AppSwitchField has shared error/read-only shell but no focusable field registration;
retain native behavior, do not copy its focus exclusion. Next UsersDataGrid inline
Checkbox and shared formBoolean source are reference semantics, not a form shell.
Accounting LedgerSetup bool CanPost/AllowPosting contract stays server-owned.
Add BooleanField extending existing FormFieldControl<boolean>; use existing field
chrome/FormContainer/error summary and actual PrimeNG Checkbox binary/ToggleSwitch.
Adopt only AuraToggleSwitch in current token adapter; existing Checkbox reused.
No raw/native checkbox/switch shell, local error/focus or duplicated form lifecycle.

## Exact value, validation and lifecycle

true and false are valid data. CVA emits only literal booleans. writeValue displays
true only for value===true; does not turn string'false',1 or objects into true.
Wrong-type/null/undefined owner control value is invalid (strict boolean validator),
even if visual safe fallback is false; no implicit nullable/tri-state contract.
Use owner nonNullable FormControl(false) for reset-to-false; caller nullable reset
must remain invalid until owner supplies explicit true/false. required input only
visual/ARIA; owner Validators.requiredTrue explicitly opts into must-be-true consent.
No shared rule forces ordinary false settings on. No HTTP/save/auto-submit.

Shared field supports kind checkbox(default)|switch, translated label/help/errors,
silent write/reset, actual user dirty/touched, server error priority/clear on edit,
readonly and disabled direct callback guards. Both vendor controls write their
model before CVA callback in installed22.1.4 binary modes; use inner reactive bool
FormControl and silently reconcile rejected values. No NgModel or method patch.
Variant change preserves boolean/control baseline/validators and no value events;
changed DOM gets current value before interaction. Exactly one FormFieldControl
query token and one focused native input; invalid summary links call shared focus.
Attach/remove only own boolean validator; preserve caller validators and existing
server error on initial registration. No browser constraint validation. Submit
enabled, errors directly underneath and first invalid focus through FormContainer.
Readonly remains keyboard-focusable (vendor readonly) and blocks label/Space/direct
callbacks; disabled disables vendor form control. No clear button (false is value).

## Presentation/accessibility and scope

Actual PrimeNG binary Checkbox and ToggleSwitch, current package tokens/light-dark/
five palettes. Shared inline row/field chrome, logical CSS/EN-AR/390-1440; label
click/Space toggles once, Tab/summary focus reach current control. Input role is
checkbox or switch with associated id/label, required/read-only/invalid/description
ARIA from shared state. Help and error links included. Label row at least44px.
No text pretending to be an interactive widget; no tri-state or grouped checkbox.

Web P-001/C-01 neutral dev/booleans form Required. All business CRUD/Grid/Cards/
Chart/Report/Import/Export/files/offline/settings writes and new native UI Excluded.
New core captions use existing bilingual SQL-backed localization and generator;
matching embedded API resource deploy remains PROD-019, strict fingerprint unchanged
in behavior. No SQL writes/domain migrations; five-point business UI/EF N/A.

## Rules, edge cases, impact and verification

Shared owns strict bool/lifetime/widget guards; feature/server owns flag meaning,
requiredTrue and auth/scope/business validation; FormContainer owns enabled submit/
errors/first focus. Test false/true/silent writes/reset/null/wrong types, each actual
vendor click/Space, no double emit/auto-save, readonly/disabled/stale callback,
server edit, checkbox↔switch swap, validator cleanup/replacement and mixed text/bool
DOM order/focus. EN/AR/RTL/five palettes/modes/390-1440 browser40+focused8; current
numeric8/form40/reference8/close8/navigation8/login10/language20 regressions as
affected. Full Angular check, API localization43/catalog7 for resource change;
canonical docs/planning/diff before Phase06 Verified. No live host mutation proof.
Impact Reuse FormFieldControl/FormContainer/summary/chrome/Checkbox/tokens;
Add generic BooleanField and ToggleSwitch adapter/tests/dev proof; Change core
generated resource only. N/A new API/domain/grants/SQL/native/transactions/events.

## Primary references

- https://primeng.dev/checkbox — binary bool and keyboard/label semantics.
- https://primeng.dev/toggleswitch — boolean input/keyboard and accessibility.
- https://angular.dev/api/forms/Validators — requiredTrue is an explicit owner rule.
- https://angular.dev/api/forms/ControlValueAccessor — silent view/model contract.
- Installed22.1.4 Checkbox/ToggleSwitch source: model update ordering/readonly.

Verified source repair during acceptance: native checkbox readonly does not block default activation; PrimeNG ignores model change but hidden DOM checked may flip. Shared BooleanField cancels native click defaults while readonly/disabled, retaining keyboard focus and direct CVA guards. Native .click unit and actual Space/label browser proof required; no vendor patch. Primary sources: https://html.spec.whatwg.org/dev/input.html and https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault .

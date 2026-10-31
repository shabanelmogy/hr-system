# BooleanField technical consumer handoff

Created after Phase06 Verified2026-10-30. Import BooleanField from Shared public API,
bind owner nonNullable FormControl<boolean>, kind checkbox(default) or switch.
False is valid data; required visual input alone does not force true. Use owner
Validators.requiredTrue only for explicit must-be-true policy. No truthy coercion;
wrong-type/null model values are invalid with safe false display, no tri-state.

Same FormFieldControl/FormContainer summary/server errors/first focus/lifecycle.
Programmatic writes/variant swap do not emit/dirty. Actual user toggles once; no
auto-save. Readonly remains focusable and cancels native default activation because
HTML checkbox ignores readonly; disabled disables actual control. Do not duplicate
click handling, error shell or native checkbox. Labels/helper/error ARIA shared.

Owner feature retains domain flag meaning, permissions, persistence, conditional
field visibility and semantic UnsavedChanges registration. Shared field alone does
not implement a business setting or consent API. Caption overrides use existing
SQL localization; preserve strict catalog version/PROD-019 matching publication.
See angular-boolean-field-foundation/IMPLEMENTATION_REPORT.md for actual proof.

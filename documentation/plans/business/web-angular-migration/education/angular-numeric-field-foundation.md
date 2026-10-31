# NumericField technical consumer handoff

Created after Phase06 Verified2026-10-30. Import NumericField from Shared public API,
bind FormControl<string>, empty string clears. Shared keeps exact edit text, zeros
and invalid partial input; no Number coercion/rounding/clamping/automatic formatting.
Use mode integer when fractional parts are forbidden; default decimal assumes no
scale. Set maxIntegerDigits/maxFractionDigits independently, inclusive min/max as
invariant strings; invalid/reversed limits fail closed. Required is owner validator.
Input accepts Arabic/Persian digits/Arabic decimal/Unicode minus and normalizes only
these. Commas/grouping/exponents are invalid and remain visible. Capacity512 chars
prevents expensive unbounded parsing without clipping data. No stepper/currency.

NumericField shares TextField HTML/styles/lifecycle and FormFieldControl token.
Do not duplicate field/error/summary/clear/focus or add native number input. Submit
enabled; FormContainer validates and focuses first error. Constraint changes update
summary silently without dirty/value events or erasing server errors. Programmatic
writes/reset silent; readonly/disabled and IME callbacks follow shared policy.

Feature service owns nullable and actual JSON number/string API contract; preserving
edit text does not guarantee precision after Number/JSON conversion. Reconcile
FOLLOW-003/ERP-07 for every real financial consumer before claiming end-to-end
precision. Server owns financial calculations and rounding. Register semantic
draft identity/revision in UnsavedChanges for real editors. No fixed two-decimal
assumption, automatic posted amount or new API representation from Shared.

Captions use existing SQL overrides; keep strict catalog identity and PROD-019
matching publication gate. See angular-numeric-field-foundation/IMPLEMENTATION_REPORT.md.

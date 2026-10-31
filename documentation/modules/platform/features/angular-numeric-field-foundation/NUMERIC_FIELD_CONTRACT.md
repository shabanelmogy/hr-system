# Frozen shared numeric input contract

S1-A8 exact technical kit, Platform Shared owner. Prior date S1-A7 Verified/Closed.
G0-G3 fixed here;333 current recipes/planning and four applied books/current-only
manifest required before bounded runtime. G4 PROD-002/017/019/RISK-018 release only;
overall plan Draft. No business calculations/schema/API protocol/native rewrite.

## Source findings and existing-system relationship

Graphify and current sources: Next MyTextField/internals passes string edits but
numeric native type/owner coercion differ; native AppTextField numeric strips all
non-digits/clamps and uses Number. Retain both sources unchanged, not copied as
financial truth. Native core/erp/decimal.ts uses decimal strings. Actual Accounting
ExchangeRateRequest.Rate is decimal with SQL precision20/10; existing Next owner
service maps actual wire separately. ERP-07 forbids binary client arithmetic from
becoming financial authority and assumes no universal two-decimal rule.
PrimeNG22.1.4 InputNumber parseValue uses unary plus and writes Number; cannot keep
exact decimal strings. Use adopted PrimeNG InputText via existing Shared TextField.
Extract existing TextField markup to text-field.html, used by both components;
NumericField inherits TextField lifecycle/CVA/clear/IME/field chrome and extends
only normalized edit/parser/validator. Add generic inputmode/direction inputs to
TextField; no duplicate shell, local wrapper, native number UI or raw browser errors.

## Required representation and syntax

String CVA only, empty string clears; null/undefined model writes display empty.
Nonempty complete numeric text is -?digits(.digits)?; ASCII dot, optional minus,
no plus/exponent/Infinity/NaN/grouping/comma/whitespace. Preserve leading/trailing
zeros, negative zero and all decimal digits. Normalize Arabic/Persian digits,
Arabic decimal U+066B to dot and unicode minus U+2212 to ASCII; never remove invalid
characters or infer ambiguous grouping. Partial '-', '.', '1.' remains visible and
invalid, not truncated, clamped or replaced by prior valid value. Clipboard/IME
follows same path on composition end. Do not normalize programmatic writes silently;
owner must supply invariant strings; wrong model types remain invalid in control.

## Limits and exact comparison

Default mode decimal, no assumed scale/precision limits; integer mode disallows
fraction part, even .0. Optional maxIntegerDigits counts meaningful integer digits
(leading zeros ignored, zero counts1); maxFractionDigits counts entered fractional
digits including trailing zeros. Valid options null or integers1..512/0..512;
mode exact integer|decimal; invalid configuration or reversed/invalid bounds denies
validation even empty. Optional inclusive min/max invariant strings. Compare sign,
integer length/lexical magnitude and zero-padded fraction without Number/parseFloat/
BigInt/rounding/dependency. Capacity512 chars per value/bound protects parsing;
long input retained and invalid, no silent clipping. Required is owner Validators.
No fixed scale padding, localization grouping, currency prefix, +/- spinner/step,
expression/percentage math, amount rounding or serialization engine in this kit.
Such consumer needs remain FOLLOW-014/ERP-07 and need exact owner evidence later.

## Field lifecycle, UI and authority

FormFieldControl token registers only once, required/disabled/readonly/ARIA/errors/
summary/first-error focus/clear/reset inherited. Default inputmode decimal, integer
mode numeric keyboard hint; LTR numeric input inside RTL label/layout. Keyboard
arrows/wheel never increment or write. Display invariant dot and explicit translated
help; invalid characters stay visible under translated error. Submit stays enabled.
Attach one validator per owner control, remove only own validator on replacement/
destroy, preserve caller validators/server error priority. Config changes recompute
validation without changing value or marking dirty; no fake valueChanges emission
for validator-only transitions. Actual normalized user edit clears server errors.
No request/save on change/blur, no HTTP or global state; future owner handles wire
number-vs-string per API and registers semantic draft state. Exact field strings
do not prove end-to-end JSON financial precision; FOLLOW-003/ERP-07 consumer gate.

## Platforms, text and excluded capabilities

Web P-001/C-01 neutral dev/numbers form Required, actual Shared TextField HTML and
PrimeNG InputText, five palettes/light-dark/EN-AR/390-1440. All business CRUD/Grid/
Cards/Tree/Chart/Report/Import/Export/files/realtime/offline/native UI Excluded.
API/schema/domain/permission/EF unchanged; only core bilingual captions/catalog
resource extends existing SQL override system. No secrets or live hosted mutation.
Strict catalog version remains; matching deploy owned PROD-019. No production
business route; technical harness excluded by production route replacement.

## Rule/edge/impact and verification matrices

Shared owns syntax/option validation/exact range, generic CVA/locks; FormContainer
owns validation submit/summary/focus; feature/server owns business rules/transport.
Verify unsafe integer 9007199254740993, decimal0.10000000000000001,20/10 boundaries,
negative/zero/leading zeros, integer/fraction limits including0, invalid bounds/
option changes, >512capacity, empty/null/wrong-type write, partial/grouping/paste/
IME, no rounding/clamp/step, silent reset/replacement/readonly/disabled/server errors.
Actual browser40+final8 input/form/focus/RTL/keyboard/clipboard, current forms/date/
reference/close/navigation/login/language regressions. Full Angular check; focused
API localization/catalog tests for generated resource; docs/planning/diff before
Phase06 Verified. Domain five-point UI/EF/live DB N/A technical no domain change.
Impact Reuse TextField/FormFieldControl/FormContainer/PrimeNG InputText/shared styles;
Extend shared template/input keyboard hints; Add numeric pure parser/field/tests/dev
proof; Change core generated resource. N/A HTTP/security/domain/persistence/native.

## Primary documentation

- https://primeng.dev/inputnumber and installed22.1.4 parseValue/Number source.
- https://primeng.dev/inputtext (adopted InputText preserves text input).
- https://angular.dev/api/forms/AbstractControl (validator add/remove and emitEvent).
- https://angular.dev/api/forms/ControlValueAccessor (silent writes).

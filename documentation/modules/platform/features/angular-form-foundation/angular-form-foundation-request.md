# Angular text fields and form submission - implementation request

S1-A2 exact scope under web-angular-migration; Platform technical owner. Existing
Angular has shared action, theme and localization but no field/form. Reuse those
public APIs; reviewed Next MyForm/FormContainer/formErrorSummary/MyTextField are
behavior references. Typed Angular Reactive Forms replace React-specific libraries.
No new business screen/auth/SQL/API/native ownership. Technical fixture only.

## Existing-System Relationship Review

Source of design values remains @app/tokens. Existing schema-3 web translations
and SQL overrides stay compatible. PrimeNG InputText only in shared adapter;
current Community key Verified. No universal form engine or feature-local shell.

## Business Rules Matrix

| Rule | Owner | Outcome | Test |
| --- | --- | --- | --- |
| Control value authority | Reactive Form/CVA | No echo/mirrored state/duplicate input-clear; null/reset/disabled/IME correct | CVA integration |
| Invalid submit | Shared form | Save enabled; touched errors under fields, summary and first invalid focus | Two compositions |
| Server errors | Caller/helper | Exact nested path, clear own server error on edit; unknown paths returned | Error mapping |
| Async/pending/read-only | Form owner/shared shell | Zoneless render; no duplicate/pending/readonly submit | Async race/busy |
| Labels/theme/accessibility | Shared field/localization | ID-linked error/help, native controls, EN/AR RTL | Browser matrix |

## Edge Cases & Validation Matrix

Empty/null/reset/unknown validation code, whitespace per caller validator, nested
path, disabled/readonly/touched/pending, async patch and server errors, clear/reveal
and composition events Required. No native HTML validity dialog. No HTTP, entity,
money/UOM/date, archive/lifecycle/audit/transaction, permissions, report/import/file,
offline queue or navigation action: N/A. Dirty discard/select/date/dialog/repeaters
remain Required at later shared contracts, no placeholder UI.

## Impact Matrix

Add generic Angular shared field/form/helpers/test harness and InputText token
mapping; reuse public action/locale/theme. API/schema/mobile/token values unchanged.
Extend architecture checker for raw form/input bypass; production excludes harness.
Current manifest paths only; G0-G3 frozen in contract; G4 remaining PROD-017/019.
Phase 06 requires actual browser/tests/type/build and narrow retained regressions.

# S1-A8 exact numeric input — implementation and acceptance

Phase06: **Verified**2026-10-30. Plan web-angular-migration/S1-A8 exact bounded
technical foundation. Overall migration remains Draft. Source a2c56412 plus existing
local changes retained.333 recipe/planning Phase00 checks passed before runtime.

## Delivered behavior and reuse

Shared NumericField inherits existing TextField/FormFieldControl. Both use the exact
same extracted text-field.html and existing field-chrome/styles/InputText/buttons,
IME/clear/focus/readonly/disabled/validation summary. TextField gets generic keyboard
and text-direction hints; no duplicated visual shell or feature-local wrapper.
FormFieldControl generic validationChanged notifies errors when constraints change
without inventing value events. Feature owners still own required/business rules,
save/draft baseline and API mapping; FormContainer owns submit/summary/first focus.

Numeric edit values stay strings. Empty clears; complete numeric form is optional
minus, digits and optional dot with fractional digits. Partial '-', '.', '1.' and
invalid grouping/comma/exponent stay visible with errors. Arabic/Persian digits,
Arabic decimal and Unicode minus normalize; zeros/negative zero/all precision are
retained. No Number/parseFloat/truncation/clamp/rounding/step/group formatting.
Mode integer forbids decimal parts; optional meaningful integer-digit and fractional
digit limits are independent, including zero fractional digits. Inclusive string
min/max compare sign/magnitude/padded fractions exactly; invalid/reversed options
fail closed. Capacity512 chars validates rather than silently clipping input.

Control validators attach/remove by exact lifetime, retain caller validators and
server errors during constraint-only validation, notify shared summary without
dirty/value mutation. Real user edits clear server errors. Programmatic writes/reset
stay silent, readonly/disabled block stale callbacks, keyboard arrows/wheel do not
change numbers. Input uses numeric/decimal keyboard hints, LTR within RTL form.
Save stays enabled and invalid submission focuses the first shared field.

## Source findings and intentional differences

Graphify and current Next MyTextField/internals, native AppTextField and core decimal
helper, API Accounting decimal Rate/SQL20,10 inspected. PrimeNG22.1.4 InputNumber
parses/writes binary Number, so it cannot preserve this required text precision;
already-adopted PrimeNG InputText is reused. Next/native numeric stripping/clamping
is not copied as financial truth. No new decimal library or calculation engine.
No API business/DTO/schema/permission/native runtime change. Owner API JSON numeric
precision is a separate FOLLOW-003/ERP-07 consumer gate, not solved by this input.

No business CRUD/list/chart/report/import/export/files/offline/currency/stepper/
financial posting was added. P-001/C-01 dev/numbers technical proof is excluded
from production route composition. Domain UI five-point audit/EF migration N/A.

## Localization and hosted boundary

11 bilingual numericField core captions use existing SQL-backed LocalizationRuntime
and catalog generator; scoped override/reset verified on the actual numeric error.
21root sources/7193 total entries;20 Angular namespaces. Web fingerprint:
b6a04fc735e9523b3765a504b0027820a8fa376d0213edc244e3e7482a2f4760.
Native fingerprint unchanged. Matching embedded API resource deployment/SQL smoke
remains PROD-019; strict version matching retained. No publication or live mutation.

## Verification

| Check | Actual result |
| --- | --- |
| Angular full check |38files/188unit;15added to173baseline |
| Architecture/config |10architecture/4configuration passed |
| Types/resources/fonts/tokens | App/spec types, generated catalog,14fonts and token checks passed |
| Production build |470.79kB initial/124.18kB estimated transfer; existing500kB budget without warning |
| Numeric browser |40palette/mode/language/width,focused8 complete flows |
| Shared TextField regression |40form cases incl password reveal, invalid/async/server/focus/reset |
| Other retained browsers |Reference8/date8/close8/navigation8/login10/language20 passed |
| API localization/resource |43passed/0failed/0skipped on current generated embedded resource |
| Catalog policy |7passed;21sources/7193entries canonical export checked |
| Phase00 |333recipes and planning pass before runtime |

Four final captures and JSON are portable under verification/. Browser form snapshots
retain unsafe integers/deep decimal text exactly, partial/invalid text/IME/Arabic
digits and inclusive max9007199254740993 verified. No date network or host mutation
from the neutral fixtures. Login intercepts configured hosted test origin.

Feature regressions: none at acceptance. Inherited environment: RISK-012 Next
installed/lock mismatch; API CA1512 warning remains outside this change. Vendor
calendar NG0956 locale warnings stay FOLLOW-014, no vendor patch. Full API solution/
Next/native runtime suites not repeated for this resource-only/non-domain change;
focused API/catalog coverage passes. No whole migration/business release claim.
PROD-002/017/019/RISK-018 retain independent release gates. Numeric stepper/currency
group formatting and actual financial API mapping remain exact future consumers
under FOLLOW-014/FOLLOW-003, not placeholders in Shared.

## Reproduction

```powershell
npm --prefix web-angular run check
# Separate local HTTPS4220 preview; do not replace the user's4210 process.
node web-angular/scripts/verify-numeric-browser.mjs
node web-angular/scripts/verify-numeric-browser.mjs --focused
# Existing browser drivers use ANGULAR_PREVIEW_ORIGIN=https://localhost:4220.
# Login also uses ANGULAR_API_ORIGIN=https://shabanhrms.runasp.net for interception.
dotnet test api/Modules/Platform/ErpSystem.Modules.Platform.Tests/ErpSystem.Modules.Platform.Tests.csproj --no-restore --filter 'FullyQualifiedName~CompanyLocalization|FullyQualifiedName~PlatformLocalizationOwnership|FullyQualifiedName~SystemLocalization'
node scripts/export-company-ui-catalog.mjs --check
node --test scripts/company-ui-scope-policy.test.mjs scripts/system-ui-access-policy.test.mjs
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/plans/Check-Planning.ps1
```

## Primary research

- https://primeng.dev/inputnumber and installed22.1.4 parseValue/writeControlValue.
- https://primeng.dev/inputtext — adopted text control and accessibility.
- https://angular.dev/api/forms/AbstractControl — validator lifetime, quiet validation.
- https://angular.dev/api/forms/ControlValueAccessor — view/model write separation.

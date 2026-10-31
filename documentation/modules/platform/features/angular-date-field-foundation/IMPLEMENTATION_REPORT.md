# S1-A7 shared date-only field — implementation and acceptance

Phase06: **Verified**2026-10-29. Bounded technical foundation; overall migration Draft.
Plan web-angular-migration / exact S1-A7. Source baseline a2c56412 plus preserved
local work. No commit/push/publication.325 canonical recipe checks precede runtime.

## Delivered behavior

DateField extends existing TextField/FormFieldControl; reuses InputText/clear/focus,
field-chrome, FormContainer/error-summary and PopoverPanel/ActionButton. Exposed
through Shared public API. Domain-neutral strict date helpers validate Gregorian
YYYY-MM-DD arithmetically with inclusive min/max. Empty is string; owner validators
decide required, API owner maps empty/null and enforces actual business policy.
Partial/impossible/timestamp/extra-whitespace input remains visible and invalid;
Arabic/Persian digits normalize to ASCII. No UTC/Date.parse, automatic rollover or
last-valid fallback. Silent programmatic writes/reset, server-error mapping, enabled
submit/first-error focus, validator cleanup, readonly/disabled/stale callbacks pass.

Actual inline PrimeNG22.1.4 calendar lives in Shared PopoverPanel, with keyboard
navigation/selection, Escape/focus return, same tokens/RTL and 390-1440 bounds.
Reactive FormControl provides synchronous adapter state. DatePicker is deferred
until calendar opens; calendar locale has a lazy theme public entry. This avoids
pulling i18next/locale services into root bootstrap. Existing500kB budget preserved.

Manual input supports0001..9999. Calendar selection deliberately starts0100 because
installed vendor Date constructors remap0..99; an earlier selected year disables
calendar and exposes translated helper, while manual editing remains fully valid.
Local-noon adapter verifies exact roundtrip even for historical skipped dates; it
returns null instead of shifting a day. Timestamp/schedule/UTC modes are excluded.

## Source/reference and ownership

Graphify and actual Next MyDateTimeField date mode/native AppDateTimeField/API
FiscalYearContracts inspected. Next's date-only format retained; invariant input
display is explicit versus Next's localized date mask. Existing native code and
all API business DTOs/schema/permissions retained. No business CRUD/five-point UI
audit/EF migration is applicable to this shared technical field. No native UI or
production business route added; dev/dates is excluded by production route setup.

Core adds39 bilingual dateField captions (months/weekdays/calendar actions/help).
Existing generator creates21 root catalog sources/7182 total entries,20 Angular
namespaces. Current Web fingerprint:
4b15d10c6ef61fba890512f7f52842bcd9b17dab362a7bb6d6bf620a677770d7.
CalendarLocale reads LocalizationRuntime revisions/SQL overrides and clears old
scope captions through the existing authority; unrelated PrimeNG text retained.
No parallel hardcoded locale dictionary. Matching API resource deployment remains
PROD-019; strict matching is unchanged. Fixtures are not live SQL/host mutation proof.

## Verification and measured limits

| Check | Actual result |
| --- | --- |
| Angular unit |36files/173passed;13added over160baseline |
| Architecture/config |10architecture/4configuration passed |
| Types/catalog/tokens/fonts | App/spec types, generated catalog, token check and14fonts passed |
| Production build |470.79kB initial/124.18kB estimated transfer;500kB budget, no budget warning |
| Calendar browser matrix |40 palette/mode/language/width; final8 complete field/form/keyboard flows |
| Timezone browser |10 cases across5 zones×2 languages; final10 repeat passed |
| Retained browser |Reference8/local-close8/navigation8/login10/language20 passed |
| API localization |43passed/0failed/0skipped after rebuilding current embedded resource |
| Root catalog policy |7passed and canonical export check passed,21sources/7182entries |
| Documentation entry |325 recipe check and planning passed before runtime |

Portable JSON/PNG under verification/. No network mutations from date harness.
Login regression uses configured hosted origin with intercepted API; an earlier
localhost-fixture mismatch is not acceptance. Full API solution/Next/native suites
not rerun: only generated resource/core captions changed outside Angular; focused
API/catalog tests cover those paths. No claim of full release/business parity.

Feature regressions: none at acceptance. Inherited environment: RISK-012 Next
installed/lock drift retained; API build CA1512 warning exists outside this change.
Vendor calendar locale refresh emits NG0956 weekday tracking warnings in dev mode;
recorded FOLLOW-014, no vendor patch. Earlier-year calendar limit also FOLLOW-014.
PROD-002/017/019/RISK-018 remain independent release checks. No catalog mismatch
workaround, secret/key/certificate changes, schema writes, deploy or commit.

## Reproduction

```powershell
npm --prefix web-angular run check
# Start a separate HTTPS4220 dev preview with the existing local certificate.
node web-angular/scripts/verify-date-browser.mjs
node web-angular/scripts/verify-date-browser.mjs --focused
# Existing browser drivers use ANGULAR_PREVIEW_ORIGIN=https://localhost:4220.
# Login fixture also sets ANGULAR_API_ORIGIN=https://shabanhrms.runasp.net.
dotnet test api/Modules/Platform/ErpSystem.Modules.Platform.Tests/ErpSystem.Modules.Platform.Tests.csproj --no-restore --filter 'FullyQualifiedName~CompanyLocalization|FullyQualifiedName~PlatformLocalizationOwnership|FullyQualifiedName~SystemLocalization'
node scripts/export-company-ui-catalog.mjs --check
node --test scripts/company-ui-scope-policy.test.mjs scripts/system-ui-access-policy.test.mjs
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/plans/Check-Planning.ps1
```

## Primary documentation checked

- https://primeng.dev/datepicker — inline/date model/calendar keyboard and limits.
- https://primeng.dev/popover — controlled overlay and keyboard/focus lifecycle.
- https://primeng.dev/configuration — runtime translation.
- https://angular.dev/guide/forms — reactive synchronous versus NgModel queued updates.
- https://angular.dev/api/forms/ControlValueAccessor — silent model-to-view writes.
- https://angular.dev/guide/templates/defer — standalone deferred dependencies.
- Installed PrimeNG22.1.4 source parsed/checked before adapter decisions.

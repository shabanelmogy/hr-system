# S1-A9 strict boolean field — implementation and acceptance

Phase06: **Verified**2026-10-30. Existing web-angular-migration plan, bounded Shared
technical kit. Source a2c56412 plus preserved local changes.341 recipe/planning
Phase00 checks passed before runtime. Overall migration remains Draft.

## Delivered behavior and ownership

BooleanField extends existing FormFieldControl<boolean>, with one shared field
registration and existing FormContainer/summary/focus/error/server lifecycle and
field-chrome. Actual PrimeNG22.1.4 binary Checkbox or ToggleSwitch, chosen by kind;
no local look-alike. Existing Checkbox preset reused; AuraToggleSwitch adopted in
current token adapter. Same labels/help/errors and logical RTL layout,46px rows.

Only literal booleans emit; true/false are valid settings. Wrong-type/null/undefined
owner value remains invalid with safe visual false, no truthy coercion of'false'.
Owner nonNullable control resets false. required input is visual/ARIA; explicit
owner Validators.requiredTrue handles consent. Ordinary false is not forced true.
One inner Reactive FormControl; silent write/reset/variant swap, guarded callback,
real dirty/touched, server-error clear only on edit, no auto-save. Variant swap
preserves current value/validators and no value events. Own validator attaches/
detaches by exact lifetime; caller validation stays. Submit stays enabled, shared
mixed text/bool summary focuses correct field, helper/error ARIA follows current
widget. Readonly stays focusable, disabled actually disables underlying control.

## Browser finding and documented repair

Actual browser found native checkbox checked could toggle on Space while vendor
readonly prevented the model update. HTML readonly does not apply to checkboxes.
Source reviewed against HTML Standard and installed vendor code before correction.
BooleanField cancels native click default while readonly/disabled and retains vendor
readonly/direct CVA guards; no vendor patch, pointer/Space remain consistent with
stored value. Added native .click unit regression and browser label/Space/checked+
model assertions. Final matrix passes after the correction.

## References and boundaries

Graphify/Angular collection Checkbox/form system/Next UsersDataGrid+formBoolean/
native AppSwitchField/API LedgerSetup bool sources reviewed. Native source retained;
no API/business flag semantics, grants/schema/EF or native implementation changes.
No nullable/tri-state/group permission editor, business settings workflow, CRUD,
list/chart/report/import/export/files/offline persistence added. P-001 C-01 neutral
dev/booleans proof excluded from production route composition. Domain five-point
UI/EF verification N/A technical field, no domain/data change.

7 bilingual booleanField captions use existing SQL-backed LocalizationRuntime and
canonical generators:21sources/7200entries,20Angular namespaces. Current Web hash:
cba7ae1870dceb9a239811ecd0f9a4be1126577a32dfa1c748c94eb639fa0dc6.
Native hash unchanged. Matching API resource deployment/SQL smoke remains PROD-019;
strict catalog checks preserved. No host publication/live SQL mutation claimed.

## Acceptance evidence

| Check | Actual result |
| --- | --- |
| Angular full check |39files/198unit;10added over188baseline |
| Architecture/configuration |10architecture/4config passed |
| Types/catalog/tokens/fonts | Strict app/spec/catalog/tokens/14font checks passed |
| Production build |472.17kB initial/124.22kB estimated transfer;500kB unchanged, no warning |
| Boolean browser |40palette/mode/language/viewport plus focused8 full flows |
| Fresh retained browser |Numeric8/reference8/close8/navigation8/login10/language20 passed |
| Shared form/date baseline |S1-A8 forms40/date8 retained; their runtime unchanged in S1-A9 |
| API/localization |43passed/0failed/0skipped after current resource rebuild |
| Catalog ownership |7passed;canonical catalog check21sources/7200entries |
| Phase00 entry |341recipes/planning passed before runtime |

Curated JSON/captures portable in verification/. Fixtures make no API mutations;
login uses intercepted hosted origin. Feature regressions none at final acceptance.
Inherited RISK-012 Next install drift and API CA1512 warning remain; vendor date
NG0956 locale tracking remains FOLLOW-014. Full API solution/Next/native suites
not repeated for this resource-only/non-domain change; focused resource tests pass.
PROD-002/017/019/RISK-018 release gates unchanged. No commit/push/deploy or secrets.

## Reproduction and primary research

```powershell
npm --prefix web-angular run check
# Separate HTTPS4220 preview; preserve the user's4210 process.
node web-angular/scripts/verify-boolean-browser.mjs
node web-angular/scripts/verify-boolean-browser.mjs --focused
# Retained drivers use ANGULAR_PREVIEW_ORIGIN=https://localhost:4220.
# Login intercept also sets ANGULAR_API_ORIGIN=https://shabanhrms.runasp.net.
dotnet test api/Modules/Platform/ErpSystem.Modules.Platform.Tests/ErpSystem.Modules.Platform.Tests.csproj --no-restore --filter 'FullyQualifiedName~CompanyLocalization|FullyQualifiedName~PlatformLocalizationOwnership|FullyQualifiedName~SystemLocalization'
node scripts/export-company-ui-catalog.mjs --check
node --test scripts/company-ui-scope-policy.test.mjs scripts/system-ui-access-policy.test.mjs
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/plans/Check-Planning.ps1
```

- https://primeng.dev/checkbox and https://primeng.dev/toggleswitch.
- https://angular.dev/api/forms/Validators — explicit requiredTrue.
- https://html.spec.whatwg.org/dev/input.html — readonly excludes checkboxes.
- https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault — canceled checkbox default.
- Installed PrimeNG22.1.4 binary model/readonly source, actual checked properties verified.

# Shared DateField technical consumer handoff

Created after Phase06 Verified2026-10-29. Import DateField from Shared public API
and bind the owning FormControl<string>. Valid nonempty values use YYYY-MM-DD;
clear is empty string. Provide translated label/help/messages and owner validators
(including Validators.required when required); required input is visual/ARIA only.
Do not manually duplicate syntax validation, summary/focus or calendar shell.
Optional min/max are inclusive invariant day strings; invalid/reversed limits deny
selection and validation. API/service maps nullable contract independently, server
owns business dates/rules. No Date.parse/toISOString for business days.

DateField registers exactly once in FormContainer, keeps invalid text visible,
normalizes Arabic/Persian digits, reports errors underneath and focuses from shared
summary. Readonly/disabled blocks callback/clear/calendar mutations; programmatic
write/reset is silent. Calendar loads on demand, uses PrimeNG in shared PopoverPanel
and restores trigger focus on Escape/select. Input supports0001..9999; calendar
starts0100 and an earlier selected day is entered manually with a translated helper.
No date-time/timezone scheduler or implicit financial date policy added.

CalendarLocale uses the lazy theme/calendar-public-api entry; avoid exporting it
from root theme entry because that eagerly loads localization services. Captions
come from current SQL-backed LocalizationRuntime, not another locale dictionary.
Scope changes clear old overrides; preserve strict catalog matching/PROD-019.
Future business editor must register UnsavedChanges semantic identity/revision and
verify real API create/edit/view; technical dev/dates is not a migrated business UI.

See documentation/modules/platform/features/angular-date-field-foundation/IMPLEMENTATION_REPORT.md.

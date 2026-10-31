# Frozen shared date-only field contract

## Scope and entry

S1-A7, existing migration plan; one generic date-only field and neutral dev proof.
Shared owner; API/native/business/date-time/schedules/money/schema/EF excluded.
G0-G3 fixed here; G4 PROD-002/017/019/RISK-018 remain release-only and cannot change
this contract. Current Phase00 books/manifest/325 recipes/planning must pass before
bounded runtime. No publishing or SQL writes authorized/claimed by fixture proof.

## Existing-system relationship and source findings

Reuse Angular FormFieldControl/TextField lifecycle, field chrome, FormContainer,
validation badges, ActionButton and PopoverPanel; add DateField shared public API.
No compatible Angular date input exists. Extend TextField generically only where
necessary and reuse its input/clear/focus mechanics. Reuse PopoverPanel with generic
disabled and Escape/focus semantics. Add only adopted AuraDatePicker preset.
Next MyDateTimeField date mode emits YYYY-MM-DD (date-time emits UTC separately).
Native AppDateTimeField date mode uses local date components/noon; retain source,
no native rewrite. FiscalYearContracts/commands use DateOnly start/end; no change.
ERP-07 separates business day from UTC instant/local schedule. PrimeNG22.1.4 source
parseDate expands years below100 and parses text permissively; use strict shared
string parsing/manual InputText and actual inline PrimeNG DatePicker for selection.
No native date UI/browser alert. Composition is deliberately stricter than source
parsers and avoids unwanted normalization or returning a prior valid date.

## Public field and wire representation

String CVA, empty string for clear/reset (null/undefined write display empty).
Nonempty valid value is exact ASCII YYYY-MM-DD, year0001..9999, Gregorian leap/day
check without Date.parse/UTC conversion. Manual Arabic/Persian digits normalize to
ASCII; partial/malformed/impossible input stays visible and invalid, never cleared
or treated as previous valid model. Reject whitespace, timestamps and extra text.
Existing owner contract adapters decide null vs empty at API boundary. Do not put
HTTP, fiscal-year/permission/company rules or date-dependent business validation
in Shared. Optional inclusive min/max exact date-only strings and default0001/9999
are UI constraints; owner/server still enforce business rules. Invalid/reversed
bounds fail closed. Disabled skips form validation, readonly blocks all user writes
and calendar open/clear (including stale callbacks), programmatic writes remain
silent and permitted. Date syntax/range validator automatically attaches to the
owning Angular control; required remains owner Validators.required. Remove only
the field validator on control replacement/destruction, preserve other validators.

## Calendar, lifetime and accessibility

Text display intentionally YYYY-MM-DD in both languages, explicit translated helper.
Actual inline PrimeNG single-date calendar inside shared PopoverPanel, standard
keyboard/month/year selection, bounded viewport, Escape closes and restores focus.
Use local year/month/day constructors at noon, verify roundtrip before calendar
conversion; years0001..0099 use setFullYear. No UTC/ISO serialization. Historical
locally nonexistent days remain valid string/manual input; calendar adapter returns
null rather than shift. Guard selection while disabled/readonly, bounds rechecked.
Close open overlay on programmatic replacement, lock or destruction; do not write
on open, cancel, language change, scope read, or overlay dismissal. Parent form is
single validation owner via FormFieldControl; no duplicate inner field/error query.
Save enabled until submit; underneath errors, summary badges and focus reused.

## Localization/theme scope

SQL-backed core dateField.* captions including month/day names and accessible
calendar actions; both en/ar canonical resources, generated API catalog and Angular
bootstrap synchronized. PrimeNG translation adapter reads LocalizationRuntime
signals/overrides and updates only adopted date calendar translation keys (no
overwrite of select captions). No hardcoded second locale dictionary. Digits are
wire-neutral, labels EN/AR/RTL. Shared tokens five palettes/light/dark; import only
AuraDatePicker into existing adapter. Matching hosted resource deployment remains
PROD-019; strict catalog checks never weakened; no host publication claim.

## Required/Excluded matrices

Web technical input/calendar/form proof Required (P-001/C-01), Text/Date/validation/
enabled submit/clear/reset/readonly/disabled/server errors/min/max/invalid bounds.
Business CRUD/Grid/Cards/Tree/Chart/Report/Import/Export/files/realtime/offline and
structured editor Excluded. All new native UI Excluded; native source retained.
Permissions N/A no new action, tenant/company/grants/schema unchanged. No business
five-point UI or database migration needed. Technical fixtures contain no secrets.

## Rules, edges, impact and verification

Shared is primary owner for syntax/range, CVA/lock, clear/touched/focus and locale
mechanics; FormContainer owns submit/first error, API owns business truth. Test
empty/required, leap1900/2000, years0001/0099/9999, invalid object/programmatic
values, partial/manual Arabic digits, timestamps, min/max edges/reversed-invalid
bounds, disabled/readonly callback, silent writes/reset, server error clear, control
replacement cleanup, selected calendar/keyboard/Escape and no automatic save.
Timezone browser contexts UTC/Cairo/LosAngeles/Kiritimati/Adak, DST boundaries and
same-day roundtrip. EN/AR390/1440, five palettes/light-dark40 plus focused8 and
timezone10, update language while open, scope override/reset and catalog regressions.
Full Angular check; API catalog/localization focused tests because resource changes;
catalog check, canonical docs/planning and diff before Phase06 Verified. No change
to API business, native behavior, auth or source Next UI beyond core resources.
Impact: Reuse forms/dialogs/buttons/tokens; Extend adopted preset/popover; Add
date parser/field/locale adapter/tests/dev route; Change core generated catalog;
N/A DB/cache/network/permission/lifecycle/transactions/import/files/notifications.

## Primary references

- https://primeng.dev/datepicker (inline, model, keyboard, limits)
- https://primeng.dev/configuration (runtime translation)
- https://angular.dev/api/forms/ControlValueAccessor
- https://angular.dev/guide/forms/form-validation
- Installed primeng-datepicker.mjs22.1.4 parseDate/onUserInput/updateModel.

Source reconciliation before acceptance: installed PrimeNG calendar date constructors also remap years0..99. Strict manual input supports0001..9999; calendar selection is deliberately limited to0100..9999 and disabled for a selected earlier year (translated helper). This avoids silent century changes. Calendar uses Reactive Forms synchronous binding, not NgModel, and a lazy theme adapter entry keeps localization off initial load. No runtime vendor patch.

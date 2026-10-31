# Date-only field — Angular Web profile

## 1. Ownership

Shared DateField/InputText/strict date helpers; feature owns required/domain constraints and wire nullability, API owns business acceptance.

## 2. Current source

Graphify/Next/native/API DateOnly and Angular shared-field reuse verified. PrimeNG22.1.4 Date constructors remap0..99; manual input strict0001..9999, calendar guarded0100..9999.

## 3. Verified outcome

Phase06 Verified for exact DATE_ONLY_FIELD_CONTRACT; report/portable evidence own current actual results. No business/schema/native/timestamp mode.

## 4. Reuse

Extends existing TextField/FormFieldControl; reuses field-chrome/FormContainer/validation summary/PopoverPanel/ActionButton. Popover generically supports disabled. DatePicker deferred, lazy theme CalendarLocale entry preserves root budget.

## 5. Platform views

Web technical P-001/C-01 form/input/calendar Required. Business CRUD/Grid/Cards/Tree/Chart/Report/Import/Export/files/offline Excluded. New native UI Excluded, source retained.

## 6. Transport

String YYYY-MM-DD with empty string; Arabic/Persian digits normalize, partial/impossible text retained invalid. No UTC conversion/Date.parse. Owner maps nullable API boundary, DateOnly DTOs unchanged.

## 7. Verified rules

Shared syntax/inclusive range/invalid-bounds validation, CVA/readonly/disabled/stale calendar guards and cleanup. FormContainer owns enabled submit/first-error summary. No new business permission/action or persistence.

## 8. Verified edges

173 unit covers leap/low-year/max-year/invalid/partial/timestamp/range/dynamic bounds/reset/readonly/disabled/server errors/validator lifecycle; actual calendar keyboard/form/locale/timezone/browser regressions pass.

## 9. Consistency

Programmatic writes silent; open/cancel/dismiss/language do not change model/save. Reactive calendar FormControl synchronously maps current selection. No persistence, replay, network mutation or transaction.

## 10. API and persistence

API business/schema/EF unchanged; generated embedded core resource adds39 bilingual captions, current Web fingerprint4b15d10c6ef61fba890512f7f52842bcd9b17dab362a7bb6d6bf620a677770d7. SQL overrides consumed through existing runtime; matching deployment remains PROD-019.

## 11. Verification

Phase06 Verified:36files/173unit,10architecture/4config/types/tokens/fonts/catalog;470.79kB/124.18kB build. Date40+final8/timezone10 twice; reference8/close8/navigation8/login10/language20; API localization43/catalog7 pass.

## 12. Operations

PROD-002/017/019/RISK-018 release gates retained, RISK-012 inherited Next drift. FOLLOW-014 early-year calendar limitation/vendor NG0956 tracking warning. No publish or secrets.

## 13. UI pattern

P-001/C-01 technical Shared composition. EN/AR390/1440/five palettes/light-dark, bounded popup/keyboard/Escape/focus; invariant YYYY-MM-DD input deliberately differs from localized Next display. Final captures verified.

## 14. Readiness

Phase06 Verified after exact325 Phase00 entry and actual runtime acceptance. Overall migration Draft; business pilot and all unported screens remain later exact contracts.

## 15. Handoff

Technical consumer guide and portable report follow Verified. New date-only consumers use Shared DateField and their own domain validators/API adapters; actual editors register draft state. No timestamp/calendar scheduling completion claim.

Canonical closure2026-10-29:325 recipe/planning checks passed; Phase06 Verified/Closed. S1-A8 numeric preparation follows; no remaining implementation gate inside this frozen kit.

S1-A8 shared-source evolution2026-10-30: TextField HTML moved unchanged to fields/text-field.html and reused by NumericField; generic inputMode/textDirection hints added. FormFieldControl can notify validation summaries on constraint-only changes without emitting value events. Existing form/date behavior retained; current acceptance belongs to angular-numeric-field-foundation/IMPLEMENTATION_REPORT.md after verification. No API/domain/native change to this foundation.

S1-A10 shared-source evolution2026-10-30: TextField now supports an optional plain-text PrimeNG textarea branch in the same template/lifecycle, rows1..20/default3 and locked clear guard. NumericField explicitly remains single input; DateField retains its own date-only input template. Existing defaults retained; current206unit and multiline/form/numeric/date/retained browser acceptance belongs to angular-multiline-field-foundation/IMPLEMENTATION_REPORT.md. No API/schema/native/resource change.

# Angular form foundation - review applied profile

## 1. Ownership
Platform technical client slice S1-A2; user authorized continuing Angular. Existing API/native domain and SQL translation ownership unchanged.

## 2. Scope and reference
Reviewed Next MyForm/FormContainer/formErrorSummary/MyTextField and existing Angular action/theme/localization. No Angular field/form exists to extend. New generic primitives justified; no business screen/auth/dialog.

## 3. Domain and persistence
No entity/schema/DB/API change, migration N/A. Native Signal Forms model/FieldTree is sole feature value/validation authority (D07/D39); current SQL UI translation consumers remain intact.

## 4. Rules
Save enabled when invalid; submission marks touched, renders specific errors/links/focus. CVA never echoes model writes, clear emits once, IME buffers; readonly/disabled/busy and async model changes explicit.

## 5. Platform decisions
Web technical field/form harness Required. Web/Mobile business Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded here. Native unchanged. Dirty/dialog/select/date/repeater remain later Required contracts.

## 6. Contracts
Typed native Signal Forms caller supplies schemas/messages/submission; generic helpers map server exact nested paths and return unknown paths. No HttpClient/new DTO/mutation/auth. No React form-library assumptions in Angular.

## 7. Composition
Shared text/email/password native FormValueControl (retained CVA compatibility) with PrimeNG InputText, shared form container/header/content/footer and public ActionButton. Existing public localization/theme, no new design values/catalog fork or mega-form engine.

## 8. States
NoValidate, specific beneath-input errors and summary links, focus by registered IDs. Input null/reset/disabled/readonly, clear/password reveal, async patch/pending/errors under zoneless. No navigation/discard workflow in this unit.

## 9. Authority
Anonymous technical harness, no domain callback/permission/API action. Server rules remain authoritative. No native dialogs, raw HTML validation UI, credential storage or automatic submit replay.

## 10. Impact and reuse
Add Angular shared primitives/helper/tests/dev-only fixture and InputText preset mapping; extend AST controls/form bypass policy. Production route replacement excludes fixture; API/native and token values unchanged.

## 11. Verification
Phase 06 Verified for exact S1-A2: 6 Angular files / 38 tests, 6 architecture cases, strict types/templates, token/font/catalog and 417.05 kB production build pass. Actual Chromium form matrix 40 cases and Next 3 files / 6 tests pass. API/native source unchanged, no full suites rerun. IMPLEMENTATION_REPORT.md and verification/browser-summary.json own proof and limits.

## 12. Operations
Local Community key reused without logging. Rollback new client source/adapter/checks only, no data rollback. Hosted origins/release remain PROD-017/019.

## 13. Localization and accessibility
Existing en/ar namespaces, plaintext label/help/error and translated clear/reveal/summary. Logical CSS, font/token geometry, native keyboard/label/aria/focus. Existing i18next SQL override runtime untouched.

## 14. Delivery
Phase 00 current books/manifest/planning and 221 recipes passed before bounded runtime. API/Web/Mobile/integrated verification Verified for exact technical scope. Documentation/handoff sole Active stage; FOLLOW-014 remaining controls/dialog/dirty acceptance, PROD-017/019 hosted release.

## 15. Evidence and closure
Current source paths only, updated buttons/forms/fields and stable public API. Runtime/config/test/summary and central shared guide registered; regenerate phase packets from numbered books. Phase 06 Verified, education N/A; no business editor/login or full S1 completion claim.

S1-A8 shared-source evolution2026-10-30: TextField HTML moved unchanged to fields/text-field.html and reused by NumericField; generic inputMode/textDirection hints added. FormFieldControl can notify validation summaries on constraint-only changes without emitting value events. Existing form/date behavior retained; current acceptance belongs to angular-numeric-field-foundation/IMPLEMENTATION_REPORT.md after verification. No API/domain/native change to this foundation.

S1-A10 shared-source evolution2026-10-30: TextField now supports an optional plain-text PrimeNG textarea branch in the same template/lifecycle, rows1..20/default3 and locked clear guard. NumericField explicitly remains single input; DateField retains its own date-only input template. Existing defaults retained; current206unit and multiline/form/numeric/date/retained browser acceptance belongs to angular-multiline-field-foundation/IMPLEMENTATION_REPORT.md. No API/schema/native/resource change.


Maintenance 2026-11-04 — D07/D39: Native Signal Forms models/schemas/submission now compose shared FormContainer and FormValueControl fields. Native focus reaches nested components; summary includes root errors; no Form Engine. New helpers map API errors with late-draft/array-order protection and preserve exact numeric/date-only values. Legacy CVA fixtures remain explicit compatibility coverage. API/Next/Mobile runtime and persistence are unchanged; migrations and cross-platform domain UI audit are N/A for this client-only maintenance. Current verification and limits: `documentation/modules/platform/features/angular-form-foundation/SIGNAL_FORMS_IMPLEMENTATION_REPORT.md`. Historical verification in section 11 refers to its dated increment.

## Shared focus perimeter maintenance — 2026-11-09

The requester-reported clipped Tenant Contact name border is corrected in the
shared field chrome, using the single `fields/_field-focus.scss` rule. Text,
multiline/floating, Numeric/Date, Reference and Boolean compound wrappers keep
visible focus inside their border boxes and preserve destructive error color.
No field-state, domain, schema, API, Next or Mobile runtime contract changed;
migration is N/A. Angular-only presentation is Required. The canonical correction,
regression commands and dated proof are in
[FIELD_FOCUS_CORRECTION_2026-11-09.md](FIELD_FOCUS_CORRECTION_2026-11-09.md).

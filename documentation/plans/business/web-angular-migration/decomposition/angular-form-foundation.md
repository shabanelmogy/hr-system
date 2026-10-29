# Angular text fields and submission — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A2 — Shared text fields and form submission |
| Child Feature ID | angular-form-foundation |
| Child feature name | Angular shared text fields and form submission |
| Owner | Platform / Web Architecture |
| Depends on | angular-theme-foundation Verified and documentation Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S1-A2: Phase 00 current books/manifest, planning and 221 recipes passed; G0-G3 fixed below, remaining G4 release-only |

## 1. Child boundary and outcome

One technical reusable form unit: typed Reactive Form model owned by the caller,
shared text/email/password ControlValueAccessor, one generic form container with
header/content/footer, validation messages, error links and first-error focus.
Development-only harness in two representative compositions. No customer login,
entity editor, save API, dialog/discard workflow, reference/select/date/repeater,
table or native change. Later form capabilities remain Required under S1/SIG-07.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.angular-form.compatibility | Web | development-only /dev/forms | Verify field/form primitives | Isolated technical form fixtures | N/A | Stacked fields; no business form/dialog | web-next/src/shared/components/forms/dialog/MyForm.tsx | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Invalid/server errors/pending/read-only/reset Required; business conflict/discard absent | No HTTP/queue | Typed fixture values, no fake auth | Anonymous technical harness; no business actions/permissions | EN/AR, compact/wide, labels/error links/focus/keyboard | Technical compatibility fixture, not an application screen |
| platform.angular-form.compatibility | Mobile | retained form | Preserve native behavior | No native edit | N/A | Existing native unchanged | mobile-react/src/shared/components/forms/AppForm.tsx | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded | Existing behavior unchanged | Existing policy | N/A | No new grant or scope | Existing native UI retained | New Angular-only primitive; no native customer surface |

## 3. Closest existing reference

Reviewed Next MyForm/FormContainer/formErrorSummary and MyTextField. Angular has
only ActionButton, localization and theme: no field or form container exists.
New shared primitives justified by multiple existing Next consumers and future
Angular login/profile/reference consumers. Use ActionButton public API, existing
catalog and token adapter. Do not copy React form libraries into Angular.

## 4. Reuse and composition contract

Reactive Forms are the Angular form authority per ANGULAR_ARCHITECTURE section 5.
Caller owns reusable validation and typed controls; components own generic DOM,
aria, projection, error visibility/focus and native submit. CVA does not validate
business values. No React-specific react-hook-form/zodResolver requirement applies
to Angular. Client reinforcement never replaces server validation/permissions.

## 5. Screen and workspace contract

One projected FormContainer and header/content/footer composition, consistent
spacing and action target, no feature-local shell. Error-summary links use actual
registered field IDs, not selector interpolation of server paths. No native
validation UI or alert/confirm. Preview route excluded by production replacement.

## 6. Typed transport and server criteria

No HTTP/new DTO/database. Server field messages are supplied by caller and mapped
onto the exact controls by reusable utility; unknown paths returned to caller for
form-level feedback, never silently discarded. Clear only the field's own server
error after editing; preserve other client errors. No automatic submit replay.

## 7. Create, edit, view, and lifecycle contract

Save remains enabled when incomplete/invalid; on submit mark touched, display
each specific field error, expose accessible summary links and focus first invalid
rendered field. Pending validation/save and read-only block duplicate writes.
Reset/null/disabled/readonly/async patch/CVA events and password reveal/clear are
Required; reveal must not change control value and clear emits once. No navigation
or close in this unit, so dirty-discard registry/dialog policy not implemented here.

## 8. UX states, permissions, offline, and mock data

Input label/help/error connected by ID; error aria-invalid reflects visibility.
Loading/pending and unknown server error displayed via caller-owned form feedback.
Read-only does not mutate form value; disabled comes through CVA. Native IME
composition must not emit partial text. No missing keys or offline storage writes.

## 9. Concurrency, transactions, and consistency

FormControl value stays authoritative, no mirrored form store. Bridge control
events to Angular rendering for zoneless async patch/error/disable/touch behavior.
Submission callback is emitted once only when form valid and not pending/readonly;
caller owns actual save pending. No business transaction or forced retry introduced.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing namespaced en/ar text and user/company translation runtime preserved.
One token/PrimeNG InputText adapter: errors/status, font, label rhythm, 44px
geometry and clear/reveal controls do not overlap content. Password visibility
labels and all summary/action texts translated. Native focus and semantic form,
labels, aria-describedby/invalid/busy; no translated HTML or manual directional CSS.

### Exact bounded readiness

G0 one Platform technical owner, existing sources reviewed; no business/API/schema.
G1 validation/focus/state rules fixed above from existing shared forms.
G2 Angular 22.2.3, PrimeNG 22.1.4, typed Reactive Forms and public CVA contract;
current license locally Verified; CSS animation and zoneless event bridge.
G3 no customer screen/pattern; technical harness only, all business optional views
Excluded on Web/Mobile. Reuse token/action/localization before new generic fields.
G4 meaningful tests/types/build/architecture/catalog and browser harness Required;
only hosted release origins/security remain PROD-017/019. No unresolved business
decision can change this exact primitive. Full S1 forms/dirty/dialog/CVA select/
date/repeater remain their later explicit contracts, not completed by this unit.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing contract/no API work | No source/schema change, N/A EF/full API test | documentation/plans/business/web-angular-migration/decomposition/angular-form-foundation.md |
| 2 | Web | Verified | Phase 00 bounded entry | 38 Angular tests/6 AST tests, types/template/checks and 417.05 kB build pass | documentation/modules/platform/features/angular-form-foundation/IMPLEMENTATION_REPORT.md |
| 3 | Mobile | Verified | Web verified | No native/token-value/schema change; existing catalog/token checks pass | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | 40 actual form browser combinations and 3 Next files/6 tests pass; no business SQL claim | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Current books/manifest/packets and technical handoff; education N/A | Same evidence ledger |

Next-step rule: no sibling starts before this unit Verified and documentation Closed.

## 12. Verification contract

Tests for CVA writeValue not echoing, input/clear once, null/reset/disable/touch,
IME, password reveal, zoneless async patch/validation/server errors, native noValidate,
invalid submit enabled/focus/summary, read-only/busy duplicate prevention, nested
field path and unknown server messages. Two distinct compositions. Browser all
palette/modes compact/wide EN/AR, no overlapping icons/errors, keyboard/error links,
password reveal and no native validation dialogs. Production budget unchanged.
Retained source unchanged: narrow shared form regressions, no full API/native rerun.

## 13. Child exit gate

- [x] Phase 00 books/current manifest/packets before runtime, bounded G0-G3 entry.
- [x] Shared CVA/form contracts pass meaningful tests and actual browser checks.
- [x] No business UI/dirty-dialog/full S1 completion implied; FOLLOW-014 owns remaining acceptance.
- [x] Canonical source evidence/phase packets reconciled before handoff.

# Shared form close and discard protection — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A5 — Shared form close and discard protection preparation |
| Child Feature ID | angular-form-close-foundation |
| Child feature name | Shared form close and discard protection preparation |
| Owner | Platform Web Shared forms/dialogs |
| Depends on | angular-reference-selection-foundation; angular-api-contract-generation-proof Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded S1-A5 SHARED_FORM_CLOSE_CONTRACT runtime after309 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare the smallest coherent Shared form-close/discard adapter before business
editors. Audit actual MyForm/FormContainer/useFormDialogState/DiscardChangesDialog,
Next unsaved registry, native useDiscardChanges and Angular FormContainer/ChoiceDialog.
Freeze clean/dirty/pending/validation-close decisions and async stale-owner guards.
No runtime is claimed or authorized by this initial preparation.

## 2. UI Pattern Gate (mandatory before implementation)

Frozen target is SHARED_FORM_CLOSE_CONTRACT: dev-only P-001/C-01 shared embedded form/confirmation composition. Exact current FormContainer/ChoiceDialog reuse reviewed; no business screen or runtime authorization yet.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.form-close-preflight | Web | dev/form-close target only, production Excluded | Verify safe close/discard | Shared form/confirmation | P-001 | C-01 embedded form | web-angular/src/app/shared/ui/forms/form-container.ts | Adapted | Technical form/confirmation Required; business views Excluded | Frozen clean/dirty/pending/error/focus/close | No persistence | No business fixture | No action/grant; owner supplies state | Freeze EN/AR/390/1440/keyboard/focus before runtime | No broad navigation or context safety claim |
| platform.foundation.form-close-preflight | Mobile | No runtime route | Retain native implementation | Source audit | N/A — no UI | Retain existing | mobile-react/src/shared/components/dialogs/discard-changes/useDiscardChanges.ts | Excluded | All new UI Excluded | Existing retained behavior | Existing policy | No new mocks | No grant/schema change | Existing retained behavior | No native rewrite or acceptance claim |

## 3. Closest existing reference

web-next/src/shared/components/forms/dialog/MyForm.tsx and useFormDialogState.ts:
common form composition, block close while saving, dirty confirmation. Shared
dialogs/discard-changes/DiscardChangesDialog.tsx composes ConfirmationDialog.
web-next/src/shared/contexts/UnsavedChangesContext.tsx owns app navigation/context
registry, separate from local close. Native useDiscardChanges mirrors local close.
Angular ChoiceDialog is a scope-option dialog, not a generic confirmation/form shell.
Actual source was read; full lifecycle/focus/async behavior still needs the audit.

## 4. Reuse and composition contract

Shared first: FormContainer remains form/error/focus/submit authority; ActionButton,
tokens, translation and actual PrimeNG Dialog remain adopted primitives. Extend
existing generic capability when possible. If ChoiceDialog cannot safely cover
generic confirmation, freeze exact reusable shell/composition without duplicating
its visual/lifecycle/accessibility. No feature-local look-alike.

## 5. Screen and workspace contract

One local form-close lifecycle. Initial freeze must distinguish local cancel/close,
route navigation, company/year/module transition, session expiry and forced reload.
Do not absorb all app navigation/request caching/attachments into one field kit.
Global unsaved registration/context/route integration needs an exact subsequent
scope when outside the frozen local adapter. FOLLOW-014/015 retain those items.

## 6. Typed transport and server criteria

No API calls, DTOs or server criteria. ERP-01 outcome: typed owner services/runtime
validation are the accepted fallback; no raw generated transport adoption here.
Permission Action Matrix N/A generic no-action kit. Future consumers own grants.

## 7. Create, edit, view, and lifecycle contract

Freeze clean close, dirty keep/discard, block duplicate confirmation, pending save,
async owner identity replacement/destruction, explicit accepted save reset and
focus return. Owner owns actual draft baseline/save; Shared cannot treat form.dirty
alone as proof of unsaved semantic changes or erase a later draft after old consent.
No domain/schema change; five business UI journeys/migrations N/A.

## 8. UX states, permissions, offline, and mock data

No native alert/confirm or validation popup. Confirmation uses Shared; primary
Save remains enabled for invalid form submission feedback. Pending work has visible
local progress. Freeze hidden/closed/dialog stacking and narrow-screen scroll/focus.
No beforeunload native prompt introduced; forced reload policy must be explicit.

## 9. Concurrency, transactions, and consistency

Local async consent is tied to owner identity/generation and current dirty/busy
state. Recheck after await; late confirmation must not close another form/draft.
No automatic write replay or cancellation-as-rollback claim. No persisted drafts,
attachment deletion, offline queue or business concurrency change.

## 10. i18n, RTL, accessibility, and responsive behavior

Canonical core EN/AR/SQL catalog remains owner; inspect existing captions first.
PrimeNG Dialog focus trap/ARIA/escape/return focus and responsive scroll behavior
need actual frozen unit/browser tests before runtime acceptance. No native changes.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | ERP-01 Verified/Closed | No-API boundary and source/ownership audit | This contract |
| 2 | Web | Verified | API audit/frozen Phase00 | Exact local shared contract/reuse and authorized implementation | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact shared harness/browser and retained regressions | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical report/manifests/recipes and handoff | This contract |

Next-step rule: only this feature is Active; no sibling or runtime before exact gates.

## 12. Verification contract

Full source/reuse audit, smallest frozen contract, per-platform Required/Deferred/
Excluded decisions and four applied books/current-only manifest/recipes/checks
before bounded runtime entry. Then test consent/pending/identity races and actual
keyboard/RTL/dialog-scroll/focus with current shared text/reference/error system.
No business writes/CRUD completion can be inferred from a neutral technical harness.

## 13. Child exit gate

- [x] Prior API generation assessment and S1-A4 technically Verified/Closed.
- [x] Sole preparation owner registered with actual reference paths.
- [x] Full source/reuse/lifecycle audit and frozen exact local adapter contract.
- [x] Phase00 applied books/current-only manifest/recipes and309 recipe/planning checks passed.
- [x] Exact runtime authorization, implementation and Phase06 acceptance:138 unit/40+8 browser; 309-recipe/planning canonical closure passed.

Customer Education N/A technical foundation; technical handoff follows Phase06.
Overall plan stays Draft. Global dirty/navigation/context parity remains its
explicit later scope; no silently implemented universal registry is authorized.

Frozen preparation2026-10-29: SHARED_FORM_CLOSE_CONTRACT and four current books/manifest/recipes registered. No app source was changed; runtime remains blocked until current entry checks and exact bounded authorization.

Bounded execution entry2026-10-29: source/reuse, frozen local consent/modal contract, four books/current-only manifest and309 recipe/planning checks pass. G0-G3 complete for this technical kit; PROD-002/017/019/RISK-018 remain release-only. No business/global navigation/context/schema/native runtime.

Phase06 Verified2026-10-29: IMPLEMENTATION_REPORT records current local runtime, tests and portable proof. No global navigation/context acceptance.

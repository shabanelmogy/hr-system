# Shared unsaved navigation/context protection — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S1-A6 — Shared unsaved navigation and context protection preparation |
| Child Feature ID | angular-unsaved-navigation-foundation |
| Child feature name | Shared unsaved navigation and context protection preparation |
| Owner | Platform Web Shared + Shell/Platform composition |
| Depends on | angular-form-close-foundation Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized bounded UNSAVED_TRANSITION_CONTRACT after317 recipe/planning Phase00 checks; G0-G3 fixed, remaining G4 release only |

## 1. Child boundary and outcome

Prepare the next bounded owner for unsaved edits when departing a routed editor or
changing company/year/module context. Audit actual Angular navigation and current
trusted context transitions against Next unsaved registry and native coordination.
Freeze participants, identity/revision/busy, consent lifetime and accepted/rejected
transition sequencing before any implementation. This historical preparation boundary was subsequently frozen and implemented under UNSAVED_TRANSITION_CONTRACT; the report and verified books own current behavior.

## 2. UI Pattern Gate (mandatory before implementation)

Current step has no new screen/UI; source preparation only. Any later shared global
confirmation reuses the verified S1-A5 DialogPanel/ConfirmationDialog and exact
pattern/composition gate. No business editor or native screen is added here.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Views | States | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.foundation.unsaved-preflight | Web | dev/unsaved/:record target only | Verify registered transitions | Shared form/confirmation + actual Router | P-001 | C-01 technical form | web-angular/src/app/shared/ui/forms/form-close-guard.ts | Adapted | Technical form/confirmation Required; business views Excluded | Frozen dirty/busy/denied/accepted/stale/context | No draft store | Technical evidence only | Preserve trusted session and grants | No current screen change | Local S1-A5 does not supply global acceptance |
| platform.foundation.unsaved-preflight | Mobile | No new route | Retain native policy | Source audit | N/A — no UI | Existing native coordination retained | mobile-react/src/shared/contexts/unsaved-changes-registry.ts | Excluded | All new UI Excluded | Existing behavior retained | Existing policy | No new mocks | No grants/schema change | No current UI change | No native implementation/acceptance claim |

## 3. Closest existing reference

web-next/src/shared/contexts/UnsavedChangesContext.tsx and unsavedChangesRegistry.ts
are inspected initial sources; local useFormDialogState is deliberately separate.
Angular verified FormCloseGuard/ConfirmationDialog must be reused for local behavior,
not copied. AuthSession switchCompany/runScopedContextUpdate and Shell navigation
remain actual owners to trace fully. Native source is retained evidence only.

## 4. Reuse and composition contract

Shared-first registry/consent mechanics must remain domain-neutral; Shell composes
shared confirmation, Platform owns trusted session transitions and feature owners
register semantic draft identity/revision/busy. Preserve existing Cookie/CSRF/read
identity/cross-tab and selected-reference behavior; no global NgRx mandate or BFF.

## 5. Screen and workspace contract

Freeze one coherent safe-transition workflow; do not combine typed lookup/cache,
attachments, persisted drafts or business CRUD. Decide rejected navigation,
same-record query/fragment versus actual departure, back/forward and context switch
separately. Forced expiry/external change cannot be blocked as if client consent
granted server authority. Hard reload/tab close policy needs an explicit browser
constraint decision; do not introduce native alert/confirm or imply data recovery.

## 6. Typed transport and server criteria

No API contract/schema change authorized in preparation. Trace existing trusted
company/year mutation and read invalidation before placement of a client barrier.
ERP-01 typed owner services/runtime-validation fallback retained. Exact Permission
Action Matrix N/A no new business action; preserve all existing permission checks.

## 7. Create, edit, view, and lifecycle contract

No business journeys implemented. Target consent cannot discard a later editor
revision or release another participant. Pending writes block user departure;
successful navigation/read cancellation differs from mutation safety. Recheck
participants/current scope after await. Source audit must define success/error/
destruction/unregistration and explicitly owned baseline resets.

## 8. UX states, permissions, offline, and mock data

Future shared confirmation must remain bilingual, accessible and reusable; current
preparation no visible text/UI. No fake business mocks/offline queue/persistence.
Error/retry/cancel decisions cannot silently lose data or clear busy work.

## 9. Concurrency, transactions, and consistency

Analyze duplicate navigation, overlapping confirmations/context requests, stale
consent, late reads, logout/expiry and cross-tab scope hints. Client cancellation
is not server rollback; no automatic write replay. No DB transaction/migration.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse canonical SQL-backed core captions and verified modal frame; no catalog
change now. Define actual keyboard/focus/390-1440 browser cases before runtime.
Native UI retained. Five business UI audit/EF migration N/A technical preparation.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1-A5 Verified/Closed | Existing context/source and no-new-API boundary audit | This contract |
| 2 | Web | Verified | API/source audit | Frozen bounded integration and Phase00/current gates before runtime | This contract |
| 3 | Mobile | Verified | Web evidence | Retained-source classification | This contract |
| 4 | Integrated live verification | Verified | Prior stages | Exact accepted/rejected/stale/pending context/navigation proof | This contract |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical report/books/manifest/recipes and handoff | This contract |

Next-step rule: this feature is Closed; S1-A7 date-only preparation is the sole Active feature.

## 12. Verification contract

Graphify/source trace, exact scope freeze, independently classified platform views,
four applied books/current-only manifest/recipes/current checks precede bounded
runtime. Later prove registry/consent races, actual route navigation and trusted
context sequencing with current auth/reference/form regressions. No green local
dialog test can stand in for accepted/rejected app transition acceptance.

## 13. Child exit gate

- [x] Prior S1-A5 local close Phase06 Verified/Closed with portable40+8 proof.
- [x] Sole preparation owner and source navigation registered.
- [x] Full route/context/ownership audit and frozen UNSAVED_TRANSITION_CONTRACT.
- [x] Phase00 four books/current-only manifest/recipes registered; current317 checks follow.
- [x] Exact bounded runtime and Phase06 acceptance:160 unit, route40+final8/context8 and regressions; 317-recipe/planning canonical closure passed.

Customer Education N/A technical foundation; no education before Phase06 Verified.
Overall migration remains Draft. FOLLOW-014/015 own broader editor/workspace parity.

Bounded entry2026-10-29:317 recipes/planning passed; exact registered-draft/router/context kit authorized. No API/schema/native/business editor/reload recovery. G4 release-only PROD-002/017/019/RISK-018 cannot change frozen kit. External authority invalidation quarantines old owner via callback; it never automatically saves/replays data.

Phase06 Verified2026-10-29: report/portable evidence own exact registered-draft outcome and exclusions. API/native/new business editor and hard reload recovery not added.

Canonical closure2026-10-29:317 recipes/planning passed; technical handoff and portable evidence registered after Phase06 Verified. S1-A7 preparation follows. Earlier preparation language records entry constraints, not an outstanding implementation gate.

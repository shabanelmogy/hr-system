# Shared form close — Retained native profile

## 1. Ownership

Platform Shared owns local form-close/confirmation/frame only; caller owns draft/baseline/save. No business aggregate/API/schema change.

## 2. Current source evidence

Graphify and source audit inspected Next MyForm/FormContainer/useFormDialogState/DiscardChangesDialog/UnsavedChangesContext, native useDiscardChanges, Angular FormContainer/ChoiceDialog/ActionButton and installed PrimeNG Dialog22 types.

## 3. Verified bounded outcome

Phase06 Verified: public FormCloseGuard/current-draft controller, reused DialogPanel/ConfirmationDialog/ChoiceDialog, technical harness. IMPLEMENTATION_REPORT owns actual behavior and exclusions.

## 4. Existing-System Relationship Review

DialogPanel extracted from current ChoiceDialog; ChoiceDialog and ConfirmationDialog share visual/lifecycle/ARIA/scroll ownership. FormContainer remains validation/error/submit authority. No alternate form, no global registry or feature-local dialog.

## 5. Platform and optional scope

Web technical local form/confirmation Required after entry. Native new UI Excluded; retained source inspected. All business collection/tree/chart/report/import/export/offline views Excluded. Global dirty navigation/context/reload Deferred FOLLOW-014/015, dates/multi/repeaters remain FOLLOW-014.

## 6. Typed transport

No network/DTOs/generated client. ERP-01 typed-owner-service/runtime-validation fallback retained. Caller supplies exact active identity/revision/semantic unsaved/pending; no domain state inside Shared.

## 7. Business Rules Matrix

Controller enforces current identity/revision/token, clean close once, busy block, stale consent invalidation and teardown. Caller owns semantic baseline/save, active editor and final close recheck; Shared never mutates draft. FormContainer retains enabled invalid submit/error/focus. Modal owns safe focus/trap/restore/bounds.

## 8. Verified edges

Unit/browser cover repeat close, old clicks, identity/revision/pending/parent state, teardown, clean readonly, enabled invalid Save, failed/successful save, focus, Escape, Tab trap, nested modal/long scroll/compact RTL. Zero business writes; transaction/migration/offline/cache N/A.

## 9. Consistency and scope

Async decision rechecks current identity+revision+unsaved+active+busy; no old consent can close another draft. No guard app-wide grant, no HTTP cancellation/rollback claim or forced draft reset.

## 10. API and persistence

No API/domain/schema/resource changes. Existing core captions added to bootstrap via normal Angular generator; canonical web hash unchanged. SQL overrides and host deployment remain current mechanism/PROD-019. Migrations/live DB/five domain UI journeys N/A.

## 11. Verification

Phase06 Verified:31 files/138 tests,10 architecture/4 config, strict types/catalog/tokens/fonts/build440.64kB/116.75kB. Browser40+final8; retained forms40/reference8/login10/context24/language20 pass. Portable JSON/PNG and exact limitations in IMPLEMENTATION_REPORT.

## 12. Release and notes

FOLLOW-014 owns remaining editor/global dirty journeys, FOLLOW-015 workspace integration. PROD-002/017/019/RISK-018 external gates retain ownership; RISK-012 inherited Next dependency drift. No remote deployment.

## 13. UI Pattern Gate

Dev-only P-001 C-01 shared embedded form/confirmation; no production route/CRUD. Actual PrimeNG Dialog shared frame, EN/AR5 palettes/modes/390/1440 and focus/scroll measured. Native new UI Excluded; no global navigation/context acceptance implied.

## 14. Readiness

309 Phase00 recipe/planning checks preceded exact bounded runtime. G0-G3 fixed for local kit; remaining G4 release only. Phase06 Verified/Closed;309 recipe/planning closure checks passed. Overall plan Draft; FOLLOW-014/015 global dirty and other editor work stays open.

## 15. Handoff

IMPLEMENTATION_REPORT and verification/ own actual local-kit outcome. Global navigation/company/year/module/session integration remains separately bounded. Technical guide created after Phase06 Verified; ROADMAP/RESUME own the next sole feature. Preserve secure API Cookies/SQL localization/Shared and no global NgRx requirement.

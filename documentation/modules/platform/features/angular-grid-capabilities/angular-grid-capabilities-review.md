# Complete shared PrimeNG Table capabilities — review applied book

Bounded runtime in progress after Final Phase00 and 405-recipe/planning entry. Phase06 Not Verified; see RUNTIME_STATUS.md for exact evidence and remaining Required capabilities.

Current2026-10-30 D28: bounded context filter/icons Verified; remaining full matrix Queued; see CELL_CONTEXT_FILTER_CONTRACT.md. Complete-matrix Phase06 remains Not Verified. Later historical references to S3-A2/3 priority below are superseded by current ROADMAP. No API/schema/native changes.

## 1. Ownership

Platform Angular Shared owns the generic Table adapter; feature owners retain API/data/permissions/schema/edit business rules. No API HTTP/domain/schema/native rewrite in this technical child.

## 2. Existing-System Relationship Review

Current PrimeNG22.1.4 declarations/implementation and official docs, PRIMENG_TABLE_CAPABILITY_REVIEW, existing Angular public shared controls/controller/criteria and actual Next header/grid/toolbar/options/footer were reviewed. NEXT_HEADER_MEASUREMENTS records actual source geometry, not a target guess.

## 3. Bounded workflow

One coherent reusable technical component kit and dev-only neutral harness. CAPABILITY_MATRIX lists every Required installed Table capability. Cards existing compatibility Required;new native UI,TreeTable,separatePRODataGrid,pivot/report/importbusiness engines Excluded.

## 4. Shared reuse

Extend MyDataGrid/CollectionFrame/PageHeader/fields/ActionButton/OptionSelect/feedback/ScrollViewport/PopoverPanel/DialogPanel/controller; use typed config/templates/events. No raw-grid or parallel feature shell. Preserve defaults and current callers.

## 5. Data and query contract

Explicit supplied-local versus controlled-remote modes. Shared emits immutable bounded typed filters/sort/range; owner serializes/queries. AND/OR per field reflects PrimeNG,not arbitrary nested SQL. No local filtering/sorting of a remote page or invented authoritative total.

## 6. Permission Action Matrix

Shared grants nothing. Caller supplies current source/authorized actions. Scope/identity changes close editors/details/menus and clear pending selection/effects. Harness contains neutral records and no business HTTP or writes.

## 7. Business Rules Matrix

No business rules change. Generic rules:unique current IDs,known zero versus unknown totals,controlled ownership,typed bounded operators/value types/ranges,protected columns,valid config combinations,editor drafts separate from authoritative rows and safe CSV formula escaping.

## 8. Edge Cases and Validation Matrix

Invalid/duplicate identities,empty/unknown/out-of-range pages,malformed constraints/modes/types,locale numbers/dates,scope/criteria replacement,pending refresh/edit/cancel,unsupported virtual/group/height combinations,RTL frozen edges,CSV formulas,invalid presentation restores and direct guarded callbacks require meaningful proof.

## 9. Consistency and lifecycle

Captured immutable scope/revision owns all late callbacks/ranges. No automatic business write/reorder persistence or replay. Preserve initialized descending sort/no duplicate request. State adapter stores validated presentation only; vendor local/session storage remains disabled.

## 10. Localization and security

Existing SQL-backed core/catalog generation remains authoritative; new shared PrimeNG captions require EN/AR canonical resources and matching host publication PROD-019. No local translation map,token storage,BFF,unsafe HTML or arbitrary server expression/function.

## 11. Verification

Phase06 **Not Verified**. Phase00 books/manifest and405recipe/planning entry checks passed before bounded runtime. Current source and execution limits are in RUNTIME_STATUS.md. Header/footer projections expose only supplied current-page rows and known/unknown totals; hidden columns prune the validated hierarchy, and incompatible grouped-header reorder/pinning settings reject explicitly. The final complete gate is still required. Full Angular gate,meaningful behavior tests,40visual+focused capability combinations,current caller regressions,source-header comparisons and measured10000-row virtual benchmark required before acceptance. Prior323unit/Countriesstandalone proof is provenance only.

## 12. Impact Matrix

Reuse current shared kit/Next reference/API/native;Extend only generic typed capabilities and styling;Add actual runtime/harness/tests as created;no API/schema/migration/native/domain writes in this child. Country server/query/host integration belongs to Active S3-A2,not hidden behind generic success.

## 13. UI Pattern and fidelity

P-001/C-02 table and C-01 shared fields/editors. No header visual redesign; current Next dimensions/fonts/colors/spacing baseline. Requested advanced controls only are additions. Same-scope/viewport source comparison required; unresolved visual difference is a regression.

## 14. Readiness

Final Phase00 entry passed; bounded runtime is authorized. No complete capability or exact visual acceptance yet. G0-G3 technical generic boundary frozen by this contract and matrix. Remaining G4 release-only PROD-002/017/019/RISK-018 do not alter the generic kit; consumer API/performance/native/pilot proofs cannot be claimed from fixture availability.

## 15. Handoff

D28 bounded cell context filter/icons Verified with Angular397, native context browser8 and retained command browser8. Exact source/limitations: verification/CELL_CONTEXT_ACCEPTANCE.md and CELL_CONTEXT_RESULTS.json. ContextMenuPanel is general Shared; MyDataGrid reuses it for current cell filtering and row actions. Countries Reset clears optional structured criteria. The complete S1-A14 matrix and Phase06 remain Not Verified; remaining generic powers stay Queued/FOLLOW-016. Chart S3-A5 source/Phase00 is next Active; no chart runtime before its gates. API/native/schema unchanged; matching catalog publication stays PROD-019.

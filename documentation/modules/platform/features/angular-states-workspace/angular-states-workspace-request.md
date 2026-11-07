# States complete Angular parity — implementation request

## Request metadata

| Field | Decision |
| --- | --- |
| Plan / slice | web-angular-migration / S3-A9 — States complete Angular parity |
| Feature | angular-states-workspace |
| Operating mode | New Angular client for an existing verified business workflow |
| Owning capability | ReferenceData States; Platform migration documentation |
| Screen/Workflow Contract | documentation/plans/business/web-angular-migration/decomposition/angular-states-workspace.md |
| Required-file manifest | documentation/modules/platform/features/angular-states-workspace/required-files.json |
| Authority | Requester D42, explicit States then Districts then remaining Super Admin with final full review |

## Existing-System Relationship Review

Existing States feature consumed by a new client, not new domain behavior. API/CQRS/SQL/Next/Mobile stay canonical. Angular replaces no endpoint, schema or grant. Inspected web-next StatesPage, StatesMultiView, StateForm, stateService, stateImport and API StatesController/StateManagementContracts/StateCommands. Countries Angular supplies presentation/lifetime references only.

## Approved product decisions translated for execution

The exact version2 contract owns all fields, routes, permissions, views and limits. Angular uses global existing scope; five views Required, native conversion Excluded. Parent Countries lookup is separately authorized. Import headers nameAr/nameEn/code/countryName and100rows/5MiB/first worksheet. No ActiveReports or speculative export/tree. Realtime states and source notifications route are retained.

## Business Rules Matrix

| ID | Rule | Primary owner | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| ST-01 | Global role plus exact action permission; read-only bars writes | Existing Application authorization; UI recheck | forbidden | denied direct handler and stale identity |
| ST-02 | Printable trimmed names2-100, code2-10 alphanumeric/hyphen, Country positive and active | Existing Domain/Application | validation/parentNotFound | field validation, inactive lookup, missing parent |
| ST-03 | Names/code duplicate within same Country | Existing Application/Database uniqueness | State.Duplicated | same-parent duplicate and other-parent distinct |
| ST-04 | Archive blocked by active District/Address; restore requires active Country | Existing Domain/Application | dependency/parent | lifecycle failure preserves rows and no replay |
| ST-05 | Atomic valid-row bulk1-100; exact success count | Existing transaction/Application | count/rejected/uncertain | malformed count and skipped row mapping |
| ST-06 | No idempotency key; ambiguous write must not replay | Existing transport/transaction contract | uncertain | lock/reconcile/explicit clear |
| ST-07 | Import parent names resolved against active authorized Country lookup | ReferenceData client conversion, API parent authority | row validation | missing/ambiguous lookup, auth loss |

## Edge Cases & Validation Matrix

| Category | Scenario/decision | Enforcement | Verification |
| --- | --- | --- | --- |
| Missing/malformed input | name/code/parent limits, IDs/query bounds | validators/service | invalid forms and transport tests |
| Duplicate/uniqueness | same parent field equality, case normalization | API and client import | scoped duplicate tests |
| Relationship eligibility | archived/missing Country; dependent District/Address | API; active lookup | create/edit/restore/dependency failures |
| Lifecycle/concurrency | target archive state, no synthetic revision | API + action guards | stale target and authoritative409 |
| Permissions/scope | role/action/read-only, parent grant separate | session/API | direct route/action denial |
| Batch/partial/result |100limit and exact created/archived count | service/API | invalid batch, malformed success |
| Network/time/retry |10s timeout, dispatched uncertainty | service/scoped state | no retry and canceled identity |
| Draft/navigation | unsaved form/import, pending barriers | shared UnsavedChanges | cancel/discard and context change |
| I18n/a11y/responsive | EN/AR390/1440, keyboard/focus/contained scroll | Shared controls | browser matrix |
| Money/calculation/period/approval | N/A: flat global geography has no amount/approval/period workflow | no added placeholder | source review |
| Historical/audit | existing server audit/realtime retained, no new history UI in source | existing owner | regression/refresh checks |
| Offline | no new offline store or queued writes | client boundary | source architecture check |
| Files/security | first-sheet5MiB/100rows; no formulas; text-only errors | shared parser/service | workbook/unknown error tests |

## Impact Matrix

| Area | Decision |
| --- | --- |
| API/domain/schema/migrations | N/A retained existing semantics; no runtime change |
| Angular | Add focused States feature; reuse existing Shared controls |
| Next/Mobile | Retain current runtime; source comparison only; compact browser is Web |
| Shared | Extend only evidenced backward-compatible gap, never business rules |
| Reporting/import/realtime | Reuse existing owner transports/contracts, entity states |
| Localization | Existing namespaces and canonical generator for actual gaps |
| Tests/docs | Meaningful tests, full Angular gate, source comparisons, manifest/books/generated packets |

## Implementation steps and verification

1. Freeze exact contract and current-only four books/manifest, register recipes and run Phase00 generation/check/planning.
2. Implement typed query/DTO/permission/mutation/service with tests before UI.
3. Implement scoped parent/read/editor/lifecycle/import using existing conventions.
4. Compose full five views, exact filters/lookup, forms/dev mock, lifecycle and reports.
5. Run full check; verify source-matched EN/AR views and errors; repair regressions.
6. Update evidence, run canonical docs checks; record Phase06 honestly, then education/closure. Activate Districts only afterward.

## Execution readiness

G0 scope/actor/source verified; G1 workflow/P-001 fixed; G2 ownership/API/shared integration fixed; G3 no new domain dependency and concrete tests. Release-only G4 PROD-019/028/RISK-020 remains. Runtime authorized only after the initial Phase00 generation/check passes. All customer behavior remains the exact frozen contract. Current existing checkout and unrelated changes are preserved; no automatic commit or merge.

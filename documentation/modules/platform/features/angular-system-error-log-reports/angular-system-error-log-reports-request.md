# System Error Logs managed reports implementation request

Mode: existing-feature extension. Plan web-angular-migration; exact S4-A4c child.
Authority: current Screen/Workflow Contract, canonical API workflow and module owners.
Initial authorized increment: safe Platform report-source contract/adapter and tests only,
after Phase00 generation/check and planning. No report engine, schema mutation or external
endpoint activation in this increment. Remaining integration stays in this same child.

## Existing-System Relationship Review

Platform ErrorLogStore owns query/redaction and remains the only data reader. Existing
Reporting providers/catalog/consumer policies own RPT workflow. Current global source
and SQL entity allowlists are geography-only. Use a narrow Platform.Contracts source;
do not reference PlatformDbContext or expose a diagnostic SQL View in Reporting.

## Business Rules Matrix

| Rule | Primary owner | Outcome/error | Test |
| --- | --- | --- | --- |
| Trusted super_admin only, nonempty user identity | Platform adapter | Forbidden with no read | Tenant/anonymous/role denial |
| Source grant and global report actions | Reporting policy, pending integration | Existing forbidden | Missing source/action/tenant denial |
| Bounded same filter criteria | Platform shared validation | Invalid with no read | Source/status/UTC/range/text/JSON |
| Safe summary DTO only | Platform source | No IP/diagnostics/scope/raw ids | Actual store projection and contract |
|5000row cap before materialization | Platform store | TooLarge; no partial rows |5001and filtered subset |
| Same criteria across list/report | Shared owner filter | Identical matching records | Filtered owner integration |
| Geography View requirement retained | Reporting binding policy | Existing invalid View | Regression in later integration |

## Edge Cases & Validation Matrix

| Category | Scenario/decision | Enforcement | Required test |
| --- | --- | --- | --- |
| Identity/scope | Empty/tenant actor rejected; global only | Adapter | No read on denial |
| Null/empty | Null optional filters mean all allowed summaries | Shared criteria | Empty result success |
| Text/numeric | Search120,user100, status400..599, exact source list | Shared owner validation | Invalid bounds |
| Date/time | UTC only; from <= to | Shared owner validation | Kind/range cases |
| Collections | Bounded allowlisted column JSON; no partial loaded-page filter | Existing parser and store | AND/OR/null/unknown |
| Size |5000accepted,5001reject; filtered small subset accepted | Store Take5001 | Boundary test |
| Concurrency | Read-only source; report may change between independent reads | Existing isolation/cancellation | Cancellation propagated |
| External/provider | No RPT available in repository for this source | Later real provider acceptance | No fake success |
| Business lifecycle | No error creation/edit/delete | N/A source is read-only | No write port |
| Offline/import | Excluded, online authoritative | No placeholder | N/A no new client yet |

## Impact Matrix

| Area | Decision | Evidence/owner |
| --- | --- | --- |
| Domain/schema | N/A initial source adapter; later Reporting CHECK migration required | Existing GlobalCrystalReportConfigurations |
| Application | Extend validation reuse and add narrow report read port | Platform ErrorLogs |
| Infrastructure | Extend existing store bounded read; no foreign access | Platform |
| Public contracts | Add safe neutral request/result/source | Platform.Contracts |
| DI | Register source and its owning port | Existing Platform registration |
| Reporting | Later source artifact/provider/binding/policy integration | Reporting owners |
| Angular/shared/locales | Later shared report composition and typed filters | Existing GlobalReportView |
| Next/native | Existing behavior retained; new UI Excluded | Existing API compatibility |
| Auth/security | Source role defense; later exact report/source grants | No permission widening |
| Transactions/jobs/cache/realtime | N/A read-only source, no new lifecycle | Existing behavior |
| Tests | Add meaningful source/actual store/security/overflow cases | Platform tests |
| Documentation | Applied books/manifest/recipes and current ledger | Canonical feature package |

## Verification and handoff

Run RED/GREEN focused source tests and full API solution restore/build/test. Record
runtime sources only after they exist. Initial adapter is not report acceptance.
Phase06 Not Verified until managed API/client/browser and real-provider boundaries
are reconciled. Arabic education starts after Verified, never from preflight.

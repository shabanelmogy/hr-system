# States Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | States |
| API route | `/api/v1/states` |
| Web route | `/basic-data/states` |
| Mobile route | `/basic-data/geographical-information/states` |
| Implementation request | N/A — States predates the scaffolded request; this artifact and the four applied profiles hold its frozen decisions. |
| Required manifest | `documentation/system/features/states/required-files.json` |
| Canonical review | `documentation/project/STATES_FEATURE_FULL_REVIEW.md` |
| Import decision | Web Required; mobile Required with the native shared XLSX boundary |
| Import format | XLSX parsed through the browser/native shared boundary; typed JSON bulk envelope sent to API |

## Phase evidence

| Phase | Result | Evidence |
| --- | --- | --- |
| 00 Discovery | Complete | Legacy API/browser audit and missing Expo feature recorded in the master review. |
| 01 Domain/API | Complete | CQRS controller, contracts, stores, lifecycle job, localization, and focused tests. |
| 02 Web | Complete | One server-list controller, shared toolbar/Grid Options, dialogs, form, Grid/Card/Chart modes, Import view over the State bulk-create contract, and Crystal Report viewer integration. |
| 03 Mobile | Complete | Guarded route, runtime schemas, controlled list, search controls, form, modes, lifecycle actions. |
| 04 Lifecycle | Complete | Country-active and District-active rules are enforced inside shared transaction-owned lifecycle resources; bulk is atomic. |
| 05 Runtime | Complete | `states` realtime invalidation and direct notification route mapping are registered. |
| 06 Reconciliation | Automated feature gates complete; inherited repository gates and the manual visual/device matrix remain recorded below. |

## State-specific decisions

| Concern | Decision |
| --- | --- |
| Parent relation | Country is required and must be active for create/update/restore; participating Country and State operations share one Country resource. |
| Child relation | Active Districts block archive and bulk archive; participating State and District operations share one State resource. |
| Search | State names, code, and Country name only; no Countries alpha/phone/currency fields. |
| Bulk creation/import | Web and mobile XLSX import post `{ "states": [...] }` to `POST /api/v1/states/bulk` (`States:Create`, 1-100 rows, atomic, one `BulkAdd` change) and require `Countries:View` for parent resolution. Shared preflight validates XLSX metadata, first-sheet canonical headers, values-only safety, non-empty/100-row bounds, and feature mapping. Dependency states fail explicitly; ambiguous submissions lock and reconcile because the API has no idempotency key. Duplicate checks are case-insensitive, independent for Arabic name, English name, and code, and scoped to Country. |
| Browser report | Crystal viewer catalog and generation contract are ready. The checked-in States report slot is empty, so browser Report mode shows a localized unavailable state until the owner adds a valid State `.rpt`. |
| Mobile report | Current-page summary only until an Expo Crystal PDF viewer/download/share workflow is implemented. |
| Charts | Required current-page view using the shared criteria and pagination; page scope is explicit. Global analytics remains excluded without an aggregate endpoint. |

## Open findings

| ID | Priority | Finding | Required follow-up |
| --- | --- | --- |
| S-F03 | Owner action | The State Crystal report template is intentionally not tracked in source. | Add a valid `.rpt` whose filename starts with `States` to the deployment-owned `Reports/States` folder on the Crystal host; the catalog and report contract will pick it up. |
| S-F04 | Release gate | Automated checks cannot replace browser/device visual testing. | Execute the master review matrix before release. |
| S-F12 | Environment | Full-solution build cannot load the legacy Crystal project's `Microsoft.WebApplication.targets`; the primary HR API project builds successfully with no errors. The full-solution path also exposes two existing lowercase migration-name warnings. | Build the Crystal project in a Visual Studio/MSBuild environment with Web Application targets, or migrate that project separately. |

## Resolved findings

| ID | Resolution |
| --- | --- |
| S-F02 | The State Chart is registered in the multi-view page, shares server criteria and pagination, states its current-page scope, and obsolete orphan-only chart helpers were removed. |
| S-F05 | Browser bulk create now sends the API's named `{ states: [...] }` envelope, with an exact service serialization test. |
| S-F06 | API and browser request duplicate checks now compare each State field independently and case-insensitively within Country; persistence prechecks catch case-only conflicts. |
| S-F07 | Singular/plural State archive and bulk-create notification keys now exist in API, web, and mobile English/Arabic resources and are covered by job tests. |
| S-F08 | Documentation generation reads UTF-8 explicitly and produces the same fingerprints under Windows PowerShell 5.1 and PowerShell 7. |
| S-F09 | Canonical guides, phase templates, and new-feature scaffolding now require an explicit per-platform Import decision and exact transport/validation/testing contract. |
| S-F13 | The documentation system now generates and validates a copy-ready implementation request, defines decision vocabulary and change-impact rules, specifies API/web/mobile Import execution flows, and classifies handoff gate failures. |
| S-F14 | State Import no longer collapses Country lookup loading/permission/error into an empty map; it blocks submit with explicit localized dependency states and tests the full state matrix. |
| S-F15 | Countries and States now share bounded XLSX metadata/header/sheet/empty/formula/column/row preflight, template/actions/feedback components, and focused parser tests while retaining feature-owned schemas and duplicate scope. |
| S-F16 | No-response/5xx bulk results now become locked uncertainty states with canonical-list reconciliation; blind “Retry failed” is unavailable without an API idempotency contract. |
| S-F17 | Country archive versus State write and State archive versus District write races are closed with deterministic transaction-owned lifecycle resources used by every participant. |
| S-F18 | Countries and States reject web bulk selections above the API's 100-ID limit with localized feedback and direct-submit defense; selection is never silently truncated. |
| S-F19 | Grid sort affordances now match each API allow-list, including supported State Country sorting and disabled ID/count/Updated/status/action columns. |
| S-F20 | Background refetch keeps current Grid/Card/Chart content mounted and displays a non-destructive progress indicator distinct from initial loading. |
| S-F21 | Country and State Import enforce read-only and feature create permission inside direct submit callbacks; State lookup permission/loading/error remains an independent prerequisite. |
| S-F22 | Countries and States now have page wiring, exact bulk-envelope, mutation-invalidation, column-contract, shared bulk-limit, and import-authorization regression coverage. |
| S-F01 | A repository-wide consumer audit found no runtime caller for the legacy `IStateService`/`StateService`, so both were removed. The old `StateChangedJob` remains only to execute already-persisted Hangfire payloads; current code cannot schedule it. |
| S-F23 | Mobile States now has screen criteria/view/form/action/permission coverage and mutation transport/invalidation tests; the unused detail hook/key were removed because list rows are form-authoritative. |
| S-F24 | State/District/AddressType names now use one API/browser/mobile printable-Unicode rule with explicit tests; spaces, digits, punctuation, and mixed scripts are accepted, while control characters and line breaks are rejected. Technical codes retain their strict ASCII identifier rules. |

## Verification results — 2026-08-27

| Gate | Result |
| --- | --- |
| Focused Country CQRS suite | Passed: 53 |
| Focused State suite | Passed: 24 |
| Primary HR API build | Passed: 0 warnings, 0 errors |
| Full API tests | Passed: 349 |
| Full solution build | Primary projects passed; legacy Crystal target unavailable (`S-F12`) |
| Web normal and strict typechecks | Passed |
| Web lint | Passed with 0 errors and 118 inherited warnings |
| Web Countries/States regression coverage | Passed inside the full suite, including page wiring, query invalidation, columns, import, bulk selection, and service envelopes |
| Web tests | Passed: 86 files, 300 tests |
| Web production build | Passed: 49 routes generated |
| Web architecture | Passed |
| Mobile check | Passed: architecture, typecheck, lint, and 41 suites/120 tests |
| Documentation generation/check | Passed for 49 recipes |
| Documentation local links | Passed for all 110 Markdown files |

## Completion checklist

- [x] States focused tests and primary API project build complete.
- [ ] Full solution build clean; inherited environment blocker is `S-F12`.
- [x] Web type/lint/tests/build complete.
- [x] Web architecture clean.
- [x] Mobile check complete.
- [x] Documentation and link validation complete.
- [x] `git diff --check` complete.
- [ ] Browser/device matrix recorded.

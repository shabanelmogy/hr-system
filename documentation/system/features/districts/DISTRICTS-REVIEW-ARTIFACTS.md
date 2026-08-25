# Districts Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | Districts (`districts`) |
| API route | `/api/v1/districts` |
| Web route | `/basic-data/districts` |
| Mobile route | `/basic-data/geographical-information/districts` |
| Review date | 2026-08-24 |
| Operating mode | Existing-feature refactor |
| Applied reference | States — parent-dependent reference data only |
| Required manifest | `documentation/system/features/districts/required-files.json` |
| Canonical review | `documentation/project/DISTRICTS_FEATURE_FULL_REVIEW.md` |
| Import | Required on API, web, and mobile |
| Reporting | Managed shared API, web, and mobile Required |

## Phase evidence

| Phase | Result | Evidence |
| --- | --- | --- |
| 00 Discovery | Complete | Legacy service/controller, client-side browser list, and absent Expo feature were audited. |
| 01 Domain/API | Complete | District CQRS contracts, atomic bulk create, stores, lifecycle handlers/job, managed report dataset, thin controller, localization, and tests. |
| 02 Web | Complete | One server-list controller, shared Grid Options/toolbar/forms/dialogs, Grid/Card/Chart/Report/Import modes, and direct realtime key. |
| 03 Mobile | Complete | Guarded route, Zod client, server list, five native views, State form/import lookup, managed Report, atomic Import, lifecycle actions, translations, and deep link. |
| 04 Lifecycle | Complete | Active State is required and active Addresses block singular/bulk archive. |
| 05 Runtime | Complete | `districts` post-commit realtime event and mobile/browser invalidation registrations. |
| 06 Reconciliation | In progress | Automated District gates pass; inherited repository/environment gates and manual visual/device/report-deployment checks remain below. |

## Capability decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Grid/Table | Required | Required | Required | Server-managed current page |
| Cards | N/A | Required | Required | Same server criteria and page |
| Chart | N/A | Required | Required | Current page only; total is separately labeled |
| Archive/restore/bulk | Required | Required | Required | `Districts:Delete`; active Address guard |
| Import | Required | Required | Required | Platform-native client-parsed XLSX; atomic `POST /districts/bulk` on both clients |
| Reporting | Managed shared API | Required | Required | Published managed Crystal catalog/render on both clients |

## Verified contract

- Parent: active State is mandatory for create, update, and restore.
- Child: active Address blocks archive and bulk archive.
- Fields: Arabic name, English name, code, State ID. Names are trimmed and code is uppercased; uniqueness is State-scoped.
- List: one-based API paging; browser/mobile convert their zero-based display page; default status is active; supported field/operator/status/State/address-presence filters and sort allow-list are enforced server-side.
- Import: exact first-sheet XLSX headers `nameAr,nameEn,code,stateName`; 5 MiB and 100-row bounds; `States:View` active lookup; `Districts:Create`; named `{ districts }` request; atomic response `{ createdCount }`; ambiguous submission requires reconciliation.
- Report: published managed catalog key `districts`; `Districts:View` plus managed Run access; District/State/active-Address-count dataset; approved District/State exact filters; shared viewer.
- Permissions: `Districts:View`, `Districts:Create`, `Districts:Edit`, and `Districts:Delete`; both imports additionally require `States:View`; mobile also observes global read-only state; mobile Report additionally requires `CrystalReports:View` before catalog access.
- Notifications/realtime: post-commit resource is `districts`; browser and Expo invalidate that root and mobile maps `/basic-data/districts` directly.

## Evidence register

| ID | Claim | Evidence |
| --- | --- | --- |
| D-E01 | Controller is CQRS-only and versioned | `api/.../Districts/V1/DistrictsController.cs` |
| D-E02 | List and lifecycle rules are feature-owned | `Application/.../Districts/Queries/DistrictQueries.cs`, `Commands/DistrictCommands.cs` |
| D-E03 | Persistence/audit/realtime are post-commit | `Infrastructure/.../Districts/Persistence/DistrictManagementStores.cs`, `Jobs/DistrictManagementChangedJob.cs` |
| D-E04 | Browser uses server list and approved views | `web-next/.../districts/hooks/useDistrictGridLogic.ts`, `components/DistrictsMultiView.tsx` |
| D-E05 | Mobile has a direct guarded route and Zod boundary | `mobile-react/app/(main)/basic-data/geographical-information/districts.tsx`, `src/features/basic-data/districts` |
| D-E06 | API contract/route/validator/mapping tests exist | `api/HrManagementSystem.Tests/DistrictCqrsArchitectureTests.cs` |
| D-E07 | Atomic District bulk-create behavior and persistence conflict closure | `api/HrManagementSystem.Tests/DistrictBulkCreateHandlerTests.cs` |
| D-E08 | Web import parser/lookup/duplicate/body behavior | `web-next/.../districts/components/import-data`, `services/districtService.test.ts` |
| D-E09 | Managed District report dataset and web viewer | `api/.../CrystalReportDataSource.cs`, `web-next/.../districts/reports/pages/DistrictReportPage.tsx` |
| D-E10 | Mobile managed Report, native Import, and five-view registration | `mobile-react/.../districts/components/DistrictReportView.tsx`, `components/import-data/DistrictImportView.tsx`, `screens/DistrictsScreen.test.tsx` |

## Intentional differences from States

Districts is below State and is guarded by Address dependencies. Its import resolves an active State rather than a Country, uses a `districts` envelope, and scopes duplicates by `StateId`. Its managed report dataset exposes District/State/address-count columns rather than the State/Country schema. Web and mobile both own native presentations of the same Import and Report contracts. The reference gave architecture, lifecycle discipline, server-list behavior, and shared controls—not District fields or contracts.

## Open findings and release gates

| ID | Severity | Finding | Owner / release decision |
| --- | --- | --- | --- |
| D-F01 | Manual release check | Browser desktop/tablet/mobile and Expo phone/tablet RTL visual matrix remains manual. | Product/QA must execute before release. |
| D-F02 | Deployment release check | The report view can run only after a compatible District `.rpt` version is uploaded, published, and granted Run access. | Report administrator/deployment owner. |
| D-F03 | Cleanup follow-up | Legacy District service/job compatibility code has no current controller producer. | Audit all callers and remove in a dedicated compatibility cleanup. |
| D-F04 | Repository test gate | The full Vitest runner remained alive after its worker exited, so the full browser-suite result could not be collected in the bounded run. | Web test-infrastructure owner should inspect open handles; the focused District service suite passed. |

## Verification

| Layer | Command | Result |
| --- | --- | --- |
| Documentation baseline | `./documentation/system/Generate-Documentation.ps1 -Check` | Passed before refactor |
| API focused | `dotnet test ... --filter "...DistrictCqrsArchitectureTests|...DistrictBulkCreateHandlerTests|...CrystalReportDataSourceTests|...BackgroundNotificationJobTests"` | Passed: 67 |
| API build | `dotnet build HrManagementSystem.Api/HrManagementSystem.Api.csproj --no-restore` | Passed: 0 warnings, 0 errors |
| API full tests | `dotnet test HrManagementSystem.Tests/HrManagementSystem.Tests.csproj --no-restore` | 318 passed, 1 inherited migration text assertion failure (`TenantRoleIsolationTests.MigrationBackfill_DeduplicatesSharedRoleTenantBeforeAssigningCloneIds`) |
| API solution build | `dotnet build HrManagementSystem.sln --no-restore` | Environment blocker: legacy Crystal project lacks `Microsoft.WebApplication.targets`; primary API projects passed |
| Web type checks | `npm run type-check`; `npm run type-check:strict` | Passed |
| Web lint/build | `npm run lint`; `npm run build` | Passed; lint has 116 inherited warnings and 0 errors; production build compiled and generated all 41 static pages |
| Web focused test | `vitest run districtService.test.ts districtImport.test.ts districtImportDuplicates.test.ts --pool=forks --maxWorkers=1` | Passed: 3 files, 12 tests |
| Web architecture | `npm run check:architecture` | 4 inherited cross-feature forbidden imports and 1 shared forms/dialogs cycle; no Districts finding |
| Mobile full gate | `npm.cmd run check` | Passed: typecheck, full lint, architecture, 31 suites and 93 tests |
| Mobile focused tests | `jest src/features/basic-data/districts --runInBand --forceExit` | Passed: 4 suites, 12 tests; force-exit notice remains the inherited focused-run behavior |
| Documentation | Generation and `-Check` | Passed: 21 recipes |
| Markdown local links | Repository documentation link scan | Passed: 123 Markdown files |
| Diff hygiene | `git diff --check` | Passed |

## Final reconciliation

- [x] District-specific fields and dependencies were not copied from States.
- [x] Web and mobile Import and Report are implemented against the frozen District-specific contracts.
- [x] Required manifest and four canonical profiles exist.
- [x] Generated packets, focused quality gates, local-link validation, and `git diff --check` are complete.
- [ ] Manual browser/device matrix is complete.

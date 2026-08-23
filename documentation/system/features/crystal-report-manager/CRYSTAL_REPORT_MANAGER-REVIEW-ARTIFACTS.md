# Crystal Report Manager Review Artifacts

Use this file as the evidence ledger for one feature. Replace every bracketed value. Mark a row `N/A` only with a written reason.

The reusable contract for integrating future business features is
[`documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`](../../../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md).
This artifact remains the implementation evidence and verification history.

## Metadata

| Field | Value |
| --- | --- |
| Feature | `crystal-report-manager` |
| API route | `/api/v1/crystal-reports` |
| Web route | `/administration/crystal-reports` |
| Mobile route | `N/A - web/API scope requested for the first implementation` |
| Review owner | `Codex` |
| Review date | `2026-08-23` |
| Required-file manifest | `documentation/system/features/crystal-report-manager/required-files.draft.json` |
| Operating mode | `new feature` |
| Documentation state | `Draft` until runtime evidence exists; `Final` only after recipe registration and check mode pass |
| Applied reference | `countries` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Manage Crystal reports in a User Manager-style administration page. | User request, 2026-08-23 | Management contract complete | Grid/dialog workflow complete | N/A | Complete |
| R-02 | Create a logical report by uploading an initial `.rpt` file. | User request, 2026-08-23 | Multipart create complete | Create dialog complete | N/A | Complete |
| R-03 | Download, externally edit, and upload immutable report revisions. | User request, 2026-08-23 | Private source storage and version endpoints complete | Download/upload/version actions complete | N/A | Complete |
| R-04 | Configure per-report role rights for the authenticated tenant and company. | User request, 2026-08-23 | Coarse claims plus company-scoped ACL complete | Permissions tab complete | N/A | Complete |
| R-05 | Publish a validated revision and retain older revisions for rollback/audit. | Agreed design, 2026-08-23 | Published-version pointer and append-only revisions complete | Version status and publish action complete | N/A | Complete |
| R-06 | Archive/delete reports without weakening the generic file security policy. | User request, 2026-08-23 | Soft archive and report-specific storage complete | Confirmation workflow complete | N/A | Complete |
| R-07 | Discover and import Crystal reports already deployed under entity folders. | User request, 2026-08-23 | Authenticated catalog/source adapter and tenant import complete | Existing-report catalog/import dialog complete | N/A | Complete |
| R-08 | Make Countries and other entity report screens list and run the manager-owned published versions. | User request, 2026-08-23 | Published-version render query, Run ACL, and internal runtime adapter complete | Countries and States now use the managed catalog/render contract | N/A | Complete |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | The legacy Crystal API already discovers `.rpt` files and reads SummaryInfo title/subject. | `api/CrystalReportGeneratorApi/Helpers/CrystalReport/CrystalReportLister.cs`; `CrystalReportInfo.cs` | Source inspection |
| E-02 | Existing RDLX ReportTemplates are tenant-scoped JSON definitions and must remain a separate feature. | `api/HrManagementSystem.Domain/Analytics/ReportTemplates/Entities/ReportTemplate.cs` | Source inspection |
| E-03 | Generic file validation intentionally blocks the compound-document signature used by current `.rpt` files. | `api/HrManagementSystem.Application/Common/Settings/FileSettings.cs` | Source and file-header inspection |
| E-04 | The HR API stores opaque immutable revisions under the application content root and delegates SummaryInfo extraction to the Crystal runtime endpoint. The temporary stream is disposed before the atomic move to its final storage key. | `PrivateCrystalReportFileStorage.cs`; `CrystalReportInspectorClient.cs`; `InternalReportInspectorController.cs`; `CrystalReportFileStorageTests.cs` | Source inspection, regression test, and modern API build |
| E-05 | The browser manager exposes create, versions, downloads, publish, access grants, and archive through one guarded route. | `CrystalReportManagerPage.tsx`; `services.ts` | Type checks, lint, Vitest, and production build |
| E-06 | Existing legacy reports are discovered without exposing paths and are copied through the same inspection/private-storage pipeline. | `InternalReportCatalogController.cs`; `CrystalReportLegacySourceClient.cs`; `ImportDiscoveredCrystalReportCommandHandler` | Modern API build/tests and web contract tests |
| E-07 | Entity report screens send only a managed report ID, language, and bounded filters. The HR API resolves the current tenant-owned published RPT, enforces Run ACL, reads approved data from its own EF context, and passes an explicit-schema DataSet plus the source to an allowlisted Crystal rendering profile. | `RenderCrystalReportQueryHandler`; `CrystalReportDataSource`; `CrystalReportRendererClient`; `InternalReportRenderController`; `ManagedReportRuntime`; entity report pages | Modern and legacy builds, API data/client/controller tests, web service contract test |

## Read and list contract

The first manager list is server-owned and supports entity-key filtering, text search, lifecycle status, deterministic entity/display-name/ID ordering, explicit loading, retry, and empty states. The shared Grid footer is the only pagination control; the feature does not add a local pager.

## Grid and card contract

| Field | Grid | Card | Report | Sortable | Searchable | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Display name | Yes | Deferred | No | Yes | Yes | Ellipsis with accessible full text |
| Entity key | Yes | Deferred | No | Yes | Yes | Compact chip |
| Report key | Yes | Deferred | No | Yes | Yes | Monospace/technical text |
| Published version/status | Yes | Deferred | No | Yes | No | Status chip |
| Updated on | Yes | Deferred | No | Yes | No | Locale-formatted |

## Detail and write contract

Entity report selectors use `SummaryInfo.ReportTitle` as the Arabic name and `SummaryInfo.ReportSubject` as the English name. If the selected localized value is empty, the stable display/report key is the fallback.

Create requires entity key, optional description, and an initial `.rpt`; the user never enters a display name. The Crystal runtime reads `SummaryInfo.ReportTitle` and `ReportSubject` automatically, while the normalized file stem is the stable technical key/fallback. Existing reports may also be imported from the deployment-owned legacy `Reports` root using this fixed convention: every direct child folder is one entity (`Reports\\Countries`), its folder name is the source of the entity key (`Countries` becomes the canonical `countries` key), and only top-level `.rpt` files inside that entity folder are catalogued. Root-level reports and nested folders are ignored. A report filename must normalize to the entity key or begin with `<entity-key>-` (for example `Countries.rpt` and `Countries-WithStates.rpt`). The browser receives an opaque source ID and SHA-256 but never a file path; import re-resolves and hashes the source server-side, copies it into tenant-owned private storage, and creates draft version 1 through the same create pipeline. Entity/report keys are normalized server-side and unique per tenant. Upload creates an immutable revision; it never overwrites the published source. Publish/archive/access replacement require the latest row version. The server owns tenant, company, storage path, hash, and validation state. Report source files are private and downloadable only through authorized endpoints. Bulk actions, Card, Chart, and browser editing are excluded from v1 because they are not requested and would not improve the source-file workflow.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Bulk | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active/draft | View + report ACL | Create permission | Upload permission + ACL | Delete permission | N/A | Excluded | Mutations denied |
| Active/published | View + Run ACL | Create permission | Upload creates draft revision | Delete permission | N/A | Excluded | Run/download only when explicitly granted |
| Archived | Management permission | N/A | Denied | Idempotent archive | Deferred | Excluded | View history only |

## Integration register

The web management route belongs beside Users/Roles administration and requires `CrystalReports:ManageAccess`; the published-report catalog separately uses `CrystalReports:View`, and every mutation is additionally guarded by its specific permission. The API derives tenant/company from the authenticated actor and evaluates role grants from the database at request time. The browser talks only to the HR API; physical paths, tenant/company IDs, connection strings, SQL, and storage keys are never client inputs. Managed report data is selected by allowlisted EF providers in the HR API and sent to the Crystal host as an explicit-schema DataSet, so the managed path does not depend on the Crystal host's database connection string. EN/AR, RTL, keyboard focus, icon labels, loading/error states, and direct callback permission guards are required. Crystal runtime inspection/rendering remains an internal adapter boundary rather than a browser-to-legacy-API call.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | Resolved | The old public Crystal endpoints still accept caller-controlled report path/file values, but Countries and States no longer call them. Managed rendering accepts no path and is authorized by the HR API. | `RenderCrystalReportQueryHandler`; `InternalReportRenderController`; entity report pages | API | Keep legacy endpoints only for compatibility and retire them after remaining callers are migrated |
| F-02 | Medium | Deep `.rpt` parsing requires the legacy SAP Crystal runtime. | `InternalReportInspectorController.cs`; `CrystalReportInspectorClient.cs` | API | Resolved in source through an authenticated internal adapter; deployment must configure the shared secret |
| F-03 | Resolved | The legacy project previously fell back to Crystal `10.0.3300.0` from the GAC because its local SAP hint paths did not exist. Generated typed-report sources were removed and all managed Crystal references now resolve from the checked package set `13.0.4003`. | `CrystalReportGeneratorApi.csproj`; legacy MSBuild output | Legacy Crystal API | Debug/Release x64 builds pass; deployed physical reports remain server-owned |
| F-04 | High | Internal-key authentication is temporarily optional when the Crystal API has no `InternalApiKey` and `RequireInternalApiKey=false`. The HR API sends the key only when configured. | `InternalApiKeyAttribute.cs`; `CrystalReportInspectorClient.cs`; `CrystalReportLegacySourceClient.cs` | Deployment | Before production use, configure the same strong secret on both services and set `RequireInternalApiKey=true` |

## Runtime deployment contract

The manager does not read the legacy report filesystem directly. The HR API calls the deployed Crystal API at `CrystalReports:InspectorBaseUrl`. During the current opt-in transition, the Crystal API permits an unauthenticated internal request only when `InternalApiKey` is empty and `RequireInternalApiKey=false`; the HR API therefore omits the header when no key is configured. As soon as `InternalApiKey` has a value, every request must provide the matching value even while the require flag is false. Before production use, give both processes the same non-empty `CRYSTAL_REPORT_INTERNAL_API_KEY` and set `RequireInternalApiKey=true`. For local HR API development, use .NET user-secrets (`CrystalReports:InspectorApiKey`) or the environment variable; do not commit the value to `appsettings.json`. Deploy `InternalReportCatalogController`, `InternalReportInspectorController`, `InternalReportRenderController`, `ManagedReportRuntime`, and `InternalApiKeyAttribute` with the legacy service, then restart both services. The runtime currently has explicit schema profiles for `countries` and `states`; adding another Crystal-backed entity requires an allowlisted HR API data provider and matching Crystal schema profile before its published reports can run. A required-but-missing key, unreachable legacy service, rejected key, undeployed internal endpoint, oversized runtime DataSet, or invalid PDF response is reported by the public HR API as HTTP 503 rather than as an application defect (HTTP 500). An entity without an approved runtime profile returns a validation response instead of accepting SQL, paths, or connection details from the browser.

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation | `./documentation/system/Generate-Documentation.ps1 -Check` | Passed before implementation and after final reconciliation | `2026-08-23` |
| API | Modern API build; full test project; EF pending-model check | Passed: 0 warnings/errors, 300 tests including private-storage, managed-data, runtime-client, and controller contract coverage; no pending model changes | `2026-08-23` |
| Web | architecture check, focused ESLint, normal/strict TypeScript, full Vitest, production build | Feature boundary clean; 64 files/221 tests passed. Repository architecture check still reports unrelated pre-existing findings. | `2026-08-23` |
| Legacy Crystal API | Visual Studio MSBuild x64, Debug and Release | Passed after unifying Crystal package references on `13.0.4003`; physical reports stay on the host | `2026-08-23` |
| Mobile | N/A | Not requested in this implementation | `2026-08-23` |

## Final reconciliation

- [x] Every requested API/web requirement has evidence and a final status.
- [x] API and web serialize the same shared contract; mobile is explicitly out of scope.
- [x] Intentional platform differences are written down.
- [x] Known reference-feature gaps were not copied as requirements.
- [x] Draft required paths exist; final recipe registration remains deferred until the mobile decision and runtime deployment are reviewed.
- [x] Feature-focused and project-level API/web gates pass, with unrelated/pre-existing blockers recorded above.

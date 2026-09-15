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
| Mobile route | `N/A for manager administration; Countries consumes managed reports inside its existing route` |
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
| R-08 | Make Countries and other entity report screens list and run the manager-owned published versions. | User request, 2026-08-23 | Published-version render query, Run ACL, and internal runtime adapter complete | Countries and States use the managed catalog/render contract | Countries uses the shared authenticated catalog/render boundary with permission-aware composition | Complete |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | The Crystal runtime exposes path-safe deployment discovery and a separate dedicated `.rpt` inspection boundary. Catalog discovery performs bounded filesystem/signature/hash eligibility only; the managed import pipeline performs Crystal SDK inspection before private storage, reads SummaryInfo title/subject, and rejects saved data, subreports, missing managed parameters, or external database metadata. | `CrystalReportCatalogService.cs`; `CrystalReportInspectionService.cs`; `PrivateCrystalReportFileStorage.cs` | Reporting tests and x64 runtime build |
| E-02 | Existing RDLX ReportTemplates are tenant-scoped JSON definitions and must remain a separate feature. | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Domain/Analytics/ReportTemplates/Entities/ReportTemplate.cs` | Source inspection |
| E-03 | Generic file validation intentionally blocks the compound-document signature used by current `.rpt` files. | `api/Modules/Platform/ErpSystem.Modules.Platform.Contracts/Files/Settings/FileSettings.cs` | Source and file-header inspection |
| E-04 | The Reporting API stores opaque immutable revisions under the application content root and delegates SummaryInfo extraction to the Crystal runtime endpoint. The temporary stream is disposed before the atomic move to its final storage key. | `PrivateCrystalReportFileStorage.cs`; `CrystalReportInspectorClient.cs`; `InternalReportInspectorController.cs`; `CrystalReportFileStorageTests.cs` | Source inspection, regression test, and modern API build |
| E-05 | The browser manager exposes create, versions, downloads, publish, access grants, and archive through one guarded route. | `CrystalReportManagerPage.tsx`; `services.ts` | Type checks, lint, Vitest, and production build |
| E-06 | Deployment-owned reports are discovered without exposing paths and are copied through the same inspection/private-storage pipeline with source-id and SHA-256 revalidation. | `CrystalReportCatalogService.cs`; `CrystalReportDeploymentSourceClient.cs`; `ImportDiscoveredCrystalReportCommandHandler` | Reporting tests and Crystal runtime build |
| E-07 | Entity report screens send only a managed report ID, language, and bounded filters. The Reporting API resolves the published RPT, enforces Run ACL, resolves one explicit data provider, obtains business truth through owning-module Contracts, and passes an explicit-schema DataSet plus source to the Crystal runtime. | `RenderCrystalReportQueryHandler`; `CrystalReportDataSource`; `ReferenceDataCrystalReportProviders`; `CrystalReportRendererClient`; `CrystalReportProfileRegistry`; `CrystalReportRenderService`; entity report pages | Reporting tests, runtime build, and web service contract test |
| E-08 | Mobile Countries uses the same authenticated Reporting API catalog/render endpoints, hides Report mode without `CrystalReports:View`, repeats the component guard before querying, validates catalog rows with Zod, and persists only validated PDF bytes in temporary cache. | `mobile-react/src/platform/reporting`; `mobile-react/src/modules/hr/basic-data/countries/presentation/components/CountryReportView.tsx`; `mobile-react/src/modules/hr/basic-data/countries/presentation/reporting/country-report-api.ts`; `mobile-react/src/platform/auth/presentation/rbac/permissions.ts` | Mobile typecheck, architecture check, transport/authorization tests, and full Jest suite |

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

Entity report selectors use `SummaryInfo.ReportTitle` as the Arabic name and `SummaryInfo.ReportSubject` as the English name. If the selected localized value is empty, the stable display/report key is the fallback. Managed templates declare a `Language` parameter that the runtime sets to `ar` or `en`; localization and RTL/LTR presentation remain explicit Crystal Designer concerns rather than runtime object mutation.

Create requires entity key, optional description, and an initial `.rpt`; the user never enters a display name. The Crystal runtime reads `SummaryInfo.ReportTitle` and `ReportSubject` during the mandatory managed inspection before private storage, while the normalized file stem is the stable technical key/fallback. Existing reports may also be imported from the deployment-owned `Reports` root using this fixed convention: every direct child folder is one entity (`Reports\\Countries`), its folder name is the source of the entity key (`Countries` becomes the canonical `countries` key), and only top-level `.rpt` files inside that entity folder are catalogued. Root-level reports and nested folders are ignored. Catalog listing deliberately avoids SAP native inspection so discovery cannot consume render capacity; it verifies path/name/size/OLE signature/SHA eligibility, and the normal create pipeline performs the authoritative Crystal inspection during import. A report filename must normalize to the entity key or begin with `<entity-key>-` (for example `Countries.rpt` and `Countries-WithStates.rpt`). The browser receives an opaque source ID and SHA-256 but never a file path; import re-resolves and hashes the source server-side, copies it into tenant-owned private storage only after inspection, and creates draft version 1 through the same create pipeline. Entity/report keys use one lowercase hyphenated grammar and are unique per tenant. Upload creates an immutable revision; it never overwrites the published source. Publish/archive/access replacement require the latest SQL Server row version. The server owns tenant, company, storage path, hash, and validation state. Report source files are private and downloadable only through authorized endpoints. Bulk actions, Card, Chart, and browser editing are excluded from v1 because they are not requested and would not improve the source-file workflow.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Bulk | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active/draft | View + report ACL | Create permission | Upload permission + ACL | Delete permission | N/A | Excluded | Mutations denied |
| Active/published | View + Run ACL | Create permission | Upload creates draft revision | Delete permission | N/A | Excluded | Run/download only when explicitly granted |
| Archived | Management permission | N/A | Denied | Idempotent archive | Deferred | Excluded | View history only |

## Integration register

The web management route belongs beside Users/Roles administration and requires `CrystalReports:ManageAccess`; the published-report catalog separately uses `CrystalReports:View`, and every mutation is additionally guarded by its specific permission. The Reporting API derives tenant/company from the authenticated actor and evaluates role grants from the Platform database at request time. Browser and mobile consumers talk only to the versioned API; physical paths, tenant/company IDs, connection strings, SQL, storage keys, and the Crystal runtime URL are never client inputs. Managed report data is selected by registered `ICrystalReportDataProvider` adapters; business truth comes from the owning module through public Contracts/source boundaries, not cross-module DbContext access. The explicit-schema DataSet is then sent to the Crystal runtime, which has no ERP database connection. EN/AR, RTL, keyboard focus, icon labels, loading/error states, and direct callback permission guards are required. Crystal runtime inspection/catalog/rendering remains an internal server-to-server adapter boundary.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | Resolved | Caller-controlled public `report/info`, `report/generate`, and State-specific generation endpoints created a second data-access path inside the Crystal host. | Deleted public controllers/DB helpers; `RenderCrystalReportQueryHandler`; `InternalReportRenderController` | API | Removed the public path, browser API-key filter, runtime DB connection, SQL/view creation, and duplicated invoice QR endpoint. Managed Reporting is the only application path. |
| F-02 | Resolved | Deep `.rpt` parsing requires the SAP Crystal .NET Framework runtime. | `CrystalReportInspectionService.cs`; `CrystalReportInspectorClient.cs` | API | Isolated behind the internal runtime boundary instead of embedding SAP runtime dependencies in the .NET 10 modular monolith. |
| F-03 | Resolved | The runtime previously mixed HTTP controllers, filesystem catalog logic, Crystal SDK logic, business SQL, and unrelated QR behavior. | `Runtime/Inspection`; `Runtime/Catalog`; `Runtime/Rendering`; `CrystalReportGeneratorApi.csproj` | Crystal runtime | Runtime now has explicit internal services and only inspect/catalog/render responsibilities; obsolete DB/QR/CORS packages and source paths were removed. |
| F-04 | Resolved | Internal-key authentication was optional and could fail open when configuration drifted. | `InternalApiKeyAttribute.cs`; Reporting runtime clients | Deployment | The runtime is now fail-closed in every environment: a missing secret returns 503, an invalid/missing supplied key returns 401, duplicate key headers are rejected, and Reporting startup validation requires an effective key whenever `RuntimeBaseUrl` is configured. |
| F-05 | Resolved | The HR-to-Reporting ownership migration omitted runtime option binding, HttpClient BaseAddress/timeout configuration, and deployment discover/import handlers. | `DependencyInjection.cs`; `CrystalReportDeploymentSourceClient.cs`; Reporting commands/queries/controller | Reporting | Restored under Reporting ownership, bound `CrystalReports` options, configured typed clients, and added deployment source hash/permission tests. |
| F-06 | Resolved | Crystal execution had no complete production safety envelope around native execution, payload memory, datasource isolation, cleanup, readiness, and diagnostics. | Runtime execution gate, managed-source policy, bounded readers, request workspace, health endpoint, runtime diagnostics, Reporting clients/tests | Runtime + Reporting | Native SAP work is concurrency-gated; managed RPTs reject saved data/subreports/external connection metadata and allow only pushed ADO.NET XML; RPT/XML/PDF/catalog/inspection payloads are bounded; request temp directories are isolated and scavenged; readiness is deterministic; correlation and bounded operational logs are in place. |

## Runtime deployment contract

The manager never reads the deployment report filesystem directly. The Reporting API calls the deployed Crystal runtime at `CrystalReports:RuntimeBaseUrl` through typed HttpClients for inspection, deployment discovery/source copy, rendering, and readiness. The runtime has no authentication bypass: both processes require the same non-empty `CRYSTAL_REPORT_INTERNAL_API_KEY` (or a securely supplied `CrystalReports:RuntimeApiKey` on the Reporting side), and no secret belongs in committed configuration. Deploy the internal controllers plus runtime catalog/inspection/render services, execution gate, managed datasource policy, runtime settings, request workspace, diagnostics, correlation handler, and API-key filter, then restart both services. The runtime currently has explicit schema profiles for `countries`, `states`, `districts`, and `addresstypes`; every new reportable entity requires a registered Reporting data provider/owning-module source and matching runtime schema profile. Managed report definitions must use pushed ADO.NET XML data only, contain no saved data or subreports, and retain no database connection metadata. RPT/XML/PDF and runtime-response sizes are bounded, stale deployment hashes remain conflicts, and the internal readiness endpoint avoids unbounded SAP native initialization. The runtime worker must also be deployed without ERP SQL credentials/outbound database access. An entity without an approved provider/profile is rejected instead of accepting SQL, paths, connection details, tenant, or company from a client.

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation | `./documentation/system/Generate-Documentation.ps1 -Check` | Passed before implementation and after final reconciliation | `2026-08-23` |
| API | Modern API build; full test project; EF pending-model check | Passed: 0 warnings/errors, 300 tests including private-storage, managed-data, runtime-client, and controller contract coverage; no pending model changes | `2026-08-23` |
| Web | architecture check, focused ESLint, normal/strict TypeScript, full Vitest, production build | Feature boundary clean; 64 files/221 tests passed. Repository architecture check still reports unrelated pre-existing findings. | `2026-08-23` |
| Legacy Crystal API | Visual Studio MSBuild x64, Debug and Release | Passed after unifying Crystal package references on `13.0.4003`; physical reports stay on the host | `2026-08-23` |
| Mobile | `npm run check`; focused managed-report transport and authorization tests | Countries managed-report consumer passes typecheck, lint, architecture, and the full Jest suite | `2026-08-23` |

## Final reconciliation

- [x] Every requested API/web requirement and the applied mobile Countries consumer have evidence and a final status.
- [x] API, web, and mobile consumers serialize the same managed catalog/render contract.
- [x] Intentional platform differences are written down.
- [x] Known reference-feature gaps were not copied as requirements.
- [x] Draft required paths include the applied mobile reporting boundary; final recipe registration remains deferred until the four canonical books and runtime deployment are reviewed.
- [x] Feature-focused API/web/mobile gates pass, with unrelated/pre-existing blockers recorded above.

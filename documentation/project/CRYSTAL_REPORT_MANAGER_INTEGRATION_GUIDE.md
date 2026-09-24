# Crystal Report Manager Feature Integration Guide

Use this guide whenever a new feature needs printable Crystal reports. It defines
where report definitions come from, how they become available to a tenant/company,
and how API, web, and mobile clients run them without knowing a filesystem path or
database connection.

This is the canonical integration contract for managed `.rpt` reports. The
[Crystal Report Manager review artifact](../system/features/crystal-report-manager/CRYSTAL_REPORT_MANAGER-REVIEW-ARTIFACTS.md)
contains the implementation evidence and current verification record.
The phased plan for AI-assisted design-time SQL View/schema generation is
[AI Report View Designer Implementation Plan](../system/features/crystal-report-manager/AI_REPORT_VIEW_DESIGNER_PLAN.md).

## 1. Make the reporting decision first

Every feature review must record one of these decisions:

| Decision | Meaning |
| --- | --- |
| Required | The feature needs managed Crystal reports now and completes every integration step in this guide. |
| Deferred | Reports are expected later; record the missing dataset, template, permission, or deployment dependency. |
| Excluded | The feature has no printable-report workflow; record the reason. |

When the decision is `Required`, also record the reporting engine:

| Engine | Definition | Ownership |
| --- | --- | --- |
| Managed Crystal | Binary `.rpt` files, external Crystal editing, immutable versions, publish and per-report ACL | Crystal Report Manager |
| Server-managed browser templates | Editable RDLX JSON used by the browser designer/viewer | `ReportTemplates` / ActiveReports |

These are separate products. Do not mix their tables, feature keys, APIs,
permissions, lifecycle, designers, or source files. A feature may expose both only
when both have an explicit product requirement.

## 2. Source of truth and runtime flow

```text
Crystal host: Reports\<Entity>\<Entity>-<Variant>.rpt
          |
          | administrator discovers/imports
          v
Reporting API Report Manager: tenant-owned logical report + immutable versions
          |
          | publish one version + grant role rights for current company
          v
Feature report view: GET published catalog by entityKey
          |
          | POST report ID + language + bounded filters
          v
Reporting API: authorize -> resolve registered data provider -> resolve private RPT
          |
          | internal explicit-schema dataset + RPT
          v
Crystal runtime: validate entity schema profile -> render PDF
```

The browser or mobile app calls only the same-origin ERP API. It never calls the
Crystal host directly and never sends a report path, filename, SQL statement,
connection string, tenant ID, or company ID.

## 3. Identifiers, folders, and localized names

### Entity key

`entityKey` is the stable link between a business feature, the manager catalog,
the Reporting data provider, and the Crystal runtime schema profile. Use a
canonical lower-case key such as `countries`, `states`, or `employees`. Keep it
stable after reports have been imported.

The deployed Crystal source convention is:

```text
Reports\Countries\Countries.rpt
Reports\Countries\Countries-WithStates.rpt
```

Rules:

- `Reports` is the deployment-owned root;
- every direct child folder represents one entity;
- the folder name is canonicalized into `entityKey` (`Countries` -> `countries`);
- only top-level `.rpt` files inside that entity folder are discovered;
- root-level reports and nested directories are ignored;
- a normalized report file stem must equal the entity key or begin with
  `<entity-key>-`.

The file stem becomes the stable technical `reportKey`. Users select reports by
localized SummaryInfo, not by that technical key:

- Arabic name: `SummaryInfo.ReportTitle`;
- English name: `SummaryInfo.ReportSubject`;
- fallback: manager `displayName`, then the stable `reportKey`.

Set both SummaryInfo fields inside Crystal Reports before upload/import. They are
read automatically by the Crystal API; the manager form must not ask users to
retype them.

## 4. Manager lifecycle and permissions

The administration page is `/administration/crystal-reports`. It owns discovery,
import/upload, download for external editing, immutable version history, publish,
per-report access, and archive.

The lifecycle is:

1. Create by uploading an `.rpt`, or import an approved deployed source.
2. Store version 1 in tenant-private storage as a draft.
3. Uploading an edited report creates another immutable draft version; it never
   overwrites a prior or published file.
4. Publish one validated version.
5. Grant report rights to roles for the current company.
6. The feature catalog exposes only active, published reports the current user may
   run.

Coarse permissions are `CrystalReports:View`, `Create`, `Download`, `Upload`,
`Publish`, `ManageAccess`, and `Delete`. Per-report role rights are `Run`,
`Download`, `Upload`, `Publish`, and `ManageAccess`. The Reporting API derives tenant and
company from the authenticated session and evaluates access server-side. A client
must never send either scope identifier.

`RowVersion` is required for publish, access replacement, and archive. Clients
must surface a stale-write conflict and reload rather than silently retry with old
state.

## 5. Public Reporting API contract

All routes are below `/api/v1/crystal-reports`:

| Method and route | Consumer | Purpose |
| --- | --- | --- |
| `GET ?entityKey={key}&search={text}` | Feature viewer | Published reports allowed for the current user/company |
| `POST /{reportId}/render` | Feature viewer | Render the current published version as PDF |
| `GET /manage` | Manager | Paged tenant management list |
| `GET /manage/{reportId}` | Manager | Details, versions, and grants |
| `GET /deployment-candidates?entityKey={key}` | Manager | Discover approved deployment-owned `.rpt` sources |
| `POST /deployment-imports` | Manager | Copy a discovered source into private version storage |
| `POST` | Manager | Create from a multipart `.rpt` upload |
| `POST /{reportId}/versions` | Manager | Add an immutable version |
| `GET /{reportId}/download` | Manager/authorized user | Download the published source |
| `GET /{reportId}/versions/{versionId}/download` | Manager | Download one revision |
| `POST /{reportId}/versions/{versionId}/publish` | Manager | Publish with `RowVersion` |
| `GET`, `PUT /{reportId}/access` | Manager | Read/replace current-company role grants |
| `DELETE /{reportId}` | Manager | Soft archive with `RowVersion` |

Global Platform Super Admin geography uses a separate read-only boundary. It
never enters the tenant/company report store or evaluates a tenant Reporting
entitlement:

| Method and route | Consumer | Purpose |
| --- | --- | --- |
| `GET /api/v1/global-crystal-reports?entityKey={countries\|states\|districts}` | Platform Super Admin | List importable deployment-owned reports for one allow-listed global entity |
| `POST /api/v1/global-crystal-reports/{sourceId}/render` | Platform Super Admin | Render after exact source ID and SHA-256 revalidation |

The global boundary requires the `super_admin` role and
`GlobalCrystalReports:View`. The server obtains global Reference Data through
the owning module's reporting Contract, applies bounded allow-listed filters,
and rejects an unsupported entity, stale source hash, or unavailable runtime.
The browser and mobile clients receive only an opaque source ID and hash; they
never receive a deployment path, tenant/company identifier, or connection data.

Render body:

```json
{
  "language": "en",
  "filters": {
    "NameEn": "Egypt"
  }
}
```

Language is `ar` or `en`. The generic boundary accepts at most 16 safe filter keys
with values up to 200 characters; the feature data provider must apply a smaller
allowlist for the selected `entityKey`. Unknown or unsupported filters fail
validation instead of becoming dynamic SQL.

Deployment discovery is intentionally lighter than managed report validation.
The runtime catalog checks the approved entity-folder/name convention, bounded
file size, OLE signature, and SHA-256 identity without opening every candidate
through the SAP Crystal SDK. Import then re-resolves and re-hashes the selected
source and routes it through the same mandatory inspection/storage pipeline as a
direct upload. This keeps discovery responsive and prevents catalog browsing from
consuming native render/inspection execution slots without weakening the managed
report policy.

## 6. Adding Crystal reports to a new feature

The implemented runtime baseline currently supports `countries`, `states`,
`districts`, and `addresstypes`.
Use those profiles as evidence for the integration shape, but do not copy their
global reference-data scope into tenant/company-owned HR features.

### 6.1 Define the report contract

Before implementation, record:

- stable `entityKey` and allowed report file prefix;
- output row/table name and exact column names/types/nullability;
- allowed filter keys, matching rules, normalization, and maximum result size;
- required feature permission in addition to `CrystalReports:View` where needed;
- empty-result behavior and expected language/layout;
- whether reports are global, tenant-owned, or company-owned data.

For a global Platform feature, choose the global catalog/render boundary above,
register the entity in the server allow-list and runtime schema profile, and
record the Super Admin role plus `GlobalCrystalReports:View`. Do not add a
tenant ReportTemplate or `CrystalReports:View` gate to a global Reference Data
screen.

The report may format data, but it must not define data-access security. Tenant,
company, soft-delete, feature authorization, and filter rules belong in the owning
module source and the Reporting adapter.

### 6.2 Add the Reporting data provider

Add one `ICrystalReportDataProvider` implementation for the entity. The generic
resolver remains at
`api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/CrystalReportDataSource.cs`;
it must not grow a feature switch. Current ReferenceData examples live in
`ReferenceDataCrystalReportProviders.cs` and consume only the public
`IReferenceDataReportingSource` contract.

The profile must:

- declare one stable `entityKey` and reject duplicate provider registration;
- obtain business data from the owning module through its public Contracts/source
  boundary rather than another module's DbContext;
- enforce tenant/company and feature visibility from trusted server context in the
  owning source;
- exclude archived rows according to the documented report contract;
- apply only approved filters and deterministic ordering;
- project only the documented report columns;
- emit one explicit-schema `ReportData` table;
- honor `CancellationToken` and enforce a bounded result size.

Every new reportable capability follows this provider pattern. Do not replace the
allowlist with reflection, arbitrary table names, user SQL, direct cross-module
DbContext access, or a client-supplied connection string.

### 6.3 Add the Crystal runtime schema profile

Add the matching `entityKey` and required column set to
`api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportProfileRegistry.cs`.
`CrystalReportRenderService` validates that profile before binding data to the
report. The Reporting provider columns and Crystal runtime profile must remain
identical.

The Crystal runtime receives a private source stream and explicit-schema data from
the Reporting API. It does not decide tenant/company scope and does not connect to
the ERP database.

Every managed `.rpt` must also declare a Crystal parameter named `Language`.
Inspection rejects templates that omit it, and render sets it to the already
validated `ar` or `en` request value. The template may use that parameter in
formulas, labels, visibility rules, or section formatting. The runtime does not
rewrite report objects, mirror coordinates, inject generic formulas, or save
layout changes during rendering; visual behavior remains owned by the `.rpt`
created in SAP Crystal Reports Designer.

### 6.4 Prepare and publish report files

1. Create the entity folder under the deployed Crystal `Reports` root.
2. Name every `.rpt` with the entity prefix.
3. Bind the report to the approved `ReportData` schema.
4. Add the required string parameter `Language`; design the RPT itself to react to
   `ar` / `en` when localized layout or labels are required.
5. Set SummaryInfo Title (Arabic) and Subject (English).
6. Deploy the Crystal host changes needed for the new runtime profile.
7. Import the candidate through Report Manager.
8. Publish the intended version.
9. Assign `Run` and any additional rights to the correct roles/company.
10. Sign out and back in only when coarse role claims changed; per-report grants are
   evaluated by the API from current persisted access.

Never create a database connection inside a managed report definition or expose
the deployment path to a client.

The managed runtime currently accepts one pushed-data report shape only:

- the report datasource must be Crystal `ADO.NET (XML)` using `crdb_adoplus.dll`;
- the report must contain no saved data;
- the report must declare the managed `Language` parameter;
- server name, database name, user name, password, and integrated-security
  metadata must be absent;
- subreports are not supported. A report that requires a subreport is rejected at
  inspection and is checked again immediately before render.

These rules are deliberate isolation boundaries, not compatibility limitations to
work around. If subreports are needed later, add an explicit pushed-data binding
contract for every subreport before enabling them; never fall back to a Crystal
database login.

## 7. Web feature integration

Use `useManagedReportAvailability`, `crystalReportService`, and
`ManagedCrystalReportView` from the public Reporting exports at
`web-next/src/modules/reporting/public`. The lower-level `ReportViewer` comes
from `web-next/src/shared/reporting`; scope and authorization remain owned by
the public boundary:

- tenant reports use `crystalReportService.listPublished(entityKey)` and
  `crystalReportService.render(reportId, { language, filters })`;
- global Reference Data reports use `crystalReportService.listGlobal(entityKey)`
  and `crystalReportService.renderGlobal(report, { language, filters })`;
- `useManagedReportAvailability('tenant')` requires
  `CrystalReports:View` plus an accessible `reporting` module;
- `useManagedReportAvailability('global')` requires `super_admin` plus
  `GlobalCrystalReports:View` and never queries tenant entitlements;
- shared `ReportViewer` for the PDF workflow.

Use a stable scope-aware query key:

```ts
["crystal-reports", scope, entityKey]
```

Build the report selector from the manager response. For RTL/Arabic use
`summaryTitle`; for English use `summarySubject`; then fall back to `displayName`
or `reportKey`. Keep the full selected catalog item in the view so the render
contract remains scope-aware:

- tenant scope calls `crystalReportService.render(selectedReport.id, {
  language, filters })`; the selected report ID is used in the tenant route and
  the body contains only the language and feature-approved filters;
- global scope calls `crystalReportService.renderGlobal(selectedReport, {
  language, filters })`; the service derives the global route source ID from the
  selected catalog item and sends its `entityKey` and `rowVersion` as
  `expectedSha256`, followed by the language and approved filters in the body.

Clients never invent report paths, source IDs, hashes, or filenames.

When Report is an `AppMultiView` view, configure it as a non-list surface: it owns
no list pagination and must be able to render before list rows exist. The current
pattern is `paginate: false` and `renderWhenEmpty: true` where those options are
available.

The Report option is hidden while the scope gate is loading or denied. If an
already-selected Report loses authorization, the feature returns to Grid and
rejects the view change. `ManagedCrystalReportView` repeats the guard and passes
`enabled: false` to React Query while loading or denied, so direct routes and
stale UI state cannot call a catalog or render endpoint.

The retired public `report/info` and `report/generate` endpoints no longer exist.
Managed reports never send `ReportPath`, `ReportFileName`, or
`NEXT_PUBLIC_REPORT_API_URL`.

## 8. Mobile feature integration

Mobile must use the same Reporting API published catalog and render endpoint as web. The
first mobile Crystal consumer (Countries) introduced the shared reporting
boundary; every other feature consumes reports only through its curated public
API at `mobile-react/src/platform/reporting`:

- `crystalReportsApi.listPublished(entityKey)` parses
  `GET /api/v1/crystal-reports?entityKey={key}` with
  `publishedCrystalReportsSchema`;
- `crystalReportsApi.render(reportId, { language, filters })` posts the same JSON
  body as web and returns the raw PDF bytes. It uses an authenticated axios
  request with `responseType: 'arraybuffer'`, a dedicated long timeout, an
  `application/pdf` accept header, and stays allowed while the tenant is
  read-only because rendering is a read workflow;
- Zod contracts live beside the service; features must not re-declare or loosen
  them;
- the mobile permission catalog must include `CrystalReports:View`. Feature
  composition hides Report mode without that permission, and the report component
  repeats the guard before mounting a catalog query.
- global Platform geography uses `crystalReportsApi.listGlobal(entityKey)` and
  `renderGlobal(sourceId, { entityKey, expectedSha256, language, filters })`.
  Its screen is already Super Admin-scoped, so it does not require a tenant
  Reporting entitlement or the tenant `CrystalReports:View` claim; the API still
  enforces the role and `GlobalCrystalReports:View` permission.

The business feature keeps one stable query key such as

```ts
["countries", "reports", "catalog"]
```

and owns only:

- its `entityKey`;
- localized report selection (Arabic uses `summaryTitle`, English uses
  `summarySubject`, falling back to `displayName`);
- allowed filter controls;
- PDF loading/error/empty/open/share experience.

There is no static default report on mobile. An empty published catalog renders
a localized info state, and a catalog failure renders a warning with Retry; the
view never fabricates a fallback report entry.

The feature persists rendered bytes without changing the contract: native builds
validate the `%PDF-` signature, write to sensitive temporary cache, print/preview
through Expo Print, share through Expo Sharing, and dispose best-effort; web
builds wrap the bytes into an object URL for open/download and revoke it on
dispose.

The retired public `report/info` and `report/generate` endpoints and browser
`X-ApiKey` flow are not part of the runtime contract. Mobile never sends
`ReportPath`/`ReportFileName` or uses `EXPO_PUBLIC_REPORT_API_URL`; managed reports
need only the authenticated ERP API URL.

The shared mobile transport test must assert the exact feature `entityKey`,
catalog schema failure, render endpoint/body, PDF response type, long timeout,
read-only allowance, and authenticated Reporting API boundary. Feature tests separately
cover localized display-name selection and approved filter mapping.

The report view is independent from the table/card page and must not render its own
pagination. Never call the Crystal host, pass a filesystem path, or embed a
connection string from React Native.

## 9. Deployment contract

The Reporting API calls the Crystal service configured by
`CrystalReports:RuntimeBaseUrl`. Inspection, deployment discovery, and rendering are
internal adapter endpoints. For production, configure the same strong
`CRYSTAL_REPORT_INTERNAL_API_KEY` in both services. The runtime is fail-closed:
there is no development bypass flag, and a configured `RuntimeBaseUrl` without an
effective API key fails Reporting startup validation. Do not commit the key.

The runtime safety ceilings are intentionally bounded: an `.rpt` and the pushed
XML dataset are each limited to 10 MiB; rendered PDF output defaults to 50 MiB;
the deployment catalog defaults to 1,000 entries. Response bodies are bounded
while streaming, including chunked responses without `Content-Length`. The public
upload boundary enforces its request size before model binding, and IIS keeps a
separate request-size ceiling above the combined default RPT + XML payload.

`GET /internal/reports/health` is an authenticated, deterministic readiness probe.
It verifies configuration, managed profiles, Crystal engine assembly presence,
and writable temporary storage, but deliberately does not instantiate
`ReportDocument`: SAP native initialization can block and must never make the
health endpoint itself unbounded. Real inspect/render calls remain protected by
the global Crystal execution gate.

Runtime operational events are written to a bounded rolling log under
`App_Data/Logs` (with a worker-temp fallback). Records contain only operation,
stable result code, correlation ID, and exception type. They never log report
data, report paths, API keys, connection metadata, or exception messages.

IIS denies direct static serving of `.rpt` files. Deployment sources are available
only through the authenticated source-id + expected-SHA256 endpoint. The runtime
does not own public logo/localization asset folders; branding and localized layout
belong to the managed `.rpt` and its explicit `Language` parameter.

As a deployment defense in depth, the Crystal worker identity/network segment must
have no ERP SQL credentials and no outbound database access. The runtime needs
only the internal HTTP path from the ERP host, its controlled report/storage
folders, temporary storage, and the installed SAP Crystal runtime.

Adding a new entity runtime profile requires deploying both the Reporting data
provider/owning-module source and the Crystal runtime schema profile. Report content itself is then
imported/versioned/published through Report Manager. An unreachable runtime or
internal authentication/configuration failure is a service-availability failure;
an unknown entity/filter/schema is a validation/unsupported-contract failure.

## 10. Verification matrix

API tests must prove:

- published catalog isolation by tenant/company, role, `entityKey`, lifecycle, and
  `Run` right;
- management and per-report permission enforcement;
- allowed filters, rejected filters, scope, soft-delete, deterministic order, and
  empty datasets;
- exact dataset table/column schema and nullability;
- unsupported entity/profile behavior;
- rejection of saved-data, external-connection, and subreport `.rpt` definitions;
- bounded RPT, XML, catalog, inspection, and rendered-PDF payload handling;
- stale deployment source/hash conflict preservation;
- runtime correlation propagation, fail-closed internal authentication, and
  readiness behavior;
- render adapter timeout/failure mapping and valid PDF response;
- immutable versions, publish concurrency, access replacement, and archive.

Client tests must prove:

- the catalog uses the exact `entityKey`;
- Arabic selects Title and English selects Subject with documented fallbacks;
- only report ID, language, and approved filters are sent;
- loading, empty, permission, catalog failure, render failure, and retry states;
- the report view has no list pagination;
- no direct Crystal-host URL/path contract exists.

Run the normal API, web/mobile, and documentation quality gates after the focused
tests.

## 11. Definition of done

A feature's managed Crystal reporting is complete only when:

- [ ] the review records Required/Deferred/Excluded and the chosen engine;
- [ ] one stable `entityKey` is used by folder, manager, dataset, runtime, and client;
- [ ] report columns and filter allowlist are documented;
- [ ] Reporting data provider and Crystal runtime profiles match;
- [ ] SummaryInfo Title and Subject provide Arabic and English names;
- [ ] at least one validated version is imported/uploaded and published;
- [ ] current-company role grants include `Run` for intended users;
- [ ] web/mobile uses the shared Reporting API catalog/render contract;
- [ ] tenant/company, lifecycle, permission, concurrency, and failure tests pass;
- [ ] both services are deployed/configured when runtime code changed;
- [ ] the feature documentation links to this guide and records evidence.

Do not mark a report view complete because an `.rpt` exists on disk. It is
available to a feature only after the manager owns a published version, access is
granted, and both allowlisted runtime profiles support its `entityKey`.

## 12. Implementation anchors

- Public controller:
  `api/Modules/Reporting/ErpSystem.Modules.Reporting.Presentation/Features/Analytics/CrystalReports/V1/CrystalReportsController.cs`
- Application contracts and handlers:
  `api/Modules/Reporting/ErpSystem.Modules.Reporting.Application/Features/Analytics/CrystalReports`
- Dataset provider:
  `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/CrystalReportDataSource.cs`
- Entity data providers:
  `api/Modules/Reporting/ErpSystem.Modules.Reporting.Infrastructure/Features/Analytics/CrystalReports/Persistence/ReferenceDataCrystalReportProviders.cs`
- Internal runtime profile:
  `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportProfileRegistry.cs`
- Internal runtime renderer:
  `api/CrystalReportGeneratorApi/Runtime/Rendering/CrystalReportRenderService.cs`
- Managed datasource isolation policy:
  `api/CrystalReportGeneratorApi/Runtime/CrystalReportManagedSourcePolicy.cs`
- Runtime limits, execution gate, request workspace, and diagnostics:
  `api/CrystalReportGeneratorApi/Runtime/CrystalReportRuntimeSettings.cs`,
  `api/CrystalReportGeneratorApi/Runtime/CrystalReportExecutionGate.cs`,
  `api/CrystalReportGeneratorApi/Runtime/CrystalReportRequestWorkspace.cs`, and
  `api/CrystalReportGeneratorApi/Runtime/CrystalRuntimeDiagnostics.cs`
- Internal deployment catalog:
  `api/CrystalReportGeneratorApi/Runtime/Catalog/CrystalReportCatalogService.cs`
- Internal render adapter:
  `api/CrystalReportGeneratorApi/Controllers/InternalReportRenderController.cs`
- Web routes and Reporting module service:
  `web-next/src/config/api/crystalReports.ts` and
  `web-next/src/modules/reporting/crystal-report-manager/services.ts`
- Applied web consumers:
  `web-next/src/modules/hr/basic-data/geographical-information/countries/reports` and
  `web-next/src/modules/hr/basic-data/geographical-information/states/reports`
- Mobile shared service and schemas:
  `mobile-react/src/platform/reporting/data/remote/crystal-report-remote-data-source.ts` and
  `mobile-react/src/platform/reporting/data/remote/crystal-report-schemas.ts`
- Applied mobile consumer:
  `mobile-react/src/modules/reference-data/geography/countries/presentation/components/CountryReportView.tsx`
- Manager administration page:
  `web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx`

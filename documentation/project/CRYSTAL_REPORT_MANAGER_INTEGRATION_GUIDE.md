# Crystal Report Manager Feature Integration Guide

Use this guide whenever a new feature needs printable Crystal reports. It defines
where report definitions come from, how they become available to a tenant/company,
and how API, web, and mobile clients run them without knowing a filesystem path or
database connection.

This is the canonical integration contract for managed `.rpt` reports. The
[Crystal Report Manager review artifact](../system/features/crystal-report-manager/CRYSTAL_REPORT_MANAGER-REVIEW-ARTIFACTS.md)
contains the implementation evidence and current verification record.

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
HR API Report Manager: tenant-owned logical report + immutable versions
          |
          | publish one version + grant role rights for current company
          v
Feature report view: GET published catalog by entityKey
          |
          | POST report ID + language + bounded filters
          v
HR API: authorize -> build allowlisted EF dataset -> resolve private RPT
          |
          | internal explicit-schema dataset + RPT
          v
Crystal runtime: validate entity schema profile -> render PDF
```

The browser or mobile app calls only the same-origin HR API. It never calls the
Crystal host directly and never sends a report path, filename, SQL statement,
connection string, tenant ID, or company ID.

## 3. Identifiers, folders, and localized names

### Entity key

`entityKey` is the stable link between a business feature, the manager catalog,
the HR API dataset provider, and the Crystal runtime schema profile. Use a
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
`Download`, `Upload`, `Publish`, and `ManageAccess`. The HR API derives tenant and
company from the authenticated session and evaluates access server-side. A client
must never send either scope identifier.

`RowVersion` is required for publish, access replacement, and archive. Clients
must surface a stale-write conflict and reload rather than silently retry with old
state.

## 5. Public HR API contract

All routes are below `/api/v1/crystal-reports`:

| Method and route | Consumer | Purpose |
| --- | --- | --- |
| `GET ?entityKey={key}&search={text}` | Feature viewer | Published reports allowed for the current user/company |
| `POST /{reportId}/render` | Feature viewer | Render the current published version as PDF |
| `GET /manage` | Manager | Paged tenant management list |
| `GET /manage/{reportId}` | Manager | Details, versions, and grants |
| `GET /legacy-candidates?entityKey={key}` | Manager | Discover approved deployed `.rpt` sources |
| `POST /legacy-imports` | Manager | Copy a discovered source into private version storage |
| `POST` | Manager | Create from a multipart `.rpt` upload |
| `POST /{reportId}/versions` | Manager | Add an immutable version |
| `GET /{reportId}/download` | Manager/authorized user | Download the published source |
| `GET /{reportId}/versions/{versionId}/download` | Manager | Download one revision |
| `POST /{reportId}/versions/{versionId}/publish` | Manager | Publish with `RowVersion` |
| `GET`, `PUT /{reportId}/access` | Manager | Read/replace current-company role grants |
| `DELETE /{reportId}` | Manager | Soft archive with `RowVersion` |

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

## 6. Adding Crystal reports to a new feature

The implemented runtime baseline currently supports `countries` and `states`.
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

The report may format data, but it must not define data-access security. Tenant,
company, soft-delete, feature authorization, and filter rules belong in the HR API
query.

### 6.2 Add the HR API dataset profile

Extend the allowlisted `ICrystalReportDataSource` implementation at
`api/HrManagementSystem.Infrastructure/Features/Analytics/CrystalReports/Persistence/CrystalReportDataSource.cs`.

The profile must:

- switch/resolve only a known `entityKey`;
- query through the HR API `ApplicationDbContext` with `AsNoTracking()`;
- enforce tenant/company and feature visibility from trusted server context;
- exclude archived rows according to the documented report contract;
- apply only approved filters and deterministic ordering;
- project only the documented report columns;
- emit one explicit-schema `ReportData` table;
- honor `CancellationToken` and enforce a bounded result size.

If the registry grows, extract one feature-owned provider per entity behind the
same interface. Do not replace the allowlist with reflection, arbitrary table
names, user SQL, or a client-supplied connection string.

### 6.3 Add the Crystal runtime schema profile

Add the matching `entityKey` and required column set to
`api/CrystalReportGeneratorApi/Helpers/CrystalReport/ManagedReportRuntime.cs`.
The runtime validates that profile before binding data to the report. The HR API
dataset columns and Crystal profile must remain identical.

The Crystal runtime receives a private source stream and explicit-schema data from
the HR API. It does not decide the tenant/company or connect to the HR database.

### 6.4 Prepare and publish report files

1. Create the entity folder under the deployed Crystal `Reports` root.
2. Name every `.rpt` with the entity prefix.
3. Bind the report to the approved `ReportData` schema.
4. Set SummaryInfo Title (Arabic) and Subject (English).
5. Deploy the Crystal host changes needed for the new runtime profile.
6. Import the candidate through Report Manager.
7. Publish the intended version.
8. Assign `Run` and any additional rights to the correct roles/company.
9. Sign out and back in only when coarse role claims changed; per-report grants are
   evaluated by the API from current persisted access.

Never create a database connection inside a managed report definition or expose
the deployment path to a client.

## 7. Web feature integration

Use the shared exports from `web-next/src/features/reporting`:

- `crystalReportService.listPublished(entityKey)`;
- `crystalReportService.render(reportId, { language, filters })`;
- shared `ReportViewer` for the PDF workflow.

Use a stable query key:

```ts
["crystal-reports", "published", entityKey]
```

Build the report selector from the manager response. For RTL/Arabic use
`summaryTitle`; for English use `summarySubject`; then fall back to `displayName`
or `reportKey`. Keep the selected report ID in the view and send only that ID,
`ar`/`en`, and feature-approved filters to `render`.

When Report is an `AppMultiView` view, configure it as a non-list surface: it owns
no list pagination and must be able to render before list rows exist. The current
pattern is `paginate: false` and `renderWhenEmpty: true` where those options are
available.

Do not use the legacy public `report/info` or `report/generate` endpoints,
`ReportPath`, `ReportFileName`, or `NEXT_PUBLIC_REPORT_API_URL` for managed reports.

## 8. Mobile feature integration

Mobile must use the same HR API published catalog and render endpoint as web. The
first mobile Crystal consumer (Countries) introduced the shared reporting
boundary; every other feature consumes reports only through its curated public
API at `mobile-react/src/features/reporting`:

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

Do not use the legacy public `report/info` or `report/generate` endpoints, the
`X-ApiKey` header, `ReportPath`/`ReportFileName` payloads, or
`EXPO_PUBLIC_REPORT_API_URL` for managed reports. Remove that legacy variable and
its helpers once no unmanaged mobile consumer remains; managed reports need only
the authenticated HR API URL.

The shared mobile transport test must assert the exact feature `entityKey`,
catalog schema failure, render endpoint/body, PDF response type, long timeout,
read-only allowance, and authenticated HR API boundary. Feature tests separately
cover localized display-name selection and approved filter mapping.

The report view is independent from the table/card page and must not render its own
pagination. Never call the Crystal host, pass a filesystem path, or embed a
connection string from React Native.

## 9. Deployment contract

The HR API calls the Crystal service configured by
`CrystalReports:InspectorBaseUrl`. Inspection, discovery, and rendering are
internal adapter endpoints. For production, configure the same strong
`CRYSTAL_REPORT_INTERNAL_API_KEY` in both services and set
`RequireInternalApiKey=true` on the Crystal service. Do not commit the key.

Adding a new entity runtime profile requires deploying both the HR API dataset
profile and the Crystal API schema profile. Report content itself is then
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
- [ ] HR API data and Crystal runtime profiles match;
- [ ] SummaryInfo Title and Subject provide Arabic and English names;
- [ ] at least one validated version is imported/uploaded and published;
- [ ] current-company role grants include `Run` for intended users;
- [ ] web/mobile uses the shared HR API catalog/render contract;
- [ ] tenant/company, lifecycle, permission, concurrency, and failure tests pass;
- [ ] both services are deployed/configured when runtime code changed;
- [ ] the feature documentation links to this guide and records evidence.

Do not mark a report view complete because an `.rpt` exists on disk. It is
available to a feature only after the manager owns a published version, access is
granted, and both allowlisted runtime profiles support its `entityKey`.

## 12. Implementation anchors

- Public controller:
  `api/HrManagementSystem.Api/Features/Analytics/CrystalReports/V1/CrystalReportsController.cs`
- Application contracts and handlers:
  `api/HrManagementSystem.Application/Features/Analytics/CrystalReports`
- Dataset provider:
  `api/HrManagementSystem.Infrastructure/Features/Analytics/CrystalReports/Persistence/CrystalReportDataSource.cs`
- Internal runtime profile:
  `api/CrystalReportGeneratorApi/Helpers/CrystalReport/ManagedReportRuntime.cs`
- Internal render adapter:
  `api/CrystalReportGeneratorApi/Controllers/InternalReportRenderController.cs`
- Web routes and shared service:
  `web-next/src/config/api/crystalReports.ts` and
  `web-next/src/features/reporting/crystal-report-manager/services.ts`
- Applied web consumers:
  `web-next/src/features/basic-data/geographical-information/countries/reports` and
  `web-next/src/features/basic-data/geographical-information/states/reports`
- Mobile shared service and schemas:
  `mobile-react/src/features/reporting/crystal-reports/crystal-report-api.ts` and
  `mobile-react/src/features/reporting/crystal-reports/crystal-report-schemas.ts`
- Applied mobile consumer:
  `mobile-react/src/features/basic-data/countries/components/CountryReportView.tsx`
- Manager administration page:
  `web-next/src/features/reporting/crystal-report-manager/CrystalReportManagerPage.tsx`

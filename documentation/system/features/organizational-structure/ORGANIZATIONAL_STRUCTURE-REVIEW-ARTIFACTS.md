# Organizational Structure Review Artifacts

Use this file as the evidence ledger for one feature. Replace every bracketed value. Mark a row `N/A` only with a written reason.

## Metadata

| Field | Value |
| --- | --- |
| Feature | `organizational-structure` |
| API route | `/api/v1/organizational-structure/{resource}` |
| Web route | `/basic-data/organizational-structure/{branches|departments|divisions|job-titles|job-levels|positions|job-descriptions}` |
| Mobile route | `/basic-data/organizational-structure/{branches|departments|divisions|job-titles|job-levels|positions|job-descriptions}` |
| Review owner | `HR Management System maintainers` |
| Review date | `2026-08-30` |
| Implementation request | `documentation/system/features/organizational-structure/IMPLEMENTATION-REQUEST.md` |
| Required-file manifest | `documentation/system/features/organizational-structure/required-files.json` |
| Operating mode | `existing Domain foundation promoted to a complete feature` |
| Documentation state | `Final canonical books, required-file manifest, registered recipes, and generated phase packets |
| Applied reference | `states` |
| Import decision | `Required` |
| Import platforms | `Web and mobile` |
| Import format | `XLSX, exact resource headers, max 100 rows/5 MiB` |
| Reporting decision | `Required` |
| Reporting engine | `Managed Crystal published catalog` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Current-company organizational directories use trusted tenant/company scope. | `CompanyAuditableEntity`, `ICurrentActor`, `ApplicationDbContext` filters | Required | Required | Required | Frozen |
| R-02 | Branch, Department, Division, JobTitle, JobLevel, Position, and JobDescription are persisted and manageable. | Existing Domain entities plus Odoo 19 `res.company`, `hr.department`, and `hr.job` review | Required | Required | Required | Frozen |
| R-03 | Department hierarchy prevents cycles and every relationship stays inside the active current-company chain. | Odoo 19 department constraint and local parent-dependent States pattern | Required | Required | Required | Frozen |
| R-04 | JobDescription is a versioned Position child with immutable approved content and explicit decisions. | `JobDescription` review and Odoo 19 job description baseline | Required | Required | Required | Frozen |
| R-05 | Server list, lifecycle, permissions, realtime, EN/AR, RTL, and responsive feedback follow the applied States architecture. | States required-file manifest and four canonical books | Required | Required | Required | Frozen |

## Platform capability decisions

Use `Required`, `Deferred`, or `Excluded` exactly as defined in
`documentation/system/README.md`. A Deferred capability requires an owner and
reopening trigger; an Excluded capability must have no reachable placeholder or
unused runtime implementation.

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Grid/Table | Required | Required | Required | Current resource, server-filtered and paged | Primary management surface. |
| Cards | Required | Required | Required | Same authoritative server page and criteria | Responsive alternative using shared card scaffolds. |
| Chart | Required | Required | Required | Authoritative matching total plus current-page relationship/status series | Operational summary; labels must state page scope. |
| Report | Required | Required | Required | Current-company managed-Crystal catalog per resource | Report Manager owns publication and ACL. |
| Import | Required | Required | Required | Atomic resource bulk endpoint with active-code lookups | HR data governance owns workbook and duplicate policy. |
| Export | Excluded | Excluded | Excluded | N/A | No approved business requirement; no placeholder action. |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | The existing folder contains seven organizational directory entities plus Company and CompanyCountry. | `api/HrManagementSystem.Domain/OrganizationalStructure` | Source inspection and Graphify query. |
| E-02 | JobDescription is a Position-scoped version with explicit approval/rejection lifecycle. | `api/HrManagementSystem.Domain/OrganizationalStructure/Entities/JobDescription.cs` | Source inspection and focused domain tests. |
| E-03 | All seven organizational resources are persisted with composite company-scoped relationships. | `ApplicationDbContext`, OrganizationalStructure configurations, migration | API build and model tests. |
| E-04 | Odoo 19 uses a recursive Department tree and rejects cycles. | Odoo 19 `addons/hr/models/hr_department.py` | Official source review, 2026-08-30. |
| E-05 | Odoo 19 keeps description, requirements, headcount, department, and company on `hr.job`. | Odoo 19 `addons/hr/models/hr_job.py` | Official source review, 2026-08-30. |

## Read and list contract

API pages are one-based and clients are zero-based. Page size is 1-500 with client defaults 10 web and 5 mobile. Resources are `branches`, `departments`, `divisions`, `job-titles`, `job-levels`, `positions`, and `job-descriptions`. Search fields are `all`, `nameAr`, `nameEn`, `code`, and `parent`; operators are contains, doesNotContain, equals, doesNotEqual, startsWith, and endsWith. Status is active/archived/all for directories and Draft/Approved/Rejected/Expired for job descriptions. Sort allow-list is nameEn/nameAr/code/parent/createdOn with Id tie-break. Initial loading replaces content; background fetch preserves it with non-destructive progress; empty, no-results, error, and retry are shared states.

## Grid and card contract

| Field | Grid | Card | Report | Sortable | Searchable | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Resource kind | Yes | Yes | Yes | No | No | Selector collapses to full width on narrow screens. |
| Arabic/English name or title | Yes | Yes | Yes | Yes | Yes | Locale-primary value appears first; both remain visible. |
| Code/version | Yes | Yes | Yes | Yes | Yes | LTR token presentation inside RTL layouts. |
| Parent relationship | Yes | Yes | Yes | Yes | Yes | Localized parent label; selectors contain only active valid parents. |
| Status | Yes | Yes | Yes | No | No | Shared status badge with text in addition to color. |
| Resource-specific metrics | Yes | Yes | Yes | No | No | Headcount, level order, salary range, and description status appear only where meaningful. |

## Detail and write contract

Create/detail/edit use resource-specific typed contracts behind the feature service. Codes/currency/version are uppercase and strings are trimmed. Duplicate codes and same-language names are case-insensitive in the current company and parent scope. Department parent changes reject cycles; Division requires an active Department; Position requires active Division, JobTitle, and JobLevel; JobDescription requires an active Position. Shared web/mobile forms keep submit enabled, validate on submit, render field errors below inputs, focus the first error, protect dirty exit, and map stable API field errors. Archive rejects active children/dependents and restore requires active parents. Bulk actions are Excluded for this release.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Bulk | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active directory | View permission | Create permission | Edit permission | Delete permission plus no active dependents | N/A | Excluded | All mutations blocked |
| Archived directory | View permission | N/A | Hidden | N/A | Delete permission plus active parents | Excluded | All mutations blocked |
| Draft JobDescription | View permission | Create permission | Edit permission | Delete permission | N/A | Approve permission for approve/reject | All mutations blocked |
| Approved JobDescription | View permission | New revision only | Immutable | Delete blocked while effective | N/A | Expire/supersede through domain action | All mutations blocked |

## Integration register

Register API routes, permissions, persistence configurations, DI ports, mapping, scheduler, and localization together. Web owns one thin App Router page per entity, feature service/hooks/types/components, one navigation leaf per entity, `organizationalStructureKeys.all`, and realtime resource `organizational-structure`. Mobile owns one guarded Expo route per entity, runtime Zod schemas, API/query layer, native screen/form/cards/chart/report/import, the same realtime prefix, and notification deep-link mapping. All visible strings are paired EN/AR and shared components own RTL, keyboard/touch targets, loading, empty/error states, form focus, confirmation, and pagination. Report and Import are reachable through the shared multi-view selector; Export has no placeholder.

## Import contract

Complete this section independently for API, web, and mobile. The current
implementation is Required and follows the reviewed States import discipline.

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | `Required on API, web, and mobile; follows the States import workflow with resource-specific dependency columns.` |
| Platforms and format | `Both clients; XLSX first worksheet with exact ordered headers.` |
| Parsing ownership | `Shared excelService on web and native-spreadsheet on mobile.` |
| Template and parsing | `nameAr,nameEn,code; dependent resources add parentCode; positions add jobTitleCode/jobLevelCode; job-levels add levelOrder.` |
| API transport | `POST /api/v1/organizational-structure/{resource}/bulk; body { items }; response { createdCount }.` |
| Wire examples | `Bulk request is limited to 100 normalized OrganizationalStructureMutation items.` |
| Validation and normalization | `File, headers, row values, schema, active lookups, duplicates, then API validation.` |
| Duplicate rules | `Case-insensitive resource/company identity with existing unique indexes and atomic service protection.` |
| Relationships and lookups | `Active Branch, Department, Division, JobTitle, JobLevel, and Position codes are resolved before submit.` |
| Batch and transaction | `One database transaction; any failed row rolls back the full batch.` |
| Retry and error artifact | `Shared feedback marks invalid, failed, and uncertain outcomes and supports refresh/reconcile.` |
| Side effects and refresh | `Committed change schedules the feature job; client query prefixes are invalidated.` |
| UX and localization | `Shared web/mobile import shells, paired EN/AR strings, RTL-safe controls.` |
| Verification | `Web/mobile type-check and API build plus parser/endpoint manual authenticated checks.` |

Required Import evidence follows this order: file acceptance, parsing, header
validation, row normalization, schema validation, relationship resolution,
request-level duplicates, client batch bound, exact serialization, API validation,
persistence conflict protection, one transaction, post-commit side effects, and
client invalidation. Record any deliberate departure.

## Reporting contract

When reporting is Required, identify the engine and link its canonical guide.
Managed Crystal reports must follow
[`documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`](../../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md).
Do not combine Managed Crystal `.rpt` records with ActiveReports/RDLX
`ReportTemplates`.

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | `Required; each resource reads the managed Crystal published catalog.` |
| Engine | `Managed Crystal.` |
| Entity/feature key | `branches, departments, divisions, job-titles, job-levels, positions, job-descriptions.` |
| Source | `Report Manager published catalog.` |
| Dataset/schema | `Current-company dataset supplied by the published report definition.` |
| Filters | `Bounded NameAr and NameEn filters plus selected report ID.` |
| Permissions | `OrganizationalStructure:View plus managed report ACL.` |
| Localization | `Arabic/English report names and language passed to render.` |
| Runtime/deployment | `Shared ReportViewer is reachable from every entity multi-view selector.` |
| Verification | `Catalog loading, no-report, filter toggle, and render paths are covered by the shared report pattern.` |

For Managed Crystal, also record evidence that the HR API data profile and Crystal
runtime schema profile match, that a manager-owned version is published, and that
the intended current-company roles have `Run`. Clients send only report ID,
`ar`/`en`, and bounded feature filters; they never send a path, filename, SQL,
connection string, tenant ID, or company ID.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | Critical | Six organizational entities were ignored by EF and could not back a feature. | Historical `ApplicationDbContext` ignore list | Backend | Resolved: DbSets, configurations, composite FKs, indexes, migration, and tests added. |
| F-02 | High | Department public setters allowed recursive and cross-company hierarchy corruption. | Historical `Department.cs` | Domain | Resolved: private setters, guarded parent changes, active/same-company checks, cycle detection. |
| F-03 | High | JobDescription was attached only to JobTitle, so a Position had no authoritative version. | Historical JobDescription/Position entities | Domain | Resolved: PositionId relationship, version index, bilingual approval lifecycle. |
| F-04 | Medium | JobLevel salary bounds and currency were mutable without range invariants. | Historical `JobLevel.cs` | Domain | Resolved: explicit identity/details methods and salary/currency invariants. |
| F-05 | Medium | Web had no management route and mobile only had non-routable placeholder cards. | Historical web/mobile navigation | Clients | Resolved: guarded routes, shared multi-view management, forms, filters, and lifecycle actions. |
| F-06 | High | Existing production administrators did not receive newly introduced claims because production disables startup seeding, so the web navigation hid the released route. | `appsettings.json` and permission-filtered Basic Data navigation | Backend | Resolved in source: idempotent permission data migration added; deployment must apply it and users must sign in again. |
| F-07 | High | The initial management list returned HTTP 500 because filtering and ordering were applied to a positional DTO projection that SQL Server could not translate; generic `all`/`parent` criteria also referenced fields unsupported by some resources. | Runtime exception, direct API reproduction, and Next.js proxy request | Backend | Resolved: member-initialized projection and resource-aware expression-tree criteria keep the full list operation server-translatable; regression coverage checks 210 resource/search/operator combinations. |
| F-08 | Medium | Web and mobile originally combined all seven entities behind one resource selector, which diverged from the reviewed Countries/States route-per-entity guide. | Feature route/navigation review | Clients | Resolved: each entity now has its own guarded route/page; the legacy web manage URL redirects to Branches. |

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation | `./documentation/system/Generate-Documentation.ps1 -Check` | `Passed after registering four canonical books, final manifest, and seven recipes` | `2026-08-31` |
| API | `dotnet build api/HrManagementSystem.Api/HrManagementSystem.Api.csproj --no-restore`; `dotnet test api/HrManagementSystem.Tests/HrManagementSystem.Tests.csproj --no-restore` | `Build passed; full API suite passed 380/380; focused OrganizationalStructure suite passed 6/6 and includes 210 SQL Server translation combinations` | `2026-08-31` |
| Web | `npm run check:architecture`; `npm run lint`; `npm run test`; `npm run type-check`; `npm run build`; authenticated local API-proxy request | `Architecture/lint/type-check/build passed; Vitest previously passed 310/310; production route table includes the management route; initial Branches request through the local web proxy returned HTTP 200` | `2026-08-31` |
| Mobile | `npm run typecheck`; `npm run check:architecture`; `npm run lint`; `npm run test -- --runInBand` | `TypeScript, architecture, lint, and full Jest suite passed (43 suites / 125 tests)` | `2026-08-31` |

Classify each failed or skipped gate as `Feature regression`, `Inherited
repository failure`, `Environment blocker`, or `Manual release check`. A focused
pass does not convert a failing full gate into a pass.

## Final reconciliation

- [x] Every requirement has evidence and a final status.
- [x] API, web, and mobile serialize the same shared contract where applicable.
- [x] Intentional platform differences are written down.
- [x] Import is explicitly Required, Deferred, or Excluded per client; a required
      Import path has an exact transport contract, bounded validation, and tests.
- [x] Reporting is explicitly Required, Deferred, or Excluded; a required report
      follows the selected engine's canonical lifecycle and runtime contract.
- [x] Known reference-feature gaps were not copied as requirements.
- [x] Required paths exist and generated packets are current.
- [x] Focused feature quality gates pass; inherited repository failures remain classified below.
- [x] Failed/skipped gates include their classification, exact failure identity,
      owner, and release decision.

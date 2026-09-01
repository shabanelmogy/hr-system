# Organizational Structure Feature Full Review

Status: final applied cross-platform implementation profile. Review date: 2026-08-31.

This feature follows the States reference for server-owned list criteria, shared
feedback, multi-view composition, and verification discipline. It keeps the
existing HR domain split instead of copying Odoo's single `hr.job` aggregate.

## 1. Scope and ownership

The feature manages Branch, Department, Division, JobTitle, JobLevel, Position,
and JobDescription under the current tenant and company. TenantId and CompanyId
are trusted from `ICurrentActor`/`ApplicationDbContext`; clients never submit
scope values. The API route is `/api/v1/organizational-structure/{resource}`.
The browser and native clients expose one guarded route/page per resource:
`branches`, `departments`, `divisions`, `job-titles`, `job-levels`, `positions`,
and `job-descriptions` under `/basic-data/organizational-structure/{resource}`.

## 2. Discovery and Odoo comparison

The original entities had public mutation surface, six entities were ignored by
EF, and JobDescription was attached to JobTitle without an applicable Position
version. Odoo 19 models departments as a recursive company hierarchy and job
records with department/company, description, requirements, and headcount. We
adopted those rules while retaining JobTitle, JobLevel, and Position as separate
local concepts because requisitions and employee workflows already depend on
them. JobDescription is now a versioned child of Position.

## 3. Domain model and invariants

All entities use private setters and explicit methods. Names/descriptions are
trimmed; code, currency, and version tokens are uppercase. Department parents
must be active and in the same company, and self/recursive ancestry is rejected.
Division requires an active Department. Position requires active Division,
JobTitle, and JobLevel. Branch supports identity/contact/headquarters operations.
JobLevel enforces non-negative ordered salary bounds and a three-letter currency.

## 4. JobDescription and lifecycle

`JobDescription` lives at `api/HrManagementSystem.Domain/OrganizationalStructure/Entities/JobDescription.cs`.
It references `PositionId`, carries an uppercase version, bilingual Purpose,
Responsibilities, and Requirements, optional skills/education/experience, and an
effective/expiry period. Draft content can be edited. Approval requires all six
bilingual core fields, a valid non-overlapping period for the Position, and the
actor id; approved content is immutable. Rejection records a reason and returns
the version to a controlled non-approved state; editing a rejected version resets
it to Draft for resubmission. Expired is derived from dates.

## 5. Persistence and company isolation

The DbContext exposes all seven DbSets and configuration classes under
`api/HrManagementSystem.Infrastructure/Persistence/Configurations/OrganizationalStructure`.
Composite TenantId/CompanyId foreign keys prevent cross-company relationships.
Unique indexes cover company-scoped codes, parent-scoped names, and
`(PositionId, Version)` for descriptions. Migrations
`20260830205716_AddOrganizationalStructureManagement` and
`20260831054245_AddOrganizationalStructureIdentityIndexes` create the tables and
identity indexes. `20260831071547_GrantOrganizationalStructurePermissionsToAdmin`
idempotently grants the five new permissions to the existing system `admin`
role; this is required because production disables startup seeding.

## 6. API and permissions

The feature-owned CQRS contracts, validators, handlers, service, and thin
versioned controller implement list, detail, lookup, create, update, archive,
restore, approve, and reject. Permissions are `View`, `Create`, `Edit`, `Delete`,
and `ApproveJobDescriptions` under the `OrganizationalStructure` module. Every
mutation rechecks permission and current-company scope in the handler/service.
Existing administrators receive the new claims through the permission migration,
then must obtain a fresh session after deployment so navigation and API claims
reflect the grant.

## 7. List, search, and views

API paging is one-based with page size 1-500. Search fields are `all`, `nameAr`,
`nameEn`, `code`, and `parent`; operators are contains, doesNotContain, equals,
doesNotEqual, startsWith, and endsWith. Status supports active/archived/all and
sorting supports nameEn/nameAr/code/parent/createdOn with an Id tie-break.
The management query keeps filtering, ordering, counting, and paging on the
server until materialization. Its response projection uses property assignment,
and search/parent expressions include only fields supported by the selected
resource, so every allowed criteria combination remains translatable by the SQL
Server provider.
Each web route uses the States-pattern shared Grid/Cards/current-page Chart/
Report/Import composition: aligned ID/name/code/parent/date/status/action
columns, server toolbar search with Reset and status Grid options, and the shared
card/chart criteria header behind the PageHeader Filter action. Each native route
uses shared Table/Cards/current-page Chart/Report/Import components. There is no
cross-entity resource selector on a management page. Chart and Report labels
explicitly describe page scope and matching total; Import is resource-specific.

## 8. Lifecycle, concurrency, and side effects

Archive is blocked by active dependents; restore requires active parents. Writes
validate parent activity, duplicate scope, cycles, salary/headcount, and
description period overlap before save. A committed change schedules the
feature-owned Hangfire job, publishes realtime resource `organizational-structure`,
and invalidates the query prefix on both clients. No notification/realtime side
effect is emitted before commit.

## 9. Platform capabilities and differences

Grid is called Table on mobile; both clients provide Cards, an operational
current-page Chart, a managed Crystal Report view, and an atomic XLSX Import
view. Export is Excluded and no placeholder action is reachable.

## 10. Verification and release decision

Focused API build and OrganizationalStructure/Pragmatic domain tests pass. The
management regression suite also verifies SQL Server translation for all seven
resources across five search fields and six operators (210 combinations), and a
local authenticated request through the Next.js API proxy returns HTTP 200 for
the initial Branches page.
Mobile TypeScript, architecture, lint, translation-usage, and route tests pass.
Web architecture, lint, type-check, and production build pass after repairing
the inherited geographical form/import typings that previously blocked a full
route build. Whole-solution build has the inherited missing
CrystalReportGenerator MSBuild target. Manual release checks remain for
browser/device EN/AR, RTL, permissions, lifecycle errors, realtime refresh,
permission migration application, and a fresh post-deployment login.

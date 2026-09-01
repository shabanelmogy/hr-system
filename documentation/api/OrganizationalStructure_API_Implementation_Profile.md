# Organizational Structure API Implementation Profile

Status: final implementation profile. Base route: `/api/v1/organizational-structure/{resource}`.

## 1. Boundary

`OrganizationalStructureController` is a thin versioned adapter over
`ISender`/feature-owned management ports. It does not call legacy services.

## 2. Resources and contracts

Resources are `branches`, `departments`, `divisions`, `job-titles`, `job-levels`,
`positions`, and `job-descriptions`. Common item responses expose id, code,
bilingual names, parent label, status, and dates; detail responses add
resource-specific fields. Create/update contracts never include TenantId or
CompanyId. JobDescription contracts use PositionId and bilingual content.

## 3. HTTP surface

`GET /{resource}` pages records, `GET /{resource}/{id}` returns detail,
`GET /{resource}/lookup` returns active selector data, `POST /{resource}` creates,
`POST /{resource}/bulk` creates up to 100 items atomically and returns
`createdCount`,
`PUT /{resource}/{id}` updates, `DELETE /{resource}/{id}` archives, and
`POST /{resource}/{id}/restore` restores. Job descriptions additionally expose
`POST /job-descriptions/{id}/approve` and `/reject`.

## 4. Paging and criteria

`page` is one-based, `pageSize` is 1-500, and status is active/archived/all.
Search accepts the five fields and six operators documented in the master book;
sort is allow-listed and deterministic by Id. Validation rejects unknown
resource, field, operator, status, or sort values.
Filtering, ordering, counting, and paging remain in the provider query until
materialization. The item projection uses member initialization and criteria are
resource-aware: unsupported parent or relationship fields are never injected
into another resource query. This keeps all accepted combinations translatable
by the SQL Server provider instead of falling back to client evaluation.

## 5. Validation and normalization

Feature validators require printable bilingual names where applicable, trim all
text, uppercase code/currency/version, validate non-negative headcount and
ordered salaries, and reject invalid dates or missing active parents. Stable
field errors are returned for duplicate scope, inactive parent, cycle, dependency
archive, period overlap, and incomplete approval content.

## 6. Create and update

The management service dispatches by resource, loads trusted company scope, and
checks parent activity and duplicate indexes before persistence. Department moves
run an ancestry walk to reject cycles. Position and JobDescription writes verify
all composite parent keys belong to the same tenant/company.

## 7. Archive and restore

Archive is idempotent for an already archived directory record but rejects active
dependents. Restore requires the current parent chain to be active. JobDescription
archive is blocked while effective/approved business rules require the version.

## 8. JobDescription decisions

Approval accepts effectiveDate and optional expiryDate, requires a draft with all
Arabic/English core sections, verifies no overlapping Position version, records
ApprovedByUserId, and makes content immutable. Rejection requires a non-empty
reason and records the lifecycle decision without deleting the version. Editing
a rejected version is allowed and automatically returns it to Draft; approved
and expired content remains immutable.

## 9. Persistence and transaction boundary

EF configurations map all seven entities. Composite foreign keys include
TenantId/CompanyId, and unique indexes scope codes, parent names, and
PositionId/Version.
Commands save through the current DbContext transaction; only a successful
commit schedules notifications/realtime work. Bulk import validates every
mutation and executes the batch inside one transaction, so any row failure
rolls back the complete request.

## 10. Authorization and error contract

The controller and handlers enforce `OrganizationalStructure:View/Create/Edit/
Delete/ApproveJobDescriptions`. Read-only callers can query but cannot mutate.
Errors are stable resource/field-oriented values suitable for EN/AR mapping;
clients map field errors beneath shared inputs.

Production does not run startup permission seeding. Migration
`20260831071547_GrantOrganizationalStructurePermissionsToAdmin` therefore adds
all five feature claims idempotently to the existing system `admin` role. Users
must refresh their authenticated session after that migration is deployed.

## 11. Tests and operational verification

`OrganizationalStructureManagementTests` covers company isolation/fail-closed
scope, composite model relationships, unique description versions, bilingual
approval completeness/period, controller permission gating, and SQL Server query
translation. The translation regression covers seven resources, five search
fields, and six operators (210 combinations), including parent ordering. Run API
build, focused tests, migration update, then exercise each resource in dependency
order.

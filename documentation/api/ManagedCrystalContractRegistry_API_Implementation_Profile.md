# Managed Crystal Contract Registry API Implementation Profile

## 1. Purpose

Define the server/runtime authority for exact managed Crystal dataset contracts
without changing any public HTTP contract. This is a Reporting-owned integration
foundation, not a new business aggregate.

## 2. Domain and persistence

No domain entity, repository, DbContext, table, migration, lifecycle, RowVersion,
or user-managed configuration is added. The registry is source-controlled,
versioned deployment configuration. Accounting and ReferenceData keep ownership
of the rows exposed through their existing public reporting-source contracts.

## 3. Contract artifact

Create `managed-crystal-report-contracts.v1.json` in the Reporting Contracts
project and package its exact bytes into Reporting and
`CrystalReportGeneratorApi`. The root schema version is `1`; entity contracts
contain key, scope, table, maximum rows, ordered columns, filters, and managed
parameters. Both loaders reject missing, duplicate, unsupported, or inconsistent
values instead of applying defaults.

## 4. Registry model

Models are immutable after successful load. Entity, column, filter, and parameter
names are unique case-insensitively. Entity keys must already be canonical
lowercase. Portable types are exactly `int32`, `string`, and `datetime`.
Lookup is case-insensitive and fail-closed. The registry exposes its schema
version, entity count, exact artifact bytes/fingerprint, and required lookup.

## 5. Provider contract

Every `ICrystalReportDataProvider` remains responsible for its current owner
query, scope, filters, ordering, and bounded row count. The emitted `DataTable`
must equal the registry contract for table name, column order, CLR type, and
`AllowDBNull`. Provider filters and maximum-row bounds must equal the artifact.
No provider may silently add, omit, reorder, widen, or loosen a field.

## 6. Fiscal Years contract

`fiscalyears` is `tenant-company`, not global and not tied to a current/selected
fiscal-year context. It uses `ReportData`, its existing `Code`, `NameAr`, and
`NameEn` filters, and all 16 existing provider fields. Eight Fiscal Year fields
are non-nullable; eight Fiscal Period fields are nullable. The provider must set
all `AllowDBNull` values explicitly.

## 7. Authorization and scope

No route or permission is added. Existing authenticated actor scope,
`CrystalReports:View`, and per-report `Run` ACL remain authoritative. Registry
scope metadata is validated configuration and test evidence; it does not grant
access or allow callers to choose tenant/company scope.

## 8. Runtime contract

The .NET Framework runtime links the same JSON artifact into its output and
parses it with process-local compatible models. `CrystalReportProfileRegistry`
loads exact profiles rather than four hard-coded name lists and supports all five
entities. Runtime data access remains limited to request-owned XML and managed
report files; no ERP database reference is introduced.

Exact template inspection/enforcement is deferred. The current render service may
continue its present required-name check in this child, but profile data must be
complete enough for the later exact validator.

## 9. Integration and failure behavior

Artifact absence, invalid JSON, unsupported schema version, invalid semantics,
duplicate keys/names, unknown types/scopes, non-positive limits, or fingerprint
parity failure are configuration failures. There is no embedded fallback profile
list. Repeated loads of identical bytes return semantically identical registries
and the same lowercase SHA-256 fingerprint.

## 10. Tests

Test valid load and five lookups; malformed/missing properties; version, scope,
type and limit validation; case-variant duplicates; parameter semantics; known
fingerprint; repeat-load determinism; provider entity/filter/limit/table/column
order/type/nullability parity; explicit Fiscal Years schema; unknown lookup; and
identical bytes in modern and legacy outputs. Preserve all existing Reporting and
runtime tests.

Verified 2026-09-27: focused registry/provider tests passed 25/25; the full
Reporting suite passed 110/110; architecture tests passed 59/59; the legacy
solution built Release x64; and the .NET Framework harness passed semantic
negative cases, five-profile/Fiscal Years assertions, SHA-256 calculation, and
source/harness/runtime resource byte parity.

## 11. Deployment

Build and deploy Reporting and `CrystalReportGeneratorApi` together when the
artifact changes. No database update, client deployment, report import, or ACL
change is required by this child. A restart is required to load a changed
artifact. Release acceptance remains blocked until later `.rpt`, live PDF,
operations, and security gates are completed.

Implemented artifact fingerprint:
`4d7511139871f7f745560191fafb51a4ccdf963a41740d8cc14ba1b07769573c`.

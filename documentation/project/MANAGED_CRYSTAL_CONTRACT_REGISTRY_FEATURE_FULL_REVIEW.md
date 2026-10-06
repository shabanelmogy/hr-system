# Managed Crystal Contract Registry Feature Full Review

Status: Verified implementation profile for the completed contract-registry
foundation. Later managed Crystal children and release acceptance remain gated.

Reviewed: 2026-09-27

## 1. Review manifest

This bounded child establishes one versioned, machine-readable contract for the
managed Crystal datasets already shaped by Reporting and consumed by the isolated
.NET Framework runtime. It covers `countries`, `states`, `districts`,
`addresstypes`, and `fiscalyears`. It does not add an endpoint, screen, database
entity, migration, permission, or customer workflow.

Canonical intent is owned by plan `managed-crystal-reporting-reliability`, its
active child contract, the Phase 00 implementation request, and the review ledger.

## 2. Architecture boundary

```text
Business modules -> public reporting sources -> Reporting data providers
                                              -> exact DataSet XML

versioned Reporting artifact -> modern Reporting loader/parity validation
                             -> linked identical bytes in legacy runtime
                             -> exact immutable runtime profile lookup
```

Accounting and ReferenceData remain the owners of business rows. Reporting owns
the transport schema. `CrystalReportGeneratorApi` remains an independent,
database-isolated SDK adapter and must not reference ERP DbContexts.

## 3. Frozen shared contract

The artifact schema version is `1`. Every entity has a unique lowercase key,
scope (`global` or `tenant-company`), non-empty table name, positive `maxRows`,
ordered columns, unique allow-listed filters, and unique managed parameters.
Portable column types are `int32`, `string`, and `datetime`; nullability and JSON
order are authoritative. The managed `Language` parameter is required, string,
single, discrete, and restricted to `ar` or `en`.

The canonical artifact is immutable deployment configuration. Both processes
load packaged bytes, calculate lowercase SHA-256 over those exact bytes, reject
malformed or semantically invalid content, and expose case-insensitive O(1)
entity lookup without a fallback list.

## 4. Entity contracts

All entities use table `ReportData` and retain their current provider filters and
row limits. Provider output must match artifact name, order, CLR type, and
nullability exactly.

`fiscalyears` is tenant/company scoped but has no dependency on the selected or
current fiscal year. Its required columns are `FiscalYearId`, `FiscalYearCode`,
`FiscalYearAr`, `FiscalYearEn`, `FiscalYearStartDate`, `FiscalYearEndDate`,
`PeriodFrequency`, and `FiscalYearStatus`. Its nullable period columns are
`FiscalPeriodId`, `FiscalPeriodSequence`, `FiscalPeriodCode`, `FiscalPeriodAr`,
`FiscalPeriodEn`, `FiscalPeriodStartDate`, `FiscalPeriodEndDate`, and
`FiscalPeriodStatus`. Its filters remain `Code`, `NameAr`, and `NameEn`.

## 5. Permissions and scope

No permission changes are authorized. Existing `CrystalReports:View` plus the
per-report `Run` grant remain authoritative. Global dataset routes keep their
approved global behavior; tenant/company datasets use the authenticated active
actor. The client never supplies a trusted tenant or company identifier.

The contract registry describes scope; it does not replace authorization or
business-module scope enforcement.

## 6. Runtime and integration behavior

The Reporting process loads the artifact and proves every registered provider
matches it. The legacy runtime replaces its four hard-coded name-only profiles
with exact profiles parsed from the same bytes, including `fiscalyears`.
Unsupported entities and invalid artifacts fail closed with stable configuration
or unsupported-profile behavior.

Exact `.rpt` inspection, template compatibility/version lifecycle, live PDF
acceptance, readiness hardening, and operational synchronization belong to later
children. This child supplies the exact contract those capabilities will use.

## 7. Client disposition

Web and Mobile are intentionally unchanged. Existing Fiscal Years and Address
Types report surfaces keep their entity keys and request envelopes. No registry
metadata is exposed to clients. Visible Fiscal Years PDF acceptance is Deferred
to the later Fiscal Years business-acceptance child; it is not evidence for this
foundation slice.

Import, offline storage, outbox behavior, mock data, UI forms, list views, and
localization changes are Excluded because this child has no customer input or
new visual surface.

## 8. Existing-system relationship decisions

- Reuse owner-module reporting-source contracts and Reporting data providers.
- Change only the duplicated contract source and provider schema precision.
- Preserve the runtime process boundary, existing routes, permissions, filters,
  report storage, publication, and ACL behavior.
- Add no compatibility registry, database persistence, hot reload, or user CRUD.
- Keep security hardening in the final roadmap phase as explicitly requested;
  it remains release-blocking but is outside this child.

## 9. Required verification

Phase 00 passed with the four applied books, final required-file manifest, recipe
registration, generated packets, documentation check, and diff check. Runtime
verification passed loader/model validation, deterministic fingerprint, five-
entity lookup, exact provider-schema parity, Fiscal Years nullability, 110/110
Reporting tests, 59/59 architecture tests, Release x64 runtime/harness builds and
the deterministic .NET Framework contract harness.

The harness compared the canonical source bytes, its own embedded resource and
the built runtime DLL resource byte-for-byte. All produced fingerprint
`4d7511139871f7f745560191fafb51a4ccdf963a41740d8cc14ba1b07769573c`.
Public route, permission, persistence, Web, and Mobile implementation changes are
absent.

## 10. Handoff decision

This bounded child is Verified and Closed. That decision does not make the full
managed Crystal program release-ready: later inspection, lifecycle, UI,
business-report, operations, and security children remain independently gated.

# Managed Crystal Template Validation API Implementation Profile

## 1. Purpose

Extend the existing managed Crystal vertical slice so template compatibility is an
explicit persisted business fact tied to the canonical contract fingerprint.

## 2. Domain model

`CrystalReportVersion` retains immutable report ID, number, storage key, file name,
size and SHA-256. Validation status becomes `Pending`, `Valid`, `Invalid`, or
`NeedsRevalidation`; reason is bounded; valid evidence includes the positive
contract schema version and lowercase 64-character fingerprint. Named methods own
allowed transitions and `IsValidFor(fingerprint)`.

## 3. Aggregate rules

`CrystalReport.Publish` accepts only an owned version whose current-valid predicate
passes for the supplied current fingerprint. Archived reports remain immutable.
Add-version continues to require aggregate ownership and never changes the report
entity key.

## 4. Application orchestration

Create validates supported entity/key uniqueness, asks storage to inspect/store
against that entity, then creates the aggregate/version atomically. Add-version
loads the report first and passes its entity to storage. Import rechecks descriptor
identity/hash then delegates to create. Publish and render obtain the current
registry fingerprint and reject stale evidence before side effects.

## 5. Typed contracts

Internal inspection multipart adds `entityKey`. Success returns title, subject,
contract schema version and fingerprint. Stored-file and inspection records carry
that evidence. Public version responses add validation schema version/fingerprint;
existing public mutation request shapes stay stable. Wire evolution is additive.

## 6. Infrastructure and persistence

`PrivateCrystalReportFileStorage` keeps extension/size/OLE/platform scanning, calls
typed entity-aware inspection, stores bytes privately, calculates SHA-256 and
returns inspection evidence. EF configuration adds bounded evidence columns. The
DbContext permits modifications only to validation evidence through Domain
transitions while rejecting source/history mutation.

## 7. Migration

Generate a Reporting-owned migration in schema `rpt`. Existing versions become
`NeedsRevalidation`; no prior generic `Valid` is trusted. New fingerprint/schema
columns are nullable for non-valid states and constrained by Domain/configuration.
Inspect Up/Down, snapshot, drift and apply to the configured development database.

## 8. Runtime inspection

The legacy service resolves `entityKey` from `CrystalReportProfileRegistry`, loads
the report by temporary copy, applies existing source safety, then validates the
exact table/ordered field names and mapped Crystal types. It validates the entire
managed parameter set, not merely presence of `Language`. It requires a string,
required, single, discrete parameter whose static defaults are exactly `ar` and
`en` and whose custom-value editing is disabled. It returns the registry schema
version/fingerprint on success. SDK exception details are logged internally but do
not leak through public API errors.

## 9. Publish and render gates

Publish requires version ownership, existing permission/ACL, valid row version and
current-valid evidence. Managed render requires the active published version to
remain current-valid before file access, data building or runtime call. A registry
change therefore fails closed even before a data provider or Crystal process runs.

## 10. Tests

Implemented verification includes Domain transition/source-immutability tests,
create/add evidence and cleanup tests, publish/render stale-fingerprint handler
tests, inspector client contract/failure tests, and legacy runtime field/parameter
semantic cases including custom `Language` values. Reporting passes 120/120,
architecture 59/59, Release x64 runtime/harness passes, EF reports no model drift,
and the configured development database contains the migration, evidence columns
and both check constraints with zero invalid-evidence rows. A real approved positive
`.rpt` remains Deferred `RISK-008`: it is required before Fiscal Years live
acceptance/release, but does not prevent this development-scoped Phase 06 result.

## 11. Deployment and closure

Reporting API, its migration and the legacy runtime must deploy with identical
canonical bytes. Development database update is mandatory for this child.
Production/staging runtime packages and old-data revalidation remain governed by
the master rollout and `PROD-025`. Security work is deliberately not pulled forward.


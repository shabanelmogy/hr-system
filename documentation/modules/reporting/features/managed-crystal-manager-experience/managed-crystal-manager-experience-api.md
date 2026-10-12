# Managed Crystal Report Manager Experience — API Profile

## 1. Purpose

Expose safe registry metadata and authorize revalidation of immutable managed
Crystal versions without adding a parallel contract or storage model.

## 2. Domain model

Reuse `CrystalReportVersion` named validation transitions and immutable source
identity. No new entity or schema field is introduced.

## 3. Aggregate rules

The version must belong to the requested non-archived report. Publication remains
valid only for owned, current-fingerprint Valid versions.

## 4. Application orchestration

Metadata query projects the canonical registry. Revalidation checks report/ACL,
opens verified source, inspects current contract, then atomically applies only
validation evidence. Transient failures preserve prior evidence.

## 5. Typed contracts

Add `SupportedCrystalReportEntityResponse` with entity key, scope, filters,
contract schema version and fingerprint. Revalidation returns the existing full
`CrystalReportVersionResponse` including all validation evidence.

## 6. Infrastructure

Extend `IManagedCrystalReportContractSource` with safe entity descriptions and
reuse `ICrystalReportFileStorage.OpenVerifiedReadAsync` plus
`ICrystalReportInspector`. Never accept storage keys or scope from clients.

## 7. Persistence and migration

No migration. DbContext already permits only validation evidence to change on an
existing version. Model-drift and source-immutability tests are mandatory.

## 8. API routes and permissions

`GET /api/v1/crystal-reports/supported-entities` requires View.
`POST /api/v1/crystal-reports/{id}/versions/{versionId}/revalidate` requires Upload
and the existing report Upload ACL unless the existing access bypass applies.

## 9. Error and transaction contract

Wrong/archived report or version and ACL denial do not disclose the resource.
Deterministic mismatch may persist Invalid with safe reason. Storage/hash/inspector
unavailability returns a stable error without changing earlier evidence.

## 10. Verification

Verified on 2026-09-27: ordered bounded metadata, permission/route contracts,
positive revalidation, deterministic mismatch persistence, transient preservation,
ACL recheck and immutable source identity are covered. Focused tests passed 32/32,
the full Reporting suite passed 128/128 and Architecture passed 59/59. This child
does not change the EF model, so no migration was generated.

## 11. Deployment and closure

No deployment configuration or security change is required. API must deploy with
the same canonical artifact already required by Phase 1/2. Actual designer `.rpt`
positive evidence remains `RISK-008`/Phase 4.

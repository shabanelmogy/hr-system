# Managed Crystal Contract Registry Next.js Implementation Profile

## 1. Route and public boundary

No Next.js route, component, hook, service, type, query key, or public feature
boundary changes in this child. Existing managed-report screens continue to use
the shared reporting client and their stable entity keys.

## 2. Transport and types

The registry is server/runtime deployment configuration and is not added to the
HTTP API. Web sends the existing report ID, language, and allow-listed filters.
No registry DTO, scope flag, fingerprint, or column definition is exposed.

## 3. Server list

Excluded. This child does not change any list, search, sort, filter, pagination,
loading, empty, or error behavior.

## 4. Grid

Excluded. No grid or shared DataGrid behavior changes.

## 5. Cards and chart

Excluded. No card, chart, or loaded-page aggregation behavior changes.

## 6. Forms and lifecycle

Excluded. The registry has no customer CRUD, form, dialog, validation, archive,
restore, reorder, concurrency, or unsaved-change workflow.

## 7. Import

Excluded. Existing report-manager `.rpt` import behavior is unchanged and exact
template validation belongs to a later child.

## 8. Report

Existing Fiscal Years uses entity key `fiscalyears`; Address Types uses
`addresstypes`; other existing report views retain their keys. This child must not
change request envelopes or visual behavior. Visible Fiscal Years PDF acceptance
is Deferred, so the presence of the report tab is not completion evidence here.

## 9. Localization and access

No visible text or permission changes. Existing translations, RTL behavior,
`CrystalReports:View`, report `Run` checks, and shared feedback components remain
unchanged.

## 10. Realtime and cache

Excluded. No mutation, cache invalidation, notification, or realtime event is
introduced.

## 11. Tests

No new Web test is required because the wire contract and UI are unchanged.
Source/diff review must prove no Web implementation leakage. Later visible report
work must add focused tests in its own authorized child.

## 12. Verification

Phase 00 records the current Web consumers as relationship evidence. Phase 06
checks that no Next.js files, routes, translations, or tests changed and that the
existing entity keys still align with the canonical artifact.

## 13. Intentional platform differences

The Web remains a browser PDF/report consumer; it never parses the internal
contract registry. The API/runtime processes validate and own transport schemas.

## 14. Manual release

N/A for this internal foundation. Manager publication, report `Run` ACL, and
live Fiscal Years PDF verification are Deferred to later children and remain
release prerequisites for the complete program.

## Entity-scoped validation repair — 2026-11-07

The existing Reporting correction separates deployment identity (SHA256 of the
complete artifact, retained for runtime health/parity) from entity validation
identity. See [the corrective contract and evidence](../managed-crystal-contract-registry/ENTITY_FINGERPRINT_REPAIR.md).
Inspection, entity/designer metadata and consumer tokens now use the individual
entity's stable definition. Formatting and unrelated report additions cannot
invalidate it. Real own-definition changes remain stale.

Only two packaged historical artifacts can supply legacy whole-artifact aliases,
and only when the entity's complete semantic definition still matches. LF/CRLF/BOM
variants are bounded to those reviewed contents; unknown hashes remain rejected.
The observed hosted Countries version3 hash exactly matches the pre-error-log CRLF
artifact. No database evidence rewrite, schema change or migration is needed.
Original fingerprints remain visible; version detail adds isContractCurrent and
an effective NeedsRevalidation status for genuinely stale evidence. Angular uses
that flag with strict old-server fallback and retains all ID/token/SHA/ACL checks.
Next consumes effective status; native consumers keep existing API contracts and
no new native management UI is introduced. Pre-upgrade open viewer tokens may need
one refresh. Future unrelated entity additions preserve entity-based tokens.

Canonical automated receipts belong to managed-crystal-contract-registry/verification/entity-fingerprint/.
Coordinated API/Crystal/Angular publication and real hosted AR/EN RPT/PDF remain
PROD-028/FOLLOW-024. Source verification does not claim deployment, native Verify
Database or a rendered production report.

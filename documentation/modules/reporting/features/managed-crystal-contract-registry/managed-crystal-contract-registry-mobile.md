# Managed Crystal Contract Registry Expo Implementation Profile

## 1. Feature boundary

No Expo module, route, public barrel, component, schema, API adapter, query key,
or design-system change in this child. Existing managed report views remain the
only mobile consumers.

## 2. Route and authorization

Existing routes and `RouteGuard` behavior are unchanged. Existing
`CrystalReports:View` and per-report `Run` decisions remain authoritative; the
registry creates no new mobile permission or navigation entry.

## 3. API/schema contract

The internal registry is not part of mobile JSON transport. Existing report
catalog/render response validation remains unchanged. Mobile never parses
registry entities, scopes, fingerprints, parameters, or dataset columns.

## 4. Query ownership

Excluded. No query key, caching, invalidation, company-switch, or realtime
mapping change is authorized.

## 5. Server list

Excluded. No pagination, search, filtering, sorting, or server-list state changes.

## 6. Table and cards

Excluded. No table, card, action, status, or shared feedback change.

## 7. Chart

Excluded. No chart or aggregation behavior change.

## 8. Form

Excluded. The registry has no mobile form, validation, mock data, unsaved state,
or input control.

## 9. Lifecycle

Excluded. It is immutable deployment configuration with no customer archive,
restore, edit, reorder, or concurrency action.

## 10. Import

Excluded. Mobile file import is unrelated. Runtime `.rpt` import/inspection is a
later server/manager child.

## 11. Report

Fiscal Years continues to request entity key `fiscalyears`; Address Types
continues to request `addresstypes`. Request bodies, PDF signature checks,
preview, sharing, error states, and read-only behavior are unchanged. Visible
Fiscal Years PDF acceptance is Deferred.

## 12. Notification and navigation

Excluded. No notification resource, action URL, route mapping, or navigation
policy changes.

## 13. Localization and accessibility

No visible text, gesture, layout, RTL, theme, safe-area, focus, or accessibility
change is introduced.

## 14. Tests

No new Expo test is required because the public wire/UI contract is unchanged.
Source/diff review must prove no Mobile implementation leakage and preserve the
existing stable entity keys.

## 15. Verification

Phase 00 records current mobile report consumers as relationship evidence. Phase
06 verifies no Mobile source or localization change and defers device/PDF manual
acceptance to the later business-report child.

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

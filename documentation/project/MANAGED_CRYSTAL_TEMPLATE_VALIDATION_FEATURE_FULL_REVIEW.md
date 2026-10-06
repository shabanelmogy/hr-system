# Managed Crystal Template Validation Feature Full Review

Status: Phase 06 Verified and child Closed for development scope.

Reviewed: 2026-09-27

## 1. Scope and outcome

This bounded child makes managed Crystal publication mean “compatible with the
current entity contract.” It covers entity-aware `.rpt` inspection, persisted
validation evidence, development revalidation migration, and publish/render gates.
It does not implement manager UI, a real Fiscal Years template, operations, or
security hardening.

## 2. Architecture and ownership

Reporting owns report/version lifecycle and the canonical contract. Business
modules own data rows. `CrystalReportGeneratorApi` remains a database-isolated SDK
adapter that receives a file plus entity key and returns typed inspection evidence.
No second registry or DB-aware runtime is permitted.

## 3. Business lifecycle

Source identity and history are immutable. Validation is a controlled state:
`Pending`, `Valid`, `Invalid`, or `NeedsRevalidation`. A current-valid version has
status `Valid`, positive schema version and the exact current lowercase SHA-256
contract fingerprint. New synchronous submissions reach `Valid` only after exact
inspection. Old evidence becomes `NeedsRevalidation` when the contract changes.

## 4. Exact compatibility contract

The report must use the approved ADO.NET pushed source, contain no saved data,
credentials or subreports, and contain exactly the canonical table/ordered fields
with compatible Crystal types. Its managed parameter set is exactly one required,
single, discrete string parameter named `Language`, with custom values disabled and
the exact static values `ar` and `en`. Provider/XML nullability stays
enforced by the modern registry because Crystal metadata does not expose the
DataColumn `AllowDBNull` contract reliably.

## 5. Workflow and consistency

Create inspects before atomic report/version persistence. Add-version inherits the
report entity and allocates its number under the existing report lock. Import
re-lists source/hash, downloads/re-hashes, then follows the same create path.
Failed persistence cleans the newly stored file. Publish retains row-version
concurrency and requires current-valid evidence. Render checks current-valid before
opening source/building data/calling the runtime.

## 6. Scope, permissions and errors

Existing permissions, report ACL and trusted tenant/company scope remain. Security
redesign is intentionally deferred. Stable outcomes distinguish unsupported entity,
deterministic template incompatibility, runtime/inspection unavailability, stale
contract evidence, source change and optimistic concurrency.

## 7. Client disposition

Web manager state/error presentation is Deferred to
`managed-crystal-manager-experience`. Mobile administration is Excluded; report
execution is Deferred to the Fiscal Years child. Additive API fields may be ignored
by current clients. No route, component, translation or mock-data edit is claimed.

## 8. Migration and rollout

The Reporting schema owns the migration. Add validation schema-version/fingerprint
columns and mark every current development version `NeedsRevalidation`. Preserve
version bytes, hashes, numbers and published pointer for audit; the runtime gate
makes stale publication non-renderable. Apply the migration to development and
record non-development work under the plan/production notes.

## 9. Verification plan

Verified evidence: Domain transition, append-only persistence and handler/store/client tests; 120/120 full
Reporting tests; 59/59 architecture tests; Release x64 runtime and semantic
positive/negative contract harness; exact contract fingerprint parity; EF migration,
zero model drift, live development update and live schema/constraint inspection.
The repository still lacks a designer-produced real positive `.rpt`, recorded as
Deferred `RISK-008`. By requester decision this does not block backend/manager
development; it becomes mandatory before Fiscal Years live acceptance or release.
UI/device acceptance is not part of this child.

## 10. Closure rule

Exact inspection, current-valid publish/render gates and the development migration
are implemented and Phase 06 Verified. `RISK-008` real approved `.rpt`/PDF evidence
is Deferred into the Fiscal Years live-acceptance child rather than weakening strict
validation. Manager, Fiscal Years, operations and final security remain separate
siblings. Customer education moves to the manager child because that is where the
user-facing recovery behavior will exist.

# Managed Crystal Reporting Reliability — Pre-Plan Specification

## Product and outcome

Make managed Crystal reports predictable from upload through render. An
administrator must be able to choose a supported entity, upload/import a template,
receive precise compatibility feedback, publish only a compatible immutable
version, and grant access. Authorized users must be able to render the same report
from Web and Mobile. Fiscal Years is the first business acceptance entity.

## Scope

### Required

- One versioned, machine-readable managed-report contract registry owned by
  Reporting and consumed/verified by both the modern API and the Crystal runtime.
- Contract fields for entity key, scope, table, ordered columns, CLR/XML types,
  nullability, filters, row limit and managed parameters.
- `fiscalyears` support with its exact Fiscal Year/Fiscal Period schema and
  tenant/company scope.
- Provider-to-contract and runtime-to-contract parity tests.
- Entity-aware template inspection before a version can be `Valid` or published.
- Strict report identity across immutable versions.
- Supported-entity catalog in the API and selection-based Web manager UX.
- Revalidation state/migration for development-era report versions.
- Stable, actionable error taxonomy across runtime, Reporting API, Web and Mobile.
- End-to-end Fiscal Years render verification in Arabic and English.
- Runtime package/catalog readiness, cancellation/concurrency/memory improvements,
  tests and production smoke.
- Security/configuration/dependency hardening as the last release-blocking phase.

### Deferred

- None of the correctness gaps above are deferred. Visual enhancements beyond the
  existing manager/viewer journeys require a separate evidence-backed plan.

### Excluded

- Crystal report designer in Web or Mobile.
- Native Mobile report administration.
- Subreports, saved data and external database connections in managed templates.
- Caller-supplied SQL, paths, connection strings, tenant or company identifiers.
- Adding Fiscal Years to global Crystal scope.
- Replacing the RDLX report-template/designer capability.

## Primary journeys

1. Reporting admin opens the manager, selects `Fiscal Years`, uploads a `.rpt`,
   sees schema/parameter inspection results, creates a valid immutable version,
   publishes it and grants `Run` access.
2. Reporting admin imports a deployed candidate whose entity and hash still match;
   unsupported or contract-incompatible candidates are rejected with a precise
   reason before storage/publication.
3. Authorized Web or Mobile user opens Fiscal Years, selects the managed Report
   view, filters by Code/Arabic Name/English Name, chooses language, and receives a
   PDF generated from the current tenant/company business data.
4. An incompatible or stale template produces a stable compatibility error rather
   than an unsupported-entity message or an ambiguous file failure.
5. Release operator proves runtime/package/catalog readiness and matching contract
   fingerprints before enabling managed reports.

## Domain and source of truth

Reporting owns report definition, stable report key, entity contract, version
validation state, publication pointer, access grants and runtime integration.
Accounting owns Fiscal Year/Period data and exposes it through its public reporting
contract. Reference Data owns its existing report data. The runtime owns only
Crystal SDK inspection/render execution and has no ERP database authority.

Critical invariants:

1. A report version is valid only for exactly one registered entity contract and
   recorded contract fingerprint.
2. Only a valid, current-contract version may be published or rendered.
3. Every version retains the parent report's entity key and stable report key.
4. Tenant/company and ACL are server-derived; the runtime receives prepared data.
5. `fiscalyears` is tenant/company scoped and independent of selecting a current
   fiscal year for other workflows.

## Architecture and integrations

The public clients continue calling `/api/v1/crystal-reports`. Reporting resolves
scope, access and business data. Internal calls use the runtime's inspect, catalog,
source, render and readiness endpoints. A versioned JSON contract artifact is the
portable source shared across .NET 10 and .NET Framework 4.8; startup and tests fail
on malformed or duplicate entries. A contract fingerprint travels with inspection
results and stored versions so drift is explicit.

## Web / Mobile / Design decisions

- Web manager remains the only administration UI and uses the existing server-owned
  grid/detail/import flow. The create form replaces free-text entity input with a
  supported-profile selector and uses the shared form-dialog/field system.
- Web and Mobile viewers keep the current shared `ManagedCrystalReportView` pattern.
- Fiscal Years report view is Required on both clients; report management on Mobile
  is Excluded.
- Loading, empty, validation, forbidden, conflict, retry and stale-contract states
  must be explicit and localized in English/Arabic with RTL support.

## Privacy / security / commercial applicability

The runtime processes tenant/company report data transiently and must not persist
DataSets/PDFs outside the bounded workspace/logging policy. No new billing, UGC, AI
or consumer-consent behavior is introduced. Security hardening is deliberately the
last implementation phase: remove committed/default secrets and Swagger secret
exposure, require protected HTTPS deployment configuration, upgrade supported
dependencies after compatibility tests, and prove log/error redaction.

## Verified current-state summary

The managed-report lifecycle and database-isolated runtime boundary exist and the
runtime builds. Focused Reporting tests pass. Runtime profiles are hard-coded and
name-only, inspection is entity-blind, the Web manager accepts free-text entity
keys, deployment packaging omits physical report content, and no runtime test
project exists. Fiscal Years has provider and clients but no runtime profile. See
`EVIDENCE.md` for source-level evidence and drift.

## ASSUMPTIONS

| ID | Assumption | Why needed | Impact if wrong | Validation trigger |
| --- | --- | --- | --- | --- |
| A-001 | Existing development report versions can all be revalidated and incompatible published pointers can be cleared/blocked. | Avoids preserving incorrect validation state. | Requires compatibility mode and staged migration. | Before applying migration outside the developer database. |
| A-002 | Table name remains `ReportData` for all current managed profiles. | Matches current providers and templates. | Registry must support per-entity table names immediately. | Contract inventory finds a different deployed table name. |
| A-003 | `Language` remains the only runtime-managed report parameter in this slice. | Keeps parameters deterministic. | Additional approved parameters need typed definitions and UI/API ownership. | A required business template demonstrates a legitimate extra parameter. |

## OPEN RISKS / UNKNOWNS

| ID / note | Risk or unknown | Impact | Owner | Resolution/reopen trigger |
| --- | --- | --- | --- | --- |
| PROD-025 | Deployment topology, installed Crystal runtime, physical report source and multi-worker concurrency are environment-specific. | Cannot claim production readiness from source tests alone. | Reporting + Operations | Execute on staging/Production candidate. |
| R-001 | Existing `.rpt` templates may encode field types/nullability differently from current DataSets. | Revalidation can reject them. | Reporting + owning module | Run compatibility inventory before migration. |
| R-002 | Crystal SDK metadata behavior can differ across service packs. | Inspector test fixtures may not cover deployed behavior. | Runtime owner | Run golden-template smoke after service-pack change. |

## Readiness to plan

- [x] High-cost ambiguities are resolved or explicitly assumed.
- [x] Current versus target behavior is separated.
- [x] No blocking unknown prevents writing the phased plan.
- [x] Applicable design/privacy/commercial scope is classified.
- [x] The requester explicitly asked for a phased modification plan.

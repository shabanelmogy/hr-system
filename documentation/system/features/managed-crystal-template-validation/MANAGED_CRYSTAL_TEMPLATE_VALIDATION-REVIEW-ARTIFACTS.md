# Managed Crystal Template Validation Review Artifacts

Status: Phase 06 Verified and child Closed for the authorized development scope.

Reviewed: 2026-09-27

## 1. Requirement evidence

The user requested a comprehensive business-logic-first improvement of
`CrystalReportGeneratorApi`, explicitly keeping security last and retaining Fiscal
Years without making reports depend on fiscal-year context. The approved master
plan decomposes that request. The prior `managed-crystal-contract-registry` child
is Verified/Closed and provides the exact five-entity artifact/fingerprint.

This child is limited to entity-aware template inspection, validation lifecycle,
current-fingerprint publish/render gates, development migration and stable errors.

## 2. Existing-system evidence

- `CrystalReportInspectionService` currently rejects saved data, subreports and
  connection metadata but does not receive an entity or compare report fields.
- `CrystalReportManagedParameters` only proves a case-insensitive `Language` name;
  it does not enforce type, requiredness, multiplicity, discrete/range shape or
  additional parameters.
- `PrivateCrystalReportFileStorage` inspects before storage, then hashes/moves the
  file and returns summary metadata.
- Create/add-version mark every stored file `Valid`; import rechecks source/hash and
  delegates to create.
- Publish checks only `ValidationStatus == Valid`; render does not compare the
  version with the current contract fingerprint.
- `ReportingDbContext` currently blocks every version modification, so validation
  transitions require narrowed append-only enforcement.
- Installed Crystal assemblies expose `Table.Fields`, field `Name`, `TableName` and
  `FieldValueType`; parameter definitions expose value type, optional/multiple/null
  and discrete/range metadata. DataColumn nullability is not present in template
  metadata and remains enforced in provider XML parity.

## 3. Target contract evidence

The version source is immutable. Validation evidence is explicit:

- `Pending`: no completed determination;
- `Valid`: exact current schema version/fingerprint passed;
- `Invalid`: deterministic template incompatibility;
- `NeedsRevalidation`: earlier evidence is no longer current.

New synchronous upload/import/version operations persist `Valid` only from a typed
runtime success. Mismatch or unavailability creates no business row. Existing
development versions are migrated to `NeedsRevalidation`. Publication and render
require `Valid` with the current fingerprint.

Exact inspection covers one approved table, ordered field names/types, and the one
required single discrete string `Language` parameter. Existing saved-data,
subreport, pushed-source and credential rules remain.

## 4. Existing-system relationship decision

Classification: extend the existing Reporting aggregate/CQRS/persistence path and
its external runtime adapter. There will be one validator: the Crystal SDK runtime
using the Reporting-owned canonical artifact. The modern API never parses `.rpt`
internals and the runtime never reads ERP databases.

## 5. Business readiness

The complete Business Rules, Edge Cases & Validation, and Impact matrices are in
`IMPLEMENTATION-REQUEST.md`. Important decisions are source immutability, named
validation transitions, exact current-fingerprint gates, inherited entity on new
versions, atomic import/create behavior and explicit development revalidation.

No unresolved business decision blocks this child. A real administrator-triggered
revalidation action is deliberately Deferred to the manager child; corrected files
can enter through a new version meanwhile.

## 6. Platform disposition

API/runtime and Reporting persistence are Required. Next.js implementation is
Deferred to `managed-crystal-manager-experience`. Mobile administration is
Excluded; report-consumer behavior is Deferred to the Fiscal Years acceptance
child. No client source or localization edit is authorized here.

## 7. Persistence and rollout evidence

The owning schema is `rpt`; `CrystalReportVersions` receives bounded validation
evidence columns. The generated migration must set all current rows to
`NeedsRevalidation` without changing report/version/source identity. It must be
inspected, pass model drift, and be applied to the configured development database
before persistence closure is claimed. Non-development rollout still requires the
plan's production decision and `PROD-025` evidence.

## 8. Verification ledger

| Evidence | Status | Location/result |
| --- | --- | --- |
| Contract registry dependency | Verified | Fingerprint `4d7511139871f7f745560191fafb51a4ccdf963a41740d8cc14ba1b07769573c` |
| Screen/Workflow Contract | Complete | Plan decomposition contract version 2.0 |
| Existing source/relationship review | Complete | This artifact and implementation request |
| Business rules/edge cases/impact | Complete | Implementation request matrices |
| Crystal SDK API surface | Verified locally | Installed x64 assemblies expose required table/field/parameter metadata |
| Four applied books | Complete for Phase 00 | Project/API/Web/Mobile canonical profiles |
| Required-file manifest/recipes | Complete for Phase 00 | Feature system folder and recipe manifest |
| Runtime implementation | Verified | Release x64 solution build and semantic contract harness pass; exact fingerprint shown below |
| Reporting regression | Verified | 120/120 tests; focused handler gates 4/4 and persistence invariants 2/2 |
| Architecture regression | Verified | 59/59 tests |
| Migration/model drift | Verified | `20260927154405_AddManagedCrystalTemplateValidation`; no pending model changes |
| Development live DB | Verified | Migration applied; evidence columns and two check constraints present; invalid-evidence row count 0 |
| Runtime real positive `.rpt` | Deferred | Required before Fiscal Years live acceptance/release under `RISK-008`; does not block current development |
| Phase 06 decision | Verified | Backend/runtime business scope, migration and development database are verified; no security or release claim is made |

## 9. Verification detail

- Canonical/runtime fingerprint:
  `4d7511139871f7f745560191fafb51a4ccdf963a41740d8cc14ba1b07769573c`.
- Reporting full suite: 120 passed, 0 failed, 0 skipped.
- Architecture suite: 59 passed, 0 failed, 0 skipped.
- Legacy runtime: Visual Studio MSBuild `Release|x64` passed for both the API and
  contract harness.
- Semantic runtime harness: exact positive metadata plus reordered-field,
  wrong-type, multiple-value, custom-value and extra-parameter negatives passed.
- EF model drift: no changes since the migration.
- Development database: update reports current; direct read-only schema inspection
  confirms both evidence columns, both check constraints and the migration-history
  row. No row violates the evidence invariant.

## 10. Deferred live acceptance

The codebase contains no approved real managed `.rpt` matching a canonical entity,
so the semantic harness is not misrepresented as real-file/PDF acceptance. By the
requester's development-stage decision, `RISK-008` is Deferred and reopens before
the Fiscal Years child can record Phase 06 or before any release claim. Strict
inspection, current-fingerprint publish/render gates and fail-closed behavior remain
enabled. Fiscal Years remains supported but independent of selected/current
fiscal-year context.

## 11. Known inherited failures

Planning checks pass. All eight feature-scoped documentation recipes pass `-Check`.
The repository-wide documentation check separately reports stale concurrent output
at `documentation/system/generated/fiscal-years/PHASE-02-web-client.md`; that file
is outside this child and was not regenerated or overwritten. Concurrent unrelated
Accounting/Web/Mobile working-tree changes remain outside this child and were
preserved.

## 12. Phase 00 decision

Implementation Ready for the bounded API/runtime child. Ownership, lifecycle,
migration policy, exact inspection surface, client dispositions and required tests
are resolved. Manager UI, live Fiscal Years PDF, operations and security remain
outside this execution authority.

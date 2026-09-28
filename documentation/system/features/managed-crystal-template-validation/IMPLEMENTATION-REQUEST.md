# Managed Crystal Template Validation Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Managed Crystal Template Validation` (`managed-crystal-template-validation`) |
| Operating mode | Existing-feature business lifecycle rebuild |
| Plan / slice | `managed-crystal-reporting-reliability` / `Slice 1 — Managed Crystal Reporting Reliability` |
| Canonical plan | `documentation/plans/business/managed-crystal-reporting-reliability/PLAN.md` |
| Screen/Workflow Contract | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-template-validation.md` |
| Applied reference | Current Reporting/Crystal implementation; no unrelated feature selected |
| Owner | Reporting module plus the database-isolated `CrystalReportGeneratorApi` SDK adapter |
| Request date | 2026-09-27 |
| Review ledger | `documentation/system/features/managed-crystal-template-validation/MANAGED_CRYSTAL_TEMPLATE_VALIDATION-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/managed-crystal-template-validation/required-files.json` |

## Execution request

Implement the API/runtime-only child authorized by the contract. Inspect each
uploaded or deployment-imported `.rpt` against the exact canonical entity profile,
persist the evidence, model validation as a controlled lifecycle, mark old
development versions `NeedsRevalidation`, and require current-valid evidence for
publication and rendering. Do not implement Report Manager UI, Fiscal Years visual
acceptance, runtime operations, or security hardening in this child.

## Approved product decisions

| Concern | Required decision |
| --- | --- |
| Ownership/scope | Reporting owns report/version lifecycle. The legacy runtime inspects Crystal SDK metadata only. Business rows remain owned by Accounting/ReferenceData. Trusted tenant/company scope is unchanged. |
| Fields | Version adds validation status, bounded reason, positive contract schema version when validated, and lowercase 64-character contract fingerprint when validated. Source identity fields stay immutable. |
| Lifecycle | `Pending → Valid` or `Pending → Invalid`; `Valid → NeedsRevalidation` when the canonical contract changes. Publish/render require `Valid` plus the current fingerprint. New create/add/import inspect synchronously and persist `Valid` only after success. |
| Identity | Create receives a supported entity key. Add-version inherits the report entity. Import rechecks catalog source ID/hash and uses the catalog entity. No file name may change the entity relationship. |
| Exact compatibility | One table named `ReportData`; exact ordered field names and portable types; no unsupported additional/missing table or field; the sole managed parameter is required single discrete string `Language`. Nullability is runtime data-shaping evidence but Crystal metadata does not reliably expose DataColumn `AllowDBNull`, so it remains provider/XML validation, not a fabricated template check. |
| Existing rows | Development migration marks every existing version `NeedsRevalidation` and clears any stale fingerprint/schema evidence. Published pointers remain for audit but cannot render until current-valid. |
| Permissions/security | Existing endpoint permissions and per-report ACL remain. No new permission/security redesign; final security phase remains release-blocking. |
| Web/Mobile | No client implementation. Downstream state/error presentation is Deferred to manager/report siblings. |
| Reporting/import | Existing server multipart upload and deployment import are Required. Spreadsheet import is unrelated and Excluded. |
| Education | Required after verified customer-visible recovery UI; this API-only child records operator/admin semantics but does not close education. |

## Existing-System Relationship Review

| Concern | Decision |
| --- | --- |
| Owning capability | `Reporting.Domain/.../CrystalReports`, its CQRS handlers/store/migrations, and `CrystalReportGeneratorApi/Runtime/Inspection`. |
| Primary relationship | Extend the existing aggregate/capability and its external SDK adapter; do not add a parallel validator. |
| Current valid behavior | Bounded private storage, OLE signature check, platform upload inspection, SDK load/source/saved-data/subreport checks, summary extraction, hash verification, immutable source versions, atomic version numbering and row-version publication remain. |
| Current behavior replaced | Generic inspection that only checks presence of `Language`; unconditional creation of `Valid` versions; publication/render without current contract fingerprint. |
| Evidence inspected | Domain entities/configuration/DbContext, create/add/import/publish/render handlers, inspector client/storage, runtime inspector/source/parameter policies, canonical registry, migrations, tests, Web manager and Fiscal Years Web/Mobile consumers. |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision and evidence |
| --- | --- | --- |
| Lifecycle | Reporting Domain `CrystalReportVersion` | Extend with named transitions/current-contract predicate; source identity remains immutable. |
| Canonical schema | Reporting Contracts embedded registry | Reuse identical bytes in both processes; no duplicate field list. |
| SDK inspection | `CrystalReportInspectionService` | Extend with entity profile comparison using installed Crystal `Table.Fields` and parameter metadata. |
| File boundary | `ICrystalReportFileStorage` / `PrivateCrystalReportFileStorage` | Extend intent-specific signature with entity key; return validation evidence. |
| Persistence | Reporting `ReportingDbContext` / configuration / migrations | Extend version columns and allow only validation-field transitions; retain append-only source enforcement. |
| Public contract | Reporting Application response records | Additive version-response fields; create/add/import requests remain stable. |
| Clients | Existing Web/Mobile managed-report consumers | Deferred/no runtime edit; record additive response compatibility only. |

## Business Rules Matrix

| ID | Business rule | Owner / enforcement | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Only an entity present in the canonical registry may be created/imported. | Application + runtime registry | `CrystalReport.UnsupportedEntity` | Unsupported key is rejected before persistence. |
| BR-002 | Report identity is tenant + canonical entity + report key; filename-derived key must match entity prefix and uniqueness remains race-safe. | Application + database | invalid file or duplicate conflict | Existing duplicate/prefix/race tests stay green. |
| BR-003 | Add-version inherits the report's entity and cannot accept caller-selected identity. | Application | not found/invalid file | Inspector receives stored report entity. |
| BR-004 | A managed template contains exactly the approved pushed-data table and exact ordered names/types. | Runtime inspection | schema mismatch | Missing/additional/reordered/wrong-type fixtures reject. |
| BR-005 | The only managed parameter is required single discrete string `Language`; additional/missing/range/multi parameters reject. | Runtime inspection | parameter mismatch | Parameter-shape negative fixtures. |
| BR-006 | Saved data, DB connection metadata, subreports and unreadable SDK metadata reject before storage. | Runtime inspection | invalid report | Existing and extended negative tests. |
| BR-007 | Successful inspection returns the exact current schema version/fingerprint and only that evidence can create `Valid`. | Runtime + Domain factory | Valid current evidence | Fingerprint parity tests. |
| BR-008 | Version source identity/history is immutable; only named validation transitions may modify validation evidence. | Domain + DbContext | invalid transition | Domain and change-tracker tests. |
| BR-009 | Publish requires owned `Valid` version whose fingerprint equals the current registry fingerprint. | Domain/Application | `VersionNotValidated` or `VersionContractStale` | Valid/stale/invalid publish tests. |
| BR-010 | Render requires the published version to still be current-valid before opening/building/calling runtime. | Application | stable incompatible/stale error, no PDF | Renderer/data source not called on stale version. |
| BR-011 | Import re-lists source ID/hash, downloads exact bytes, then performs the same entity-aware inspection/create flow. | Application | source-changed/unavailable/invalid | Changed hash and schema mismatch tests. |
| BR-012 | Existing development versions are not trusted by old generic inspection. | Database migration | `NeedsRevalidation` | Migration operation/backfill assertion and live DB verification. |
| BR-013 | Reports, including `fiscalyears`, are independent of current/selected fiscal-year context. | Reporting/Application | no context requirement | Provider/render contract tests. |
| BR-014 | Money, approvals, period locks, reversal, calculations and numbering are N/A: this workflow validates immutable report templates. | N/A | N/A | Documentation assertion only. |

## Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Stable outcome | Enforcement | Test |
| --- | --- | --- | --- | --- | --- |
| Input shape | Blank/unknown/overlong entity; missing/empty/non-rpt/oversized/bad-signature file | Reject before storage | validation / unsupported entity | validator + storage + registry | Validator/storage tests |
| Duplicate/normalization | Entity/key casing and filename stem | Canonical lowercase identity; no ambiguous duplicate | duplicate/invalid file | Application + DB unique index | Existing handler tests |
| Persisted uniqueness race | Two creates/add-version writers | One identity/version number wins under resource lock/index | conflict or one next version | Application + DB | Concurrency/resource-lock tests |
| Relationship | Missing/archived report or foreign version | Do not add/publish | not found | Application/Domain | Handler tests |
| Scope | Missing/wrong tenant/company | Query filters and actor scope fail closed | not found/forbidden | Infrastructure/Application | Existing isolation tests |
| Permission | Missing create/upload/publish/run or ACL | No business action | 403/404 per existing policy | Presentation/Application | Existing authorization tests |
| Lifecycle | Pending/Invalid/NeedsRevalidation/stale `Valid` published or rendered | Reject; repeated current-valid publish remains allowed under row-version rules | not validated/stale | Domain/Application | Transition/gate tests |
| Concurrency | Stale report RowVersion during publish | Do not overwrite pointer | 409 conflict | EF concurrency | Existing publish tests |
| Retry/double submit | Repeated create/import/add | No duplicate identity/version; staged file cleanup | duplicate/source-changed | handler/store | Failure cleanup tests |
| Transaction rollback | Save/lock failure after storage | Delete newly stored file; no row | exception with cleanup | Application | Handler failure test |
| Post-commit side effect | N/A: no new notification/cache/realtime side effect | None | N/A | N/A | Documentation evidence |
| Archive/delete | Archived reports cannot add/publish/render; immutable versions are retained | Reject mutation; preserve history | not found/business rule | Domain/Application | Existing archive tests |
| Queries | Existing paging/filter/sort unchanged; additive version projection only | Deterministic output | existing contract | Store | Projection/contract test |
| Money/UOM/currency | N/A: no monetary/quantity behavior | None | N/A | N/A | Documentation evidence |
| Date/time/period | N/A: no business-date/fiscal-context decision | None | N/A | N/A | Fiscal independence test |
| Import | Empty/changed/duplicate source, hash mismatch, incompatible template | Atomic rejection, no residual stored file/row | source changed/unavailable/invalid | Application/storage | Import tests |
| Integration | Runtime timeout/unavailable/malformed/oversized response | Retryable unavailable; never assume valid | 503 | client boundary | Inspector client tests |
| File/security-sensitive | Unsafe filename/path, embedded credentials/source metadata, saved data/subreports | Reject and contain path | invalid report | storage/runtime | Existing + runtime harness tests |
| Compatibility/migration | Old rows lack fingerprint; artifact changes | NeedsRevalidation and non-renderable | stale contract | migration/Application | Migration/gate tests |
| Cancellation/unexpected | Caller cancellation or SDK/HTTP failure | Cancel/translate; cleanup staged file | cancellation/503/invalid | boundary/handler | Cancellation/failure tests |
| Scale/operability | Bounded single file/response; synchronous SDK gate | Respect configured limits; capacity work Deferred | busy/unavailable | runtime/storage | Existing bounds plus focused tests |

## Impact Matrix

| Area | Decision | Existing owner | Required change | Evidence |
| --- | --- | --- | --- | --- |
| Domain | Extend | `CrystalReportVersion`, `CrystalReport` | Four-state lifecycle/current-contract predicate | Domain tests |
| Application/CQRS | Change | create/add/import/publish/render handlers | Carry entity/evidence and gate publish/render | Handler tests |
| Infrastructure/persistence | Extend | storage/client/store/configuration | Typed inspection evidence, projections and columns | Persistence/client tests |
| Presentation/API | Extend | existing routes/internal inspector | Add internal entity form field and additive response data | Contract tests |
| Permissions/security | Reuse | existing permissions/ACL | No redesign; preserve checks | Authorization regression |
| Scope | Reuse | current actor/query filters/providers | No caller-supplied trusted scope | Isolation regression |
| Migration | Add | Reporting migrations | Add evidence fields/backfill old statuses | migration/drift/live update |
| Integration | Change | API ↔ Crystal runtime inspection | Typed entity-aware request/response | client/runtime harness |
| Jobs/realtime/cache | N/A | None for validation | No new behavior | Diff review |
| Module tests | Extend | Reporting.Tests | Domain/handler/client/projection/migration tests | focused/full suite |
| Architecture/integration | Reuse | architecture tests | Preserve boundaries; add only if rule changes | architecture suite |
| Web | N/A | manager consumer | Deferred to next child | no-change evidence |
| Mobile | N/A | report consumers | Deferred/Excluded | no-change evidence |
| Documentation/runbook | Extend | plan/books/manifest/recipes | Phase 00–06 evidence | generator/check |

## Import contract

This child concerns deployment `.rpt` import, not spreadsheets. The existing
server-owned catalog route, source ID and expected SHA-256 remain. The server
re-lists, verifies a unique importable descriptor, downloads bounded bytes,
recomputes SHA-256, performs entity-aware SDK inspection, then atomically creates
the same aggregate as upload. It is all-or-nothing and returns existing stable
source-changed, unavailable or invalid-template errors. Web controls are Deferred;
Mobile import is Excluded.

## Offline and synchronization decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Cached/offline read | Excluded | Excluded | Excluded | Validation evidence is server authoritative. |
| Local draft/write | Excluded | Excluded | Excluded | `.rpt` bytes are not an offline business draft. |
| Sync/outbox | Excluded | Excluded | Excluded | Synchronous inspection and module transaction are required. |
| Connection required | Required | Required later | Required for render | Authorization, SDK inspection and persistence require live services. |
| Local security | N/A | N/A | N/A | No local data added. |
| Recovery | Required | Deferred | Deferred | Server keeps immutable source/history; UI recovery belongs to later siblings. |

## Verification and handoff

Run focused Reporting tests, full Reporting tests, architecture tests, Release x64
runtime/harness build, migration generation/inspection/model-drift and development
database update, documentation generation/check, and `git diff --check`. Separate
feature regressions from the known unrelated Accounting/Fiscal Years planning and
generated-document drift. Phase 06 must record `Verified` before this child closes.


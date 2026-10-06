# Managed Crystal Contract Registry — Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Managed Crystal Contract Registry` (`managed-crystal-contract-registry`) |
| Operating mode | Existing-feature substantial rebuild; bounded foundation child |
| Plan ID | `managed-crystal-reporting-reliability` |
| Authorized slice | `Slice 1 — Managed Crystal Reporting Reliability` |
| Canonical plan | `documentation/plans/business/managed-crystal-reporting-reliability/PLAN.md` |
| Screen/Workflow Contract | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-contract-registry.md` |
| Owning module | Reporting |
| Module package | `documentation/modules/reporting/` |
| Canonical engine guide | `documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md` |
| Review artifact | `documentation/system/features/managed-crystal-contract-registry/MANAGED_CRYSTAL_CONTRACT_REGISTRY-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/managed-crystal-contract-registry/required-files.json` |
| Request date | `2026-09-27` |

## Execution request

Implement only the contract-registry foundation. Create one versioned JSON artifact
owned by Reporting and package identical bytes into the modern Reporting process and
the independent .NET Framework Crystal runtime. Add immutable parser/model/registry
implementations appropriate to each process, deterministic SHA-256 fingerprinting,
strict startup validation, provider-schema parity tests and exact runtime lookup.

The registry must cover `countries`, `states`, `districts`, `addresstypes` and
`fiscalyears`. Do not implement entity-aware `.rpt` inspection, version
revalidation/persistence, public API/UI changes, real PDF acceptance, operations
hardening or security work in this child.

## Approved decisions

| Concern | Decision |
| --- | --- |
| Ownership and scope | Reporting owns the report transport registry. Business data remains in Accounting/ReferenceData. Scope vocabulary is exactly `global` or `tenant-company`; `fiscalyears` is `tenant-company`. |
| Artifact | `managed-crystal-report-contracts.v1.json` under Reporting Contracts; schema version `1`; both processes package identical bytes. |
| Entity contract | Stable lowercase entity key, scope, table name, positive maximum rows, ordered columns, allow-listed filters and managed parameters. |
| Column contract | Stable name, portable type and nullability. Portable types in v1: `int32`, `string`, `datetime`. Duplicate names are invalid case-insensitively. |
| Parameters | Only `Language`: type `string`, required, single, discrete, allowed values `ar` and `en`. Runtime inspection enforcement is a later child. |
| Fiscal Years | Table `ReportData`; 16 ordered fields. Fiscal Year fields are required. Fiscal Period fields are nullable. Filters: `Code`, `NameAr`, `NameEn`. No current-year context dependency. |
| Lifecycle/persistence | Registry is immutable source-controlled deployment configuration. No EF entity, migration, user CRUD, hot reload or RowVersion. |
| Permissions | No new endpoint or permission. Existing `CrystalReports:View` plus report Run grant remains unchanged. |
| Web/Mobile | No implementation or wire change. Existing Fiscal Years report view is Deferred to its later business-acceptance child. |
| Import | Excluded for this child; deployment `.rpt` import is unchanged and belongs to later validation work. |
| Education | N/A — internal foundation with no customer-visible action. |

## Existing-System Relationship Review

| Concern | Decision |
| --- | --- |
| Owning capability | Reporting managed Crystal integration: providers under `ErpSystem.Modules.Reporting.Infrastructure/.../CrystalReports`, runtime profiles under `api/CrystalReportGeneratorApi/Runtime/Rendering`. |
| Primary relationship | Extend an existing capability and replace duplicated name-only runtime configuration with one canonical cross-process contract artifact. |
| Existing behavior affected | Keep Reporting-owned scope/data and runtime DB isolation. Change hard-coded name-only profiles and add exact provider parity plus Fiscal Years. |
| Existing path disposition | `CrystalReportProfileRegistry` responsibility remains canonical but its data source changes. No compatibility registry remains. |
| Evidence | `CrystalReportProfileRegistry.cs`; `CrystalReportRenderService.cs`; `CrystalReportDataProviderBase.cs`; both provider files; Reporting DI/tests; Web/Mobile Fiscal Years views. |

### Ownership and reuse inventory

| Item | Owner/source | Decision |
| --- | --- | --- |
| Business rows | Accounting/ReferenceData public reporting Contracts | Reuse unchanged; never query foreign DbContexts. |
| Data shaping | Reporting `ICrystalReportDataProvider` implementations | Extend with schema verification while preserving filters and row caps. |
| Runtime lookup | `CrystalReportProfileRegistry` | Replace hard-coded name lists with parsed exact profiles; preserve fail-closed lookup. |
| Portable artifact | Reporting Contracts project | New module-owned cross-process artifact; not a BuildingBlocks abstraction. |
| JSON parser | Modern .NET and .NET Framework process-local code | New local parsers over identical artifact; strict semantics parity-tested. |
| Fingerprint | SHA-256 over exact artifact bytes | Reuse cryptography locally; no shared business abstraction. |
| Client components | Existing Web/Mobile managed viewers | Reuse unchanged; no code change in this child. |

## Business Rules Matrix

| ID | Business rule | Owner / enforcement | Stable outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Artifact schema version equals `1`. | Both loaders | Startup/configuration failure | Reject missing/unsupported version. |
| BR-002 | Entity keys are lowercase keys and unique case-insensitively. | Both loaders | Startup/configuration failure | Reject empty/invalid/case-duplicate key. |
| BR-003 | Scope is `global` or `tenant-company`; `fiscalyears` is tenant-company. | Contract/loaders | Startup/configuration failure | Accept both; reject unknown; assert Fiscal Years. |
| BR-004 | Table is non-empty and every entity has ordered columns. | Both loaders | Startup/configuration failure | Reject empty table/columns. |
| BR-005 | Column names are unique case-insensitively; types are `int32|string|datetime`; JSON order is authoritative. | Both loaders | Startup/configuration failure | Reject duplicate/type; preserve order. |
| BR-006 | Filters are non-empty and unique case-insensitively. | Both loaders | Startup/configuration failure | Reject duplicate/blank filter. |
| BR-007 | `maxRows` is positive and matches provider bounds. | Loaders/provider parity | Startup/test failure | Reject zero/negative; assert parity. |
| BR-008 | Parameter names are unique; Language is required single discrete string with `ar|en`. | Both loaders | Startup/configuration failure | Exact metadata and malformed tests. |
| BR-009 | Fingerprint is lowercase SHA-256 of exact packaged bytes and matches across processes. | Build/test/composition | Parity failure | Known hash and artifact comparison. |
| BR-010 | Provider table/name/order/CLR type/nullability matches the entity contract exactly. | Reporting parity tests | Configuration/test failure | All five entities plus negative fixtures. |
| BR-011 | Fiscal Year fields set `AllowDBNull=false`; optional Fiscal Period fields set `true`. | Reporting provider | Exact schema | Assert all 16 columns. |
| BR-012 | Runtime supports every artifact entity and no unregistered entity. | Runtime registry | Existing unsupported-profile exception | Lookup five; reject unknown. |

## Edge Cases & Validation Matrix

| Category | Scenario / decision | Expected behavior | Enforcement | Required test |
| --- | --- | --- | --- | --- |
| Input shape | Empty/malformed JSON, null collections, missing properties | Fail; never partially register | Both parsers | Malformed/missing tests |
| Duplicate input | Case-variant entity/column/filter/parameter duplicate | Deterministic rejection | Both registries | Duplicate matrix |
| Persisted uniqueness | N/A — no persistence | No DB work | Source/configuration | No migration/model diff |
| Relationships | N/A — no persisted parents | No lookup | N/A | Source review |
| Scope | Unknown scope or Fiscal Years global | Reject configuration | Loader/tests | Scope tests |
| Permission/entitlement | N/A — no new user operation | Existing authorization unchanged | Existing API | Diff evidence |
| Lifecycle | N/A — immutable startup configuration | Restart after change | Composition | Immutability review |
| Concurrency | Parallel reads after startup | Thread-safe immutable reads | Registry | Parallel lookup if practical |
| Idempotency/retry | Repeated load of same bytes | Same models/fingerprint | Loader | Determinism test |
| Transaction rollback | N/A — no transaction | No state written | N/A | Source review |
| Post-commit effects | N/A — no effects | None | N/A | Source review |
| Archive/restore/delete | N/A — source-controlled artifact | None | N/A | Documentation |
| Query shape | Unknown entity lookup | Fail closed | Runtime registry | Unknown lookup test |
| Money/UOM/currency | N/A — transport schema only | No calculation | Owner modules | Documentation |
| Dates/timezone | `datetime` is XML/CLR DateTime; no timezone conversion | Preserve current data | Provider | Type/schema test |
| Bulk/import | N/A — `.rpt` import unchanged | No import behavior | Later child | Scope diff |
| Integration failure | Artifact missing/mismatched | Fail loader/readiness/test; no fallback list | Composition | Missing resource/fingerprint tests |
| Files/security | Resource path is fixed, not caller-controlled | Load known packaged artifact only | Composition | Fixed-resource review |
| Compatibility/versioning | Unknown schema version or changed bytes | Reject unknown; fingerprint changes | Both loaders | Version/hash tests |
| Cancellation/timeout | N/A — small synchronous startup parse | Complete before serving | Startup | Bounds review |
| Scale/operability | Five small entities | O(n) startup, O(1) lookup | Registry | Count/lookup tests |

## Impact Matrix

| Area | Decision | Existing owner/artifact | Required change | Evidence |
| --- | --- | --- | --- | --- |
| Domain | N/A | Reporting Crystal domain | No aggregate/lifecycle change | Domain diff empty |
| Application/CQRS | Reuse | Existing handlers/provider contracts | No route/use-case change | Build/architecture tests |
| Infrastructure | Change | Reporting providers/DI | Load registry; make provider schemas exact | Reporting tests |
| Runtime | Change | Runtime profile registry/project | Link artifact, parse profiles, add Fiscal Years | Runtime build/tests |
| Presentation/API | N/A | Existing controller | No wire change | Contract tests/diff |
| Permissions/security | N/A | Existing permissions/API key | No change | Permission diff empty |
| Tenant/company scope | Extend | Registry metadata + current context | Declare/verify scopes | Contract tests |
| Migration/data | N/A | Reporting DbContext | No EF change | Model/source review |
| Integrations/events | Reuse | Owner reporting sources | No public contract change | Build/provider tests |
| Jobs/realtime/cache | N/A | Existing features | No change | Diff evidence |
| Module tests | Add | Reporting tests | Parser/artifact/provider/Fiscal Years parity | Focused pass |
| Runtime tests | Add | Independent runtime | Legacy-compatible registry/fingerprint tests or deterministic harness | Test pass |
| Web consumer | N/A | Fiscal Years report page | No code/wire change | Applied profile |
| Mobile consumer | N/A | Fiscal Years report view | No code/wire change | Applied profile |
| Documentation | Add/Change | Plan/guide/books/manifests | Register Phase 00; later update factual runtime evidence | Generator/check |

## Import, offline and client decisions

- Import: Excluded in API/Web/Mobile for this child; runtime `.rpt` import is
  unchanged and reopens in the template-validation child.
- Offline/cache/local draft/outbox/security/recovery: N/A because no client surface
  or user data is created.
- Process startup must load the packaged artifact; clients have no new connection
  requirement.

## Reporting contract

Managed Crystal is Required as the engine context, but visible rendering is
Deferred. Dataset table is `ReportData` with exact ordered entity fields. Filters
remain allow-listed. Existing `CrystalReports:View`, Run ACL and scope remain. This
child accepts schema/profile/fingerprint parity, not a PDF.

## Verification and exit

Before runtime edits, the Phase 00 books, final manifest, recipe registration and
generated preflight must pass. Then run focused Reporting tests, legacy runtime
tests/build, affected solution gates, documentation generation/check and
`git diff --check`. Close only when both processes package identical bytes, all
five entities pass parity, no client/persistence/permission change leaked in, and
Phase 06 is Verified followed by documentation closure.

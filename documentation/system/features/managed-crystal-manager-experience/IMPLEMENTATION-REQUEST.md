# Managed Crystal Report Manager Experience — Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Managed Crystal Report Manager Experience` (`managed-crystal-manager-experience`) |
| Operating mode | Existing-feature change |
| Plan / slice | `managed-crystal-reporting-reliability` / `Slice 1 — Managed Crystal Reporting Reliability` |
| Canonical plan | `documentation/plans/business/managed-crystal-reporting-reliability/PLAN.md` |
| Screen/workflow contract | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-manager-experience.md` |
| Owner | Reporting API and Web Reporting module |
| Request date | 2026-09-27 |
| Review artifact | `documentation/system/features/managed-crystal-manager-experience/MANAGED_CRYSTAL_MANAGER_EXPERIENCE-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/managed-crystal-manager-experience/required-files.json` |
| Shared reuse inventory | P-001, `PageHeader`, `MyDataGrid`, shared form-dialog system, shared feedback and confirmation |

## Execution request

Extend the existing manager in strict order: API supported-entity metadata and
stored-version revalidation, then the Web manager, then explicit Mobile exclusion,
integrated verification, education and closure. Strict validation stays enabled.
Real designer `.rpt`/PDF acceptance stays Deferred under `RISK-008` to Phase 4,
and security/dependency hardening stays Phase 6.

## Approved product decisions

| Concern | Required decision |
| --- | --- |
| Ownership and scope | Reporting owns contracts/lifecycle; authenticated tenant/company remain server-derived; registry metadata is safe global configuration. |
| Fields and relationships | Supported entity returns key, scope, filters, schema version and fingerprint. Revalidation addresses an existing report/version pair and never changes source identity. |
| Permissions and read-only | View lists metadata; Create creates/imports; Upload plus report Upload ACL revalidates/uploads; Publish plus report Publish ACL publishes; app read-only blocks mutations. |
| List contract | Existing server search/status/entity filters and paging remain. Entity values come from the supported-entity endpoint. |
| Lifecycle | Four states: Pending, Valid, Invalid, NeedsRevalidation. Only current-fingerprint Valid can publish/render. Revalidation is idempotent for identical source/current contract. |
| Web views | Grid Required; Detail Required; Import Required; Cards/Table/Tree/Chart/Export Excluded; report execution Deferred to Phase 4. |
| Mobile views | Administration Excluded. Consumer report work remains Phase 4. |
| Reporting | Manager lifecycle Required; new actual `.rpt`/PDF evidence Deferred to `RISK-008`/Phase 4. |
| Realtime/notifications | Excluded; explicit refresh and query invalidation are sufficient. |
| Customer Education Pack | Required after Phase 06 verification at `documentation/plans/business/managed-crystal-reporting-reliability/education/managed-crystal-manager-experience.md`. |

## Existing-System Relationship Review

| Concern | Required decision |
| --- | --- |
| Owning capability | Reporting managed Crystal reports; Domain versions, Application CQRS, Infrastructure storage/registry, Presentation v1 controller, Web manager. |
| Primary relationship | Rebuild/extend an existing capability through its canonical owner; no parallel manager or registry. |
| Existing behavior affected | Preserve create/import/upload/publish/grants/download/archive, ACLs and row-version conflict recovery; replace free-text entity entry and add lifecycle recovery. |
| Existing path disposition | Existing API `/api/v1/crystal-reports` and Web `/administration/crystal-reports` remain canonical. |
| Evidence inspected | Contract registry, aggregate/version, command/query handlers, store/storage, controller, Web types/services/page/dialogs/tests/locales/routes. |

### Ownership, contracts, and reuse inventory

| Item | Owner/source | Decision and evidence |
| --- | --- | --- |
| Domain rules and persistence | Reporting `CrystalReportVersion`, `ReportingDbContext` | Reuse named validation transitions and permitted validation-only updates; no migration. |
| Cross-module contract/event | N/A | No cross-module data call or event is introduced. |
| API registry abstraction | `IManagedCrystalReportContractSource` | Extend with safe bounded entity descriptions; implementation remains the embedded registry. |
| File/inspection boundary | `ICrystalReportFileStorage`, `ICrystalReportInspector` | Reuse verified open plus inspector; no byte overwrite. |
| Web shared UI | Shared form/layout/fields, grid, feedback, confirmation | Reuse before feature-local composition; no raw browser validation/alerts. |

## Business Rules Matrix

| ID | Business rule | Owner / enforcement layer | Stable error or outcome | Required test |
| --- | --- | --- | --- | --- |
| BR-001 | Supported-entity metadata comes from the canonical embedded registry only. | Application/Infrastructure | Bounded ordered metadata list | Query/registry parity test |
| BR-002 | Revalidation addresses a version owned by the requested non-archived report. | Application | Existing not-found outcome | Wrong report/version and archived tests |
| BR-003 | Revalidation requires Upload permission and per-report Upload ACL unless existing bypass applies. | Presentation/Application | Forbidden at policy boundary or not-found at ACL boundary | Controller permission and handler ACL tests |
| BR-004 | Stored bytes are opened by immutable key, expected size and SHA-256; source fields never change. | Infrastructure/Domain | Source unavailable/invalid file | Hash/open and persistence immutability tests |
| BR-005 | Current exact inspection marks Valid with current schema/fingerprint; deterministic mismatch marks Invalid with safe reason. | Domain/Application | Valid or Invalid response | Positive, schema, parameter and invalid-report tests |
| BR-006 | Inspector/storage transient failure preserves prior validation evidence. | Application | Stable unavailable error | Prior-state preservation test |
| BR-007 | Repeating successful revalidation is idempotent and cannot create a new version. | Domain/Application | Same version/current evidence | Repeat test |
| BR-008 | Publish stays blocked unless the version is Valid for the current fingerprint. | Domain/Application | Not validated or stale contract | Existing plus Web action test |
| BR-009 | Fiscal Years is one optional supported entity, not a selected/current Fiscal Year dependency. | Registry/Application | Entity metadata only | Metadata and no-context request test |

## Edge Cases & Validation Matrix

| Category | Scenario | Expected behavior | Stable outcome | Enforcement layer | Required test |
| --- | --- | --- | --- | --- | --- |
| Input shape / format | Empty IDs or malformed route input | Reject before handling | Validation ProblemDetails | FluentValidation/routing | Validator/controller tests |
| Duplicate input / normalization | Entity keys vary by case in registry | One canonical lower-case key | Ordered unique list | Registry | Registry test |
| Duplicate persisted data | N/A: revalidation adds no row | Existing version only | No duplicate | Application | Count/source identity assertion |
| Relationship state | Version belongs elsewhere or report archived | Do not inspect/mutate | Not found | Application | Handler tests |
| Tenant/company scope | Cross-tenant report is filtered by store | No disclosure/mutation | Not found | Infrastructure/Application | Scope test |
| Permission / actor | Missing Upload claim or ACL | No revalidation | 403 or not found per boundary | Presentation/Application | Denial tests |
| Lifecycle | Any of four states | Revalidate safely; publish only current-valid | Typed state | Domain/Application | State matrix tests |
| Concurrency | Publish competes with revalidation | Report lock serializes; publish RowVersion remains authoritative | Current state / 409 publish | Application/Database | Lock/handler tests |
| Idempotency | Same version revalidated twice | No new version/source change | Same current evidence | Domain/Application | Repeat test |
| Transaction rollback | Save fails after inspection | No partial evidence committed | Rollback | Unit of work | Failure test where supported |
| Post-commit side effect | N/A: no post-commit external side effect | None | N/A | N/A | Contract assertion |
| Archive/restore/delete | Archived report | No revalidation | Not found | Application | Handler test |
| Paging/filtering | Entity filter uses API list; report list stays server-paged | Existing deterministic query | Existing response | API/Web | Service/page tests |
| Money/UOM/currency | N/A: no financial calculation | None | N/A | N/A | N/A |
| Dates/timezone/periods | N/A: no date or fiscal-period business rule | None | N/A | N/A | N/A |
| Import/atomicity | Import still uses strict create | No partial report on failure | Existing stable errors | Application/Web | Import and UI tests |
| Integration timeout/retry | Inspector unavailable | Preserve prior evidence; user may retry | Inspector unavailable | Application | Handler test |
| File/ownership/path | Storage key is never client supplied | Verified private open only | Source unavailable/invalid | Infrastructure | Storage test |
| Compatibility/versioning | Contract fingerprint changed | NeedsRevalidation until rechecked | Stale/current evidence | Domain/Application | Transition test |
| Cancellation/unexpected failure | Cancellation during open/inspect/save | No false state transition | Cancellation/error | Application | Cancellation test where practical |
| Scale/operability | Metadata bounded; no per-row runtime call in grid | One metadata call | No N+1 | Query/Web | Service/query review |

## Impact Matrix

| Area | Decision | Existing owner / artifact | Required change | Evidence / test |
| --- | --- | --- | --- | --- |
| Domain | Reuse | `CrystalReportVersion` | Invoke named transitions only | Domain tests |
| Application / CQRS | Add | Crystal commands/queries | Metadata query and revalidate command | Handler tests |
| Infrastructure / persistence | Extend | Registry/store/storage | Expose metadata and verified read | Registry/storage/persistence tests |
| Presentation / API | Add | `CrystalReportsController` | Two v1 routes | Contract/permission tests |
| Permissions / security | Reuse | Existing permissions/ACL | No new permission or hardening | Denial regression |
| Tenant/company scope | Reuse | Reporting store | No client scope inputs | Scope regression |
| Migration/data compatibility | N/A | Reporting model | No schema change | Model-drift check |
| Integrations/events | N/A | No new owner | No event/provider call | Architecture review |
| Jobs/realtime/cache | N/A | Explicit refresh | No job/realtime | Web invalidation test |
| Module tests | Extend | Reporting tests | Query/revalidation/controller cases | Full module pass |
| Architecture tests | Reuse/verify | API architecture suite | Preserve boundaries | Full pass |
| Web consumer | Change | Crystal manager | Typed endpoint/state/revalidation/shared form UX | Type-check/focused tests |
| Mobile consumer | N/A | No manager route | Explicitly Excluded | Source audit |
| Documentation/runbook | Add/Change | Feature books/packets/guide | Phase 00–07 and education | Generation/check |

## Import contract

The existing deployment-source import is Required on Web and unchanged on the
wire: server-owned catalog, opaque source ID, expected SHA-256, optional
description, strict re-list/download/hash/inspection, atomic create, stable errors
and explicit refresh. No spreadsheet/client parser, partial batch, rejected-row
artifact or Mobile import exists. Tests cover exact body, eligibility/reason,
changed hash, permission, conflict and refresh.

## Offline and synchronization decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Cached/offline read | Excluded | Excluded | Excluded | State must be current and authoritative. |
| Local draft/write | N/A | Local unsaved form only | Excluded | Never final before API success. |
| Sync/outbox write | Excluded | Excluded | Excluded | Mutations require live authorization/inspection. |
| Connection required | Required | Required | N/A | Every manager read/mutation is online. |
| Local security | N/A | Browser memory only | N/A | No persisted report file/state. |
| Lifecycle/recovery | Required | Required | N/A | Retry/reload; no offline queue. |

## Reporting contract

Manager lifecycle is Required using Managed Crystal. This child owns safe entity
metadata, validation evidence and revalidation UX, not a new dataset/template.
Exact schemas stay in the canonical registry. Clients never send paths, connection
strings, tenant IDs or company IDs. Real positive designer `.rpt` and PDF acceptance
is Deferred to Phase 4 under `RISK-008`.

## Verification and handoff

Required gates: focused/full Reporting tests, API architecture tests, model-drift
check, Web focused tests, type-check, Web architecture check, documentation
generation/check, planning check and `git diff --check`. Phase 06 must be Verified
before education and Phase 07 close.

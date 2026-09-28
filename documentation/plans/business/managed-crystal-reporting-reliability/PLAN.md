# Managed Crystal Reporting Reliability — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | managed-crystal-reporting-reliability |
| Business capability | Managed Crystal Reporting Reliability |
| Owning module | Reporting |
| Status | `Active` — contract-registry and template-validation are Verified/Closed; Report Manager experience is the active preflight; real `.rpt`/PDF acceptance is Deferred to Fiscal Years Phase 4; security remains the final implementation phase |
| Target milestone | Development readiness and production-safe release |
| Primary owner | Reporting API + Crystal runtime owners |
| Reference feature(s) | Existing `crystal-report-manager`; Countries managed report; Accounting Fiscal Years |
| Planning method version | `2.0 — capability plan + slice roadmap + feature contract + evidence ledger` |
| Related plans | `reporting-delivery`; `accounting-core-gl`; `crystal-report-ai-view-designer` is separate and excluded |
| Last reviewed | `2026-09-27` |

### Planning evidence

- Discovery: `DISCOVERY.md`
- Current-system evidence: `EVIDENCE.md`
- Approved pre-plan specification: `SPEC_SUMMARY.md`
- Dependency/status roadmap: `IMPLEMENTATION-ROADMAP.md`
- Decisions: `DECISIONS.md`

The master plan owns the approved target. Current behavior claims remain traceable
to `EVIDENCE.md`. The requester authorized continuation on 2026-09-27. The
contract-registry and template-validation children are Verified/Closed and the
roadmap now owns the bounded Report Manager experience preflight. Later children
and release remain gated by `IMPLEMENTATION-ROADMAP.md`.

## 1. Executive outcome

### Business problem

Managed reports can be accepted and published without proving that their tables,
fields, types, nullability and parameters match the DataSet produced by the owning
business module. The runtime and Reporting module maintain different notions of
supported entities. `fiscalyears` is already exposed by API/Web/Mobile and has a
Reporting data provider, but the Crystal runtime has no matching profile, so the
business journey cannot render successfully.

### Desired outcome

Every supported entity has one exact, versioned contract. A template is inspected
for that entity before it is valid or publishable, a published version records the
contract fingerprint it passed, and runtime render verifies the same contract.
Fiscal Years becomes the first fully accepted tenant/company business report across
API, Web and actual Mobile. Operational and security work follows after correctness,
with security retained as the final release gate.

### Success measures

| Measure | Current | Target | Evidence |
| --- | --- | --- | --- |
| Supported-entity parity | API/provider/client and runtime lists drift; `fiscalyears` fails at runtime lookup | 100% parity from one registry; startup fails on invalid/duplicate contracts | Registry parser/startup and provider/runtime parity tests |
| Publish compatibility | Generic inspection can mark an entity-incompatible template valid | 0 incompatible versions can become Valid or Published | Golden compatible/incompatible `.rpt` integration tests |
| Fiscal Years journey | Provider and clients exist; runtime profile is missing | Authenticated AR/EN Web and actual-Mobile render succeeds with company isolation and Run ACL | Phase 4 live acceptance record |
| Error actionability | Different failures collapse to unsupported profile/invalid report | Stable distinct error codes and localized client messages for every failure class | Contract tests across runtime/API/Web/Mobile |
| Runtime verification | Build and partial smoke only; no runtime test project | Automated runtime unit/contract suite plus render/readiness/package smoke | CI/test logs and Phase 06 evidence |
| Release packaging | Package can omit report source/catalog readiness | Release manifest explicitly proves runtime, contract fingerprint and source/catalog state | `PROD-025` staging/Production evidence |

## 2. Scope

### Required now

- Canonical versioned entity contract registry shared across Reporting and runtime.
- Exact schema: entity/scope/table, ordered fields, types, nullability, filters,
  limits and managed parameters.
- `fiscalyears` exact schema and tenant/company business behavior.
- Entity-aware inspection, immutable version identity and publish/render gates.
- Revalidation lifecycle and development migration/backfill.
- Supported-entity API and Web selection/validation experience.
- Stable cross-process error taxonomy.
- Fiscal Years `.rpt` fixture/template and API/Web/Mobile live acceptance.
- Runtime tests, package/catalog readiness, capacity/cancellation/memory/diagnostics.
- Security, secrets, transport and dependency hardening as the last implementation
  phase before final closure.

### Deferred

| Capability | Reason | Owner | Reopen trigger |
| --- | --- | --- | --- |
| Additional managed parameters beyond `Language` | No approved business template requires them now. | Reporting/Product | A supported entity demonstrates a typed parameter owned by a business workflow. |
| Additional report-manager visualizations/bulk operations | They do not improve template compatibility or Fiscal Years correctness. | Reporting/Web | A measured administration workflow requires them. |

### Excluded

| Capability | Reason |
| --- | --- |
| Web/Mobile Crystal designer | Separate `crystal-report-ai-view-designer` plan; not needed for reliable managed files. |
| Native Mobile report administration | Current product requires Mobile consumption, not administration. |
| Subreports, saved data, external DB connections | Violate the pushed-DataSet and database-isolated runtime contract. |
| Runtime-owned ERP SQL/business logic | Reporting and owning modules remain authoritative. |
| Fiscal Years in global reporting scope | Fiscal Years is tenant/company accounting data. |
| Report availability tied to selected/current fiscal year | Reporting this entity is independent of accounting-period context selection. |
| RDLX/ReportTemplate changes | Separate reporting engine and ownership. |

## 3. Ownership and existing-system relationship

### Bounded-context owner

Reporting is the canonical owner of managed Crystal definition/version lifecycle,
supported-entity reporting contracts, publication, access grants, public API and
runtime integration. Accounting owns Fiscal Year/Period truth. Reference Data owns
its reportable entities. The independent Crystal runtime owns only SDK-specific
inspection/render execution.

### Existing-system relationship matrix

| Existing concept/system | Relationship | Source of truth | Reuse/change/remove | Evidence |
| --- | --- | --- | --- | --- |
| Managed Crystal domain/API | Existing owner | Reporting module | Extend validation state/fingerprint and contracts; preserve lifecycle/ACL | `CrystalReport`, `CrystalReportVersion`, controller/handlers |
| Crystal runtime | Existing internal adapter | `api/CrystalReportGeneratorApi` | Replace name-only profiles, extend inspect/readiness/tests; preserve DB isolation | Runtime source and smoke evidence |
| Accounting reporting source | Business-data owner | Accounting Contracts | Reuse; make emitted Fiscal Years DataTable exactly match registry | `IAccountingReportingSource`; `FiscalYearsCrystalReportDataProvider` |
| Web Crystal Report Manager | Existing administration client | Reporting Web feature | Reuse server grid/detail workflow; replace free text and expose validation state/errors | `CrystalReportManagerPage.tsx` and dialogs |
| Web/Mobile managed viewer | Existing consumption clients | Shared Reporting adapters | Reuse; map new stable errors and verify Fiscal Years | `ManagedCrystalReportView` on both clients |
| Deployment report catalog | Existing source discovery | Runtime filesystem policy | Distinguish candidate/signature eligibility from supported-contract importability | `CrystalReportCatalogService` |
| RDLX ReportTemplates | Separate reporting product | Reporting ReportTemplates aggregate | No change | Existing Reporting domain/docs |

### Cross-module dependencies

| From | To | Contract/mechanism | Why ownership is not duplicated |
| --- | --- | --- | --- |
| Reporting | Accounting | `IAccountingReportingSource.GetFiscalYearsAsync` | Accounting returns business rows; Reporting shapes reporting transport. |
| Reporting | Reference Data | Existing module reporting Contracts | Owners provide business truth; Reporting does not access their DbContexts. |
| Reporting | Crystal runtime | Typed internal inspect/catalog/source/render/readiness clients | Runtime receives report source + prepared schema/data only. |
| Web/Mobile | Reporting | Versioned public `/api/v1/crystal-reports` endpoints | Clients never call the runtime or know physical paths/secrets. |

## 4. Personas, roles, tenant/company scope

| Persona/role | Goals | Allowed scope | Critical restrictions |
| --- | --- | --- | --- |
| Reporting administrator | Create/import/version/publish/archive and manage grants | Authenticated tenant + active company; exact action permissions | Cannot invent unsupported entity keys or bypass template validation. |
| Report consumer | List/render/download permitted published reports | Active tenant/company plus `CrystalReports:View` and report `Run` grant | No source paths, SQL, scope IDs or unpublished versions. |
| Super Admin global report user | Use global geographic reports only | Existing global reporting rules | `fiscalyears` is not included in this global scope. |
| Release operator | Deploy matching runtime/contracts/sources and prove readiness | Target environment | Cannot mark healthy/release-ready from process liveness alone. |
| Internal runtime service | Inspect/render approved contracts | Server-to-server request | No ERP database credentials or business authorization decisions. |

## 5. Domain model

| Concept | Type | Owner | Identifier/business key | Notes |
| --- | --- | --- | --- | --- |
| ManagedReportEntityContract | Versioned configuration contract | Reporting | `entityKey + contractVersion` | Scope, table, fields, filters, limits, parameters, fingerprint. |
| CrystalReport | Aggregate | Reporting | Tenant + stable `reportKey` | Bound permanently to one supported `entityKey`. |
| CrystalReportVersion | Immutable aggregate child | Reporting | `versionId` / sequence | Stores source hash, inspection result, contract version/fingerprint and validation timestamp. |
| ValidationState | Value/lifecycle state | Reporting | `Pending`, `Valid`, `Invalid`, `NeedsRevalidation` | Publication/render require current `Valid`. |
| ReportAccessGrant | Aggregate child | Reporting/Platform role identity | report + role | Rights such as Run; tenant/company constrained. |
| DeploymentCandidate | Ephemeral runtime DTO | Runtime | opaque source ID + SHA-256 | Not importable until entity support and inspection pass. |
| FiscalYearsReportData | Typed reporting projection | Accounting → Reporting | Fiscal Year/Period IDs | Table `ReportData`; exact schema frozen in Phase 1. |

### Invariants

1. Entity keys come only from the canonical supported registry.
2. A report's entity key and report key cannot change across versions.
3. A version is valid only for the recorded current contract fingerprint.
4. Publish and render require `Valid` against the current fingerprint.
5. Inspection verifies source policy, exact schema and exact managed parameters.
6. Tenant/company/permissions/grants are evaluated by Reporting, never the runtime.
7. Runtime accepts only pushed ADO.NET XML data matching one exact contract.
8. `fiscalyears` remains tenant/company scoped and has no implicit current-year filter.

## 6. Lifecycle / state machine

| Current state | Action | Next state | Actor | Preconditions | Side effects |
| --- | --- | --- | --- | --- | --- |
| None | Upload/import initial version | `PendingInspection` | Admin | Supported entity; Create permission; valid source identity/size | Temporary bounded runtime inspection request. |
| `PendingInspection` | Exact inspection succeeds | `Valid` | System | Source policy + schema + parameters match fingerprint | Store immutable source and inspection metadata. |
| `PendingInspection` | Inspection rejects | `Invalid` or no persisted version | System | Safe deterministic rejection | Return stable field/template error; never publish. |
| `Valid` | Publish | `Published` pointer → version | Admin | Publish permission, RowVersion, current fingerprint | Previous immutable versions remain; catalog changes. |
| `Valid`/`Published` | Contract fingerprint changes | `NeedsRevalidation` | System/migration | Registry version changes | Block publish/render until reinspection; clear/block stale pointer per migration decision. |
| `NeedsRevalidation` | Reinspect | `Valid` or `Invalid` | Admin/System | Source still available and current contract exists | Record new fingerprint/timestamp/result. |
| Active report | Upload version | New `PendingInspection` child | Admin | Upload permission + report ACL + strict report identity | Existing published version remains until explicit publish. |
| Active report | Archive | Archived | Admin | Archive permission + RowVersion | Hidden from normal catalog; immutable history retained. |

## 7. Business rules matrix

| Rule ID | Action/scenario | Preconditions | Rule/validation | Failure | Side effects |
| --- | --- | --- | --- | --- | --- |
| BR-001 | Resolve supported entity | Registry loaded | Entity key must exist exactly once and declare scope/provider/table/fields/filters/parameters | `crystal_entity_unsupported` | None |
| BR-002 | Build report data | Provider registered | Provider output table/schema must exactly match registry, including type/nullability/order | `crystal_data_contract_mismatch` | No runtime call |
| BR-003 | Fiscal Years schema | `entityKey=fiscalyears` | Exact 16-field Fiscal Year/optional Period contract; Code/NameAr/NameEn filters only; tenant/company source | Stable validation error | No global-scope fallback |
| BR-004 | Inspect template | Supported entity + bounded file | Source policy, table fields/types/nullability and managed parameters match current contract | `crystal_template_contract_mismatch` or `crystal_template_unsafe` | Invalid source never becomes publishable |
| BR-005 | Managed language | Inspect/render | `Language` is one required discrete string accepting only `ar`/`en`; unsupported required parameters are rejected | `crystal_parameter_contract_mismatch` | Runtime sets value from server request |
| BR-006 | Create report | Create permission | Entity selected from server catalog; normalized report key unique per tenant; summary metadata/fallback valid | Domain/validation conflict | Creates report + immutable version transactionally after inspection |
| BR-007 | Add version | Upload permission + report access | Filename/source report key equals parent stable key; entity and contract are inherited, never caller-selected | `crystal_report_identity_mismatch` | Adds immutable version only |
| BR-008 | Publish | Publish permission + RowVersion | Version belongs to report and is Valid for current fingerprint | conflict/stale/invalid-version problem | Atomically updates published pointer and RowVersion |
| BR-009 | Render | View permission + Run grant | Report active/published/current-valid; filters allow-listed/bounded; provider scope derived from session | forbidden/not-found/stale-contract/data-too-large | Returns bounded PDF; no business data persisted in runtime |
| BR-010 | Catalog candidate | Runtime source root available | Path/name/size/OLE/hash eligibility is separate from supported entity/importability | candidate marked non-importable with reason | No deep SDK work during list |
| BR-011 | Import candidate | Create permission | Opaque ID + expected hash revalidated; entity supported; full inspection passes | conflict or compatibility error | Copies to private storage through normal create pipeline |
| BR-012 | Contract change | Registry fingerprint changes | All older Valid/Published versions become NeedsRevalidation in development migration | stale-contract error | Audit migration and revalidation result |
| BR-013 | Errors | Any internal call | Preserve safe stable code/category/correlation; do not relabel infrastructure failure as invalid user file | mapped ProblemDetails | Clients localize by code |
| BR-014 | Fiscal Year labels | AR/EN render | Template selects FiscalYear/Period AR or EN names using Language; statuses/frequency translation decision is explicit | visual acceptance failure | No hidden string mutation in runtime |

## 8. Edge cases and validation matrix

| Category | Scenarios / decision |
| --- | --- |
| Duplicate/idempotency | Duplicate entity contract/startup is fatal; report key uniqueness is tenant-scoped; repeated publish of same current version may be idempotent only with current RowVersion. |
| Concurrency/RowVersion | Publish, access replacement and archive keep SQL RowVersion. Revalidation/migration cannot silently overwrite a newer version or grant update. |
| Stale data | Contract fingerprint, deployment candidate SHA and report RowVersion detect three distinct stale conditions with distinct errors. |
| Partial failure/transactions | Do not persist a valid version before inspection and atomic private storage succeed; clean temporary workspaces on all outcomes. |
| Invalid lifecycle transition | Invalid/NeedsRevalidation versions cannot publish/render; archived reports cannot version/publish/render. |
| Missing/archived dependency | Missing provider/entity contract/runtime/catalog yields explicit unavailable/unsupported result, never fallback SQL. |
| Tenant/company mismatch | Reporting derives tenant/company and data source from authenticated context; grants/roles must belong to the tenant. |
| Permission changes | API re-evaluates permissions and Run grants on each action; cached client visibility is advisory. |
| Date/time/timezone | Fiscal Year/Period `DateOnly` values map deterministically to midnight `DateTime` with no timezone conversion; render timestamps use UTC for audit. |
| Currency/rounding/precision | N/A — no monetary calculation belongs to this runtime slice. |
| Large dataset/paging | Data providers keep bounded filters and row cap; report data is whole bounded result, not client paging. Oversize fails before native render. |
| Import duplicate/atomicity | Candidate hash is rechecked; duplicate report key returns conflict; source copy + domain creation follows existing atomic cleanup discipline. |
| External outage/timeout | Runtime unavailable/timeout/capacity are retryable service errors distinct from invalid template; retry policy must not duplicate writes. |
| Mobile offline/conflicts | Report render is online-authoritative; no offline generation. Previously cached PDF behavior remains bounded/private and does not imply current validity. |
| Audit/history | Immutable versions, source hash, validation fingerprint/result/time, publisher and grant changes remain inspectable. |
| Sensitive data/security | No DataSet/PDF/source content in logs; runtime workspace is transient; hardening is Phase 6. |

## 9. Permissions and security

Existing exact permissions remain the authority; this plan does not add a broad
`Manage` claim. `Run` is the per-report grant evaluated in addition to View.

| Actor | Permission | Access mode / scope | Exact action/data controlled | Endpoint/message | Web guard | Mobile guard | EN/AR label owner | Server enforcement / denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Consumer | `CrystalReports:View` + report `Run` grant | Tenant/company | List and render published report | `GET /api/v1/crystal-reports`; `POST /{id}/render` | Managed viewer availability + direct handler | Reporting access adapter + direct use case | Platform Auth catalogs | 403 when either permission/grant absent |
| Admin | `CrystalReports:Create` | Tenant/company | Upload initial report or import candidate | `POST /api/v1/crystal-reports`; `POST /deployment-imports` | Create/import controls + callback guard | Excluded | Platform Auth catalogs | Unsupported entity and permission denial tests |
| Admin | `CrystalReports:Upload` | Tenant/company + report ACL | Add immutable version/revalidate source | `POST /{id}/versions` and planned revalidate action | Detail-dialog direct guard | Excluded | Platform Auth catalogs | Deny without claim/access; identity mismatch test |
| Admin | `CrystalReports:Publish` | Tenant/company + report ACL | Change published pointer | `POST /{id}/versions/{versionId}/publish` | Detail-dialog direct guard | Excluded | Platform Auth catalogs | Deny invalid/stale-contract version and missing claim |
| Admin | `CrystalReports:Download` | Tenant/company + report ACL | Download approved source/version | existing download routes | Detail/grid direct guard | Excluded | Platform Auth catalogs | Denial and cross-tenant tests |
| Access admin | `CrystalReportAccess:View` | Tenant/company | View grants/version administration detail | existing access/detail routes | Detail-tab guard | Excluded | Platform Auth catalogs | 403 denial test |
| Access admin | `CrystalReportAccess:Edit` | Tenant/company | Replace report role rights | `PUT /{id}/access` | Save callback guard | Excluded | Platform Auth catalogs | Role tenant + exact-right denial tests |
| Admin | `CrystalReports:Archive` | Tenant/company + report ACL | Archive active report | `DELETE /{id}` | Confirmation + direct guard | Excluded | Platform Auth catalogs | Separate denial and stale RowVersion tests |

Security execution is deliberately Phase 6. Server-authoritative permission/scope
correctness remains part of every earlier business phase and is not postponed.

## 10. Persistence and migration

| Store/entity | Schema/owner | Key constraints/indexes | Tenant/company filter | Delete/archive rule |
| --- | --- | --- | --- | --- |
| CrystalReport | Reporting `rpt` schema | Existing tenant/report-key uniqueness + RowVersion | Required | Soft archive/history retained |
| CrystalReportVersion | Reporting `rpt` schema | Immutable report/version sequence; add contract version/fingerprint, validation state/code/time | Through parent report | Never overwrite/delete as normal workflow |
| Managed entity contracts | Versioned repository JSON/content artifact owned by Reporting | Unique entity key/version; deterministic canonical fingerprint; startup validation | Scope declared per entity | Source-controlled evolution, not tenant data |
| Runtime temporary workspace | Runtime filesystem | Per-request random directory, bounded files | No business identity in path | Always cleanup/scavenge |

Migration/backfill strategy:

1. Add validation state, contract version/fingerprint, validation timestamp and safe
   error-code fields to report versions as needed.
2. In development, mark every existing version `NeedsRevalidation`; block or clear a
   published pointer that no longer targets current-valid content.
3. Inventory existing private/deployment `.rpt` sources, re-inspect them against the
   new registry, and record deterministic outcomes.
4. Reconfirm this clean-revalidation policy before applying to a shared/staging DB.

Transaction boundaries: domain row updates and publication pointer/RowVersion are
transactional in Reporting; native inspection and file IO occur before committing a
new Valid version, with compensating cleanup rather than a distributed transaction.

## 11. API / CQRS / contracts

| Operation | Type | Route/message | Permission | Request | Response | Error/concurrency contract |
| --- | --- | --- | --- | --- | --- | --- |
| List supported entities | Query | Planned `GET /api/v1/crystal-reports/supported-entities` | View for consumption; Create for admin metadata as appropriate | Optional usage context | Entity key, localized label, scope, filters, contract version/fingerprint, capabilities | No secrets/types that expose internals; stable unsupported/unavailable errors |
| Create | Command | Existing `POST /api/v1/crystal-reports` | Create | Supported `entityKey`, description, `.rpt` | Detail + validation metadata | Exact entity inspection; conflict on report key |
| Add version | Command | Existing `POST /{id}/versions` | Upload | `.rpt`; entity inherited | Version + validation metadata | Strict report identity/current fingerprint |
| Revalidate version | Command | Route finalized in child contract | Upload or Publish policy decision | Report/version IDs + RowVersion if state mutates | Updated validation metadata | Idempotent for same source/fingerprint; stale conflict |
| Publish | Command | Existing `POST /{id}/versions/{versionId}/publish` | Publish | RowVersion | Updated detail | Only current-valid version; 409 stale |
| Catalog/import | Query/Command | Existing deployment routes | Create | Entity filter/opaque ID/hash/description | Candidate reasons or created detail | Hash conflict; supported-contract and inspection errors |
| Render | Query | Existing `POST /{id}/render` | View + Run grant | `language=ar|en`, allow-listed entity filters | Bounded PDF | Current-valid fingerprint, data-size, runtime unavailable/timeout distinctions |
| Runtime inspect | Internal command | `POST /internal/reports/inspect` | Internal key | Entity key + bounded `.rpt` + expected contract fingerprint | Summary metadata, inspected fingerprint, validation facts | Unsafe template vs contract mismatch vs runtime failure |
| Runtime render | Internal command | `POST /internal/reports/render` | Internal key | Entity key, fingerprint, report source, XML schema/data, language | Bounded PDF | Exact data/template contract and capacity/cancellation errors |
| Runtime readiness | Internal query | `GET /internal/reports/health` or split readiness route | Internal key | None | Liveness + readiness components, installed runtime version, profile count/fingerprint, catalog state | 503 with component reason |

### Cross-module events/contracts

| Event/contract | Producer | Consumer | Delivery/idempotency rule |
| --- | --- | --- | --- |
| `IAccountingReportingSource.GetFiscalYearsAsync` | Accounting | Reporting | Synchronous query, bounded row probe, cancellation; no persistence side effect. |
| Managed entity contract artifact | Reporting source/build | Reporting + runtime | Identical canonical bytes/fingerprint packaged in both artifacts; startup/test mismatch fails. |
| Report publication/grant state | Reporting | Web/Mobile viewers | Read through authenticated API; no new integration event required in this slice. |

## 12. Web experience

Prepared design reference: existing source is the baseline. No external mockup
overrides business rules, permissions, RTL, accessibility or shared components.

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |
| List/Grid | Required | Existing server-managed manager grid; add validation/contract state where actionable. |
| Cards | Excluded | Administration workflow gains no value from duplicate view. |
| Detail | Required | Versions, validation facts, publish/download/grants/archive. |
| Create/Edit | Required | Create/upload/import/revalidate; supported entity selector; shared `MyForm` dialog system. |
| Search/Filter/Sort | Required | Server-owned search/status/supported-entity filter. |
| Pagination | Required | Existing server pagination/MyDataGrid footer. |
| Bulk actions | Excluded | Not needed for reliable lifecycle. |
| Import | Required | Deployment candidate with compatibility reason and hash revalidation. |
| Export/Report | Required for business screens | Existing shared managed PDF viewer, including Fiscal Years. |
| Realtime | Excluded | Explicit refresh/invalidation is sufficient. |

Primary journeys:

1. Admin selects supported entity → uploads compatible file → reviews Valid result →
   publishes → assigns Run access.
2. Admin opens invalid/stale version → sees exact mismatch → uploads correction or
   revalidates after contract change.
3. User opens Fiscal Years Report → applies Code/Name filter → renders AR/EN PDF.

Shared/reusable component mapping:

| UI need/reference element | Existing shared component | Decision | Reason |
| --- | --- | --- | --- |
| Page/grid/feedback/pagination | `PageHeader`, `MyDataGrid`, shared feedback | Reuse | Existing manager already uses them. |
| Create/upload form | `MyForm`, `FormContainer`, `FormHeader`, `FormContent`, `FormFooter`, shared fields/file control | Refactor to shared system | Current raw MUI dialog/free-text validation does not meet shared-form rules. |
| Confirmation/errors/toasts | `ConfirmationDialog`, shared feedback | Reuse | Preserve non-native accessible behavior. |
| PDF render | `web-next/src/modules/reporting/crystal-report-manager/ManagedCrystalReportView.tsx` | Reuse/extend error mapping | Existing authenticated viewer is the correct seam. |

## 13. Mobile experience

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |
| Report Manager administration | Excluded | Web-only administrative workflow. |
| Fiscal Years report selection/render | Required | Existing Fiscal Years screen and shared `ManagedCrystalReportView`. |
| AR/EN filters and PDF handling | Required | Code/NameAr/NameEn, online authoritative render, bounded temporary PDF. |
| Validation/contract errors | Required | Localized stable errors with retry; no generic unsupported message. |
| Offline generation | Excluded | Crystal render requires authenticated API/runtime. |

Offline/sync/deep-link/notification behavior: online-authoritative; no outbox or
background generation. A cached PDF is only a temporary previously generated file,
not evidence that the current report/version/data is valid.

Mobile shared/reusable component mapping:

| UI need/reference element | Existing shared component | Decision | Reason |
| --- | --- | --- | --- |
| Managed report catalog/render | `mobile-react/src/platform/reporting/presentation/ManagedCrystalReportView.tsx` | Reuse/extend stable error mapping | Already centralizes authenticated report viewing. |
| Fiscal Years composition | `FiscalYearReportView.tsx` | Reuse | Already supplies entity key and supported filters. |
| Feedback/retry/file preview | Platform reporting/shared feedback | Reuse | Avoid feature-local network/file behavior. |

## 14. 5-point structured-data parity audit

| Audit point | Web | Mobile | Evidence/decision |
| --- | --- | --- | --- |
| Creation Journey | Report admin can select entity/upload/import/revalidate | Excluded for administration | Web manager tests; explicit Mobile exclusion |
| Editing Journey | Immutable version upload plus grants/publish/archive; no source overwrite | Excluded for administration | API/Web lifecycle tests |
| Viewing Journey | Manager detail and Fiscal Years PDF | Fiscal Years PDF | Authenticated live acceptance |
| Listing & Filtering | Manager server list; Fiscal Years report filters | Fiscal Years report selector/filters | API/Web/Mobile contract tests |
| Mock/Test Data Generator | Golden `.rpt` and deterministic DataSet fixtures; no production mock button required | N/A — read-only online report view | Test fixtures and live data acceptance |

## 15. Reporting / import / export / files

- Managed Crystal report render is Required.
- Deployment source import is Required and remains hash/path-safe.
- Source download is Required under exact permission/report access.
- `.rpt` source, XML DataSet and PDF limits remain explicit and tested.
- Every template uses pushed ADO.NET XML, one approved table/schema, no saved data,
  no subreports, and no external connection metadata.
- The Fiscal Years template consumes the 16-field contract and renders Fiscal Year
  rows even when no Period exists; optional Period fields remain nullable.
- Template localization must explicitly define AR/EN names and the treatment of
  frequency/status labels. Visual formulas are verified in Phase 4.

## 16. Integrations and side effects

| Integration | Direction | Trigger | Contract | Timeout/retry | Failure/recovery |
| --- | --- | --- | --- | --- | --- |
| Accounting reporting source | Reporting → Accounting | Fiscal Years render | Bounded filters + row cap + cancellation | Request cancellation; no blind retry needed | Domain/source error mapped before runtime call |
| Runtime inspection | Reporting → runtime | Create/import/add-version/revalidate | Entity + fingerprint + bounded source | Short bounded timeout; no automatic write retry | Safe error retained; temp/source cleanup |
| Runtime render | Reporting → runtime | Authorized render | Entity + fingerprint + source + exact XML + Language | Bounded timeout/cancellation; retry only user-initiated | Stable transient/capacity error; workspace cleanup |
| Deployment catalog/source | Reporting → runtime | Admin list/import | Opaque source ID + expected SHA | Bounded list/source timeouts | Stale hash returns conflict and refresh instruction |
| Private report storage | Reporting filesystem/provider | Validated version accepted | Atomic immutable key + source hash | No silent overwrite | Cleanup on failure; stored content hash verified |

## 17. Non-functional requirements

### Performance and scale

- Preserve bounded upload/XML/PDF/catalog sizes and provider row caps.
- Native Crystal concurrency configuration cannot exceed the vendor-supported
  envelope; enforcement must include final worker/process topology.
- Queue wait, inspection and render durations are observable separately.
- Reduce avoidable byte-array/stream copies and measure peak memory with maximum
  allowed payloads before accepting the change.

### Reliability

- Runtime startup/readiness fails on missing/malformed contract artifact, missing
  supported runtime dependency, unavailable required temp root or invalid settings.
- Catalog readiness is explicit; absence may be optional only when deployment import
  is disabled by a deliberate configuration.
- All request workspaces clean up on success, rejection, timeout and cancellation.
- Correlation IDs cross public API, internal clients and runtime logs.

### Observability

- Structured events: entity, report/version IDs, contract version/fingerprint,
  validation state/error code, queue/render duration and correlation ID.
- Never log secrets, physical private paths, raw report bytes, XML business data or
  PDF content.
- Health identifies actual installed Crystal file/product version and artifact
  contract fingerprint, not only the assembly reference version.

### Localization/accessibility/security

- All visible Web/Mobile text has EN/AR keys and works in RTL/LTR.
- Forms focus the first invalid field and expose server field/template errors
  accessibly; no native browser validation/alert/confirm.
- Security implementation occurs last, but no earlier phase may weaken existing
  server permissions, scope, API-key fail-closed behavior or data isolation.

### Privacy and data handling

Report data may include tenant/company business data. It is processed solely to
produce the requested report, held in bounded transient memory/workspace, and not
retained by the runtime. Private `.rpt` sources remain under authorized Reporting
storage. Logs and errors contain metadata only. No new consent, third-party data
sharing or retention product surface is introduced.

### Commercial / legal applicability

No subscriptions, billing, UGC or AI behavior is added. Crystal runtime deployment
must use appropriately licensed/supported SAP components; legal/procurement review
is a release-operations responsibility if distribution/topology changes.

## 18. Test and verification matrix

| Requirement/rule | Domain | Application | Integration | API | Web | Mobile | E2E/manual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Registry uniqueness/fingerprint | Registry model tests | Startup/parser tests | Both artifacts have same fingerprint | Supported-entities response | Selector contract | Viewer accepts entity/error contract | Health fingerprint comparison |
| Fiscal Years exact DataSet | N/A | Provider schema/data tests | Accounting source → provider fixture | Render handler filter/scope tests | Fiscal Years report view | Fiscal Years report view | AR/EN live PDF with/without periods |
| Template exact compatibility | Version lifecycle tests | Inspect orchestration tests | Golden `.rpt` fixtures against runtime | Create/version/revalidate/publish negatives | Error/detail states | Error mapping | Compatible/incompatible smoke |
| Strict report identity | Aggregate/value tests | Add-version handler tests | Storage inspection metadata | Filename/report-key conflict | Upload feedback | Excluded | Manual corrected-version journey |
| Contract drift/revalidation | Version state tests | Migration/revalidation tests | Old/new fingerprint fixture | Publish/render blocked until valid | Stale status/action | Stale message | Development DB migration + revalidation |
| Permission/scope/ACL | Invariants | Policy/handler tests | Cross-module scope tests | 401/403/404/tenant isolation | Hidden/read-only + direct guards | Access/use-case guards | Role-minimal authenticated journey |
| Error taxonomy | N/A | Client mapping tests | Runtime → Reporting mapping | ProblemDetails contract | Localized messages/retry | Localized messages/retry | Inject unsafe/mismatch/timeout/capacity cases |
| Runtime capacity/cancel/memory | N/A | Gate/service tests | Concurrent render harness | 429/503/cancel mapping as designed | Retry behavior | Retry behavior | Load/cancel/package smoke |
| Final security | N/A | Config validation tests | HTTPS/secrets/dependency compatibility | Secret/header/redaction tests | No secret exposure | No change expected | Staging render after upgrades |

## 19. Rollout and migration plan

1. Approve the first child contract; inventory current templates/contracts without
   changing runtime state.
2. Deploy canonical registry and parity tests to Reporting/runtime artifacts.
3. Apply Reporting migration that marks existing versions NeedsRevalidation in the
   development database; do not preserve stale Valid flags.
4. Deploy entity-aware runtime inspection and API lifecycle/error contracts.
5. Revalidate/import corrected templates and publish/grant the Fiscal Years version.
6. Deploy Web manager and Web/Mobile stable error/contract consumers.
7. Run Phase 4 Fiscal Years authenticated acceptance.
8. Complete runtime operations/package/load work, then Phase 6 security/dependency
   hardening.
9. On staging/Production candidate, execute `PROD-020` and `PROD-025`, monitor error
   rates/durations/memory and compare fingerprints.
10. Rollback is forward-fix preferred: keep immutable source/version history and
    previous runtime/API artifacts; never re-enable an incompatible published
    pointer. If compatibility cannot be restored, disable runtime reporting and
    return explicit unavailable state.

## 20. Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Trigger |
| --- | --- | --- | --- | --- | --- |
| Existing templates fail exact validation | High | Medium | Inventory/golden fixtures; development revalidation; precise mismatch output | Reporting + module owners | Phase 1/2 inventory |
| Crystal SDK metadata differs by service pack | Medium | High | Pin/test supported version; staging golden renders after upgrade | Runtime owner | Runtime package change |
| Multi-worker capacity exceeds native envelope | Medium | High | Topology-aware limit and load test; `PROD-025` | Operations/runtime | Deployment design |
| Exact schema duplicated accidentally in code | Medium | High | Single JSON registry, generated/parsed models and parity tests | Reporting/runtime | Any new entity/field |
| Fiscal Years visual labels are not localized | Medium | Medium | Freeze template formula decision and AR/EN visual acceptance | Accounting/Reporting | Phase 4 |
| Memory pressure from bounded but copied payloads | Medium | High | Stream where practical; lower effective limits; max-size load measurement | Runtime/API | Phase 5 |
| Security postponed indefinitely | Low/Medium | High | Phase 6 remains release-blocking and precedes closure | Product/security | Release candidate |

### Assumptions inherited from specification

| Assumption | Impact if wrong | Validation trigger | Owner |
| --- | --- | --- | --- |
| Development versions may all be revalidated | Need compatibility/migration window instead of clean invalidation | Before non-local migration | Product/Reporting |
| `ReportData` is current table name for all profiles | Per-entity table migration/compatibility needed | Template inventory | Reporting/runtime |
| Only `Language` is managed now | Registry/UI/API must support another typed parameter | Approved template need | Product/module owner |

## 21. Decision log

| Decision | Alternatives | Selected | Reason | Impacted surfaces | Date |
| --- | --- | --- | --- | --- | --- |
| Runtime ownership | DB-aware runtime vs adapter | Database-isolated adapter | Keeps business data/authorization in ERP | API/runtime/deployment | 2026-09-27 |
| Contract source | Duplicated code/docs vs registry | Versioned machine-readable registry | Enforce cross-process parity | Reporting/runtime/tests | 2026-09-27 |
| Fiscal Years scope | Remove/global/tenant-company | Tenant/company managed entity | Accounting data ownership | API/Web/Mobile/runtime | 2026-09-27 |
| Existing versions | Preserve flags vs revalidate | Revalidate in development | Old inspection was not entity-exact | DB/API/manager | 2026-09-27 |
| Security order | First/last/omit | Last but release-blocking | Explicit requester priority | Roadmap/release | 2026-09-27 |

See `DECISIONS.md` for the compact decision register.

## 22. Open questions

| Question | Owner | Blocking? | Due | Resolution |
| --- | --- | --- | --- | --- |
| What exact Fiscal Years `.rpt` visual layout/grouping is accepted? | Product + Accounting | Blocks Phase 4 visual acceptance, not Phase 1 data contract | Before Phase 4 | Use/create one approved golden template and screenshots/PDFs. |
| Must any shared/staging legacy published version remain temporarily renderable? | Product + Reporting | Blocks migration outside development | Before Phase 2 migration | Default is no; revalidate cleanly. |
| What is the final IIS worker/host topology? | Operations | Blocks production capacity sign-off | Before Phase 5 closure | Record under `PROD-025`. |

## 23. Implementation phases

### Planning authority and execution rule

`PLAN.md` owns capability scope, ownership, business decisions and release
boundaries. `IMPLEMENTATION-ROADMAP.md` is the single dependency/status authority.
The roadmap owns the single `ACTIVE_FEATURE_STEP`. Before each implementation,
create the selected child contract from
`documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`, complete its UI Pattern
Gate and permission matrix, scaffold Phase 00, and activate exactly one feature.

### Feature Decomposition Gate

Slice `Slice 1 — Managed Crystal Reporting Reliability` is `Decompose`; each row is
independently testable and cannot claim a sibling's result. The first child is
Verified/Closed; later contracts are created only as their roadmap step becomes
active.

| Slice | Decision | Feature ID | Planned Screen/Workflow Contract | Boundary / independent acceptance |
| --- | --- | --- | --- | --- |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `managed-crystal-contract-registry` | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-contract-registry.md` | Canonical registry + Fiscal Years provider/runtime schema parity, no lifecycle/UI claim. |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `managed-crystal-template-validation` | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-template-validation.md` | Entity-aware inspection, identity, validation state/fingerprint, migration and error taxonomy. |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `managed-crystal-manager-experience` | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-manager-experience.md` | Web-only administration UI/API workflow; Mobile admin explicitly Excluded. |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `fiscal-years-managed-crystal-report` | `decomposition/fiscal-years-managed-crystal-report.md` after Phase 3 | Fiscal Years AR/EN API/Web/actual-Mobile report journey and business acceptance. |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `managed-crystal-runtime-operations` | `decomposition/managed-crystal-runtime-operations.md` after Phase 4 | Runtime tests, packaging, readiness, capacity, cancellation, memory and diagnostics. |
| Slice 1 — Managed Crystal Reporting Reliability | Decompose | `managed-crystal-security-hardening` | `decomposition/managed-crystal-security-hardening.md` after Phase 5 | Final security/config/transport/dependency/redaction release gate. |

### Phase summary

| Phase | Goal | Dependencies | Deliverables | Entry gate | Exit gate | Customer education |
| --- | --- | --- | --- | --- | --- | --- |
| 0 Planning/preflight | Authorize executable scope | This plan | Child contract, required-file manifest, implementation request, golden fixture plan | Requester reviews plan | G0–G4 for child + Phase 00 passes | N/A — internal planning only |
| 1 Contract foundation | One exact source of entity truth | Phase 0 | Registry, parsers, Fiscal Years schema, provider/runtime parity tests | Contract approved | All current entities and Fiscal Years pass | N/A — internal foundation |
| 2 Validation/lifecycle | Make publish mean compatible | Phase 1 | Entity-aware inspection, fingerprint/state/errors, migration/revalidation, identity gate | Registry verified | Semantic positive/negative contract tests, migration and development DB gates pass; real `.rpt` acceptance is Deferred to Phase 4 | Deferred to Phase 3 manager UX because this child adds no customer-visible recovery surface |
| 3 Manager experience | Make correct workflow usable | Phase 2 | Supported selector, shared form refactor, validation/revalidation UI, localization/tests | API verified | Web API-backed EN/AR workflow verified | Required |
| 4 Fiscal Years acceptance | Prove business outcome | Phase 3 | Approved `.rpt`, AR/EN formula contract, Web/Mobile live evidence | Template fixture ready | Authenticated business acceptance Verified | Required |
| 5 Runtime operations | Production-operable adapter | Phase 4 | Runtime tests, package/catalog readiness, load/cancel/memory/diagnostics | Business journey stable | Operational gates and `PROD-025` staging plan ready/passed as applicable | N/A — operator runbook instead |
| 6 Security hardening | Close final release risk | Phase 5 | Secrets/Swagger/HTTPS/dependency/redaction fixes and regression | Ops baseline verified | Security checks + staging render pass | Required for administrator/operator changes |
| 7 Closure | Reconcile evidence and release | Phase 6 | Canonical docs/profiles/manifests/recipes, Phase 06/07 | All features Closed | Docs checks and production notes reconciled | Required |

## 24. Acceptance criteria

- [x] Business outcome is measurable.
- [x] Discovery, evidence audit and pre-plan specification are complete.
- [x] Current versus target behavior is explicitly separated.
- [x] Assumptions are labelled and have validation triggers.
- [x] Ownership/source of truth is explicit.
- [x] Lifecycle and invariants are frozen at plan level.
- [x] Business rules and edge cases are defined for planning.
- [x] Security/scope remains server-authoritative; security implementation is last.
- [x] Data/migration strategy is explicit for development.
- [x] API/integration target contracts are explicit enough for child preflight.
- [x] Web/Mobile Required/Deferred/Excluded decisions are explicit.
- [x] Test evidence maps to critical rules/journeys.
- [x] Rollout/recovery plan is executable at plan level.
- [x] Privacy/commercial/legal applicability is classified.
- [x] Every phase classifies customer/operator education.
- [x] The first authorized child has a completed version 2.0 contract, UI Pattern
      Gate, required-file manifest and Phase 00 scaffold.
- [x] G4 implementation readiness passed for the first authorized child and its
      Phase 06 evidence records Verified/Closed.

Current gate assessment:

| Gate | Status | Reason |
| --- | --- | --- |
| G0 Evidence | Pass | `DISCOVERY.md`, `EVIDENCE.md`, source/build/test/smoke evidence and drift are recorded. |
| G1 Specification | Pass for planning | Required/Deferred/Excluded scope, journeys, ownership and assumptions are explicit. |
| G2 Business plan | Pass for requester review | Lifecycle, rules, clients, integration, migration and tests are planned. |
| G3 Decision closure | Pass with bounded assumptions | Three assumptions have named validation triggers; no ambiguity blocks planning. |
| G4 Implementation readiness | Pass for completed child | `managed-crystal-contract-registry` passed Phase 00, runtime/API tests, cross-artifact parity, Phase 06 verification and documentation closure. The next child must pass its own preflight. |

## 25. Customer education / video documentation

| Phase | Required / N/A | Customer-visible outcome | Planned education file |
| --- | --- | --- | --- |
| Phase 2 | Deferred to Phase 3 | No customer-visible UI is added here; manager UX will teach Valid/Invalid/Needs Revalidation and correction flow | `education/template-validation.md` after manager verification |
| Phase 3 | Required | Admin creates/imports/versions/publishes/grants with supported entities | `education/report-manager.md` after verification |
| Phase 4 | Required | User renders Fiscal Years in AR/EN on Web/Mobile | `education/fiscal-years-report.md` after verification |
| Phase 5 | N/A — operator-facing | No new end-user business journey | Runtime deployment/runbook in canonical Reporting docs |
| Phase 6 | Required | Admin/operator follows secure configuration without exposed defaults | `education/secure-crystal-deployment.md` after verification |

Education files are created only after Phase 06 records Verified; they cannot claim
queued behavior.

## 26. Handoff

### Approved implementation request

The requester authorized continuation. `managed-crystal-contract-registry` and
`managed-crystal-template-validation` are Verified/Closed with the portable
registry and strict lifecycle in place. Proceed next only through the roadmap's
`managed-crystal-manager-experience` API → Web → platform disposition → integrated
verification → closure sequence. Do not begin live Fiscal Years acceptance,
operations, or security siblings until their roadmap gates permit it.

### Canonical documents to create/update during implementation

- `documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`
- `documentation/system/features/crystal-report-manager/CRYSTAL_REPORT_MANAGER-REVIEW-ARTIFACTS.md`
- Final `required-files.json`, recipe registration and generated packets through
  the documented generator, never direct edits under `generated/`
- Reporting module/API implementation profile and runtime deployment/runbook
- Fiscal Years API/Web/Mobile/full-review profiles for the report contract change
- Applicable central production notes/indexes and customer education artifacts

## 27. Central note references

| Note ID | Type | Reason linked to this plan |
| --- | --- | --- |
| `PROD-004` | Production | Real deployed PDF viewer/CSP behavior remains environment evidence. |
| `PROD-020` | Production | A compatible `.rpt` still requires publication and Run ACL before release. |
| `PROD-025` | Production | Runtime artifact/version/fingerprint, catalog source, worker topology, capacity and live render require staging/Production evidence. |

Indexes updated by this plan: API and Cross-platform for `PROD-025`; existing Web
and Mobile indexes already reference the shared managed-report publication/viewer
notes.

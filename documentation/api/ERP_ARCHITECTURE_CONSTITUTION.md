# ERP Architecture Constitution

This document is the mandatory architecture policy for the ERPSYSTEM API.

It defines the target state for the modular monolith before the codebase is
considered foundation-complete. A green build alone is not sufficient. New
features, refactors, module generation, tests, documentation, and deployment
work must comply with the applicable rules in this document.

The intent is to finish architecture work once, enforce it continuously, and
then let future development focus primarily on business capabilities.

## 1. Enforcement levels

| Level | Meaning | Closure rule |
| --- | --- | --- |
| P0 | Architecture invariant | Must never be violated. Blocks further architectural closure. |
| P1 | Foundation gate | Must be closed before the API is declared foundation-complete. |
| P2 | Module standard | Must be satisfied by every applicable module before that module is closed. |
| P3 | Business capability policy | Applied when the relevant business capability exists. |

Review status values are: `PASS`, `FAIL`, `N/A`, and `BLOCKED`.

## 2. Canonical execution model

The default write flow is:

`Controller -> ISender -> Command Handler -> Application Port -> Infrastructure Adapter -> Domain Aggregate -> Commit -> Post-Commit Effects`

The default read flow is:

`Controller -> ISender -> Query Handler -> Read Port -> Infrastructure Projection -> Response`

Cross-module communication is:

`Module A Domain/Application -> Integration Contract/Event -> Outbox -> Consumer Adapter -> Module B Application/Domain`

Controllers do not call business CRUD services. Domain objects are not created
or mutated by automatic mapping. Infrastructure types do not leak inward.

## 3. Core architecture policies

| # | Level | Policy |
| ---: | :---: | --- |
| 1 | P0 | Each business capability has one owning bounded context/module. No duplicated ownership. |
| 2 | P0 | Every module follows the canonical six runtime-project shape: Domain, Contracts, Application, Infrastructure, Presentation, Bootstrap, plus one module-owned `ErpSystem.Modules.<Module>.Tests` project. Tests are ownership infrastructure, not a seventh runtime layer. |
| 3 | P0 | Dependency direction follows Clean Architecture. Inner layers never depend on outer layers. |
| 4 | P0 | Cross-module compile-time dependencies use public `*.Contracts` only. No foreign Domain, Infrastructure, DbContext, or internal Application references. |
| 5 | P0 | Domain owns business invariants, lifecycle rules, state transitions, calculations, and aggregate behavior. |
| 6 | P0 | Every API business use case uses explicit CQRS Command/Query + Handler. |
| 7 | P0 | Business controllers are thin and default to `Controller -> ISender`; HTTP mapping only belongs in Presentation. |
| 8 | P0 | Application owns use-case orchestration and ports. It has no EF Core, ASP.NET persistence, filesystem, or direct external-provider implementation concerns. |
| 9 | P0 | Broad business CRUD `IXxxService` facades are forbidden. Use intent-specific repositories, read stores, gateways, clients, clocks, effects, or specialized orchestrators. |
| 10 | P0 | Infrastructure implements Application-owned ports and contains EF, Identity, cache providers, HTTP clients, files, crypto, realtime and job-provider implementations. |
| 11 | P0 | Domain is independent of mapping libraries, DTOs, HTTP models and persistence models. |
| 12 | P0 | Each module owns its persistence schema, DbContext, mappings, migrations and migration history. |
| 13 | P0 | Database tables are never shared by unrelated modules through direct DbContext coupling. |
| 14 | P1 | Every persistent module has real EF migrations representing its current schema; `EnsureCreated` and runtime schema hacks are not accepted substitutes. |
| 15 | P0 | Application defines transaction boundaries. External side effects do not run before successful commit. |
| 16 | P0 | Reliable cross-module workflows use Outbox/Inbox, idempotency and retry instead of fire-and-forget. |
| 17 | P0 | Integration Contracts contain stable DTO/event contracts only, never Domain entities or Infrastructure types. |
| 18 | P0 | Domain events and integration events are distinct concepts with distinct responsibilities. |
| 19 | P0 | Tenant isolation is mandatory in queries, writes, jobs, cache, realtime, messaging and external operations. |
| 20 | P0 | Company isolation is distinct from tenant membership and must be independently enforced where applicable. |
| 21 | P0 | Authentication, permissions, roles, tenant membership, company access and module entitlement are separate authorization concepts. |
| 22 | P0 | Secrets, tokens, passwords and cryptographic material must not leak into logs or public contracts. |
| 23 | P3 | Monetary values never use binary floating point. Use `decimal` or a Money value model with explicit precision/currency rules. |
| 24 | P3 | Accounting posting, reversal, closing and journal balancing are domain operations, never generic CRUD. |
| 25 | P3 | Inventory truth is based on controlled stock movements/reservations/transfers/adjustments, not arbitrary quantity mutation. |

## 4. Mapping policy

| # | Level | Policy |
| ---: | :---: | --- |
| 26 | P0 | Request-to-Command/Query mapping may be simple and explicit in Presentation; business decisions do not belong there. |
| 27 | P0 | Commands do not auto-map into aggregates. Aggregate creation and mutation use factories/domain methods that enforce invariants. |
| 28 | P1 | Read paths prefer direct database projection into read DTOs/responses when it improves correctness and performance. |
| 29 | P0 | EF entities, provider models and Infrastructure-only types never escape Infrastructure boundaries. |
| 30 | P0 | Cross-module transformations are explicit adapters around public contracts; no global mapper couples modules. |
| 31 | P2 | Mapster may be used for mechanical, non-business mapping only. It is not permitted to bypass aggregate invariants, security scope, money rules or lifecycle rules. |
| 32 | P2 | Domain-to-Application mapping configuration belongs with the consuming Application feature; Infrastructure mapping is reserved for Infrastructure-owned types. |
| 33 | P2 | Avoid a monolithic global mapping profile. Mapping belongs close to the owning feature/use case. |
| 34 | P0 | Automatic bidirectional Entity/DTO mapping is not an architectural default; write and read models are intentionally separate. |
| 35 | P1 | Architecture tests enforce mapping boundaries, including no mapper dependency in Domain and no domain mutation via mapper. |

## 5. Identity, time, concurrency and consistency

| # | Level | Policy |
| ---: | :---: | --- |
| 36 | P1 | ID strategy is explicit and consistent. Internal identity, external IDs and integration IDs are not conflated. |
| 37 | P0 | Business logic does not call `DateTime.Now`/`UtcNow` directly. Use `TimeProvider`/clock abstractions and store UTC where appropriate. |
| 38 | P2 | Business date is modeled separately from timestamp where fiscal/legal semantics require it. |
| 39 | P1 | Optimistic concurrency is used for aggregates/configuration where stale writes can cause loss or corruption. |
| 40 | P1 | Conflict handling has stable API/application semantics rather than provider-specific exceptions leaking outward. |
| 41 | P1 | Critical commands, webhooks, imports, integrations and posting operations are idempotent where retries or double-submission are possible. |
| 42 | P2 | Soft delete is not a default. Each aggregate explicitly chooses delete, archive, deactivate, immutable history or reversal semantics. |
| 43 | P0 | Posted financial/stock/legal history is not silently rewritten. Correction uses reversal/amendment/corrective operations where the domain requires it. |
| 44 | P0 | Strong consistency is the default inside an aggregate/module transaction; cross-module consistency is eventual unless an explicit documented exception exists. |

## 6. API, validation and errors

| # | Level | Policy |
| ---: | :---: | --- |
| 45 | P1 | Validation distinguishes transport/input validation from Domain invariants. Validation libraries do not replace Domain protection. |
| 46 | P1 | Error semantics are standardized: validation, not-found, conflict, forbidden, business-rule violation and unexpected failure map consistently to ProblemDetails/API contracts. |
| 47 | P1 | Routes, status codes, JSON shapes, pagination, filtering, sorting and versioning conventions are consistent across modules. |
| 48 | P1 | Breaking wire-contract changes follow an explicit versioning/migration policy; contracts do not change silently. |
| 49 | P2 | Large collections are paginated. Unbounded business list endpoints are forbidden. |
| 50 | P2 | Filtering/sorting uses allowlisted capabilities; arbitrary dynamic reflection/execution is not exposed by default. |
| 51 | P2 | Query implementations use projections, `AsNoTracking` where appropriate, and avoid N+1 and unnecessary entity graphs. |

## 7. Security and data governance

| # | Level | Policy |
| ---: | :---: | --- |
| 52 | P0 | Least privilege applies to endpoints, jobs, background consumers and administrative operations. |
| 53 | P1 | Session/token/API-key revocation semantics are explicit, testable and tenant-safe. |
| 54 | P1 | Sensitive data is classified and drives logging, export, encryption and audit decisions. |
| 55 | P2 | PII has retention, anonymization/purge and access policies where legally/business-applicable. |
| 56 | P0 | Security audit/business audit records required for accountability cannot be modified by ordinary business users. |
| 57 | P1 | File upload/storage boundaries enforce ownership, authorization, content validation and secure provider isolation. |
| 58 | P1 | Security-sensitive behavior has dedicated tests, not only happy-path controller tests. |

## 8. Caching, realtime, jobs and integrations

| # | Level | Policy |
| ---: | :---: | --- |
| 59 | P1 | Cache is never the source of truth. Cache keys include all required scope dimensions and invalidation occurs after commit. |
| 60 | P1 | Realtime notifications publish after commit and target the correct tenant/company/user/permission audience. |
| 61 | P1 | Background jobs invoke Application use cases; job classes do not become alternate business-logic layers. |
| 62 | P1 | Jobs are retry-safe/idempotent and have explicit ownership, retry and terminal-failure handling. |
| 63 | P1 | External clients live in Infrastructure behind ports with timeout, authentication, resilience and correlation policies. |
| 64 | P1 | External/legacy models are isolated by anti-corruption adapters and do not dictate internal Domain terminology. |
| 65 | P2 | Dead-letter/poison-message handling supports diagnosis and controlled replay. |
| 66 | P2 | Reconciliation processes exist for important financial/integration workflows where drift or missing messages would be materially harmful. |

## 9. Persistence, migrations and operations

| # | Level | Policy |
| ---: | :---: | --- |
| 67 | P1 | Database constraints, unique keys, indexes and internal relationships participate in correctness; they are not treated as optional tuning only. |
| 68 | P1 | Schema changes follow an explicit production deployment/migration strategy. |
| 69 | P2 | Potentially breaking production schema changes use expand-migrate-contract or another proven zero/low-downtime sequence. |
| 70 | P1 | Seeds are deterministic and distinguish system/reference bootstrap data from demo/sample data. |
| 71 | P2 | Seed/reference-data evolution is versioned and safe to rerun. |
| 72 | P1 | Production data repair uses controlled, auditable commands/scripts rather than undocumented ad-hoc SQL. |
| 73 | P1 | Backup, restore and disaster-recovery requirements include database, file storage and cryptographic key material. |
| 74 | P2 | Archival strategy is explicit for large historical datasets without breaking audit/reporting semantics. |
| 75 | P2 | Large transactional datasets plan for appropriate indexing, partitioning/archival and keyset/cursor pagination where scale requires it. |

## 10. ERP business architecture policies

| # | Level | Policy |
| ---: | :---: | --- |
| 76 | P3 | Important workflows use explicit state transitions/state machines instead of freely assignable status fields. |
| 77 | P3 | Approval workflows model levels, limits, delegation, escalation and separation-of-duties explicitly. |
| 78 | P3 | Document numbering/sequences are concurrency-safe and can scope by tenant/company/branch/fiscal period as required. |
| 79 | P3 | Effective-dated data uses explicit validity semantics where historical truth matters. |
| 80 | P3 | Fiscal/business calendars, working days, periods and closing dates are modeled concepts rather than scattered date checks. |
| 81 | P3 | Closed/locked periods prevent prohibited backdating and historical mutation. |
| 82 | P3 | Units of measure, conversion precision and rounding rules are explicit and testable. |
| 83 | P3 | Monetary, tax, quantity and exchange-rate rounding uses centralized domain policy rather than arbitrary `Math.Round` calls. |
| 84 | P3 | Multi-currency distinguishes base, transaction and reporting currencies plus exchange-rate source/date and FX difference handling. |
| 85 | P3 | Tax calculation is a dedicated business capability supporting applicable inclusive/exclusive/compound/exemption/withholding semantics. |
| 86 | P3 | Pricing, price lists, tiers, promotions and customer-specific pricing are explicit business capabilities rather than controller/service conditionals. |
| 87 | P3 | Build configurable rules engines only when real use cases justify them; ordinary domain rules remain explicit Domain code. |
| 88 | P3 | Long-running cross-module business processes use an explicit Process Manager/Saga when orchestration/state is required. |
| 89 | P3 | Eventual-consistency workflows expose meaningful pending/processing/failed states where users need to understand asynchronous progress. |
| 90 | P3 | Read-model/reporting freshness expectations are explicit and rebuild/recovery paths exist where projections are used. |
| 91 | P3 | Integration-event schemas support backward-compatible evolution/versioning. |
| 92 | P3 | Bulk operations define atomicity/error semantics explicitly and do not simply loop single-item endpoints. |
| 93 | P3 | Imports use staged validation/preview/commit/error-reporting for material datasets rather than uncontrolled record-by-record mutation. |
| 94 | P3 | Heavy exports use streaming/asynchronous techniques as needed and preserve authorization and tenant isolation. |
| 95 | P3 | Master data defines ownership, uniqueness/deduplication, merge and external-code policies. |
| 96 | P3 | Module entitlement and user permission remain separate: enabled module does not imply user authorization. |
| 97 | P3 | Branch/site/warehouse scope is modeled separately from tenant/company when the business capability requires it. |
| 98 | P3 | Hierarchical models define parent/child rules and prevent cycles. |
| 99 | P3 | Localization covers culture, language, RTL, dates, numeric formatting and translated master data without leaking presentation concerns into Domain. |
| 100 | P3 | Country/legal localization extends core capabilities through explicit policies/modules rather than polluting global core logic. |

## 11. Quality, testing and maintainability

| # | Level | Policy |
| ---: | :---: | --- |
| 101 | P1 | Each applicable feature has Domain, handler, persistence, security, contract, architecture and integration tests appropriate to its risks. |
| 101A | P1 | Each business module owns one dedicated test project that references only its own runtime projects plus explicitly required technical BuildingBlocks. Cross-module architecture and end-to-end integration tests live in dedicated solution-level test projects instead of a monolithic all-modules test assembly. |
| 102 | P0 | Architecture rules are executable tests where practical, not documentation-only expectations. |
| 103 | P0 | Important tests are not hidden with `Compile Remove`, blanket skip, or similar mechanisms merely to keep CI green. Obsolete tests are updated or intentionally deleted. |
| 104 | P1 | Nullable, analyzers, package/version policy, SDK pinning and warning policy are centrally governed. |
| 105 | P1 | Dependencies are centrally governed and routinely checked for vulnerabilities and unnecessary/abandoned packages. |
| 106 | P1 | Naming is intention-revealing and consistent. Avoid generic dumping-ground names such as `Manager`, `Helper`, `CommonService`. |
| 107 | P2 | Application organization is feature/use-case oriented rather than large horizontal `Services`/`Dtos` buckets. |
| 108 | P0 | BuildingBlocks/Shared Kernel remains small, technical and business-neutral. It is not a dumping ground for cross-module business code. |
| 109 | P0 | No permanent legacy compatibility facade, workaround layer, duplicate ownership or knowingly obsolete implementation remains after its replacement is complete. |
| 110 | P1 | The module generator emits the canonical module structure, references, registration, tests and documentation automatically. |
| 111 | P1 | Each module documents ownership, dependencies, data ownership, public contracts and important workflows. |
| 112 | P1 | Important architecture decisions are recorded as ADRs when rationale/tradeoffs must survive team changes. |
| 113 | P1 | Definition of Done includes architecture, security, tenant/company scope, migration, tests, observability and operational behavior where applicable. |
| 114 | P1 | Performance-sensitive queries/workflows have measurable baselines and regression protection where risk justifies it. |
| 115 | P2 | Critical concurrency scenarios such as numbering, reservations, posting and sync are covered by realistic concurrency tests. |
| 116 | P2 | Failure tests cover commit/publish boundaries, duplicate events, timeouts, worker restart and partial external failure for critical workflows. |

## 12. Production and operational policies

| # | Level | Policy |
| ---: | :---: | --- |
| 117 | P1 | Observability includes structured logs, correlation, traces, metrics and health/readiness checks without sensitive-data leakage. |
| 118 | P2 | Modules define useful business/operational metrics, not only generic HTTP/CPU telemetry. |
| 119 | P1 | Administrative operational capabilities such as failed-job inspection, replay and reconciliation are explicitly authorized and audited. |
| 120 | P0 | Do not build a premature generic ERP framework. Extract reusable abstractions only after real repeated use cases prove the pattern. |

## 13. Non-negotiable architectural principles

1. Strong consistency inside an aggregate/module transaction; eventual
   consistency across module boundaries by default.
2. Business history that affects money, stock, payroll, legal state or security
   is corrected through explicit business operations, not silent mutation.
3. Modules are independently owned enough to be extractable in the future, but
   the system remains a modular monolith. Do not introduce microservice
   complexity without a real need.
4. Prefer a small amount of duplication over a shared abstraction that creates
   incorrect coupling between bounded contexts.
5. Rules affecting money, stock, authorization, security, compliance or legal
   records must be explicit, testable and auditable.

## 14. Foundation closure blockers

The API cannot be declared architecture-foundation complete while any of the
following remain unresolved:

- P0 violations.
- Business controllers bypassing the CQRS/sender pattern without an approved
  transport-only exception.
- Broad legacy business service facades whose replacement already exists.
- Disabled architecture/security/ownership tests used to hide failing rules.
- Persistent modules without a valid migration story.
- Cross-module persistence/domain coupling.
- Missing tenant/company/security isolation on applicable workflows.
- Mapping that bypasses aggregate invariants or leaks outer-layer types inward.
- Module generator output that diverges from the canonical module architecture.

## 15. Review order

The architecture review proceeds in this fixed order:

0. Repository foundation: SDK, solution, central packages, build/analyzers,
   test policy, CI and common conventions.
1. BuildingBlocks projects, one project at a time.
2. `ErpSystem.Api` host/composition root.
3. Module generator and modularity infrastructure.
4. Platform.
5. ReferenceData.
6. Contacts.
7. Accounting.
8. Inventory.
9. HR.
10. CRM.
11. Reporting.
12. PointOfSale.
13. Module-owned tests, `ErpSystem.ArchitectureTests`, `ErpSystem.IntegrationTests`, legacy-test retirement, and the final architecture gate.

Within every module the order is:

`Domain -> Contracts -> Application -> Infrastructure -> Presentation -> Bootstrap -> Tests`

## 16. Project closure template

Every reviewed project records:

1. Scope and ownership.
2. Applicable policy numbers.
3. `PASS` / `FAIL` / `N/A` / `BLOCKED` status per policy.
4. Evidence: source paths, tests and runtime/deployment evidence when needed.
5. Violations and severity (`P0`-`P3`).
6. Exact required change.
7. Verification performed.
8. Closure decision: `OPEN` or `CLOSED`.

No project is marked `CLOSED` while an applicable P0 or P1 item remains open.

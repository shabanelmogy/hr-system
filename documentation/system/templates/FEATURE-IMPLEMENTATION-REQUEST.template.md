# <Feature Name> Implementation Request

Use this file as the copy-ready request for creating or refactoring one feature.
Replace every angle-bracketed value before implementation starts. The review artifact
remains the evidence ledger; this request states the work to perform.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `<Feature Name>` (`<feature>`) |
| Operating mode | `<new feature | existing-feature change>` |
| Applied reference | `<ReferenceFeature>` |
| Request date | `<YYYY-MM-DD>` |
| Review artifact | `<repository-relative review artifact path>` |
| Required-file manifest | `<repository-relative draft or final manifest path>` |
| Owning module | `<platform | hr | accounting | ...>` |
| Module documentation package | `<repository-relative module package path>` |
| Public module contract | `<repository-relative Contracts/profile path or explicit decision>` |
| Shared reuse inventory | `<catalog links and reused/extended/rejected pieces>` |

## Execution request

Implement or refactor `<Feature Name>` end to end in every Required platform.
Use the centralized documentation system and `<ReferenceFeature>` only as an
architecture and verification reference. Audit current source first, preserve
unrelated changes, and do not copy reference-specific fields, ownership, views,
or findings.

Before changing runtime source:

1. Run `./documentation/system/Generate-Documentation.ps1 -Check`.
2. Read `AGENTS.md`, `documentation/system/README.md`,
   `documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md` when API work is in scope,
   `documentation/project/ERP_DOCUMENTATION_GUIDE_AR.md`,
   `documentation/project/SHARED_REUSE_CATALOG.md`, this request, the review
   artifact, the feature's generated phase packets, and the selected reference's
   required-file manifest.
3. Verify every referenced runtime path and record current, requested,
   intentionally different, and unresolved behavior separately.
4. Complete the Existing-System Relationship Review and the Business Readiness Gate
   below. Do not infer a missing decision from the reference.
5. Freeze the remaining product/platform decisions below.

Runtime implementation is blocked while ownership is unresolved, any Business
Readiness row still contains a placeholder, or an edge-case category is neither
covered nor explicitly marked `N/A` with a reason.

## Frozen product decisions

| Concern | Required decision |
| --- | --- |
| Ownership and scope | `<global | tenant | company; trusted scope source>` |
| Fields and relationships | `<exact fields, nullability, normalization, parent/child rules>` |
| Permissions and read-only | `<view/create/edit/archive/restore/domain actions>` |
| List contract | `<search fields/operators, filters, sort allow-list, defaults, paging limits>` |
| Lifecycle | `<active/archive/restore, dependency guards, concurrency, bulk behavior>` |
| Web views | `<Grid plus each optional view: Required | Deferred | Excluded>` |
| Mobile views | `<Table/Cards plus each optional view: Required | Deferred | Excluded>` |
| Reporting | `<Required | Deferred | Excluded; engine, dataset, permissions>` |
| Import | `<Required | Deferred | Excluded independently for web and mobile>` |
| Realtime and notifications | `<resource, actions, audience, route, localized keys>` |

## Existing-System Relationship Review

Inspect the current owning capability before proposing new runtime types. Record the
owning capability, the primary relationship classification from the API workflow,
the existing behavior affected by the request, and the source/tests/contracts used
as evidence. The target is one canonical owner after the change.

| Concern | Required decision |
| --- | --- |
| Owning capability | `<module, capability, and exact source/docs>` |
| Primary relationship | `<classification from API_FEATURE_DEVELOPMENT_WORKFLOW.md>` |
| Existing behavior affected | `<behavior that remains valid or must change>` |
| Existing path disposition | `<kept as canonical | replaced by canonical path | N/A with reason>` |
| Evidence inspected | `<source paths, symbols, routes, tests, contracts, consumers>` |

### Ownership, contracts, and reuse inventory

Record the owning bounded context and the allowed dependency direction. List
the shared BuildingBlocks and module-local pieces inspected before implementation
and classify each as `reused`, `extended`, `rejected`, or `new module-local`.
When a shared component or Contract is added or extended, update its generic
canonical guide in the same change with its public API/options/defaults, a real
usage example, constraints, accessibility/RTL, loading/error behavior,
compatibility, and tests; link every affected consumer profile.

| Item | Owner/source | Decision and evidence |
| --- | --- | --- |
| Domain rules and persistence | `<module and exact paths>` | `<decision>` |
| Cross-module Contract/event | `<public contract path>` | `<version, consumers, compatibility>` |
| Shared piece inspected | `<catalog or source path>` | `<reused | extended | rejected | new local; reason>` |

## Mandatory Business Readiness Gate

Complete all three matrices before runtime implementation. They are execution
evidence, not optional documentation. Update them when implementation discovery
changes a rule, relationship, edge case, or affected surface.

### Business Rules Matrix

Record every known rule that can make the requested behavior valid, invalid,
conditional, state-dependent, calculated, limited, or historically constrained.
Add rows as needed; do not leave example or placeholder rows at handoff.

Primary ownership must be explicit. Use `Domain` for business invariants,
calculations, and lifecycle behavior; `Application` for persisted-state, trusted
scope, authorization-dependent, or orchestration decisions; and `Database` for
race-safe uniqueness/referential/data integrity. `Presentation` may own HTTP
mapping, but it is not the owner of a business rule.

| ID | Business rule | Owner / enforcement layer | Stable error or outcome | Required test |
| --- | --- | --- | --- | --- |
| `BR-001` | `<exact business rule>` | `<Domain | Application | Database; exact owner>` | `<stable error/outcome>` | `<test that proves allowed and rejected behavior>` |

At minimum review creation/uniqueness, lifecycle transitions, approvals/limits,
calculations/rounding, effective dates/period locks, correction/reversal semantics,
dependency eligibility, business scope, idempotency where it affects outcome, and
immutable/reconstructable history. Record `N/A: <reason>` only when a category is
genuinely irrelevant.

### Edge Cases & Validation Matrix

Every category below must contain concrete scenarios or `N/A: <reason>`. Add
scenario rows when a category contains more than one materially different case.
The enforcement layer must follow the API workflow's validation ownership rather
than duplicating the same decision across layers.

| Category | Scenario | Expected behavior | Stable error / HTTP outcome | Enforcement layer | Required test |
| --- | --- | --- | --- | --- | --- |
| Input shape / null / format / range | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<FluentValidation/Application/etc.>` | `<test>` |
| Duplicate input / normalization | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Duplicate persisted data / uniqueness race | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<Application + Database where race-safe>` | `<test>` |
| Relationship existence / active or archived state | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Tenant / company / branch / site / warehouse scope | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Permission / entitlement / actor state | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Lifecycle / invalid, repeated, or out-of-order transition | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<Domain/Application>` | `<test>` |
| Concurrency / stale revision / competing writes | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<Application + Database/Infrastructure>` | `<test>` |
| Idempotency / retry / double-submit | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Transaction rollback / commit failure | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Post-commit side-effect failure | `<scenario or N/A: reason>` | `<behavior>` | `<error/status/recovery>` | `<layer>` | `<test>` |
| Archive / restore / delete / dependency behavior | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Paging / filtering / sorting / deterministic ordering / query shape | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Money / quantity / UOM / rounding / currency | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Dates / timezone / effective dates / closed periods | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Bulk / import / partial-versus-atomic behavior | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Integration duplicate / out-of-order / timeout / retry exhaustion / reconciliation | `<scenario or N/A: reason>` | `<behavior>` | `<error/status/recovery>` | `<layer>` | `<test>` |
| File / security-sensitive input / ownership / unsafe paths or secrets | `<scenario or N/A: reason>` | `<behavior>` | `<error/status>` | `<layer>` | `<test>` |
| Compatibility / versioning / existing-data migration | `<scenario or N/A: reason>` | `<behavior>` | `<error/status/migration behavior>` | `<layer>` | `<test>` |
| Cancellation / timeout / unexpected failure | `<scenario or N/A: reason>` | `<behavior>` | `<stable ProblemDetails/error>` | `<layer>` | `<test>` |
| Scale / N+1 / hot-path index / operability / replay-recovery | `<scenario or N/A: reason>` | `<behavior>` | `<operational outcome>` | `<layer>` | `<test/evidence>` |

### Impact Matrix

Classify every area as exactly one of `Reuse`, `Extend`, `Change`, `Add`, or `N/A`.
For `N/A`, record the reason. For every other decision, identify the current owner
or artifact before stating the required change. An unresolved owner or impact blocks
implementation.

| Area | Decision | Existing owner / artifact | Required change | Evidence / required test |
| --- | --- | --- | --- | --- |
| Domain | `<Reuse | Extend | Change | Add | N/A>` | `<path/symbol or N/A: reason>` | `<change>` | `<evidence/test>` |
| Application / CQRS | `<decision>` | `<path/symbol or N/A: reason>` | `<change>` | `<evidence/test>` |
| Infrastructure / persistence | `<decision>` | `<path/symbol or N/A: reason>` | `<change>` | `<evidence/test>` |
| Presentation / API contract | `<decision>` | `<route/contract or N/A: reason>` | `<change>` | `<evidence/test>` |
| Permissions / security | `<decision>` | `<permission/policy or N/A: reason>` | `<change>` | `<evidence/test>` |
| Tenant / company / business scope | `<decision>` | `<scope owner or N/A: reason>` | `<change>` | `<evidence/test>` |
| Migration / data compatibility | `<decision>` | `<DbContext/migration/data path or N/A: reason>` | `<change>` | `<evidence/test>` |
| Integration contracts / events / projections | `<decision>` | `<contract/consumer or N/A: reason>` | `<change>` | `<evidence/test>` |
| Jobs / realtime / cache | `<decision>` | `<owner/artifact or N/A: reason>` | `<change>` | `<evidence/test>` |
| Module tests | `<decision>` | `<test project/path>` | `<change>` | `<required tests>` |
| Architecture / integration tests | `<decision>` | `<test project/path or N/A: reason>` | `<change>` | `<required tests>` |
| Web consumer | `<decision>` | `<feature/route or N/A: reason>` | `<change>` | `<evidence/test>` |
| Mobile consumer | `<decision>` | `<feature/route or N/A: reason>` | `<change>` | `<evidence/test>` |
| Documentation / runbook | `<decision>` | `<book/profile/runbook>` | `<change>` | `<regeneration/check>` |

## Import contract

Complete this table when Import is Required on any platform. Otherwise retain the
decision, reason, owner, and trigger that would reopen it.

| Concern | Required decision |
| --- | --- |
| Platform and owner | `<web | mobile | both; client-parsed JSON | server-parsed multipart>` |
| Format and template | `<XLSX | CSV | JSON; template source, sheet, headers>` |
| File bounds | `<extensions, MIME policy, size, row count, blank/duplicate-header rules>` |
| API wire contract | `<method, route, permission, exact envelope, response, success status>` |
| Validation order | `<parse, headers, normalize, schema, relationships, duplicates, batch>` |
| Duplicate scope | `<same fields, case rules, tenant/company/parent scope, database race closure>` |
| Relationships | `<lookup endpoint, permission, missing/inactive dependency behavior>` |
| Transaction | `<atomic | partial; idempotency and retry rules>` |
| Feedback | `<preview, row status, batch error, rejected-row artifact decision>` |
| Side effects | `<audit, plural notification, realtime, cache invalidation>` |
| Accessibility | `<EN/AR, RTL, keyboard/touch, focus, screen-reader behavior>` |
| Tests | `<parser, exact body, limits, duplicates, dependencies, permission, conflict, retry, refresh>` |

## Required implementation

- API: domain rules, persistence, contracts, CQRS handlers, thin versioned
  controller, permissions, stable errors, post-commit work, localization, and
  focused tests.
- Next.js: thin route, exact transport types/service, and (where the feature has
  a server-managed list) one server-list state shared by its approved views;
  use shared controls/components, forms/dialogs, lifecycle actions, realtime
  invalidation, localization, RTL, accessibility, and tests as applicable.
- Expo: thin guarded route, runtime schemas, exact endpoint client, one server-list
  state where the feature has a server-managed list, native responsive UI,
  permissions/read-only behavior, localization, RTL, accessibility,
  realtime/deep links, and tests for every Required capability.
- Documentation: cross-platform master, API/web/mobile applied profiles, final
  required-file manifest, review artifact, feature-scoped recipes, and regenerated
  phases 00 through 06.

## Optional offline and synchronization decisions

Decide each capability independently for API, web, and mobile. `Required`,
`Deferred`, and `Excluded` need evidence, an owner, and a reopening trigger when
applicable; no platform may infer support from another platform.

| Capability | API | Web | Mobile | Decision, owner, and acceptance evidence |
| --- | --- | --- | --- | --- |
| Cached/offline read | `<Required | Deferred | Excluded>` | `<decision>` | `<decision>` | `<source, freshness, scope, acceptance>` |
| Local draft/write | `<decision>` | `<decision>` | `<decision>` | `<draft meaning, protection, acceptance>` |
| Sync/outbox write | `<decision>` | `<decision>` | `<decision>` | `<idempotency, retry, conflict, uncertain result, acceptance>` |
| Connection required | `<decision>` | `<decision>` | `<decision>` | `<operations that require live authorization>` |
| Local security | `<N/A or decision>` | `<decision>` | `<decision>` | `<encryption, logout/company switch, retention, acceptance>` |
| Lifecycle/recovery | `<N/A or decision>` | `<decision>` | `<decision>` | `<upgrade, restart, policy change, unsent work, acceptance>` |

The decision must also state who enables the capability (server policy, tenant,
company, user, or device), the maximum local data, and the UI state shown for
cached, pending, synchronized, failed, or conflicted work. A local write is not
reported as final business success until the server confirms it.

## Verification and handoff

Run the applicable API build/tests, web architecture/type/strict/lint/tests/build,
mobile check/tests, documentation generation/check under supported PowerShell
versions, local-link validation, and `git diff --check`. Record exact commands,
counts, dates, skipped gates, environmental blockers, and unrelated inherited
failures. Do not describe the feature as fully ready while a Required feature gate
or manual release matrix remains unresolved.

Before handoff, verify the acceptance criteria in the ownership, offline, and
platform tables. Update the generic guide and every affected consumer profile
in the same change when a shared capability changed, then regenerate and check
the documentation packets.

Report at handoff:

- completed behavior and exact contracts;
- intentional platform differences;
- verification results separated into feature, repository, and environment gates;
- remaining findings with severity, evidence, owner, and release decision;
- every modified and newly created runtime/documentation path.

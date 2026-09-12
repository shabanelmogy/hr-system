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
   `documentation/project/ERP_DOCUMENTATION_GUIDE_AR.md`,
   `documentation/project/SHARED_REUSE_CATALOG.md`, this request, the review
   artifact, the feature's generated phase packets, and the selected reference's
   required-file manifest.
3. Verify every referenced runtime path and record current, requested,
   intentionally different, and unresolved behavior separately.
4. Freeze the decisions below. Do not infer a missing decision from the reference.

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

## Ownership, contracts, and reuse inventory

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

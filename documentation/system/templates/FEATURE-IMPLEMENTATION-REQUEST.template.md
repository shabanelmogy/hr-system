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

## Execution request

Implement or refactor `<Feature Name>` end to end in every Required platform.
Use the centralized documentation system and `<ReferenceFeature>` only as an
architecture and verification reference. Audit current source first, preserve
unrelated changes, and do not copy reference-specific fields, ownership, views,
or findings.

Before changing runtime source:

1. Run `./documentation/system/Generate-Documentation.ps1 -Check`.
2. Read `AGENTS.md`, `documentation/system/README.md`, this request, the review
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
- Next.js: thin route, exact transport types/service, one server-list state,
  approved views, shared controls/components, forms/dialogs, lifecycle actions,
  realtime invalidation, localization, RTL, accessibility, and tests.
- Expo: thin guarded route, runtime schemas, exact endpoint client, one server-list
  state, native responsive UI, permissions/read-only behavior, localization, RTL,
  accessibility, realtime/deep links, and tests for every Required capability.
- Documentation: cross-platform master, API/web/mobile applied profiles, final
  required-file manifest, review artifact, feature-scoped recipes, and regenerated
  phases 00 through 06.

## Verification and handoff

Run the applicable API build/tests, web architecture/type/strict/lint/tests/build,
mobile check/tests, documentation generation/check under supported PowerShell
versions, local-link validation, and `git diff --check`. Record exact commands,
counts, dates, skipped gates, environmental blockers, and unrelated inherited
failures. Do not describe the feature as fully ready while a Required feature gate
or manual release matrix remains unresolved.

Report at handoff:

- completed behavior and exact contracts;
- intentional platform differences;
- verification results separated into feature, repository, and environment gates;
- remaining findings with severity, evidence, owner, and release decision;
- every modified and newly created runtime/documentation path.

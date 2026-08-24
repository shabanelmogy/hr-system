# <Feature Name> Review Artifacts

Use this file as the evidence ledger for one feature. Replace every bracketed value. Mark a row `N/A` only with a written reason.

## Metadata

| Field | Value |
| --- | --- |
| Feature | `<feature>` |
| API route | `<route>` |
| Web route | `<route>` |
| Mobile route | `<route>` |
| Review owner | `<name>` |
| Review date | `<YYYY-MM-DD>` |
| Implementation request | `<repository-relative implementation request path>` |
| Required-file manifest | `<repository-relative path>` |
| Operating mode | `<new feature | existing-feature review | existing-feature change>` |
| Documentation state | `Draft` until runtime evidence exists; `Final` only after recipe registration and check mode pass |
| Applied reference | `Countries`, `States`, or `<documented alternative>` |
| Import decision | `<Required | Deferred | Excluded>` |
| Import platforms | `<Web | Mobile | Both | N/A>` |
| Import format | `<XLSX | CSV | JSON | N/A>` |
| Reporting decision | `<Required | Deferred | Excluded>` |
| Reporting engine | `<Managed Crystal | Server-managed browser templates | N/A>` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | `<requirement>` | `<evidence>` | `<result>` | `<result>` | `<result>` | Open |

## Platform capability decisions

Use `Required`, `Deferred`, or `Excluded` exactly as defined in
`documentation/system/README.md`. A Deferred capability requires an owner and
reopening trigger; an Excluded capability must have no reachable placeholder or
unused runtime implementation.

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Grid/Table | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |
| Cards | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |
| Chart | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |
| Report | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |
| Import | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |
| Export | `<decision>` | `<decision>` | `<decision>` | `<scope>` | `<reason>` |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | `<claim>` | `<path and symbol>` | `<test or inspection>` |

## Read and list contract

Record page-base conversion, page sizes, search fields, operators, filters, sort allow-list, deterministic tie-break, status default, loading state, empty state, and error state.

## Grid and card contract

| Field | Grid | Card | Report | Sortable | Searchable | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- |
| `<field>` | Yes | Yes | No | Yes | Yes | `<behavior>` |

## Detail and write contract

Record create, detail, edit, validation, normalization, duplicate rules, concurrency behavior, dirty-exit handling, archive, restore, and bulk actions.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Bulk | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Active | `<rule>` | `<rule>` | `<rule>` | `<rule>` | `<rule>` | `<rule>` | `<rule>` |

## Integration register

Record route constants, route guards, navigation, API registration, dependency injection, persistence configuration, cache keys, realtime invalidation, notification deep links, localization, RTL, accessibility, report/export behavior, and import behavior.

## Import contract

Complete this section independently for API, web, and mobile. When Import is
Deferred or Excluded, retain the decision and reason and mark non-applicable rows
`N/A`; do not silently copy a reference feature's Import view.

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | `<Required | Deferred | Excluded; reason>` |
| Platforms and format | `<Web | Mobile | Both; XLSX | CSV | JSON; reason for platform differences>` |
| Parsing ownership | `<browser/native client parses to typed JSON | API parses multipart; reason>` |
| Template and parsing | `<download source, accepted MIME/extensions, file-size limit, sheet/header rules, blank-row behavior>` |
| API transport | `<endpoint, JSON envelope or multipart shape, response, success status, permission>` |
| Wire examples | `<exact request and success/error response examples>` |
| Validation and normalization | `<shared schema, field normalization, row errors, local-invalid-row handling>` |
| Duplicate rules | `<request and persistence checks by exact field/scope, case sensitivity, stable conflict>` |
| Relationships and lookups | `<parent/dependency source, permission, loading/error behavior, missing relation result>` |
| Batch and transaction | `<client/API limits, atomicity, partial-failure policy, idempotency>` |
| Retry and error artifact | `<what can be retried; downloadable rejected-row artifact Required | Deferred | Excluded>` |
| Side effects and refresh | `<audit, notification, realtime, cache invalidation, selection cleanup>` |
| UX and localization | `<preview, confirmation, progress, EN/AR, RTL, keyboard, focus, screen reader>` |
| Verification | `<exact request-body, parser, validation, duplicate, permission, dependency, conflict, retry, invalidation tests>` |

Required Import evidence follows this order: file acceptance, parsing, header
validation, row normalization, schema validation, relationship resolution,
request-level duplicates, client batch bound, exact serialization, API validation,
persistence conflict protection, one transaction, post-commit side effects, and
client invalidation. Record any deliberate departure.

## Reporting contract

When reporting is Required, identify the engine and link its canonical guide.
Managed Crystal reports must follow
[`documentation/project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md`](../../project/CRYSTAL_REPORT_MANAGER_INTEGRATION_GUIDE.md).
Do not combine Managed Crystal `.rpt` records with ActiveReports/RDLX
`ReportTemplates`.

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | `<Required | Deferred | Excluded; reason>` |
| Engine | `<Managed Crystal | Server-managed browser templates>` |
| Entity/feature key | `<stable key>` |
| Source | `<Report Manager published catalog | ReportTemplates published catalog>` |
| Dataset/schema | `<exact table, columns, types, nullability, scope>` |
| Filters | `<allowlisted keys, rules, limits>` |
| Permissions | `<coarse permission plus per-report ACL where applicable>` |
| Localization | `<Arabic/English naming source and fallbacks>` |
| Runtime/deployment | `<services/configuration that must be deployed>` |
| Verification | `<scope, ACL, schema, client payload, render/viewer tests>` |

For Managed Crystal, also record evidence that the HR API data profile and Crystal
runtime schema profile match, that a manager-owned version is published, and that
the intended current-company roles have `Run`. Clients send only report ID,
`ar`/`en`, and bounded feature filters; they never send a path, filename, SQL,
connection string, tenant ID, or company ID.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | `<severity>` | `<finding>` | `<path>` | `<owner>` | Open |

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation | `./documentation/system/Generate-Documentation.ps1 -Check` | `<result>` | `<date>` |
| API | `<command>` | `<result>` | `<date>` |
| Web | `<command>` | `<result>` | `<date>` |
| Mobile | `<command>` | `<result>` | `<date>` |

Classify each failed or skipped gate as `Feature regression`, `Inherited
repository failure`, `Environment blocker`, or `Manual release check`. A focused
pass does not convert a failing full gate into a pass.

## Final reconciliation

- [ ] Every requirement has evidence and a final status.
- [ ] API, web, and mobile serialize the same shared contract where applicable.
- [ ] Intentional platform differences are written down.
- [ ] Import is explicitly Required, Deferred, or Excluded per client; a required
      Import path has an exact transport contract, bounded validation, and tests.
- [ ] Reporting is explicitly Required, Deferred, or Excluded; a required report
      follows the selected engine's canonical lifecycle and runtime contract.
- [ ] Known reference-feature gaps were not copied as requirements.
- [ ] Required paths exist and generated packets are current.
- [ ] Focused and project-level quality gates pass.
- [ ] Failed/skipped gates include their classification, exact failure identity,
      owner, and release decision.

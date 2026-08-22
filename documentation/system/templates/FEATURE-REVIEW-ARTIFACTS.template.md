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
| Required-file manifest | `<repository-relative path>` |
| Operating mode | `<new feature | existing-feature review | existing-feature change>` |
| Documentation state | `Draft` until runtime evidence exists; `Final` only after recipe registration and check mode pass |
| Applied reference | `Countries`, `States`, or `<documented alternative>` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | `<requirement>` | `<evidence>` | `<result>` | `<result>` | `<result>` | Open |

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

## Final reconciliation

- [ ] Every requirement has evidence and a final status.
- [ ] API, web, and mobile serialize the same shared contract where applicable.
- [ ] Intentional platform differences are written down.
- [ ] Known reference-feature gaps were not copied as requirements.
- [ ] Required paths exist and generated packets are current.
- [ ] Focused and project-level quality gates pass.

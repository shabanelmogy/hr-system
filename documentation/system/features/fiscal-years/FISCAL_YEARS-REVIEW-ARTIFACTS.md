# Fiscal Years Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `fiscal-years` |
| API route | `/api/v1/fiscal-years` |
| Web route | `/finance/fiscal-years` |
| Mobile route | `/finance/fiscal-years` |
| Review owner | `HR Management System implementation team` |
| Review date | `2026-09-05` |
| Implementation request | `documentation/system/features/fiscal-years/IMPLEMENTATION-REQUEST.md` |
| Required-file manifest | `documentation/system/features/fiscal-years/required-files.json` |
| Operating mode | `new feature` |
| Documentation state | `Final; canonical profiles and generated phases registered` |
| Applied reference | `countries`; ownership and optional views deliberately differ |
| Import decision | `API/Web Deferred; Mobile Excluded` |
| Import platforms | `N/A in current release` |
| Import format | `N/A; Finance will decide XLSX contract at Workforce Budget milestone` |
| Reporting decision | `Deferred` |
| Reporting engine | `N/A until Finance reporting dataset is approved` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Company-scoped Fiscal Year with generated monthly/quarterly periods | User-approved architecture and implementation request | Required | Required | Required | Frozen |
| R-02 | Non-overlapping dates and unique code within trusted company | Implementation request | Required | Mirror for UX | Mirror for UX | Frozen |
| R-03 | Draft/Open/Closing/Closed/Locked lifecycle with optimistic concurrency | Implementation request | Required | Required | Required | Frozen |
| R-04 | Finance owns the shared calendar; Workforce Planning, Payroll, Attendance reporting, and Recruitment may only consume eligible years | Cross-module ownership review | Required boundary | Finance navigation | Finance navigation | Frozen |
| R-05 | Exact server paging/search/filter/sort shared by clients | Countries reference plus implementation request | Required | Required | Required | Frozen |
| R-06 | EN/AR, RTL, responsive, accessible, permission/read-only workflows | Repository guides | Required errors | Required | Required | Frozen |
| R-07 | Post-commit notification/realtime invalidation | Repository guides | Required | Required | Required | Frozen |
| R-08 | Reports and Import have no placeholder runtime | Product decision | Deferred/Excluded | Deferred | Excluded | Frozen |

## Platform capability decisions

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Grid/Table | Required | Required | Required | Current company, server paged | Primary management surface |
| Cards | N/A | Required | Required | Same page/query as Grid/Table | Responsive lifecycle overview |
| Detail/periods | Required | Required | Required | One Fiscal Year plus generated periods | Creation/edit/view parity |
| Chart | Excluded | Excluded | Excluded | No runtime | Meaningful aggregates belong to Workforce Budget |
| Report | Deferred | Deferred | Deferred | No runtime | Finance owner; reopen after budget dataset/profile |
| Import | Deferred | Deferred | Excluded | No runtime | Finance owner; reopen for initial budget setup on API/Web only |
| Export | Deferred | Deferred | Excluded | No runtime | Reopen with reporting contract |
| Bulk lifecycle | Excluded | Excluded | Excluded | No runtime | Critical, low-volume records require explicit review |

## Verified current behavior before implementation

- No Fiscal Year, Fiscal Period, Workforce Plan, Workforce Budget, reservation,
  commitment, or variance aggregate exists in Domain or persistence.
- `CompanyAuditableEntity` supplies trusted tenant/company scope markers and
  `ApplicationDbContext` applies tenant/company filters and ownership stamping.
- Recruitment currently contains only a budgeted boolean/justification on a
  requisition; it does not provide a financial calendar.
- Countries supplies the reviewed CQRS and multi-client lifecycle pattern but is
  global data and therefore not an ownership reference.

## Read and list contract

- UI pages are zero-based and converted once to one-based API pages.
- Page size is `1..5000`; Web defaults to 10, Mobile Table to 5 and Cards to 3.
- Search is debounced, trimmed, maximum 200, over `all/code/nameAr/nameEn` with
  the shared six operators.
- Record status is `active/archived/all`; lifecycle is
  `all/draft/open/closing/closed/locked`.
- Sort allow-list is `code/nameAr/nameEn/startDate/endDate/status/createdOn`.
- Default order is `startDate DESC, Id DESC`; every sort has an ID tie-break.
- Initial load, background fetch, error/Retry, default empty, and filtered empty
  are distinct states. Grid/Table and Cards share one authoritative page/query.

## Grid and card contract

| Field | Grid/Table | Card | Detail | Sortable | Searchable | Responsive behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Code | Yes | Title | Yes | Yes | Yes | Never truncated without accessible label |
| Arabic/English name | Yes | Localized primary/secondary | Yes | Yes | Yes | Wraps and respects RTL |
| Start/End | Yes | Yes | Yes | Yes | No | Localized date pair stacks when narrow |
| Frequency | Yes | Chip | Yes | No | No | Semantic label, not numeric enum |
| Lifecycle | Yes | Chip | Yes | Yes | Filter | Theme-aware status plus text |
| Period count | Yes | Metric | Period list | No | No | Period list scrolls inside workflow |
| Archived state | Chip | Chip | Yes | No | Status filter | Lifecycle actions adapt to state |

## Detail and write contract

- Add/Edit use `Code`, bilingual names, start/end dates, and frequency.
- Create/Edit UI shows a generated period preview; users never type child JSON.
- Edit requires detail hydration and latest RowVersion; detail failure blocks save.
- Server validates a full twelve-month year, unique code, no date overlap, valid
  enum, and transition state. Clients mirror structural rules only.
- Dirty exit, busy close, first invalid-field focus, and per-field messages are
  owned by the shared form systems.
- View mode renders read-only aggregate fields and period rows/cards.

## Permission and lifecycle matrix

| State/action | View | Create | Edit | Archive | Restore | Manage lifecycle | Read-only |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Draft active | View | Create | Edit | Delete | N/A | Open | View only |
| Open | View | Create | No | No | N/A | Begin closing | View only |
| Closing | View | Create | No | No | N/A | Close | View only |
| Closed | View | Create | No | No | N/A | Lock | View only |
| Locked | View | Create | No | No | N/A | No | View only |
| Archived Draft | View | Create | No | Idempotent | Delete | No | View only |

## Integration register

Required integration points are API versioning, `[TenantMember]`, trusted current
actor scope, EF configuration/DbSets/migration, validation and DI scanning,
permissions, localization, post-commit job, web/mobile route and navigation,
route access, endpoints, query keys, realtime mapping, translations, and thin
route adapters. Exact source paths are registered in the final required-file
manifest.

## Import contract

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | API/Web Deferred to Workforce Budget setup; Mobile Excluded because mass financial-calendar authoring is not a phone workflow |
| Platforms and format | N/A in this release |
| Parsing ownership | N/A |
| Template and parsing | N/A |
| API transport | No endpoint in this release |
| Wire examples | N/A |
| Validation and normalization | N/A |
| Duplicate rules | N/A |
| Relationships and lookups | N/A |
| Batch and transaction | N/A |
| Retry and error artifact | N/A |
| Side effects and refresh | N/A |
| UX and localization | No reachable placeholder |
| Verification | Architecture/source tests assert no Import route or view |

## Reporting contract

| Field | Decision/evidence |
| --- | --- |
| Decision and reason | Deferred until Workforce Budget supplies an approved Finance dataset |
| Engine | N/A in this release |
| Entity/feature key | N/A |
| Source | N/A |
| Dataset/schema | N/A |
| Filters | N/A |
| Permissions | N/A |
| Localization | No reachable placeholder |
| Runtime/deployment | N/A |
| Verification | Architecture/source tests assert no Report route or view |

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | High | Financial calendar did not exist; Recruitment used only a budget boolean | Domain/recruitment source review | Finance/HR Planning | Resolved by shared Finance aggregate and routes |
| F-02 | Medium | Countries is global and cannot prove company isolation | Countries profile and `CompanyAuditableEntity` | API | Resolved by tenant/company/fail-closed aggregate tests |
| F-03 | Medium | Full reports/import depend on an unimplemented Workforce Budget dataset | Architecture review | Finance | Deferred with reopening trigger |
| F-04 | High | Draft update replaced every generated period, causing SQL unique-index conflicts when the same codes were inserted before prior rows were soft-archived | Production edit response and update-handler review | API | Resolved by sequence reconciliation, identity preservation, archived-period restoration, and regression tests |
| F-05 | Manual | Runtime visual/device matrix requires live authenticated environments | Web/Mobile guides | Release owner | Automated UI contract audited; authenticated browser/device smoke remains |

## Verification ledger

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation baseline | `./documentation/system/Generate-Documentation.ps1 -Check` | Passed for all 63 registered recipes, including the 7 Fiscal Years phases | 2026-09-05 |
| API | API build; 18 focused Fiscal Year tests; full suite | Passed; full suite 410/410 | 2026-09-05 |
| Database | Migration update plus pending-model check | Applied `20260905180523_AddFiscalYears`; no pending model changes | 2026-09-05 |
| Web | Feature lint, architecture, types, tests, production build | Passed; full Vitest 333/333; route `/finance/fiscal-years` emitted | 2026-09-05 |
| Web full strict | `npm run type-check:strict` | Inherited failures in Organizational Structure and Basic Data; none in Fiscal Years | 2026-09-05 |
| Mobile | Feature lint, types, architecture, focused tests, Android Expo export | Passed; focused 21/21 and Expo 57 bundle exported | 2026-09-05 |
| Mobile full tests | `npm test` | 143 passed; inherited Recruitment translation failure and shared-tree timeout | 2026-09-05 |
| UI audit | Creation, editing, viewing, listing/filtering, mock data on Web/Mobile | Passed source/contract audit; live authenticated viewport/device smoke is manual | 2026-09-05 |

## Final reconciliation

- [x] Requested contract and platform decisions are frozen before runtime work.
- [x] Intentional Countries-reference differences are documented.
- [x] Import and Reporting are explicitly classified per platform.
- [x] Runtime evidence and canonical profiles exist.
- [x] Feature-scoped API, web, mobile, migration, and UI audit gates pass.
- [x] Final required-file manifest and feature recipes are registered/generated.
- [x] Inherited repository failures and manual release checks are separated from feature regressions.

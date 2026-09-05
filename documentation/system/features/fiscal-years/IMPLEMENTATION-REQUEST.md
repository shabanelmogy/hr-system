# Fiscal Years Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Fiscal Years` (`fiscal-years`) |
| Operating mode | `new feature` |
| Applied reference | `countries` for CQRS, server-list, form, lifecycle, and verification discipline only |
| Request date | `2026-09-05` |
| Review artifact | `documentation/system/features/fiscal-years/FISCAL_YEARS-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/fiscal-years/required-files.draft.json` |

## Objective and ownership

Implement a shared Finance calendar foundation across API, Next.js, and Expo.
Fiscal Years belong to Finance, are tenant- and company-scoped, and are selected
later by Workforce Plans, Workforce Budgets, Payroll, Attendance reporting, and
other period-aware modules. The API derives
`TenantId` and `CompanyId` from the authenticated actor; neither client may send
either scope identifier.

The Countries feature is the applied reference for clean CQRS, exact typed
transport, controlled lists, shared UI, localization, realtime invalidation, and
verification. Its global ownership, country fields, bulk/import/report surfaces,
and `super_admin` restriction are not copied.

## Frozen domain contract

### Aggregate

`FiscalYear` is a company-owned aggregate with:

- positive integer `Id`;
- `Code` (required, 2-20, trimmed and upper-cased);
- `NameAr` and `NameEn` (required, 2-100, trimmed printable Unicode);
- `StartDate` and `EndDate`, where `EndDate` must equal
  `StartDate.AddYears(1).AddDays(-1)`;
- `PeriodFrequency`: `Monthly` or `Quarterly`;
- lifecycle `Status`: `Draft`, `Open`, `Closing`, `Closed`, or `Locked`;
- optimistic-concurrency `RowVersion`;
- inherited audit and soft-archive fields;
- generated child `FiscalPeriod` rows that completely cover the year without
  gaps or overlaps: 12 monthly periods or 4 quarterly periods.

Fiscal Periods are company-scoped, read-only children in this release. They are
generated and regenerated only while the Fiscal Year is Draft; they are shown in
the Fiscal Year detail workflow and have no independent route or mutation UI.

### Invariants and lifecycle

- `Code` is unique within tenant/company, including archived rows.
- Date ranges may not overlap another non-archived Fiscal Year in the company.
- Create starts in `Draft` and generates periods atomically.
- Update is allowed only in `Draft`, requires the latest RowVersion, and
  regenerates periods atomically.
- `Open`: `Draft -> Open`.
- `Begin closing`: `Open -> Closing`.
- `Close`: `Closing -> Closed`.
- `Lock`: `Closed -> Locked`.
- Archive is allowed only for `Draft`; archived Draft rows can be restored.
- Lifecycle actions are idempotent only when the row is already in the requested
  target state; skipped transitions fail with a stable business error.
- Locked Fiscal Years are immutable. Reopening and unlocking are Excluded until
  Finance defines a controlled exception/approval policy.

## API contract

Base route: `/api/v1/fiscal-years`. Every endpoint requires tenant membership and
the current company context.

| Method | Route | Permission | Success |
| --- | --- | --- | --- |
| GET | `/api/v1/fiscal-years` | `FiscalYears:View` | paged list |
| GET | `/api/v1/fiscal-years/lookup` | `FiscalYears:View` | active lookup rows |
| GET | `/api/v1/fiscal-years/{id}` | `FiscalYears:View` | detail including periods |
| POST | `/api/v1/fiscal-years` | `FiscalYears:Create` | `201` detail |
| PUT | `/api/v1/fiscal-years/{id}` | `FiscalYears:Edit` | `200` detail |
| DELETE | `/api/v1/fiscal-years/{id}` | `FiscalYears:Delete` | `204` archive |
| POST | `/api/v1/fiscal-years/{id}/restore` | `FiscalYears:Delete` | `204` restore |
| POST | `/api/v1/fiscal-years/{id}/open` | `FiscalYears:ManageLifecycle` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/begin-closing` | `FiscalYears:ManageLifecycle` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/close` | `FiscalYears:ManageLifecycle` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/lock` | `FiscalYears:ManageLifecycle` | `200` detail |

Create body:

```json
{
  "code": "FY2027",
  "nameAr": "السنة المالية 2027",
  "nameEn": "Fiscal Year 2027",
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "periodFrequency": 1
}
```

Update uses the same fields plus the Base64 `rowVersion`; the route owns the ID.
List parameters are one-based `pageNumber`, `pageSize` (1-5000), trimmed
`search` (max 200), `searchField` (`all`, `code`, `nameAr`, `nameEn`),
`searchOperator` (the six shared text operators), record `status`
(`active`, `archived`, `all`), lifecycle (`all`, `draft`, `open`, `closing`,
`closed`, `locked`), `sortBy` (`code`, `nameAr`, `nameEn`, `startDate`,
`endDate`, `status`, `createdOn`) and `sortDirection` (`asc`, `desc`). The
default is `startDate DESC`, followed by `Id DESC`.

Stable errors include not found, duplicate code, overlapping dates, invalid
transition, non-Draft update/archive, and concurrency conflict. Persistence,
audit rows, Fiscal Period replacement, and the Fiscal Year mutation commit once;
notification/realtime scheduling occurs after commit.

## Platform decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Paged management list | Required | Required Grid | Required Table | Same server contract |
| Cards | N/A | Required | Required | Same page and criteria as list |
| Detail with periods | Required | Required dialog | Required full-screen view | Child periods are read-only |
| Create/edit | Required | Required shared form dialog | Required full-screen AppForm | Same validation and requests |
| Lifecycle actions | Required | Required | Required | Permission/read-only/direct-handler guarded |
| Chart | Excluded | Excluded | Excluded | Budget/headcount analytics will own meaningful aggregates |
| Report | Deferred | Deferred | Deferred | Finance reporting milestone after Workforce Budget dataset exists |
| Import | Deferred | Deferred | Excluded | Web/API revisit with Workforce Plan/Budget setup; no native bulk authoring need |
| Export | Deferred | Deferred | Excluded | Reopen with Finance report/export requirements |
| Bulk actions | Excluded | Excluded | Excluded | Low-volume critical lifecycle; explicit single-row review is required |
| Realtime | Required | Required | Required | Resource `fiscal-years`, authoritative refetch |

Deferred reporting/export/import is owned by Finance and reopens when the
Workforce Budget implementation begins. No placeholder view, route, endpoint, or
unused component is permitted in this release.

## Client routes and integration

- Web route: `/finance/fiscal-years`.
- Mobile route: `/finance/fiscal-years`.
- Both applications add a shared Finance navigation group, permission
  constants, route access, localized EN/AR labels, query-key registration, and
  `fiscal-years` realtime invalidation.
- Web uses the shared feature layout, `PageHeader`, `MyDataGrid`, toolbar,
  pagination, cards, feedback states, `MyForm`, fields, and form-dialog system.
- Mobile uses the shared route guard, `AppScreen`, `AppListScreen`,
  `AppDataTable`, `AppDataCard`, `AppForm`, feedback, theme, localization, safe
  area, and server-list state.

## Verification and handoff

Required evidence includes domain/validator/handler/controller/scope/concurrency
tests; inspected and applied migration; exact web/mobile transport tests; list,
form, lifecycle, permission, read-only, localization, and realtime tests; API
build/tests; web architecture/type/lint/test/build; mobile `npm run check`;
documentation generation/check; `git diff --check`; and the mandatory five-point
Web/Mobile UI audit. Manual viewport/device checks remain explicitly recorded
when no interactive runtime is available.

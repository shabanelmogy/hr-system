# Fiscal Years Implementation Request

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Fiscal Years` (`fiscal-years`) |
| Operating mode | `new feature` |
| Applied reference | `countries` for CQRS, server-list, form, lifecycle, and verification discipline only |
| Request date | `2026-09-05` |
| Review artifact | `documentation/system/features/fiscal-years/FISCAL_YEARS-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/fiscal-years/required-files.json` |

## Objective and ownership

Implement a shared Finance calendar foundation across API, Next.js, and Expo.
Fiscal Years belong to Finance, are tenant- and company-scoped, and are selected
later by Workforce Plans, Workforce Budgets, Payroll, Attendance reporting, and
other period-aware modules. The API derives
`TenantId` and `CompanyId` from the authenticated actor; neither client may send
either scope identifier.

The company has at most one default `Current` Fiscal Year. Each authenticated
user may select a different working Fiscal Year for each company without changing
the company default or another user's context. Accounting owns both states; the
identity/session token is not expanded with business-calendar state.

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
- `IsCurrent`, the company-default marker, with a filtered tenant/company unique
  index so no more than one active Fiscal Year is Current.

`FiscalYearUserSelection` is a separate Accounting-owned company-scoped
preference keyed by authenticated `UserId`. Its optional selected Fiscal Year ID
is never supplied with tenant/company/user scope by the client. Null, a missing
preference, an archived target, or a deleted target resolves to the company
Current year; if no Current exists the effective selection is null.

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
- `Reopen`: `Closed -> Open` or `Locked -> Open`; all active generated periods return to `Open`.
- Archive is allowed only for `Draft`; archived Draft rows can be restored.
- A Current Fiscal Year cannot be archived until another Fiscal Year is made
  Current. Setting Current is RowVersion-protected, company-locked, audited, and
  idempotent for the existing target.
- Personal working-year changes are last-write-wins preferences. Selecting the
  company Current (or sending null) clears the personal override. A user can
  select any non-archived Fiscal Year for historical/read workflows; downstream
  writes continue to enforce their own lifecycle eligibility.
- Lifecycle actions are idempotent only when the row is already in the requested
  target state; skipped transitions fail with a stable business error.
- Closed and Locked Fiscal Years remain immutable. Reopen is the controlled exception: it
  requires `FiscalYears:Reopen`, the latest RowVersion, explicit confirmation, an
  atomic company-calendar transaction, lifecycle audit, and post-commit realtime.

## API contract

Base route: `/api/v1/fiscal-years`. Every endpoint requires tenant membership and
the current company context.

| Method | Route | Permission | Success |
| --- | --- | --- | --- |
| GET | `/api/v1/fiscal-years` | `FiscalYears:View` | paged list |
| GET | `/api/v1/fiscal-years/lookup` | `FiscalYears:View` | active lookup rows |
| GET | `/api/v1/fiscal-years/context` | `FiscalYears:View` | company Current, effective user selection, override flag, selectable years |
| PUT | `/api/v1/fiscal-years/context` | `FiscalYears:View` | change/clear only the authenticated user's selection and return context |
| GET | `/api/v1/fiscal-years/{id}` | `FiscalYears:View` | detail including periods |
| POST | `/api/v1/fiscal-years` | `FiscalYears:Create` | `201` detail |
| PUT | `/api/v1/fiscal-years/{id}` | `FiscalYears:Edit` | `200` detail |
| DELETE | `/api/v1/fiscal-years/{id}` | `FiscalYears:Archive` | `204` archive |
| POST | `/api/v1/fiscal-years/{id}/restore` | `FiscalYears:Restore` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/open` | `FiscalYears:Open` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/begin-closing` | `FiscalYears:BeginClosing` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/close` | `FiscalYears:Close` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/lock` | `FiscalYears:Lock` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/reopen` | `FiscalYears:Reopen` | `200` detail |
| POST | `/api/v1/fiscal-years/{id}/set-current` | `FiscalYears:SetCurrent` | `200` detail with the new Current marker |

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
transition, non-Draft update/archive, attempting to archive Current, invalid or
archived personal selection, missing authenticated user/company context, and
concurrency conflict. Persistence,
audit rows, Fiscal Period replacement, and the Fiscal Year mutation commit once;
notification/realtime scheduling occurs after commit.

Context response example:

```json
{
  "companyCurrentFiscalYear": { "id": 27, "code": "FY2027", "nameAr": "السنة المالية 2027", "nameEn": "Fiscal Year 2027", "startDate": "2027-01-01", "endDate": "2027-12-31", "status": 2, "isCurrent": true },
  "selectedFiscalYear": { "id": 26, "code": "FY2026", "nameAr": "السنة المالية 2026", "nameEn": "Fiscal Year 2026", "startDate": "2026-01-01", "endDate": "2026-12-31", "status": 4, "isCurrent": false },
  "hasUserOverride": true,
  "availableFiscalYears": []
}
```

## Platform decisions

| Capability | API | Web | Mobile | Decision |
| --- | --- | --- | --- | --- |
| Paged management list | Required | Required Grid | Required Table | Same server contract |
| Cards | N/A | Required | Required | Same page and criteria as list |
| Detail with periods | Required | Required dialog | Required full-screen view | Child periods are read-only |
| Create/edit | Required | Required shared form dialog | Required full-screen AppForm | Same validation and requests |
| Lifecycle actions | Required | Required | Required | Permission/read-only/direct-handler guarded |
| Chart | Excluded | Excluded | Excluded | Budget/headcount analytics will own meaningful aggregates |
| Report | Required | Required | Required | Accounting-owned `fiscalyears` managed Crystal dataset; tenant/company scope |
| Import | Excluded | Excluded | Excluded | No financial-calendar import workflow, parser, control, or transport is owned by this feature |
| Export | Excluded | Excluded | Excluded | Managed Reporting is the approved output surface; no Fiscal Years export contract exists |
| Bulk actions | Excluded | Excluded | Excluded | Low-volume critical lifecycle; explicit single-row review is required |
| Realtime | Required | Required | Required | Resource `fiscal-years`, authoritative refetch |
| Company Current | Required | Required in management Grid/Cards/detail | Required in Table/Cards/detail | Exact `SetCurrent` permission and confirmation |
| Personal working-year context | Required | Required in global Topbar | Required in global App header | Same API; one preference per user/company; online authoritative |

Report is Required through managed Reporting. Import and Export are Excluded from
this feature; a future bulk-authoring or export requirement needs its own approved
feature-contract revision. No placeholder view, route, endpoint, or unused
component is permitted in this release.

## Client routes and integration

- Web route: `/finance/ledger-setup/fiscal-years` under `acc:ledger-setup`.
- Mobile route: `/finance/ledger-setup/fiscal-years` under `acc:ledger-setup`.
- Both applications add a shared Finance navigation group, permission
  constants, route access, localized EN/AR labels, query-key registration, and
  `fiscal-years` realtime invalidation.
- Web uses the shared feature layout, `PageHeader`, `MyDataGrid`, toolbar,
  pagination, cards, feedback states, `MyForm`, fields, and form-dialog system.
- Mobile uses the shared route guard, `AppScreen`, `AppListScreen`,
  `AppDataTable`, `AppDataCard`, `AppForm`, feedback, theme, localization, safe
  area, and server-list state.
- Web reuses the shared `ContextSwitcher`; the App Router composition root injects
  the Accounting selector through a generic Topbar slot so Shell never imports a
  business-module implementation. This is the Web `Implemented` reference for
  `P-008 Global Scoped Context Selector`.
- Mobile composes the Accounting selector into a generic navigation-header action
  slot and reuses `AppModal`, `AppCard`, `AppButton`, and the shared unsaved-change
  registry. Platform navigation never imports Accounting internals. This is the
  Mobile `Adapted` reference for P-008.

## Verification and handoff

Required evidence includes domain/validator/handler/controller/scope/concurrency
tests; inspected and applied migration; exact web/mobile transport tests; list,
form, lifecycle, permission, read-only, localization, and realtime tests; API
build/tests; web architecture/type/lint/test/build; mobile `npm run check`;
documentation generation/check; `git diff --check`; and the mandatory five-point
Web/Mobile UI audit. After automated evidence is ready, the implementation agent
must send the user the detailed manual Web/actual-device scenario defined by the
Slice 1 execution authority. The current executable instance is
`documentation/plans/business/accounting-core-gl/manual-acceptance/FISCAL-YEARS-STEP-01.md`,
derived from `MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`. The step remains Active until the user explicitly
accepts the results; an unavailable environment or user rejection is recorded and
never converted into an inferred Phase 06 pass.

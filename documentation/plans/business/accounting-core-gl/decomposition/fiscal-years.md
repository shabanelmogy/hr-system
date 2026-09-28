# Fiscal Years & Periods — Screen / Workflow Contract

> Contract version: 2.0
>
> This is the active Step 01 revalidation contract. Fiscal Years predates the
> historical 1A–1V package IDs; it is recorded here so the current run still has
> one complete feature authority. It does not create a new module or change the
> Accounting ownership boundary.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | accounting-core-gl |
| Authorized slice | Step 01 — Fiscal Years & Periods revalidation |
| Child Feature ID | fiscal-years |
| Child feature name | Fiscal Years & generated Fiscal Periods |
| Owner | Accounting / Finance |
| Depends on | Accounting foundation, authenticated tenant and current company |
| Execution status | Active |
| Status evidence | documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md and documentation/project/FISCAL_YEARS_FEATURE_FULL_REVIEW.md |

## 1. Child boundary and outcome

This feature owns the tenant/current-company financial calendar: a Fiscal Year
aggregate, its generated monthly or quarterly Fiscal Period children, lifecycle
actions, archive/restore behavior, the company-default `Current` Fiscal Year, a
per-user working-year selection within each company, and the read-only period
preview used by later Accounting and workforce-planning features.

`Current` is company state and is unique within the tenant/company. Changing it
requires the exact `FiscalYears:SetCurrent` permission and affects only the
default used when a user has no personal selection. The working selection is a
user preference keyed by trusted tenant, company, and authenticated user; changing
it requires `FiscalYears:View`, never changes another user's selection, and never
changes the company `Current` year.

The independent acceptance outcome is a complete API → Web → Mobile vertical
slice with authenticated live evidence and reconciled documentation. It does not
claim Currency, Chart of Accounts, Workforce Plans, Month Close, or any sibling
Accounting feature.

Periods are generated and reconciled by the Fiscal Year domain. They are not
JSON-authored and have no independent CRUD route in this feature.

## 2. UI Pattern Gate (mandatory before implementation)

The catalog authority is documentation/project/SCREEN_PATTERN_CATALOG.md. The
management surface uses P-001 as the server-managed collection/list interaction
pattern and one compact sectioned form. The global working-year selector uses
P-008. P-001 does not require Countries' five views or imply that every optional
surface must be implemented. P-003 tabs are not used: the form is one bounded
calendar workflow and the generated periods are a read-only child preview, not a
second form workflow.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fiscal-years-management | Web | /finance/ledger-setup/fiscal-years | Manage the company's financial calendar and inspect generated periods | Server-managed collection + read-only aggregate detail | P-001 | Grid/Cards/Report composition; one compact sectioned MyForm; period preview is read-only | web-next/src/modules/accounting/fiscal-years/pages/FiscalYearsPage.tsx; web-next/src/modules/accounting/fiscal-years/components/FiscalYearsMultiView.tsx; web-next/src/modules/accounting/fiscal-years/components/FiscalYearForm.tsx; Countries reference web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx | Implemented — revalidation active | Grid Required; Cards Required; Detail Required; Report Required through managed Reporting catalog; Import Excluded; Export Excluded; Chart Excluded; Tree Excluded | Initial/background loading, default/filtered empty, retryable error, forbidden/read-only, dirty form, field errors, busy actions, and RowVersion conflict/reload | Online authoritative reads and writes; no offline success synthesis or queued mutation | Writable form shows shared local mock draft after authoritative prerequisites; no submit, identity, tenant/company, or RowVersion fabrication; report/detail/query surfaces are N/A | Exact FiscalYears View/Create/Edit/Archive/Restore/Open/BeginClosing/Close/Lock/Reopen action; tenant + current company come from authenticated actor; no scope fields in route/body | Shared PageHeader, MyDataGrid, cards, feedback, MyForm and RTL theme; dialog/list scroll remains bounded; keyboard focus goes to first invalid field | Report is a managed Reporting surface, not a FiscalYearsController endpoint; compact form deliberately does not use P-003; import/export/chart have no runtime control |
| fiscal-years-management | Mobile | /finance/ledger-setup/fiscal-years | Manage and review the same authoritative company calendar on a touch device | Server-managed page + cards + read-only detail/period preview | P-001 | Table/Cards composition; full-screen stacked AppForm; no tabs; period preview is read-only | mobile-react/src/modules/accounting/fiscal-years/presentation/screens/FiscalYearsScreen.tsx; mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearForm.tsx; Countries reference mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Adapted — revalidation active | Table Required; Cards Required; Detail Required; Report Required through managed Reporting catalog; Import Excluded; Export Excluded; Chart Excluded; Tree Excluded | Loading/background refresh, empty/no-results, retryable error, forbidden/read-only, dirty exit, field validation, busy action, stale RowVersion conflict with reload | Online authoritative reads and writes; offline read/cache may be shown only as stale state; mutations require connectivity and never claim local success | AppForm mock action fills a deterministic valid local draft only after prerequisites; it never queues/submits or invents scope/identity/concurrency; read/report surfaces are N/A | Same server permissions and tenant/current-company scope; RouteGuard and API remain authoritative | Full-screen stacked form preserves one validation context; responsive table/cards, RTL labels, accessible touch targets, and back/dirty protection | Mobile adapts the P-001 ergonomics to table/cards and stacked form; it does not mirror a desktop split layout; import/export/chart have no runtime control |
| fiscal-year-working-context | Web | Global authenticated Topbar | See Tenant and Company scope, then switch only the signed-in user's working Fiscal Year | Unified scope badges plus compact domain selector composed into the shell through the Accounting public API | P-008 | Reuse shared `ContextBadge`/`ContextSwitcher`; no feature-owned look-alike menu | web-next/src/shared/components/layout/ContextBadge.tsx; web-next/src/shared/components/layout/ContextSwitcher.tsx; web-next/src/platform/tenant-access/TenantNameBadge.tsx; web-next/src/platform/tenant-access/CompanyContextSwitcher.tsx; web-next/src/modules/accounting/fiscal-years/components/FiscalYearContextSwitcher.tsx; composition in web-next/src/app/(main)/MainShell.tsx | Implemented | Context identity/selector Required; no independent page/view | Loading, no-year, API error, forbidden/hidden, busy, dirty-form confirmation, company switch, stale selection fallback | Online authoritative; selection is persisted by API and never synthesized locally | N/A | `FiscalYears:View`; trusted tenant/company/user only | Wide label/value hierarchy Tenant→Company→Year; compact icon-only variant with full tooltip/accessibility, keyboard/menu semantics and RTL | Shell receives a generic context slot and never imports Accounting internals; Tenant is session identity only |
| fiscal-year-working-context | Mobile | Global authenticated App header | See Tenant and Company scope, then switch only the signed-in user's working Fiscal Year | Unified scope badges plus compact Accounting-owned selector composed through a generic navigation action slot | P-008 | Reuse shared `AppContextBadge`, AppModal/AppCard/AppButton, and the existing company-switch interaction contract | mobile-react/src/shared/components/layout/AppContextBadge.tsx; mobile-react/src/platform/navigation/AppAppBar.tsx; mobile-react/src/platform/navigation/NavigationContextActions.tsx; mobile-react/src/platform/tenant-access/presentation/components/TenantNameBadge.tsx; mobile-react/src/platform/tenant-access/presentation/components/CompanyContextSwitcher.tsx; mobile-react/src/modules/accounting/fiscal-years/presentation/components/FiscalYearContextSwitcher.tsx; composition in mobile-react/app/(main)/_layout.tsx | Adapted | Context identity/selector Required; no independent route | Loading, no-year, API error, forbidden/hidden, busy, dirty-form confirmation, company switch, stale selection fallback | Online authoritative; no offline selection success | N/A | `FiscalYears:View`; trusted tenant/company/user only | Wide label/value hierarchy Tenant→Company→Year; 44-point icon-only badges on narrow phones, safe area, RTL and screen-reader state | Platform header consumes a generic slot; it never imports Accounting internals; Tenant is session identity only |

The management screen uses registered P-001 and the global working-context entry
uses registered P-008. A future pattern candidate would block UI implementation
until it is registered and reviewed in the catalog.

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Countries P-001 (Web) | web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx; web-next/src/modules/reference-data/geographical-information/countries/components/CountriesMultiView.tsx | Page header, server list state, Grid/Cards composition, feedback states, shared form conventions | Finance ownership, lifecycle actions, generated periods, company scope, and managed report contract |
| Countries P-001 (Mobile) | mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx | Table/Cards composition, AppListScreen/AppMultiView, shared form/state primitives | Online authoritative accounting mutations, lifecycle/RowVersion behavior, and report entitlement |
| Shared form system | web-next/src/shared/components/forms/dialog/MyForm.tsx; web-next/src/shared/components/forms/FormContainer.tsx; mobile-react/src/shared/components/forms/AppForm.tsx | One form context, validation/error focus, dirty protection, and local mock-draft action | Fiscal Year fields and generated-period read-only preview remain Accounting-owned |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web page/list shell | web-next/src/shared/components/navigation/header/PageHeader.tsx; web-next/src/shared/components/data-grid/core/MyDataGrid.tsx; shared server-list state | reuse | Compose PageHeader, toolbar, server paging/sort/filter, Grid and Cards without direct apiService calls |
| Web form/dialog | web-next/src/shared/components/forms/dialog/MyForm.tsx; shared MyTextField/MySelect/confirmation | reuse | One sectioned create/edit/view form with Zod field errors and RowVersion conflict handling |
| Mobile list/card shell | mobile-react/src/shared/components/multi-view/AppListScreen.tsx; mobile-react/src/shared/components/multi-view/AppMultiView.tsx; mobile-react/src/shared/components/data-table/AppDataTable.tsx; mobile-react/src/shared/components/surfaces/AppDataCard.tsx | reuse | Table/Cards consume the same server page and query state |
| Mobile form/state | mobile-react/src/shared/components/forms/AppForm.tsx; mobile-react/src/shared/components/feedback/AppStateView.tsx; mobile-react/src/shared/components/dialogs/confirmation/ConfirmationDialog.tsx | reuse | Full-screen stacked form, dirty exit, server errors, and lifecycle confirmations |
| Managed report | Reporting managed report catalog/rendering contract | reuse | Reporting owns report rendering and entitlement; Accounting supplies the fiscalyears dataset |
| Global working-context selector | Web `ContextBadge`/`ContextSwitcher`; Mobile `AppContextBadge` + `AppModal`/`AppCard`/`AppButton`; existing company-switch dirty guard | reuse/compose | Shared owns the scope label/value/icon surface; Accounting owns year data and selection; App/Shell composition injects a generic action so Shell/Platform do not depend on Accounting |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Grid/Table and Cards | Web Grid/Cards Required; Mobile Table/Cards Required | One server page/query with search, status/lifecycle filters, sort, and paging | Search, filter, sort, open detail, create, edit, archive/restore, lifecycle actions when authorized |
| Detail/View | Required on Web and Mobile | Read-only Fiscal Year aggregate with ordered generated periods | Inspect dates, frequency, status, period sequence and RowVersion-backed actions |
| Create/Edit | Required on Web and Mobile | One compact sectioned shared form; end date calculated from start date/frequency | Create or edit Draft with bilingual names/code/frequency; submit authoritative mutation |
| Report | Required on Web and Mobile | Managed Reporting catalog route over Accounting's company-scoped dataset | Open report when Reporting entitlement and Fiscal Years view permission allow |
| Chart | Excluded | No placeholder | N/A |
| Import | Excluded on Web and Mobile | No route, control, parser, or transport in this feature | N/A |
| Export | Excluded on Web and Mobile | No route, control, or transport in this feature | N/A |
| Company `Current` year | Required on Web and Mobile management views | Gold/warning `Current` badge in list/card/detail plus a permission-guarded Set Current action offered only for an Open target | One active company default; does not overwrite user overrides; Draft/Closing/Closed/Locked cannot be newly assigned Current |
| User working-year selector | Required in Web Topbar and Mobile authenticated App header | Compact shared selector over the authoritative context endpoint | Change/clear only the caller's selection; selecting company Current clears an unnecessary override |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | CQRS requests/responses under api/Modules/Accounting/ErpSystem.Modules.Accounting.Application/Features/Finance/FiscalYears include distinct required `NameAr` and `NameEn`; list/detail/lookup include `IsCurrent`; detail includes ordered non-deleted periods and RowVersion; context includes company Current, effective selected year, whether a personal override exists, and selectable non-archived years |
| Canonical API route | /api/v1/fiscal-years in api/Modules/Accounting/ErpSystem.Modules.Accounting.Presentation/Features/Finance/FiscalYears/V1/FiscalYearsController.cs |
| Web/Mobile routes | /finance/ledger-setup/fiscal-years |
| Server search/filter/sort | One-based page/pageSize, allow-listed search field/operator, record/lifecycle status, sort column/direction; default StartDate descending then Id descending |
| Paging/limits | Server-owned page metadata and max client page size; clients do not present current-page filtering as global |
| Domain errors / ProblemDetails | Stable not-found, duplicate-code, overlap, transition, not-editable/not-archivable/not-restorable, current-year archive, invalid selection, validation, missing-company/user, and concurrency errors localized EN/AR |
| Permission and tenant/company scope | TenantMember plus the exact FiscalYears View/Create/Edit/Archive/Restore/Open/BeginClosing/Close/Lock/Reopen/SetCurrent permission; ICurrentActor supplies TenantId, current CompanyId, and UserId; request DTOs never accept scope or another user ID |
| Cross-module contract | Reporting consumes Accounting's public fiscalyears dataset; future Workforce Planning references FiscalYearId under server company/lifecycle eligibility |
| Persistence/schema/migration | AccountingDbContext, acc schema, `FiscalYears.IsCurrent`, and a `FiscalYearUserSelections` row keyed by tenant/company/user with an optional selected FiscalYear FK; HR ApplicationDbContext and ErrorsService are outside this feature |

Context routes are `GET /api/v1/fiscal-years/context` and
`PUT /api/v1/fiscal-years/context` with `{ "fiscalYearId": number | null }`.
The write is last-write-wins for this user's preference and returns the complete
authoritative context. `POST /api/v1/fiscal-years/{id}/set-current` accepts the
target RowVersion and changes the unique company default atomically.

### Permission Action Matrix

All rows are company-scoped, blocked by global read-only for mutations, enforced by
the API, and guarded by both the visible Web/Mobile action and its direct callback.
Technical keys are stable English; role-catalog labels are bilingual.

| Actor | Action / route | Exact permission | English label | العربية | Required denial evidence |
| --- | --- | --- | --- | --- | --- |
| Company user | List/detail/report dataset `GET` | `FiscalYears:View` | View fiscal years | عرض السنوات المالية | Direct route/API denied without View |
| Company user | Create `POST` | `FiscalYears:Create` | Create fiscal year | إضافة سنة مالية | View/Edit do not grant Create |
| Company user | Edit `PUT` | `FiscalYears:Edit` | Edit fiscal year | تعديل سنة مالية | Create does not grant Edit |
| Company user | Archive `DELETE .../archive` | `FiscalYears:Archive` | Archive fiscal year | أرشفة سنة مالية | Restore does not grant Archive |
| Company user | Restore `POST .../restore` | `FiscalYears:Restore` | Restore fiscal year | استعادة سنة مالية | Archive does not grant Restore |
| Company user | Open | `FiscalYears:Open` | Open fiscal year | فتح السنة المالية | Other lifecycle claims do not grant Open |
| Company user | Begin closing | `FiscalYears:BeginClosing` | Begin closing | بدء الإقفال | Open/Close do not grant Begin closing |
| Company user | Close | `FiscalYears:Close` | Close fiscal year | إقفال السنة المالية | Begin closing does not grant Close |
| Company user | Lock | `FiscalYears:Lock` | Lock fiscal year | قفل السنة المالية | Close does not grant Lock |
| Authorized exception actor | Reopen | `FiscalYears:Reopen` | Reopen fiscal year | إعادة فتح السنة المالية | Lock/Open do not grant Reopen |
| Company calendar administrator | Set company Current `POST .../{id}/set-current` | `FiscalYears:SetCurrent` | Set current fiscal year | تعيين السنة المالية الحالية | View/Edit/lifecycle claims do not grant Set Current |
| Company user | Read personal context `GET .../context` | `FiscalYears:View` | View fiscal years | عرض السنوات المالية | Missing View hides selector and API returns forbidden |
| Company user | Change/clear own selection `PUT .../context` | `FiscalYears:View` | Select working fiscal year | اختيار سنة العمل المالية | Scope/user are never caller supplied; a second user is unchanged |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | Authorized company context; form is clean | Enter code, bilingual names, start date and frequency; end date is calculated | Create Draft and generate 12 monthly or 4 quarterly periods atomically | Return authoritative aggregate/RowVersion; stay in Draft |
| Edit | Existing Draft detail loaded with current RowVersion | Edit calendar fields; periods are never authored as JSON | Update Draft, reconcile periods by sequence, preserve matching identities, archive surplus and restore matching archived periods | Refresh authoritative detail; non-Draft fields are read-only |
| View/detail/preview | List row or deep link | Inspect aggregate, lifecycle, period sequence/range/status | Query detail with ordered non-deleted periods | No child mutation; report is separate managed Reporting surface |
| Archive/restore | Draft for archive; archived Draft for restore | Confirm action; send latest RowVersion | Archive/restore with overlap check on restore; repeated target action is idempotent | Update list/detail and invalidate fiscal-years query family |
| Open/begin-closing/close/lock/reopen | Authorized lifecycle state + RowVersion | Confirm explicit lifecycle action | Enforce Draft→Open→Closing→Closed→Locked and controlled Closed/Locked→Open reopen | Reopen returns active periods to Open but never makes calendar editable |
| Set company Current | Authorized Open, non-archived row + latest RowVersion | Confirm Set Current from Grid/Table, Card, or detail; other lifecycle states do not expose the action | Under the company-calendar lock, reject non-Open targets with `FiscalYear.MustBeOpenForCurrent`, then clear the previous current row and mark the target; repeating the already-current row is idempotent and the filtered unique index permits at most one | All users without a personal override resolve to the new company Current; existing personal overrides remain unchanged; a Current year may continue through later lifecycle states until another Open year replaces it |
| Select personal working year | View-authorized authenticated user | Choose a non-archived year in the Topbar/App header after dirty-state approval | Upsert only `(TenantId, CompanyId, UserId)` preference; selecting the company Current or sending null clears the override | Only this user and this company change; switching company resolves that company's preference/default independently |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | Shared feedback states for initial/background fetch, default/filtered empty, retryable API errors, and action busy state |
| Permission / forbidden / read-only | Server authoritative; clients fail closed and hide discoverability only after permission evaluation; subscription read-only suppresses all mutations |
| Archived / locked | Archived rows support restore only when eligible; Locked rows are view/reopen only; no client-only lifecycle bypass |
| Unsaved changes / destructive confirmation | Shared form dirty guard and shared confirmation dialog; no native browser/device alert or confirm |
| Offline / stale / conflict | Online authoritative writes; stale cache is clearly identified; mutation requires connectivity; RowVersion conflict reloads latest detail and preserves no false success |
| Mock data | Shared action fills realistic next-year monthly local draft only after prerequisites; no submit/persist, identity, tenant/company, RowVersion, or lifecycle invention; query/report/detail surfaces are N/A |
| Context fallback | Missing/invalid/archived personal selection falls back to the company Current. If neither exists, the selector shows a localized no-year state and does not invent a year. Company switching loads a separately scoped context. |

## 9. Concurrency, transactions, and consistency

Every mutation requires the current Base64 RowVersion where applicable and executes
under FiscalYearLocks.CompanyCalendar plus the Accounting-owned
IAccountingUnitOfWork transaction against the same scoped AccountingDbContext.
Audit persistence commits atomically. Repeated target-state lifecycle actions are
idempotent; stale versions return a stable conflict and the client reloads.
Scheduler/realtime invalidation is post-commit only and uses the fiscal-years
resource.

Setting company Current is RowVersion-protected, audited and serialized by the
same company-calendar lock. Personal selection is intentionally not RowVersion
protected: it is an idempotent last-write-wins preference for one authenticated
user, persists online in Accounting, and does not publish company-wide mutation
notifications.

## 10. i18n, RTL, accessibility, and responsive behavior

Visible Web/Mobile text, including Current, Set Current, working-year selector,
fallback/error/help text, and the `FiscalYears:SetCurrent` role label, is owned by
paired English and Arabic catalogs. Separately, Fiscal Year and generated named Period data preserve
distinct persisted `NameAr` and `NameEn`: create/edit require both, detail exposes
both, and Grid/Table/Cards/search use current locale with documented fallback
without overwriting the other value. Both platforms use the shared RTL/theme system. Web maps the first
invalid field to its section and focus; Mobile preserves one validation context and
first-error focus. Grid/Cards/Table remain usable at narrow widths, list scroll is
bounded to its panel, lifecycle actions have accessible names and confirmation,
and read-only/forbidden states are announced through shared state components.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Accounting owner/scope/contracts frozen | API build and focused Fiscal Year domain/application/controller/isolation tests; migration applied and no pending model changes | documentation/api/FiscalYears_API_Implementation_Profile.md; api/Modules/Accounting/ErpSystem.Modules.Accounting.Tests/ |
| 2 | Web | Verified | API contract verified | Source evidence: typed service/hooks, P-001 Grid/Cards/Report, form/mock/conflict tests, type-check and focused lint; authenticated live journey is still pending | documentation/web-next/features/fiscal-years-frontend-reference.md; web-next/src/modules/accounting/fiscal-years/ |
| 3 | Mobile | Verified | Web contract verified | Source evidence: typed remote/use-case boundary, P-001 Table/Cards/Report, form/mock/conflict tests, type-check/lint/export evidence; actual device journey is still pending | documentation/mobile-react/fiscal-years-mobile-reference.md; mobile-react/src/modules/accounting/fiscal-years/ |
| 4 | Integrated live verification + user acceptance | Active | API/Web/Mobile evidence complete | Agent sends the detailed authenticated API/Web/actual-Mobile scenario; user runs or supervises it and explicitly accepts. Create/edit/view/archive/restore/lifecycle/report/conflict and bilingual checks are mandatory; no pass is inferred from automated evidence. | Scenario, results and user decision recorded in Phase 06 evidence |
| 5 | Documentation and closure | Queued | Integrated stage Verified **and explicit user acceptance recorded** | Reconcile canonical profiles, required-file manifest/recipe, plan status, and customer education when required; then mark Closed | To be recorded after Step 01 manual acceptance |

**Manual acceptance protocol.** Follow
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`, the transition rule in
`../SLICE-01-LEDGER-SETUP-EXECUTION.md`, and the current executable instance in
`../manual-acceptance/FISCAL-YEARS-STEP-01.md`. The implementation agent must send the user
all prerequisites, exact data, Web and actual-device actions, EN/AR/RTL cases,
expected outcomes, negative/read-only/conflict checks, cleanup and evidence fields.
This step remains Active until the user replies with explicit acceptance.

Next-step rule: Currency and every later Accounting step remain Queued or Blocked.
No sibling may become Active until this contract's integrated live verification is
Verified, explicit user acceptance is recorded, and documentation/closure is Closed.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Fiscal Year generation, bilingual names, exact duration, lifecycle, reopen, period identity preservation, archived-period restoration, validation | Both names survive monthly/quarterly generation and lifecycle; invalid transitions; idempotent target state | Source tests recorded in canonical profile |
| API/transport | Controller CQRS/route/permission/TenantMember contract tests; `NameAr`/`NameEn`; company isolation; RowVersion archive/restore/lifecycle | Scope cannot be selected by caller; either name missing fails; stale write conflicts | Focused tests reported green; live auth still pending |
| Persistence/migration | AccountingDbContext schema/index/relationship and migration application | acc schema and composite tenant/company isolation | Development migration applied; deployment evidence remains in Phase 06 |
| Web | P-001 Grid/Cards/Report composition, server criteria, form validation/mock, lifecycle/conflict tests; explicit absence of Import/Export/Chart controls | No direct transport in components; report permission/entitlement gate | Focused checks green; authenticated live journey pending |
| Mobile | P-001 Table/Cards/Report composition, remote boundary, form validation/mock, conflict/reload tests; explicit absence of Import/Export/Chart controls | Online authoritative mutation and device navigation/back/dirty behavior | Focused checks green; actual device journey pending |
| E2E/manual/live | Authenticated hosted API, Web browser, and actual Mobile/device journey | Create → edit → view periods → open/close/reopen/archive/restore → report and stale conflict | Pending; must be completed before Verified |
| Current/context | API isolation tests plus Web Topbar and Mobile App-header tests | One company Current; two users choose independently; company switch isolates preferences; archived/stale override falls back; SetCurrent denial is exact | Required by this contract revision |

## 13. Child exit gate

- [x] API, Web, and Mobile contracts are documented and focused source checks are recorded.
- [x] P-001 management and P-008 global-context patterns are selected for both platforms with exact references and explicit R/D/E decisions.
- [x] No new/candidate pattern is used and P-003 is intentionally not applied.
- [x] Source contracts/forms/lists carry distinct Arabic and English Fiscal Year names.
- [ ] Company Current and per-user/per-company working-year context are implemented and verified on API, Web Topbar, and Mobile App header.
- [ ] Authenticated live Web and actual Mobile/device journey is verified.
- [ ] Live create/edit/view/list verifies both `NameAr` and `NameEn` without data loss.
- [ ] The detailed manual scenario and results were sent to the user, and the user's explicit acceptance is recorded.
- [ ] Integrated evidence is recorded in Phase 06 and this contract moves to Verified.
- [ ] Canonical documentation, manifest/recipe, and required customer education are reconciled.
- [ ] The roadmap moves Currency to Active only after this feature is Closed.

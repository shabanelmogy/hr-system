# Ledger Setup Exchange Rates — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-exchange-rates` |
| Child feature name | Exchange Rate Types and Exchange Rates |
| Owner | Accounting |
| Depends on | `ledger-setup-currency`, `ledger-setup-company-settings` order |
| Execution status | `Queued` after Company Settings closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; generic clients remain compatibility evidence |

## 1. Child boundary and outcome

This child owns Accounting `ExchangeRateType` and historical/versioned
`ExchangeRate` setup. Rate Types have separate Arabic and English stored names;
rate records are identified by type, currency pair, effective period and version
and therefore do not invent name fields. Independent acceptance proves effective
rate series without restoring HR rate authority or mutable-rate shortcuts.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-exchange-rate-types | Web | `/finance/ledger-setup/exchange-rates` Types view | Manage rate-type master data | server-managed flat collection | P-001 | independent Grid and typed `MyForm` | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; no identity/scope/RowVersion fabrication | `AccountingSetup:View/Manage`; current company | bounded grid/form, RTL and keyboard/error focus | Generic renderer is current evidence only; target is a typed Rate Type child |
| ledger-setup-exchange-rate-types | Mobile | `/finance/ledger-setup/exchange-rates` Types segment | Manage rate-type master data | native server-managed collection | P-001 | Table/Cards and typed full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; no fabricated identity/scope/concurrency | `AccountingSetup:View/Manage`; current company | phone/tablet, RTL, touch/screen-reader and validation focus | Typed clean layers replace generic resource definitions |
| ledger-setup-exchange-rate-history | Web | `/finance/ledger-setup/exchange-rates` Rates view | Maintain and inspect effective historical rate series | filtered server-managed collection | P-001 | independent Grid and typed `MyForm`; not a tabbed aggregate | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | list/type/currency lookup loading, empty/no-results, error/retry, forbidden, dirty, overlap/version/concurrency conflict | online authoritative | local draft uses real Rate Type/Currency IDs; no invented effective history | `AccountingSetup:View/Manage`; current company | bounded history grid, compact form, RTL and keyboard/error focus | History has no bilingual name fields; linked masters provide localized labels |
| ledger-setup-exchange-rate-history | Mobile | `/finance/ledger-setup/exchange-rates` Rates segment | Maintain and inspect effective historical rate series | filtered native server-managed collection | P-001 | Table/Cards and typed full-screen `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | list/type/currency lookup loading, empty/no-results, error/retry, forbidden, dirty, overlap/version/concurrency conflict | online authoritative | local draft uses authoritative dependencies only | `AccountingSetup:View/Manage`; current company | phone/tablet, RTL, touch/screen-reader and validation focus | Segment navigates an independent resource; P-003 is not used |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-001 Accounting lists | sources registered in `documentation/project/SCREEN_PATTERN_CATALOG.md` | authoritative list/form/lifecycle/state behavior | historical pair/effective/version rules remain server-owned |
| Existing FX setup | current Web/Mobile generic resource screens named above | route and interaction evidence | catch-all records/schemas are removed from target child ownership |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web collections/forms | `PageHeader`, `MyDataGrid`, `useServerListState`, `MyForm`, shared select/date/number fields and feedback | reuse | separate typed Rate Type and Rate views |
| Mobile collections/forms | `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppForm`, `AppDateTimeField`, `AppSelectField`, `AppStateView` | reuse | native typed Types/Rates journeys |
| Dependencies | active Currency and Rate Type lookups | reuse owned contracts | From/To Currency and Rate Type choices |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Rate Types | Required | independent list/form | manage code, `NameAr`, `NameEn` and lifecycle |
| Historical Rates | Required | independent filtered list/form | manage pair/type/effective/version/rate and inspect history |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | separate Rate Type and Rate detail/page/mutation/lifecycle contracts; Rate Type includes `NameAr`/`NameEn`; Rate uses typed IDs/dates/version/decimal |
| Canonical routes | Accounting FX APIs plus `/finance/ledger-setup/exchange-rates` subviews |
| Server search/filter/sort | code, Arabic/English type name/status; type, pair, effective dates/status and approved sort allow-lists for rates |
| Paging/limits | authoritative totals; dependency lookups cannot silently truncate |
| Domain errors / ProblemDetails | missing bilingual type name, nonpositive rate, same/invalid pair, inactive dependency, duplicate/effective conflict and concurrency |
| Permission and tenant/company scope | `AccountingSetup:View/Manage`; server-enforced current company |
| Cross-module contract | N/A — Currency/FX are Accounting-owned |
| Persistence/schema/migration | Accounting FX mappings/migrations and effective/version indexes; live database update required |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create/Edit Rate Type | Manage | code, `NameAr`, `NameEn` | create/update with RowVersion | list/lookup retain both names |
| Rate Type lifecycle | valid dependency state | confirm | archive/restore | history dependency conflict explicit |
| Create/Edit permitted Rate | active type/currencies | type, pair, effective range, version and rate | create/update historical record | series refreshes without replacing history silently |
| View history | View/read-only | filter and inspect | paged read | localized linked names shown; no mutation controls |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | Types, Rates and dependency lookups have independent states |
| Permission / forbidden / read-only | View reads/history; Manage mutates; global read-only removes writes |
| Archived / locked | archived Rate Types remain discoverable; unavailable dependencies cannot be newly selected |
| Unsaved changes / destructive confirmation | shared dirty guard and Type lifecycle confirmation |
| Offline / stale / conflict | online-authoritative; uncertain writes refetch; effective/version races are server-owned |
| Mock data | Type drafts include valid Arabic/English names; Rates use real lookups and valid dates/decimals; no fabricated scope/history/concurrency |

## 9. Concurrency, transactions, and consistency

Protected mutations send RowVersion where defined. Currency/Rate Type changes
invalidate selectors and rate series. Database/server own effective/version
uniqueness and overlap races; both type-name values commit together.

## 10. i18n, RTL, accessibility, and responsive behavior

Rate Type create/edit/view/list exposes persisted `NameAr` and `NameEn`; a Rate
shows localized names from its linked Type/Currencies while retaining stable IDs.
UI labels/status text use EN/AR catalogs. Shared forms/grids provide RTL, first-error
focus, screen-reader/touch behavior and bounded scrolling on compact layouts.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | Company Settings closed and contract approved | typed bilingual Type/history contracts, migrations, permissions and tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | typed P-001 Types/Rates screens/forms/states and tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, schemas, native Types/Rates and tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior stages Verified | agent sends detailed authenticated historical FX API/Web/actual-Mobile scenario with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical docs, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact type/pair/rate/effective-date data, Web and
actual-device steps, EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/
conflict cases, cleanup and evidence. The feature remains Active until explicit
user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | bilingual Type, pair/rate/effective/version/dependency tests | duplicate version, invalid pair and missing one Type name | Queued |
| API/transport | exact criteria/page/mutation tests | both Type names, totals and date/pair serialization | Queued |
| Persistence/migration | apply current Accounting migration | bilingual Type columns and effective indexes | Queued |
| Web | focused Types/Rates tests | history remains authoritative and both names editable | Queued |
| Mobile | schemas/query/form tests | create/view history and localized linked labels | Queued |
| E2E/manual/live | authenticated FX setup | filter pair, conflict, EN/AR and responsive journey | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001 is registered and reviewed.
- [ ] Generic source ownership is replaced by typed FX boundaries.
- [ ] Rate Type Arabic/English names and history identity are verified API-to-UI.
- [ ] Effective/version rules, permissions, conflict and live schema are verified.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Link Accounts becomes Active.

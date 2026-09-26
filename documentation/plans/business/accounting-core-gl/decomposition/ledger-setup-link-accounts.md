# Ledger Setup Link Accounts — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-link-accounts` |
| Child feature name | Link Accounts |
| Owner | Accounting |
| Depends on | `ledger-setup-books-journals`, `ledger-setup-coa-hierarchy`, `ledger-setup-exchange-rates` order |
| Execution status | `Queued` after Exchange Rates closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; current generic mapping UI is compatibility evidence only |

## 1. Child boundary and outcome

This child owns direct, typed, effective `AccountMapping` records so a company
purpose and every genuinely available source capability can resolve to an eligible
Account. The mapping has no user-authored name field; Book, Account and source
selectors display the Arabic/English names owned by their source contracts.
Conditional Posting Profiles, fake source masters and posting execution are outside.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-link-accounts | Web | `/finance/ledger-setup/account-determination` Link Accounts view | Configure direct purpose/source-to-Account mappings | scoped effective relationship records | P-006 | filtered mapping table plus typed form and explicit version/save action | `web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | mapping/capability/lookup loading, empty/no-results, partial error/retry, forbidden/read-only, dirty, overlap/concurrency conflict | online authoritative | N/A for mappings; authoritative Book/Account/source prerequisites only | `AccountingSetup:View/Manage`; current company and selected Book/context | grouped responsive table/form, RTL, keyboard selection, change summary and error focus | Role Permissions supplies relationship behavior only; effective mapping semantics are Accounting-owned |
| ledger-setup-link-accounts | Mobile | `/finance/ledger-setup/account-determination` Link Accounts segment | Configure direct purpose/source-to-Account mappings | scoped effective relationship records | P-006 | stacked mapping cards plus typed form and explicit save/version action | `mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx` | Adapted | Cards Required; Detail Required; Grid Table Tree Report Import Export Chart Excluded | mapping/capability/lookup loading, empty/no-results, partial error/retry, forbidden/read-only, dirty, overlap/concurrency conflict | online authoritative | N/A for mappings; no fabricated Book/Account/source capability | `AccountingSetup:View/Manage`; current company and selected Book/context | phone/tablet cards, RTL, touch/screen-reader state, change summary and validation focus | Mobile cards adapt the same relationship contract without local financial truth |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-006 Role Permissions | Web/Mobile Role Permissions paths named above | scope, filtering, dirty set, read-only, explicit save and platform adaptation | mappings are effective/versioned records, not permission checkboxes |
| Current Account Determination | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` and Mobile counterpart | current route/form evidence | generic fields and company-only hardcoding are not target authority |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web mapping UI | P-006 structure plus shared `PageHeader`, grid/form/select/feedback/dirty/confirmation components | feature-specific composition | typed list/detail/editor with capability-driven fields |
| Mobile mapping UI | P-006 cards plus `AppListScreen`, `AppForm`, `AppSelectField`, feedback and confirmation | feature-specific composition | native mapping journey with identical semantics |
| Dependencies | active Book/Account lookups and typed source capability/reference contracts | reuse owned public contracts | show only eligible same-company choices and supported source types |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Mapping collection/editor | Required | P-006 scoped relationship workspace | filter, inspect, create and version/edit effective mapping |
| Capability-driven source selector | Required | dynamic typed fields | choose only supported source/reference |
| Unsupported source placeholders | Excluded | no dead controls | none |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | AccountMapping detail/page/mutation plus source-capability/reference contracts; IDs remain stable while referenced bilingual names are presentation data |
| Canonical routes | Accounting Account Mapping/capability APIs plus the Account Determination client route |
| Server search/filter/sort | Book, purpose, source type/reference, Account, effective/status and approved allow-list |
| Paging/limits | authoritative totals; capability/reference/lookup traversal cannot silently truncate |
| Domain errors / ProblemDetails | unsupported source, invalid reference, inactive Account/Book, overlap/ambiguity, permission and concurrency |
| Permission and tenant/company scope | `AccountingSetup:View/Manage`; server-enforced current company and referenced owner scope |
| Cross-module contract | a source type appears only when its owner exposes a stable validating contract/projection |
| Persistence/schema/migration | Accounting mapping/effective indexes and constraints; live database update required |

Company-purpose default is always available. BankAccount, PaymentMethod, Cashbox,
ContactGroup and PartyRole are never synthesized merely to populate UI.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create company default | Manage | Book, purpose, Account and effective range | create AccountMapping | mapping refresh; localized Book/Account labels remain linked, not copied authority |
| Create source-specific mapping | supported capability | choose typed source and validated reference | create mapping | unavailable source cannot be selected |
| Edit/version mapping | current record/version | change API-authorized effective fields | update/version | history/effective semantics preserved; conflict reloads |
| View | View/read-only | filter and inspect | read collection/detail | no write controls; referenced names visible in current locale |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | collection, capability and each reference lookup state remain independently visible |
| Permission / forbidden / read-only | View inspects; Manage writes; global read-only preserves mappings |
| Archived / locked | ineligible dependencies remain visible historically but cannot be newly selected |
| Unsaved changes / destructive confirmation | shared dirty guard; effective replacement/end action uses confirmation |
| Offline / stale / conflict | online-authoritative; lookup failure blocks save; overlap/concurrency refetches server truth |
| Mock data | N/A for relationship records; form helpers may select only real prerequisites and never fabricate source capability or success |

## 9. Concurrency, transactions, and consistency

Protected changes use current concurrency/version tokens. Account, Book and source
capability changes invalidate selectors and mappings. Server/database own effective
range, duplicate winner and competing write races.

## 10. i18n, RTL, accessibility, and responsive behavior

Purpose/source/status text uses EN/AR catalogs. The mapping does not duplicate
`NameAr`/`NameEn`; it renders current-locale Book, Account and source names from
their owners with documented fallback, while details can expose both where useful.
Dynamic fields have accessible loading/error labels. Web table and Mobile cards
preserve RTL, focus/touch behavior and readable effective/account information.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | Exchange Rates closed and contract approved | typed capabilities/mappings, effective constraints, migrations, permissions and tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | typed P-006 mapping journey, dynamic fields and tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, runtime schemas, P-006 cards/forms and tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior stages Verified | agent sends detailed authenticated default + real-source mapping API/Web/actual-Mobile scenario with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical docs, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact purpose/source/Book/Account data, Web and
actual-device steps, EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/
conflict cases, cleanup and evidence. The feature remains Active until explicit
user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | mapping/effective/capability tests | default resolves and unsupported source is rejected | Queued |
| API/transport | capability/reference/page/mutation tests | no fake source and real totals | Queued |
| Persistence/migration | apply current Accounting migration | effective uniqueness/overlap constraints | Queued |
| Web | P-006 mapping tests | dynamic field visibility, dirty filtering and localized references | Queued |
| Mobile | schema/query/card/form tests | lookup error blocks save and read-only is preserved | Queued |
| E2E/manual/live | authenticated mapping journey | default plus one real typed source in EN/AR | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-006 is registered and reviewed.
- [ ] Generic mapping evidence is replaced by typed capability/mapping ownership.
- [ ] Referenced bilingual names display correctly without duplicate ownership.
- [ ] Effective rules, permissions, conflicts and live schema are verified.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Posting Profiles becomes Active.

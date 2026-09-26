# Ledger Setup Dimensions — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-dimensions` |
| Child feature name | Dimensions and Account Dimension Policies |
| Owner | Accounting |
| Depends on | `ledger-setup-coa-hierarchy` |
| Execution status | `Queued` after COA closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; current generic clients are compatibility evidence only |

## 1. Child boundary and outcome

This child owns `DimensionDefinition`, `DimensionValue`, typed value-source
capability, and `AccountDimensionPolicy`. Independent acceptance proves bilingual
definitions/values and an account-scoped Required/Optional/Forbidden relationship
workflow. Journal-line assignments and posting validation belong to later slices.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-dimension-definitions | Web | `/finance/ledger-setup/dimensions` Definitions view | Manage dimension masters and value-source capability | server-managed flat collection | P-001 | focused view with Grid and typed `MyForm` | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; capability values come from server contract | `Dimensions:View/Manage`; current company | bounded grid, compact form, RTL, keyboard and error focus | Generic renderer proves current behavior only and must be replaced by a typed child composition |
| ledger-setup-dimension-definitions | Mobile | `/finance/ledger-setup/dimensions` Definitions segment | Manage dimension masters and value-source capability | native server-managed collection | P-001 | Table/Cards with full-screen typed `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft only; no fabricated capability, identity or scope | `Dimensions:View/Manage`; current company | phone/tablet, RTL, touch and screen-reader/error focus | Generic resource model is migration evidence, not target ownership |
| ledger-setup-dimension-values | Web | `/finance/ledger-setup/dimensions` Values view | Manage values within one definition scope | scoped server-managed collection | P-001 | definition selector plus Grid and typed `MyForm` | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | definition lookup, loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft uses a real selected definition/source reference only | `Dimensions:View/Manage`; current company and definition | selector stacks compactly, bounded grid, RTL, keyboard/error focus | Independent view; P-003 is not used because Definitions and Values have separate APIs/lifecycles |
| ledger-setup-dimension-values | Mobile | `/finance/ledger-setup/dimensions` Values segment | Manage values within one definition scope | scoped native collection | P-001 | definition selector plus Table/Cards and typed `AppForm` | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | definition lookup, loading, empty/no-results, error/retry, forbidden, dirty, dependency/concurrency conflict | online authoritative | local bilingual draft uses authoritative definition/source data only | `Dimensions:View/Manage`; current company and definition | phone/tablet stacked scope, RTL, touch and validation focus | Segment is navigation between independent resources, not one tabbed aggregate form |
| ledger-setup-account-dimension-constraints | Web | `/finance/ledger-setup/dimensions` Account Constraints view | Set Required/Optional/Forbidden per Account and Dimension | scoped relationship editor | P-006 | account scope selector plus explicit relationship save | `web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | account/definition lookup, loading, empty/no-results, partial error, forbidden/read-only, dirty set, save conflict | online authoritative | N/A for relationships; real Account/Dimension prerequisites are mandatory | `Dimensions:View/Manage`; current company and selected Account | grouped table, compact stacking, RTL, keyboard selection and change summary | Role Permissions supplies interaction pattern only; policy upsert semantics remain Accounting-owned |
| ledger-setup-account-dimension-constraints | Mobile | `/finance/ledger-setup/dimensions` Account Constraints segment | Set Required/Optional/Forbidden per Account and Dimension | scoped relationship editor | P-006 | account selector plus stacked definition cards and explicit save | `mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx` | Adapted | Cards Required; Detail Required; Grid Table Tree Report Import Export Chart Excluded | account/definition lookup, loading, empty/no-results, partial error, forbidden/read-only, dirty set, save conflict | online authoritative | N/A for relationships; no fabricated prerequisites | `Dimensions:View/Manage`; current company and selected Account | phone/tablet cards, RTL, touch targets, screen-reader state and change summary | Mobile cards adapt Web relationship table without dropping any policy |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-001 list management | Currency/Countries sources registered in `documentation/project/SCREEN_PATTERN_CATALOG.md` | authoritative lists, forms and states | definition/value fields and scoping stay Accounting-owned |
| P-006 relationship editor | Role Permissions Web/Mobile sources registered in the pattern catalog | scope, filtering, dirty set, read-only and explicit save | AccountDimensionPolicy uses typed requirement values and server upsert rules |
| Existing Ledger Setup | current Web/Mobile resource screens named in the gate | route and current interaction evidence | generic records/catch-all schemas are removed from target child ownership |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web collection/form | `MyDataGrid`, `useServerListState`, `MyForm`, shared selects and feedback under `web-next/src/shared/components/` | reuse | typed Definition and Value collections/forms |
| Mobile collection/form | `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppForm`, `AppSelectField` under `mobile-react/src/shared/components/` | reuse | native scoped lists and forms |
| Relationship editor | P-006 reference plus shared filters/feedback/dirty guard | feature-specific composition | Account scope with one typed requirement per definition |
| Account dependency | public Account lookup/detail seam from COA | reuse | only eligible same-company Account IDs |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Definitions | Required | independent list/form view | manage code, `NameAr`, `NameEn`, source and lifecycle |
| Values | Required | selected-definition scoped list/form | manage code, `NameAr`, `NameEn`, reference and lifecycle |
| Account Constraints | Required | P-006 relationship editor | choose Account, review and save each requirement |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | separate Definition, Value, capability and Account Policy contracts; named Definition/Value DTOs have distinct `NameAr` and `NameEn` |
| Canonical routes | Accounting Dimensions/Values/Policies API plus `/finance/ledger-setup/dimensions` subviews |
| Server search/filter/sort | code, Arabic/English name, source/status; Values are definition-scoped; Policies are account-scoped |
| Paging/limits | real totals for collections; complete/bounded lookup traversal cannot truncate silently |
| Domain errors / ProblemDetails | missing bilingual name, unsupported source, invalid reference, duplicate code, inactive dependency, concurrency |
| Permission and tenant/company scope | `Dimensions:View/Manage`; server-enforced current company and route scope |
| Cross-module contract | external sources appear only through a stable owner contract/adapter |
| Persistence/schema/migration | Accounting mappings/migrations for Definitions, Values and Policies; live update required before closure |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Definition create/edit | Manage | code, `NameAr`, `NameEn`, supported source | create/update with RowVersion | list/detail retain both names |
| Value create/edit | active definition | code, `NameAr`, `NameEn`, typed reference | create/update with RowVersion | scope refresh; unsupported reference rejected |
| Archive/restore | valid dependency state | confirm | lifecycle mutation | dependent-policy conflicts visible |
| Account policy | selected Account and loaded Definitions | set Required/Optional/Forbidden and save | typed upsert/replace contract | read-only mode exposes current rules without save |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | scope lookup, collection and relationship loads/errors remain distinguishable |
| Permission / forbidden / read-only | View inspects all surfaces; Manage controls mutations; API remains authority |
| Archived / locked | archived identities remain discoverable where the server contract allows |
| Unsaved changes / destructive confirmation | shared dirty guard; lifecycle confirmation; relationship changes have explicit save/discard |
| Offline / stale / conflict | online-authoritative; failures refetch affected scope; no queued setup writes |
| Mock data | Definition/Value drafts include valid Arabic/English names and real prerequisites; relationship data is never fabricated |

## 9. Concurrency, transactions, and consistency

Definition/Value writes use RowVersion. Policy save follows its explicit atomic
upsert/replace contract. Mutations invalidate definitions, selected Values, Account
constraints and COA detail. Server/database own duplicate and competing-policy races.

## 10. i18n, RTL, accessibility, and responsive behavior

UI translations are separate from persisted `NameAr`/`NameEn`. Both names are
required and editable/viewable for Definitions and Values on both platforms; locale
controls primary display with a documented fallback. Relationship requirement labels
are translated. Web uses accessible grouped controls; Mobile uses touch-safe cards;
both preserve RTL, first-error focus and change summaries.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | COA closed and this v2 contract approved | typed bilingual contracts, policies, migrations, permissions and tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | replace generic renderer with P-001/P-006 typed journeys and tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, runtime schemas, P-001/P-006 native journeys and tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | API, Web and Mobile Verified | agent sends detailed authenticated definition→value→account-policy Web/actual-device scenario; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical books, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact definition/value/policy data, Web and
actual-device steps, EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/
conflict cases, cleanup and evidence. The feature remains Active until explicit
user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | bilingual, source, policy and lifecycle tests | unsupported source and missing one name rejected | Queued |
| API/transport | scoped page/upsert/runtime schema tests | exact Account scope and real totals | Queued |
| Persistence/migration | apply current Accounting migration | bilingual columns, indexes and policy constraints | Queued |
| Web | typed list/form/relationship tests | edit both names and save policy without hidden-filter loss | Queued |
| Mobile | runtime schema/list/form/relationship tests | phone/tablet bilingual and read-only journeys | Queued |
| E2E/manual/live | authenticated cross-platform journey | Definition→Value→Account policy, EN/AR RTL | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001/P-006 are registered and reviewed.
- [ ] Generic renderer/catch-all transport is replaced by typed child ownership.
- [ ] API, Web, Mobile and live database stages verify both Arabic and English names.
- [ ] Relationship save semantics, filtering, dirty state and conflicts are verified.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Books/Journals becomes Active.

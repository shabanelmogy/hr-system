# Ledger Setup Integration & Verification — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-integration-verification` |
| Child feature name | Ledger Setup Integration and Verification |
| Owner | Accounting |
| Depends on | all Ledger Setup children from Currency through Posting Profiles |
| Execution status | `Queued` — final Slice 1 child |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; may activate only after all preceding child closure rows |

## 1. Child boundary and outcome

This child owns cross-child integration and final Slice 1 verification, not a new
financial aggregate. Independent acceptance proves that setup children compose one
coherent, permission-filtered Ledger Setup workspace with consistent navigation,
cache invalidation, bilingual business names, EN/AR UI, RTL/LTR, responsive/
accessible behavior and API-backed journeys.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-overview | Web | `/finance/ledger-setup` | Discover and open authorized setup children | permission-filtered navigation hub | P-007 | responsive launcher cards only; no form or generic CRUD | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupOverviewPage.tsx` | Implemented | Cards Required; Grid Table Tree Detail Report Import Export Chart Excluded | route/entitlement loading if dynamic, no authorized destinations, error/retry, forbidden; child dirty/conflict remains child-owned | N/A — navigation only; children stay online-authoritative | N/A — launcher never fabricates business records | exact child View permission; Accounting module/submodule and current company context | responsive cards, logical RTL order, keyboard/focus names and breadcrumbs | Hub must hide unavailable/deferred destinations and never call child CRUD services |
| ledger-setup-overview | Mobile | `/finance/ledger-setup` | Discover and open authorized setup children | permission-filtered native navigation hub | P-007 | touch-safe launcher cards/list only; no generic data ownership | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx` | Implemented | Cards Required; Grid Table Tree Detail Report Import Export Chart Excluded | route/entitlement loading if dynamic, no authorized destinations, error/retry, forbidden; child dirty/conflict remains child-owned | N/A — navigation only; child offline policy remains explicit per operation | N/A — launcher never fabricates business records | exact child View permission; Accounting module/submodule and current company context | phone/tablet layout, logical RTL order, touch/screen-reader names and breadcrumbs | Native launcher preserves the same route/permission manifest without desktop grid compression |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-007 Ledger Setup sources | Web/Mobile overview paths in the UI Pattern Gate plus `web-next/src/modules/accounting/moduleDefinition.tsx` and `mobile-react/src/modules/accounting/moduleDefinition.ts` | one module entry, route registration, permission-filtered discovery | Hub never owns generic child DTOs, forms or mutations |
| Fiscal Years integration | `web-next/src/modules/accounting/fiscal-years/` and `mobile-react/src/modules/accounting/fiscal-years/` | permission/query/error/localization discipline | final verification spans every child and HR Currency consumers |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Launcher/navigation | current Ledger Setup overview sources and Accounting module definitions | reuse P-007 | one permission-filtered umbrella with registered live routes only |
| Translation scope | Accounting Web EN/AR resources and Mobile ledger-setup translations | reuse | consistent route/card/child terminology |
| Feedback/state | shared Web feedback and Mobile `AppStateView`/confirmation systems | reuse | consistent state language while child owns domain behavior |
| Child composition | typed services/query keys/navigation boundaries from all child contracts | feature-specific integration | explicit child packages; no catch-all `resourceName` authority |
| HR Currency consumers | `IAccountingCurrencyCatalog` plus client active lookup | reuse public contract | consume Accounting-owned active code/name without duplicate write ownership |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Ledger Setup overview | Required | P-007 single launcher | discover/open authorized closed or active child workflows |
| Child routes | Required as verified route manifest | each child owns its screen pattern | navigate with no duplicate shell/dead link |
| Cross-child journeys | Required | typed dependencies and invalidation | configure prerequisites then consume them |
| Generic catch-all CRUD | Excluded as target | historical compatibility evidence only | none |
| New business aggregate | Excluded | integration owns no financial data | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | integration uses child-owned DTO/runtime schemas/public contracts only; no umbrella catch-all DTO |
| Canonical routes | registered Web and Expo child routes plus child API endpoints |
| Server search/filter/sort | each child retains its server criteria/allow-list; integration adds none |
| Paging/limits | child totals/limits remain authoritative; selectors use complete/bounded lookup contracts |
| Domain errors / ProblemDetails | preserve child validation, dependency, permission and concurrency contracts |
| Permission and tenant/company scope | exact child View/Manage rules and server company isolation; launcher filtering is defense-in-depth |
| Cross-module contract | HR consumes Accounting Currency catalog/lookup only; future sources require explicit contracts |
| Persistence/schema/migration | all child Accounting migrations applied to the live database before final verification |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Currency→Book→Settings | Manage | configure bilingual masters then singleton | child-owned mutations only | settings reloads exact active dependencies with localized names |
| Hierarchy→Account→Dimensions | Manage | create bilingual levels/accounts/definitions/values then constraints | child-owned mutations | Account composition shows current typed policies |
| FX history | Manage | configure bilingual Rate Type and effective Rate | child-owned mutations | historical series remains authoritative |
| Link→Profile→Preview | Manage/View | configure mapping and bilingual Profile then preview | child writes plus read-only resolve | deterministic structured diagnostic without posting |
| Global read-only | View/read-only | traverse permitted screens | no mutations | both Arabic/English business names remain inspectable where owned |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | launcher state plus child-owned initial/background/empty/no-results/error/retry remain distinct |
| Permission / forbidden / read-only | exact View destinations only; Manage never leaks in View/read-only; API remains authority |
| Archived / locked | archived/history records remain discoverable per child, not by launcher invention |
| Unsaved changes / destructive confirmation | child transitions preserve shared dirty guard and lifecycle confirmation |
| Offline / stale / conflict | financial setup writes remain online-authoritative; stale reads visibly refresh; conflict stays child-owned |
| Mock data | launcher and integration never fabricate data; child draft rules remain in their contracts |

## 9. Concurrency, transactions, and consistency

Cross-child invalidation is explicit: Currency refreshes consumers; Book refreshes
Settings and account determination; Account refreshes Dimensions/Link/Profile;
capability changes refresh dynamic forms. RowVersion stays child-owned. Integration
does not cache a dependency as a second source of truth.

## 10. i18n, RTL, accessibility, and responsive behavior

Final verification distinguishes translated UI text from persisted bilingual
business values. Every named master is created, edited, viewed and listed with
`NameAr` and `NameEn` through API, Web and Mobile; reference-only records show their
owner's localized name. The full journey runs in EN/AR and RTL/LTR, desktop/compact
Web and phone/tablet Mobile, with keyboard/touch/focus/error/screen-reader checks and
no page-level horizontal overflow.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | all child documentation/closure rows Closed | reconcile typed contracts, permissions, migrations and cross-child invalidation | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API integration Verified | launcher/routes and all child API-backed journeys/patterns verified | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web integration Verified | route manifest and all child actual-device journeys/patterns verified | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | API, Web and Mobile Verified | agent sends the full authenticated Slice 1 Web/actual-Mobile matrix against the migrated live database; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated live verification Verified and explicit user acceptance recorded | Phase 06 Verified, Phase 07 education, manifests/recipes and Slice closure | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory
for the final cross-child matrix as well as for every individual step. It includes
prerequisites, roles/permissions, exact setup chain, Web and actual-device journeys,
EN/AR and RTL/LTR checks, expected outcomes, negative/read-only/conflict cases,
cleanup and evidence. Slice 1 remains Active until explicit user acceptance.

**Next-step rule:** Slice 1 and later accounting slices cannot become `Active`
or complete until this child's Integrated live verification is `Verified` and
Documentation and closure is `Closed` in the roadmap, with explicit user acceptance
recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | reconcile all child suites | no invariant weakened by integration | Queued |
| API/transport | end-to-end typed contract/authorization | dependency lifecycle and concurrency propagate correctly | Queued |
| Persistence/migration | apply every Accounting migration to live database | schema matches all typed children | Queued |
| Web | launcher/routes/cross-query/invalidation/accessibility | all child routes compose without generic authority | Queued |
| Mobile | route manifest/navigation/schema/invalidation | phone/tablet flow across every child | Queued |
| E2E/manual/live | authenticated Slice 1 matrix | bilingual names; prerequisite journeys; read-only; conflict; EN/AR RTL; responsive | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-007 is registered and reviewed.
- [ ] Every preceding child exit gate and documentation/closure row is green.
- [ ] One launcher composes typed children without generic CRUD ownership or dead routes.
- [ ] Live database migrations and cross-child invalidation are verified.
- [ ] Every named master proves Arabic/English create, edit, view and listing without data loss.
- [ ] Full authenticated API/Web/actual-Mobile EN/AR/RTL/responsive matrix is green.
- [ ] Phase 06 records `Verified`; only then Phase 07 may close Slice 1.
- [ ] Detailed final manual matrix/results are sent to the user and explicit acceptance is recorded.

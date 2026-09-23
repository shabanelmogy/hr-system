# Ledger Setup Integration & Verification — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-integration-verification` |
| Child feature name | Ledger Setup Integration and Verification |
| Owner | Accounting |
| Depends on | `ledger-setup-currency`, `ledger-setup-coa-hierarchy`, `ledger-setup-dimensions`, `ledger-setup-books-journals`, `ledger-setup-company-settings`, `ledger-setup-exchange-rates`, `ledger-setup-link-accounts`, `ledger-setup-posting-profiles` |
| Execution status | `1V` — final Slice 1 child after `1A`–`1H` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own cross-child integration and final Slice 1 verification, not a new financial
aggregate. Independent acceptance proves that the eight setup children compose one
coherent Ledger Setup workspace with consistent navigation, permissions, cache
invalidation, localization, responsive/accessibility behavior and API-backed journeys.

Explicitly outside this child: adding new setup masters, changing child business
rules to make tests pass, JournalEntry/posting runtime, Month Closing, GL/TB and later
slice customer workflows.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Ledger Setup umbrella | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupOverviewPage.tsx` and `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx` | single Accounting Ledger Setup entry/navigation concept | umbrella becomes integration shell only; it must not own generic child CRUD/runtime contracts |
| Fiscal Years integration | `web-next/src/modules/accounting/fiscal-years/` and `mobile-react/src/modules/accounting/fiscal-years/` | same-module permissions/query/error/localization discipline | verification spans eight child packages and HR Currency consumers |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Ledger Setup launcher/navigation | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupOverviewPage.tsx`, `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx`, and Accounting module definitions | reuse | one permission-filtered umbrella; no parallel Finance/settings shell |
| Translation scope | `web-next/src/locales/resources/accounting/en.json`, `web-next/src/locales/resources/accounting/ar.json`, and `mobile-react/src/core/localization/translations/en-ledger-setup.ts` / `ar-ledger-setup.ts` | reuse | all child routes resolve EN/AR and RTL/LTR consistently |
| Shared feedback/state | `web-next/src/shared/components/feedback/`, `mobile-react/src/shared/components/feedback/AppStateView.tsx`, and shared confirmation dialogs | reuse | common state language without generic domain renderer |
| Child composition | typed service/query/navigation boundaries from `1A`–`1H` | feature-specific composition | integrate by explicit child APIs/query keys; no catch-all `resourceName` switch |
| HR Currency consumers | `IAccountingCurrencyCatalog` plus Accounting client lookup contract | reuse | validate selectors consume Accounting-owned active currency without restoring HR ownership |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Ledger Setup overview | Required | existing single launcher on Web/Mobile | discover/open only authorized child workflows |
| Child routes | Required | all eight child contracts reachable from the umbrella | navigate without duplicate shell or dead route |
| Cross-child journey state | Required | explicit dependency lookups/invalidation across child boundaries | configure prerequisites then consume them in dependents |
| Generic catch-all CRUD screen | Excluded as target | historical evidence only | no new child is forced through one generic record renderer |
| New business aggregate | Excluded | N/A | integration package does not invent financial data |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Currency → Book → Company Settings | Manage | configure prerequisite masters then singleton | child-owned mutations only | settings reloads the exact selected active dependencies |
| Hierarchy/Account → Dimensions constraints | Manage | create/select account then configure constraints | child-owned mutations | account detail shows current typed Required/Optional/Forbidden composition |
| Exchange-rate history | Manage | configure type/pair/effective rate | FX child mutation | historical series remains authoritative and visible |
| Link Account → Posting Profile → preview | Manage/View | configure direct mapping/profile then run preview | mapping/profile writes + read-only resolve query | deterministic resolved/no-match/ambiguous evidence without posting |
| HR currency selector consumption | authorized HR workflow | select Accounting active currency | HR owns its business record only | stored HR `CurrencyCode` snapshot comes from Accounting lookup |
| Global/app read-only | View only/read-only | traverse all permitted setup screens | no mutations | data remains inspectable; write controls absent/blocked consistently |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | integration uses only child-owned typed DTO/runtime schemas and public cross-module contracts; no umbrella catch-all DTO becomes authority |
| Server search/filter/sort | every collection keeps its child server criteria/allow-list; integration never substitutes client-only filtering |
| Paging/limits | child totals/limits remain authoritative; cross-child selectors use explicit lookup contracts that cannot silently truncate |
| Domain errors | preserve child stable errors/problem contracts and distinguish dependency, permission, validation and concurrency failures |
| Cross-module contract | HR consumes `IAccountingCurrencyCatalog`/Accounting lookup only; future sources remain outside Slice 1 unless explicitly contracted |

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | route-level loading plus child-owned initial/background/empty/no-results/error/retry states remain distinct |
| Permission / forbidden | umbrella and child entries are filtered by exact View permissions; API authorization remains authoritative; Manage actions never leak into View-only mode |
| Read-only / archived / locked | global read-only is consistent across all children while archived/history records remain discoverable per child contract |
| Unsaved changes / destructive confirmation | navigating between children preserves shared dirty-form protection; destructive lifecycle actions retain child confirmations |
| Offline/stale behavior when applicable | setup mutations remain online-authoritative; stale/cached reads visibly refresh rather than claiming local financial truth |

## 8. Concurrency and consistency

Cross-child invalidation must be explicit: Currency changes refresh Currency consumers,
Book changes refresh Company Settings/account-determination selectors, Account changes
refresh Dimensions/Link Accounts/Posting Profiles, and capability changes refresh
dependent dynamic forms. RowVersion conflicts stay child-owned and reload current
detail. No integration layer caches a stale dependency as a new source of truth.

## 9. i18n, RTL, accessibility, and responsive behavior

Phase 1V verifies the complete setup journey in English/Arabic and RTL/LTR. Web must
work at desktop and compact widths with bounded internal scrolling and no page-level
horizontal overflow. Mobile verifies phone and tablet compositions with touch-safe
targets. Keyboard/focus/error links, screen-reader names, route headings, dynamic
selectors and structured diagnostics must remain usable across child transitions.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | aggregate child test reconciliation | no child invariant is weakened by integration |
| API/transport | end-to-end typed contract and authorization checks | prerequisite lookup/lifecycle/concurrency changes propagate correctly |
| Web | launcher/routes/cross-query/invalidation/accessibility tests | all authorized child routes compose without generic catch-all authority |
| Mobile | route manifest/navigation/runtime schema/invalidation tests | phone/tablet flow across every required child |
| E2E/manual | API-backed Slice 1 matrix | Currency→Book→Settings; Account→Dimensions; FX; Link→Profile→Preview; HR lookup; View/Manage/read-only; conflict; EN/AR RTL; responsive |

## 11. Child exit gate

- [ ] All `1A`–`1H` child exit gates are independently green.
- [ ] The single Ledger Setup umbrella composes child routes without reclaiming their typed ownership.
- [ ] Cross-child invalidation and dependency lookups are API-authoritative and verified.
- [ ] Permissions/read-only behavior is consistent across umbrella and every child.
- [ ] EN/AR, RTL/LTR, accessibility, desktop/compact Web and phone/tablet Mobile verification is green.
- [ ] HR Currency consumers use Accounting lookup/catalog with no duplicate Currency owner.
- [ ] Required integrated API-backed journeys above are green.
- [ ] Umbrella Phase 06 records `Verified`; only then may Phase 07 education close Slice 1.

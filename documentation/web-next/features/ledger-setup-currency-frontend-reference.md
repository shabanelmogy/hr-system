# Ledger Setup Currency — Next.js Implementation Profile

## 1. Feature boundary

`web-next/src/modules/accounting/currencies/` is the dedicated browser owner for
child `ledger-setup-currency`. It manages the Accounting company Currency catalog and
does not absorb Company Settings or Exchange Rates.

## 2. Route and navigation

The thin App Router entry is
`src/app/(main)/(modules)/(accounting)/finance/ledger-setup/currencies/page.tsx` at
`/finance/ledger-setup/currencies`. Route access requires Accounting setup View; the
Ledger Setup umbrella links to the child but does not render generic Currency CRUD.

## 3. Transport and contracts

`types/Currency.ts` and `services/currencyService.ts` mirror the versioned API page,
detail, lookup and mutation shapes. Page totals come from server metadata. Update,
archive and restore transmit the latest opaque RowVersion.

## 4. Validation

`validation/currencyValidation.ts` mirrors structural constraints: three-letter code,
required bilingual names and bounded symbol. Server errors remain authoritative;
`Currency.DuplicateCode` maps to the code field. The client does not implement
dependency eligibility or company uniqueness as business truth.

## 5. List state

`useServerListState` owns zero-based UI page, search/filter/sort state. The service
converts to the API contract once. `useAdaptivePagination` keeps one authoritative
server list. Search/status/sort values use the exact API allow-lists.

## 6. Grid view

`CurrenciesDataGrid.tsx` reuses `MyDataGrid` with server pagination/filter/sort,
currency code, Arabic/English names, symbol and permission-aware actions. Real total
count comes from API metadata. Grid is the Required Web list view.

## 7. Card view

Cards are Excluded for the Web Currency child. No hidden Card implementation is
required for parity with Mobile; responsive Grid/form behavior is the Web contract.

## 8. Create and edit

`CurrencyForm.tsx` reuses `MyForm`/`MyTextField`. Create/edit use the same four
identity fields. Edit waits for authoritative detail. Detail failure blocks submit.
Dirty-form protection and first-invalid-field behavior come from the shared form
system.

## 9. Detail and lifecycle

View is the same form in read-only mode. Archive/restore use shared confirmation.
Mutation success refreshes Currency query state. A 409 `ConcurrencyConflict` causes
list/detail reload and clears stale selection before another write.

## 10. Permissions and read-only mode

View route/access remains usable with `AccountingSetup:View`. Mutation controls
require `AccountingSetup:Manage` and are suppressed when global read-only is active.
Archived rows can be viewed/restored but not edited.

## 11. Localization and RTL

Accounting `en.json`/`ar.json` own Currency text. Shared logical layout and form/grid
components provide RTL behavior. No feature hardcodes English-only business labels.

## 12. Responsive and accessibility contract

The feature keeps page-level horizontal overflow out of compact layouts; the grid may
use its bounded internal behavior. Shared header/form/dialog/grid primitives provide
keyboard focus and accessible labels; lifecycle state must be conveyed by text/icon,
not color alone.

## 13. Integration and cache invalidation

`currencyQueryKeys.ts`/`useCurrencyQueries.ts` own Currency query invalidation.
Consumers needing an active currency selector use the Currency lookup contract; they
do not infer active data from the current paged screen. No feature-owned offline cache
or Currency-specific realtime contract is required in Slice 1.

## 14. Verification and optional capabilities

Focused service/contract and route-access tests prove exact endpoints, paging and
permissions. Phase 06 additionally requires authenticated create/edit/view/archive/
restore/conflict behavior in EN/AR and compact layout. Cards, Tree, Chart, Report,
Import and Export are Excluded for Web Currency.

Phase 06 completed on 2026-09-22. Route access, Accounting navigation, Currency
service and Grid permission suites passed `34/34`; the full Web check, focused
post-change ESLint/typecheck and optimized production build passed. The API-backed
browser journey verified Admin create/edit/archive/filter/restore in Arabic and
English, a `390x844` compact viewport with no page-level horizontal overflow, and
Normal User route denial. Phase 07 customer guidance is published at
`documentation/plans/business/accounting-core-gl/education/ledger-setup-currency.md`.

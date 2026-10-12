# Ledger Setup Currency — Expo Implementation Profile

## 1. Feature boundary

`mobile-react/src/modules/accounting/currencies/` is the native Currency child. The
feature is a server-authoritative company master and does not own Functional Currency
or exchange-rate history.

The current v2 Screen Contract selects `P-001`. Mobile requires Table, Cards and
typed detail/create/edit/lifecycle through the shared native shells. `NameAr` and
`NameEn` remain separate required business values in forms, Table/Card/detail/
search and valid local mock drafts.

## 2. Routes and navigation

The thin route is `app/(main)/finance/ledger-setup/currencies.tsx`, backed by
`ROUTES.finance.ledgerSetup.currencies`. Route manifest/access require Accounting setup View and
the Ledger Setup module/submodule relationship.

## 3. Runtime response validation

`data/remote/currency-schemas.ts` parses Currency, lookup and page responses at the
network boundary. RowVersion is required for mutable detail. Invalid response shape
fails at the boundary rather than leaking unknown data into UI state.

## 4. API contract

`currency-endpoints.ts` and `currency-remote-data-source.ts` own `/currencies`,
`/lookup`, detail and `/restore` paths plus exact page-query serialization. Update,
archive and restore send RowVersion; page/lookup/detail responses are schema parsed.

## 5. Query ownership

`presentation/queries/currency-keys.ts` and `use-currencies.ts` own Currency query
keys, server reads and mutation invalidation. No screen invents an independent cache
or duplicates API serialization.

## 6. Server list state

The Currency screen uses controlled server list state for search, field/operator,
record status, sort and page. Table and Cards consume the same current page and API
total; switching view does not create a second list truth.

## 7. Table view

`AppDataTable` displays code, names, symbol/status/actions using server pagination and
sort. View is always permission-aware; Edit/Archive/Restore require Manage and current
record state.

## 8. Card view

Cards are Required on Mobile as a compact alternate presentation of the exact same
server page. They display code/symbol, bilingual names, status badge and lifecycle
actions without changing paging/filter semantics.

## 9. Create workflow

`CurrencyForm` uses `AppForm`, `AppFormSection` and `AppTextField`. The Zod schema
mirrors structural code/name/symbol constraints. `currency-request-policy.ts`
normalizes writes before the repository call. Server remains authoritative for
uniqueness/scope/dependencies.

## 10. Edit workflow

Edit hydrates current detail, requires RowVersion and fails closed when detail cannot
be loaded. `currency-use-cases.ts` rejects update without RowVersion before remote
transport. A server conflict requires authoritative refresh rather than local merge.

## 11. View and lifecycle workflow

View renders the full form read-only. Archive/restore use `ConfirmationDialog`, send
RowVersion and invalidate the Currency queries after success. Archived Currency is
discoverable by status but excluded from active lookup.

## 12. Permissions and read-only mode

Route access requires View; mutation actions require Manage. The screen fails closed
for missing View. Application read-only prevents writes while preserving inspectable
data. The client never sends trusted tenant/company scope.

## 13. Localization, theme, and safe area

`en-currencies.ts` and `ar-currencies.ts` own feature text and are composed through
the main locale resources. Shared theme/components own visual tokens, safe-area and
RTL direction; Currency does not introduce feature-global styling.

## 14. Responsive and UI parity audit

Phone and tablet use the same business actions with adaptive Table/Cards/form
composition. Touch targets, status text, loading/error/empty states and confirmation
dialogs use shared accessible primitives. No page-level horizontal overflow is
accepted as a substitute for responsive composition.

## 15. Verification and optional capabilities

`currency-remote-boundary.test.ts` proves endpoint/query/schema behavior and
`currency-use-cases.test.ts` proves normalization and RowVersion fail-closed logic.
Route-access tests prove authorization. Phase 06 adds authenticated device/simulator
journeys in EN/AR. Tree, Chart, Report, Import, Export and feature-owned offline writes
are Excluded.

Phase 06 source acceptance completed on 2026-09-22: route access, remote boundary,
use-case and screen conflict/permission/read-only suites passed `27/27`; typecheck,
lint, architecture, i18n, dependency, native-config, foundation and release-source
checks passed. The global Contract Matrix reports only sibling Ledger Setup work
owned by packages `1B`–`1H`; it does not identify a Currency endpoint or route gap.
Hosted authenticated device journeys and the physical phone/tablet accessibility
matrix remain release-time gates under central notes `PROD-010` and `PROD-014`.

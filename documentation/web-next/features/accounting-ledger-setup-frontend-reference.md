# Accounting Ledger Setup — Next.js Implementation Contract

Status: **Client implementation evidence exists; Phase 06 live journey verification remains required.**

## 1. Feature boundary

Create Ledger Setup inside `src/modules/accounting`. Fiscal Years remains the
same-module implementation reference for transport/service/hooks, company scope,
permissions, concurrency and shared UI composition. Do not copy its business fields.

Future Slice 1 work follows the child Screen Contracts in
`documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`.
The current generic Ledger Setup page/`LedgerSetupRecord` model is implementation
evidence to refactor, not the target client architecture. Each child owns typed
transport models, stable query keys/hooks and focused screen composition.

## 2. Route and module navigation

Implemented routes:

- `/finance/ledger-setup` (permission-filtered launcher)
- `/finance/ledger-setup/company-settings`
- `/finance/ledger-setup/currencies`
- `/finance/ledger-setup/accounts`
- `/finance/ledger-setup/hierarchy-levels`
- `/finance/ledger-setup/dimensions`
- `/finance/ledger-setup/books`
- `/finance/ledger-setup/journals`
- `/finance/ledger-setup/exchange-rates`
- `/finance/ledger-setup/account-determination`
- `/finance/ledger-setup/fiscal-years` (Fiscal Years child capability under Ledger Setup)

Extend the Accounting module definition; do not create a second finance sidebar.

## 3. Transport and types

Only feature services call `apiService`. Transport types mirror API responses and
keep RowVersion. Tenant/company never appear in mutation payloads. React Query owns
stable key families per setup capability.

## 4. Validation and forms

Use Zod + `react-hook-form` + `zodResolver`, `MyForm` and approved shared
fields. Save stays actionable; validation renders beneath fields and focuses the
first invalid field. Server field errors map back to their controls.

## 5. Chart of Accounts hierarchy

COA is a first-class tree workspace using `SplitTreeView` /
`HierarchicalTreeList` with search, expand/collapse, selection and detail/actions.
Tree nesting reflects server parent relationships; the UI does not infer level
meaning from code prefixes.

Use the existing Cost Center `CostCenterTreeDiagram` as the closest composition
reference for Web master/detail behavior: controlled selection, search,
`renderDetailPanel`, `renderEmptyDetailPanel`, contextual add-child/edit actions and
a bounded detail pane. Reuse the interaction pattern and shared `SplitTreeView`
contract only; do not copy HR fields, permissions, move/reparent rules or domain
logic. Account drag/reparent remains off unless an explicit Accounting API contract
authorizes it.

## 6. Account create/edit/detail

Forms expose parent, configured level, server-proposed editable code, bilingual
names, AllowPosting, ManualPostingPolicy, CurrencyPolicy/specific currency and
dimension constraints. Posting/parent rules are explained but enforced by server.

## 7. Setup lists

Currencies, Dimensions, Books, Journal definitions, Exchange Rates, Link Accounts
and Posting Profiles use shared `PageHeader`, `MyDataGrid`, feedback,
confirmation and server-owned criteria where lists can grow. Cards are Deferred
unless a concrete workflow later proves value.

## 8. Currency ownership migration UX

The existing HR Organizational Structure Currency management route is retired once
the Accounting currency screen is live. Existing HR forms needing a currency
selector consume the Accounting currency lookup while retaining their HR-owned
business data as CurrencyCode.

## 9. Link Accounts and Posting Profiles

Link Accounts presents direct purpose mappings and only reference types backed by
an available owner Contract. Company-purpose mapping is always available.
Posting Profiles provide typed conditions, effective dates, specificity/priority
and a resolve-preview diagnostic. No unavailable Bank/Payment/Contact source type
appears as a dead option.

## 10. Permissions and read-only mode

`Accounts:View` gates COA reads; `Accounts:Manage` gates account writes;
`Dimensions:View/Manage` gates dimensions; `AccountingSetup:Manage` gates
currency/book/journal/FX/mapping/profile setup. Global app read-only mode suppresses
mutations while preserving permitted reads.

## 11. Localization, RTL, and accessibility

All visible strings use Accounting English/Arabic namespaces. Shared RTL/theme
behavior controls direction. Tree/list/form actions have keyboard-accessible
alternatives, labels and focus behavior; no native alert/confirm/browser validation.

## 12. Responsive and shared-component contract

Desktop uses bounded internal panels and tree/detail composition. Compact widths
stack content without page-level horizontal overflow. Reuse `PageHeader`,
`MyDataGrid`, `MyForm`, shared confirmations/feedback and tree components
before extending generically.

The launcher card uses one interactive `CardActionArea`; placing a second
`Button` inside it creates nested buttons and can break hydration. Keep the
call to action as text within the card's single focusable action.

## 13. Integration and cache behavior

Currency lookups used by HR and Accounting share authoritative API data. Mutations
invalidate exact feature key families. Realtime is not required for Slice 1
correctness. Company switch/session behavior comes from existing shell context.

## 14. Verification and optional capabilities

Source exists for the COA tree/detail/create/edit/archive flow and the setup
lists/forms. The tree endpoint returns a lightweight node without RowVersion;
opening a tree node must fetch `/accounts/{id}` before edit, view, or archive.
Paged API lists must bind their current page to the grid; a first-page-only
`pageSize=500` request silently hides later records. Dimension selector options
traverse every server page, since the API has no separate dimension lookup.
Account and dimension
definition search uses server criteria. The remaining paged endpoints currently
lack server search/count contracts, so do not describe their current-page grid
as a globally searchable collection.

The new Ledger Setup route segment needs `AccountingTranslationScope` in its
parent layout. A key existing in both catalogs is not sufficient when the route
does not register that namespace; verify EN/AR keys at runtime. The segment
also has a shared `RouteLoading` boundary so dynamic content has an immediate
prefetched fallback. The `instant` console message alone is a secondary navigation diagnostic: the route builds,
but an authenticated browser session and the preceding runtime exception are
still required to verify the reported failure. Phase 06 remains Not Verified
until create/edit/view, permission subsets, RTL and device-width journeys are
observed against the live API. Import, bulk actions, Cards, notifications and
realtime are Deferred; Journal runtime/GL/TB belong to later slices.

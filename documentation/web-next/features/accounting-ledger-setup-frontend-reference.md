# Accounting Ledger Setup — Next.js Implementation Contract

Status: **Phase 00 target contract; screens below are not current runtime claims.**

## 1. Feature boundary

Create Ledger Setup inside `src/modules/accounting`. Fiscal Years remains the
same-module implementation reference for transport/service/hooks, company scope,
permissions, concurrency and shared UI composition. Do not copy its business fields.

## 2. Route and module navigation

Target routes:

- `/finance/accounts`
- `/finance/accounting-setup/currencies`
- `/finance/accounting-setup/dimensions`
- `/finance/accounting-setup/books`
- `/finance/accounting-setup/journals`
- `/finance/accounting-setup/exchange-rates`
- `/finance/accounting-setup/link-accounts`
- `/finance/accounting-setup/posting-profiles`

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

## 13. Integration and cache behavior

Currency lookups used by HR and Accounting share authoritative API data. Mutations
invalidate exact feature key families. Realtime is not required for Slice 1
correctness. Company switch/session behavior comes from existing shell context.

## 14. Verification and optional capabilities

Required: COA tree/detail/create/edit/archive, all setup lists/forms, currency
cutover consumers, permission/read-only behavior, EN/AR, RTL, responsive and
focused service/hook/component/route tests. Import, bulk actions, Cards,
notifications and realtime are Deferred. Journal runtime/GL/TB are later slices.


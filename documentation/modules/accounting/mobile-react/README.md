# Accounting mobile documentation

Accounting has an active Expo/React Native surface under `mobile-react/src/modules/accounting`:
Fiscal Years, typed Currency and COA/Hierarchy Levels, and generic Ledger Setup
screens (company settings, dimensions, books, journals, exchange rates, account
determination). `/finance` and `/finance/ledger-setup` render the Ledger Setup
overview. The Fiscal Years slice is protected by the Fiscal Years permission set.
It includes server-managed list/table/card behavior, create/edit/view forms,
lifecycle actions, read-only enforcement, and shared-state/error/confirmation
components.

The Expo composition root injects the Accounting-owned working-year selector into
the generic navigation-header context slot. `FiscalYears:View` allows a personal
per-company selection, while `FiscalYears:SetCurrent` independently controls the
company default in the Fiscal Years management screen.

Future Accounting capabilities follow their approved feature plan. Write flows,
including Core GL where Required, must define online/offline authority, ambiguous
retry reconciliation, idempotency, permissions, accessibility, localization, and
audit feedback independently from the Web layout while reusing the shared mobile
design system first.

## Ledger Setup authorization contract

Mobile uses the same exact view ownership as the API and Web: Chart of Accounts
requires `Accounts:View`, while Hierarchy Levels requires
`AccountHierarchyLevels:View`. Composite Ledger Setup routes accept any view
claim belonging to their child screens. `LedgerSetupResourceScreen` filters the
selector to authorized children and selects the first authorized child when the
configured first child is unavailable; it must never deny a user who owns only a
secondary child permission. Route-manifest tests preserve these positive and
negative mappings.

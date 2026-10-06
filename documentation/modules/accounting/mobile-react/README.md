# Accounting mobile documentation

Accounting has an active Expo/React Native Fiscal Years slice under
`mobile-react/src/modules/accounting/fiscal-years`, registered through the
Accounting module definition and protected by the Fiscal Years permission set.
It includes server-managed list/table/card behavior, create/edit/view forms,
lifecycle actions, read-only enforcement, and shared-state/error/confirmation
components. This does **not** imply that broader Accounting is implemented.

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

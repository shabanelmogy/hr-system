# Accounting web documentation

Accounting has an active Next.js surface. The currently implemented Accounting
slice is Fiscal Years at `/finance/ledger-setup/fiscal-years`, owned by
`web-next/src/modules/accounting` and registered through
`moduleDefinition.tsx`. This does **not** imply that the remaining Accounting
roadmap is implemented.

The app composition root injects the Accounting-owned fiscal-year context selector
into generic Topbar slots. Company Current is administered with
`FiscalYears:SetCurrent`; each user with `FiscalYears:View` can select a different
working year for the current company without changing other users or auth tokens.

Future screens should still be documented as vertical slices: configuration and
chart-of-accounts administration, journal entry/posting, AP/AR, cash/bank,
tax, fixed assets, approved external-fact reconciliation, period close, and
reports. For each screen freeze permissions, server/client boundaries,
loading/error/empty states, localization, accessibility, and tests.

The generated current ownership/route inventory is maintained in
`documentation/web-next/architecture/frontend-architecture-manifest.md`.

## Ledger Setup authorization contract

Ledger Setup routes, sidebar entries, the visible screen/tab, and API endpoints
must use the same exact view claim. In particular, Chart of Accounts uses
`Accounts:View` and Hierarchy Levels uses `AccountHierarchyLevels:View`; these
claims are independent and must never be substituted for one another.

Composite routes authorize when the user can view any child screen and then open
the first authorized child. They do not assume that the first configured tab is
available and they do not render unauthorized tabs:

- Dimensions: `DimensionDefinitions:View`, `DimensionValues:View`, or
  `AccountDimensionPolicies:View`.
- Exchange Rates: `ExchangeRateTypes:View` or `ExchangeRates:View`.
- Account Determination: `AccountMappings:View` or `PostingProfiles:View`.

The application navigation test must continue to verify that every permission
which exposes a link is accepted by that link's route policy. The focused route
tests additionally preserve the Chart of Accounts/Hierarchy Levels isolation and
the composite-screen any-child behavior.

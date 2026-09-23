# Accounting web documentation

Accounting has an active Next.js surface. The currently implemented Accounting
slice is Fiscal Years at `/finance/ledger-setup/fiscal-years`, owned by
`web-next/src/modules/accounting` and registered through
`moduleDefinition.tsx`. This does **not** imply that the remaining Accounting
roadmap is implemented.

Future screens should still be documented as vertical slices: configuration and
chart-of-accounts administration, journal entry/posting, AP/AR, cash/bank,
tax, fixed assets, approved external-fact reconciliation, period close, and
reports. For each screen freeze permissions, server/client boundaries,
loading/error/empty states, localization, accessibility, and tests.

The generated current ownership/route inventory is maintained in
`documentation/web-next/architecture/frontend-architecture-manifest.md`.

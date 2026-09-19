# Accounting module

Accounting is the financial bounded context for ERP System. This package owns
Accounting-specific architecture, delivery decisions, and feature evidence.
Shared documentation workflow and cross-module rules remain centralized in
[`../../system/README.md`](../../system/README.md).

## Current status: Foundation with active Fiscal Years slice

Verified in the runtime repository today:

- `api/Modules/Accounting` contains the canonical six projects and an explicit
  `AccountingModule` bootstrap registered by the host.
- `AccountingDbContext` owns the short `acc` schema and its migrations history
  boundary.
- Fiscal Years is an implemented Accounting vertical slice, including domain/API
  behavior and the Next.js route `/finance/fiscal-years`.
- Later Accounting areas such as chart of accounts, posting, AP/AR, cash/bank,
  tax, fixed assets, close, and broader reporting remain roadmap work unless
  their own feature evidence says otherwise.

Unimplemented roadmap surfaces remain intentionally absent rather than hidden
behind placeholders. Start with [ARCHITECTURE.md](ARCHITECTURE.md), then use
[DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md) to sequence the first vertical slice.
The complete dependency-ordered Accounting plan is in
[phases/README.md](phases/README.md); phase plans are planning artifacts and are
not runtime evidence unless their feature slice is verified separately.

## Package map

- [API](api/README.md) — Accounting transport boundary (currently scaffold only)
- [Web](web-next/README.md) — Next.js ownership and future UI decisions
- [Mobile](mobile-react/README.md) — Expo/React Native ownership and future UI decisions
- [Feature catalog](features/README.md) — one entry per reviewed vertical slice
- [Phase plan](phases/README.md) — PHASE-00 through PHASE-21 and final acceptance

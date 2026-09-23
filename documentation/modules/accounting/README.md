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
  behavior and the Next.js route `/finance/ledger-setup/fiscal-years` under the
  Ledger Setup navigation boundary.
- Later Accounting areas such as chart of accounts, posting, AP/AR, cash/bank,
  tax, fixed assets, close, and broader reporting remain roadmap work unless
  their own feature evidence says otherwise.

Unimplemented roadmap surfaces remain intentionally absent rather than hidden
behind placeholders. Start with [ARCHITECTURE.md](ARCHITECTURE.md), then use
[DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md) to sequence the first vertical slice.
The first gated execution plan is
[`accounting-core-gl`](../../plans/business/accounting-core-gl/PLAN.md).
[phases/README.md](phases/README.md) preserves the historical 00–21 decomposition
as source/traceability material and is not execution authority.

## Package map

- [API](api/README.md) — Accounting transport boundary and current feature contracts
- [Web](web-next/README.md) — Next.js Accounting ownership and feature evidence
- [Mobile](mobile-react/README.md) — Expo/React Native Accounting ownership and feature evidence
- [Feature catalog](features/README.md) — one entry per reviewed vertical slice
- [Historical phase source](phases/README.md) — PHASE-00 through PHASE-21 source material

# Accounting feature catalog

The catalog is intentionally empty of implemented business features: the
runtime currently contains only the module foundation. Add one reviewed entry
per vertical slice and link its API, web, mobile, migration, and test evidence.

Planned areas are foundation/configuration, chart of accounts, fiscal periods,
GL/journals/posting, AP, AR, cash/bank, tax, fixed assets, approved external-fact
integration, and close/reporting/audit. Keep each area clearly marked Planned
or Deferred until source evidence exists.

Cross-module flows must use Contracts/events and stable IDs. Do not add a
feature entry that implies a direct EF relationship to any other module. Use
[`../../../system/README.md`](../../../system/README.md) for shared phase recipes
and generated packets; never copy those rules into this catalog.

The ordered implementation scope and phase-level acceptance criteria live in
[`../phases/README.md`](../phases/README.md). Link feature entries to the phase
that owns them rather than duplicating its common rules.

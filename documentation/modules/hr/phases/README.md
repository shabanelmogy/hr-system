# HR delivery phases

HR uses the shared documentation workflow in
[`../../../system/README.md`](../../../system/README.md). This index keeps the
module's delivery sequencing and reuse decisions; it does not copy the shared
phase templates or generated packets.

## Current plan

1. Confirm the HR domain and ownership boundaries for each vertical slice.
2. Inventory existing BuildingBlocks and HR-local reusable components before
   introducing anything new; reuse or extend compatible pieces and record the
   decision in the feature evidence.
3. Deliver each slice through Contracts, Domain, Application, Infrastructure,
   Presentation, and the required web/mobile surfaces with migrations and tests.
4. Promote a piece to shared only when it is domain-neutral and used by multiple
   modules. HR-specific rules remain in HR.

The existing canonical HR reviews and profiles listed in
[`../README.md`](../README.md) remain authoritative. Add a phase file only when
the corresponding scope, dependencies, acceptance evidence, and owner are
approved; do not invent unverified HR capabilities in this index.

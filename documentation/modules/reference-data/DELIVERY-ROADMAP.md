# ReferenceData delivery roadmap

Status vocabulary is shared across modules: **Foundation** is verified
structure, **Applied** is implemented with current evidence, **Required** is
committed to the current authorized release slice, **Deferred** has an owner and
reopening trigger, and **Excluded** is deliberately outside the contract.

## Foundation (verified)

- Six-project runtime structure, module bootstrap, explicit host registration,
  and module-owned tests.
- `ref` database schema, migrations boundary, history table, and geography seed.
- Default module registration with global `geography` and tenant-entitled
  `addresses` submodules.

## Applied capabilities

| Capability | API | Web | Mobile | Delivery note |
| --- | --- | --- | --- | --- |
| Countries | Applied | Applied | Applied | Global Platform catalog |
| States | Applied | Applied | Applied | Country-dependent global catalog |
| Districts | Applied | Applied | Applied | State-dependent global catalog |
| Address Types | Applied | Applied | Applied | Company-scoped tenant capability |
| Addresses | Core CQRS/API applied | Deferred standalone UI | Deferred standalone UI | Owner integration is intentionally separate |

The [feature catalog](features/README.md) contains the exact canonical books and
required-file manifests. Platform parity is decided per feature; an API entity
or contract does not imply a client route.

## Deferred work

- `DEF-006`: owner-specific Company, Branch, Employee, and Work Location Address
  commands with purpose policy and transaction locks.
- `DEF-020`: privacy-governed Employee and Emergency Contact Address surfaces.
- Standalone Address Grid/Cards/Import/Report/CRUD clients remain deferred by
  the Address Web and Mobile profiles; owner forms must be delivered with their
  owning workflow instead of through a generic PII list.

The canonical records are in
[`documentation/plans/notes/DEFERRED_ITEMS.md`](../../plans/notes/DEFERRED_ITEMS.md).
Do not restate or renumber those items here.

## Starting the next slice

For new ReferenceData capability work, first authorize the exact plan slice,
complete the API feature workflow and Phase 00 preflight, select a reviewed
reference only when its implementation shape matches, and register only evidence
that already exists. Then implement the vertical slice through the owning
runtime layers and applicable clients, extending its manifest as real evidence
is created.

No endpoint, screen, or entity is implied by this roadmap until its canonical
feature book and source evidence say it is implemented.

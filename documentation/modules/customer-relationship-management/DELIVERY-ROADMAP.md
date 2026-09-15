# CustomerRelationshipManagement delivery roadmap

Status vocabulary is shared across modules: **Foundation** means the structural
scaffold is verified; **Required** means committed for the current release;
**Planned** means accepted future work; **Deferred** means intentionally moved
to a later milestone; **Excluded** means outside this module's contract.

## Foundation (verified)

- Six-project module structure and explicit host registration.
- Module-owned `crm` database schema and migration boundary.
- Empty feature surface awaiting the first domain slice.

## Planned

1. Freeze the domain contract and ownership decisions.
2. Implement one vertical slice through Domain, Application, Infrastructure,
   Presentation, and the applicable clients.
3. Add migrations, authorization, observability, and end-to-end verification.

Begin each slice with a documented reuse inventory. Shared promotion requires
genuine domain neutrality and use by more than one module; never copy/paste a
shared capability into a module.

No endpoint, screen, or entity is implied by this roadmap until documented in
the module's feature book and verified in source.
---
name: data-migration-planning
description: Use when production data must move from a legacy system into the new database, to plan mapping, prechecks, identity provisioning, rehearsal, reconciliation, cutover, and rollback.
---
# Data migration planning

## Purpose

Move real data safely and verifiably. Application conversion and data migration are separate
workstreams; this one ends with a rehearsed runbook, not with an ad-hoc script.

## Inputs

`05-domain-model.md`, `06-business-rules.md`, `legacy/inventory.md`, legacy schema,
`07-quality-attributes.md` (time zones, retention). Reference implementation:
`api/docs/data-migration/` in the School application.

## Procedure

1. **Scope.** Which entities, how much history, which data classes are legally required.
2. **Tenant mapping.** Which target tenant each source database/rows belong to; tenant creation
   through platform administration (with subscription and entitlements) before import.
3. **Identity provisioning.** Legacy password hashes are usually unusable. Decide activation:
   invitation, temporary password + forced reset, or SSO. Import is blocked until decided.
4. **Key strategy.** Preserve integer IDs only when there is one source and no collisions;
   otherwise crosswalk tables `entity | legacy_id | target_id | tenant_id`.
5. **Field mapping.** Per entity: source → target, transform (trim, normalize, enum map, date/time
   zone conversion), nullability, defaults. Row versions are generated, never imported.
6. **Prechecks (read-only SQL on the source).** Every target invariant the source did not enforce:
   duplicates after normalization, orphan references, invalid "exactly one" combinations,
   capacity violations, cross-relationship mismatches. Each check is `blocking` or `warning`.
7. **Import order.** Follow the dependency graph; bulk load with explicit IDs where preserved;
   reseed identity columns.
8. **Reconciliation (target).** Counts per entity vs source minus documented rejects; integrity
   checks; membership/role coverage; no orphans.
9. **Rehearsal.** From an empty migrated target, full run at least once with the final package.
   Never hand-patch a failed rehearsal.
10. **Cutover and rollback.** Write freeze, final snapshot, precheck, import, reconcile, smoke test,
    switch traffic; rollback = return to the frozen legacy system.

## Outputs

`migration/data-migration-plan.md` plus `migration/precheck.sql` and
`migration/reconciliation.sql` when ready; risks and decisions.

## Quality bar

- Every target invariant has a precheck.
- The identity activation policy is a recorded decision.
- The runbook has been rehearsed end to end.

## Anti-patterns

- Replaying API create endpoints to import history (IDs and timestamps change).
- Silently "fixing" bad legacy data without a documented rule.
- Defaulting production data to a development tenant.

# Platform delivery roadmap

Status vocabulary is shared across modules: **Foundation** means the structural
scaffold is verified; **Required** means committed for the current release;
**Planned** means accepted future work; **Deferred** means intentionally moved
to a later milestone; **Excluded** means outside this module's contract.

## Foundation (verified)

- Six-project module structure and explicit host registration.
- Module-owned `platform` database schema and migration boundary.
- Technical/internal classification separated from tenant entitlement and
  launcher visibility.
- Platform-owned policy/orchestration seams for authentication/session,
  tenant/company access, entitlements, module catalog, authorization, generic
  file workflow/storage policy, localization, notifications, security audits,
  and offline operations.
- Explicit compatibility adapters preserve legacy physical storage and wire
  behavior without introducing a Platform -> HR dependency.

## Remaining policy

No business capability is implied by Platform. Additional technical ownership
moves are required only when a concrete legacy compatibility adapter becomes a
real architectural blocker; physical table moves are not performed merely for
cosmetic ownership purity.

Begin each slice with a documented reuse inventory. Shared promotion requires
genuine domain neutrality and use by more than one module; never copy/paste a
shared capability into a module.

No new endpoint, screen, or entity is implied by this roadmap until documented
and verified in source.

# Platform API documentation

## Verified foundation

Platform owns public capability contracts, application policies, authorization,
and its own persistence. Its implementation is not an empty scaffold.

`PlatformDbContext` maps Platform-owned Identity, tenant, company, membership,
refresh-session, entitlement, file, notification, audit, API-key, and selection
challenge tables in the `platform` schema. Module-specific connections therefore
select the Platform store directly. Entitlement `ApplyAsync` stages changes; its
owning transaction commits or rolls them back with tenant changes and audit
records.

Platform consumes ReferenceData through public geography contracts for company
operating-country and registration-country workflows. Future extraction replaces
those contracts with remote or replicated adapters; it must not recreate
cross-module EF mappings.

When a feature is added, document the exact route, authorization policy,
request/response envelope, validation, errors, paging/sorting, and tests here
or in a linked feature book. Cross-module communication uses Contracts/events,
never another module's Infrastructure or EF model.

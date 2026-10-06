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

## User administration contract

Platform owns tenant-scoped user administration and exposes the paged `getPage`
query used by Web and the bounded `getAll` query currently used by Mobile. Both
responses, user detail, and the create-user response use the same `UserResponse`
contract.

`UserResponse.lifecycleStatus` is a public string union with only `active` and
`archived`. The Identity persistence value is an internal integer and must be
mapped through the shared user-lifecycle contract mapper; numeric strings such as
`"0"` and `"1"` are not wire-compatible values. Unknown stored values fail closed
instead of being emitted to clients. Platform tests cover both valid mappings, the
unknown-value guard, and the paged/non-paged read paths; Web and Mobile transport
tests independently reject numeric lifecycle strings.

## Role-permission presentation contract

`GET roles/getRoleClaims` remains the tenant-scoped, server-authoritative source
for the complete replace-set editor. Every returned claim contains
`displayValue`, `isSelected`, and `moduleCode`. `moduleCode` is resolved from
`IModuleCatalogPolicy.TryResolvePermission`; clients must not infer business-module
ownership from the resource name or maintain a second permission dictionary.

The bounded business rule is that every tenant-assignable permission has exactly
one catalog owner. A permission present in the assignable set but missing catalog
ownership is an invalid server configuration and the query fails instead of
publishing an unowned claim. The additive response field is backward compatible;
the update command still authorizes and validates the selected `displayValue`
set and never trusts client-supplied module ownership for access control.

Impact review: Platform Application and its module tests are changed; Web and
Mobile response schemas and role-permission presentation consume the new field.
Domain, persistence, migrations, endpoint route, permission policies, tenant
scope, transaction behavior, realtime, jobs, and audit semantics are unchanged.

When a feature is added, document the exact route, authorization policy,
request/response envelope, validation, errors, paging/sorting, and tests here
or in a linked feature book. Cross-module communication uses Contracts/events,
never another module's Infrastructure or EF model.

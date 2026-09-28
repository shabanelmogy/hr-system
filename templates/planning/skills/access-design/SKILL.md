---
name: access-design
description: Use to design tenancy, roles, permissions, and row-level resource scope for every actor, including platform vs tenant administration and IDOR policy (phase C3).
---
# Access design

## Purpose

Decide exactly who can do what to which records. Permissions alone are not enough: "Teacher can
read Students" must become "Teacher can read Students enrolled in classes the teacher teaches".

## Inputs

- `03-actors-access.md`, `04-capabilities.md`, `05-domain-model.md`, `06-business-rules.md`
- Track A: authorization findings in `legacy/behavior-catalog.md` and `legacy/defects.md`
- Template baseline: Standard profile provides platform admin, tenants with subscriptions and
  entitlements, tenant roles (multiple per user), permission claims, tenant-bound tokens.

## Procedure

1. **Tenant model.** Confirm: what the tenant is (school, company, branch, workspace); whether a
   user can belong to several; how a tenant is created and by whom; subscription/entitlements.
   Map to the template: control plane (platform admin) vs tenant plane (tenant admin).
2. **Permission catalog.** Name permissions `Resource.Action` (`Invoices.Read`, `Invoices.Post`).
   Actions follow the business verbs, not only CRUD (`Approve`, `Cancel`, `Export`).
3. **Roles.** Roles group permissions and are configurable per tenant. Decide the default roles
   shipped with the product and which ones are system roles that cannot be edited.
4. **Member type vs role.** If resource scope depends on *who the person is* (a Teacher profile,
   a Customer profile), keep a stable member/profile type separate from editable roles, so scope
   stays deterministic when roles change.
5. **Resource scope matrix.** For each actor × resource write the scope rule:

   | Actor | Resource | Read scope | Write scope | Rule |
   | --- | --- | --- | --- | --- |
   | Teacher | Student | students in classes the teacher teaches | none | BR-021 |
   | Parent | Result | own children's results | none | BR-034 |

   Scope types: all-in-tenant · own · owned-by-my-profile · related-through-X · assigned ·
   none.
6. **IDOR policy.** Out-of-scope IDs return **404** (hide existence) or **403** (reveal
   existence). Default: filter before retrieval and return 404.
7. **Field-level rules.** Fields only some roles may see or edit (salary, grades, medical notes).
8. **Sensitive actions.** Which need confirmation, reason, dual control, or audit?
9. **Session rules.** When access changes (role removed, user disabled, entitlement removed),
   must it apply immediately? (Template default: yes — session revalidation.)

## Outputs

`03-actors-access.md` sections: tenant model, permission catalog, default roles, scope matrix,
IDOR policy, field-level rules, sensitive actions. Authorization rules also appear in
`06-business-rules.md` with type `authorization`.

## Quality bar

- Every story actor has permissions and a scope rule for every resource it touches.
- No scope is written as just "their data" — the relationship path is explicit.
- Platform administration and tenant administration are clearly separated.

## Anti-patterns

- `[Authorize(Roles = "Admin")]`-style role checks as the design.
- Trusting a tenant ID from the request body or header as proof of membership.
- Hiding buttons instead of enforcing on the server.
- One giant "Admin" role for everything in the tenant with no separation of duties.

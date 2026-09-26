# Permission and Authorization Model

This document is the product-wide authority for permission design across the API,
`web-next`, `mobile-react`, plans, and feature documentation.

## Core rule

Runtime authorization uses one exact `Resource:Action` claim for one independently
grantable operation. Broad mutation claims such as `Manage`, `ManageAccess`, or a
single delete claim reused for archive and restore are forbidden.

Examples:

| Intent | Required permission |
| --- | --- |
| Read currencies | `Currencies:View` |
| Create a currency | `Currencies:Create` |
| Edit a currency | `Currencies:Edit` |
| Archive a currency | `Currencies:Archive` |
| Restore a currency | `Currencies:Restore` |
| Permanently delete an eligible record | `<Resource>:Delete` |
| Submit / approve / lock / publish | the exact named lifecycle action |

`Delete` is reserved for an irreversible deletion contract. Soft-delete endpoints
and UI labels use `Archive` and `Restore` as separate permissions. A role editor may
offer a user-facing **Manage / إدارة** preset that selects several exact claims; the
preset is never itself an API claim or authorization policy.

## Bilingual naming

Permission identifiers and API policies are stable English technical keys in
PascalCase (`AccountHierarchyLevels:Archive`). They are not translated in tokens,
database claims, logs, routes, or source code. Every permission exposed to a person
must have both an English and Arabic display label and description in the owning
client/localization catalog. Arabic and English labels describe the same action;
neither language may combine independently grantable actions under “manage”.

Recommended labels:

| Action | English | العربية |
| --- | --- | --- |
| View | View | عرض |
| Create | Create | إضافة |
| Edit | Edit | تعديل |
| Archive | Archive | أرشفة |
| Restore | Restore | استعادة |
| Delete | Permanently delete | حذف نهائي |
| Submit | Submit | إرسال |
| Review | Review / approve or reject | مراجعة / اعتماد أو رفض |
| Publish | Publish | نشر |
| Revoke | Revoke | إلغاء |

## Mandatory Permission Action Matrix

Every planned feature and every permission-changing existing feature must maintain
a matrix before implementation:

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Rules:

1. Include reads, lookups, create, edit, each lifecycle transition, imports,
   exports, reports, bulk operations, credential operations, and access-control
   changes independently.
2. Map every controller action to exactly one minimum permission unless the
   documented operation intentionally requires an explicit `all` set.
3. Navigation visibility, module entitlement, tenant membership, company access,
   read-only state, and named permission remain separate decisions.
4. Web and Mobile hide unavailable actions and guard direct callbacks. The API is
   authoritative and must return forbidden for a missing exact claim.
5. Bulk operations use the permission for their actual action and never gain
   authority from row selection or a client-side preset.
6. Permission replacement is a clean cut during development: update catalogs,
   controllers, clients, tests, seeds, contract matrices, and documentation in one
   change. Do not retain aliases or compatibility claims.

## Enforcement and verification

- API permission catalogs are the source of truth.
- Web and Mobile catalogs mirror the API and must pass parity checks.
- System-role startup reconciliation removes stale permission claims instead of
  only adding new claims. Platform-owned system-role permissions are included
  explicitly by the Platform bootstrap and must not depend on Platform appearing
  in an externally assembled module catalog; in particular, the tenant `admin`
  role always receives the exact `Roles:View`, `RolePermissions:View`, and
  `RolePermissions:Edit` claims from the canonical Platform catalog.
- A protected client route, its navigation/action entry, and its API endpoint use
  the same minimum exact permission. For example, the role-permission route and
  its row action both require `RolePermissions:View`; `Roles:View` only grants
  access to the role list and never implicitly grants permission inspection.
- Architecture tests reject catalog constants whose action begins with `Manage`.
- Tests cover authorized and forbidden outcomes for sensitive actions and prove
  that Archive does not grant Restore (and vice versa).
- Manual acceptance uses roles containing only the single claim being tested, plus
  the minimum independent View/lookup claims required to reach the screen.

## Planning rule

A feature is not implementation-ready while its Permission Action Matrix contains
`Manage`, shares one claim between independently grantable actions, omits Web or
Mobile direct-handler behavior, lacks Arabic/English display ownership, or leaves
the irreversible Delete versus Archive/Restore decision unresolved.

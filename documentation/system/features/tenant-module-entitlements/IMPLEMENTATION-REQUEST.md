# Tenant module entitlements implementation request

## Metadata

| Field | Value |
| --- | --- |
| Feature | `tenant-module-entitlements` |
| Operating mode | New feature |
| Applied reference | Countries architecture and verification discipline |
| Request date | 2026-09-09 |

## Frozen product decisions

| Concern | Decision |
| --- | --- |
| Ownership | Tenant-owned commercial grants; company remains data scope only |
| Persistence | `platform.TenantModuleEntitlements` and `platform.TenantSubmoduleEntitlements`; lower-case codes, composite keys, cascading foreign keys |
| Compatibility | Create omission uses catalog defaults; update omission preserves stored grants; explicit lists replace prior grants, including empty lists |
| Catalog | Installed `IModule.Definition`; HR code `hr`, Accounting code `acc`; Accounting has no business submodules yet |
| Authorization | Existing RBAC claims plus database revalidation plus tenant grant; unknown permissions fail closed; super-admin/global geography stay platform-managed |
| Authentication flow | Username/password → tenant → company → `/apps` → module → submodule |
| Web | Odoo-style shared launcher, typed React Query service, three-level app routes, route/sidebar filtering, shared `MyForm` tenant editor, EN/AR |
| Mobile | Expo Router `/apps`, module and submodule routes, typed Zod API client, shared App components, EN/AR |
| Import/reporting | Excluded; entitlements are entered through the tenant management form and no report surface is part of this feature |
| Realtime | Existing tenant change dispatch invalidates tenant lists; launcher catalog uses a short React Query TTL |

## API contract

`GET /api/v1/modules/installed` is super-admin only. `GET
/api/v1/modules/accessible` returns the current tenant grants intersected with
database-backed role permissions. Tenant create/update accepts
`entitlements: [{ moduleCode, submoduleCodes }]`.

Selection is immutable per module: enabling Accounting appends or restores the
an Accounting entitlement and never removes another module's grant or its selected submodules.

## Verification request

Run API restore/build/test, web type-check/architecture/lint/tests/build, mobile
`npm run check`, documentation check, `git diff --check`, and apply the HR EF
migration with `--context ApplicationDbContext`. CrystalReportGeneratorApi is
independent and is excluded from this change.

# Mobile API compatibility matrix

This document is the human-readable index for the canonical machine-readable
[MOBILE_API_COMPATIBILITY_MATRIX.json](MOBILE_API_COMPATIBILITY_MATRIX.json).
The JSON is the gate input; this page explains the decisions recorded in the
baseline and the work intentionally left for Phase 01.

## Baseline coverage

- 74 physical Expo Router files under `mobile-react/app/**/*.tsx` are listed,
  including layouts, public/authentication routes, dynamic routes, and pages.
- 25 endpoint source files under `mobile-react/src/**/*endpoints.ts` are listed,
  with every exported object member recorded. The checker also catches a new
  endpoint member or route file that is not added to the matrix.
- Each entry records current and target ownership, route/module policy,
  tenant/company scope, offline policy, API/request-response boundary, and a
  status of `aligned`, `mismatch`, or `deferred`.

Run the gate from `mobile-react/`:

```powershell
npm run check:contracts
```

## Ownership findings for Phase 01

The matrix records compatibility findings without changing runtime ownership in
Phase 00:

| Surface | Current mobile boundary | Target API boundary | Status |
|---|---|---|---|
| Countries, states, districts, address types, geographic scope | `HR/basic-data` | `ReferenceData/geography` | mismatch |
| Appointments | `Platform/tools` and legacy `extras` route policy | `CRM/appointments` | mismatch |
| Users, roles, invitations, tenant administration | legacy HR administration route policy | `Platform/administration` | mismatch |
| Change logs and Crystal/reporting surfaces | platform/legacy HR analytics paths | `Reporting/analytics` where the API module owns reporting | mismatch |
| HR organizational structure, recruitment, workforce planning, fiscal-year endpoints | HR module paths | corresponding HR module boundaries | aligned pending API permission verification |
| Entitlement-driven `/apps` routes | dynamic catalog | installed module catalog and API module definition | deferred |

These are compatibility observations, not an approval to add forwarding wrappers
or duplicate modules. Phase 01 owns the registry, route policy, permission, and
module-boundary corrections.

## Offline policy is per surface

Offline is not a requirement for every module. The matrix requires an explicit
policy so that a feature cannot accidentally inherit a permissive offline mode:

| Value | Meaning |
|---|---|
| `online-only` | An authoritative API request is required; no local queue is allowed. This is the default for authentication, tenant/company switching, RBAC, approvals, reporting, file transfer, and destructive actions. |
| `read-cache` | Previously fetched reads may be shown while disconnected. Refresh and all writes remain online-authoritative. |
| `queued-write` | Only a low-risk, explicitly idempotent command may be queued. It must not be used for security administration, approvals, money, inventory, or destructive operations. |
| `required` | Offline is a release requirement for the surface and needs an implementation and device test before the phase can close. |
| `deferred` | The owner must settle the policy after the module/API contract is fixed. |

The current baseline uses `read-cache` only for reference-data list journeys and
`online-only` for the remaining routes and endpoint members. That is a recorded
compatibility policy, not a claim that every offline workflow is implemented.
Future offline-capable work must update the matrix, API idempotency contract,
conflict strategy, and tests together.

## Request, response, and permission boundary

Endpoint entries point to the caller DTO/path/query and response adapter rather
than copying server DTOs into documentation. The API module catalog and endpoint
policy remain the authorization source of truth. Phase 01 must replace any
legacy mobile permission/module key with the exact API claim and entitlement
contract, then add fixture-backed contract tests for super-admin, tenant admin,
limited, read-only, and no-entitlement roles.


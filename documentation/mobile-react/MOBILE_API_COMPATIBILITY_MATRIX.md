# Mobile API compatibility matrix

This document is the human-readable index for the canonical machine-readable
[MOBILE_API_COMPATIBILITY_MATRIX.json](MOBILE_API_COMPATIBILITY_MATRIX.json).
The JSON is the gate input; this page explains the decisions recorded in the
baseline and the work intentionally left for Phase 01.

## Baseline coverage

- 74 physical Expo Router files under `mobile-react/app/**/*.tsx` are listed,
  including layouts, public/authentication routes, dynamic routes, and pages.
- 27 endpoint source files under `mobile-react/src/**/*endpoints.ts` are listed,
  with all 200 exported leaf members and 226 caller operations recorded using full paths such as
  `openings.byId` and `applications.hire`. The checker also catches a new
  endpoint member or route file that is not added to the matrix. It rejects
  local endpoint objects and direct `apiService`, `axiosClient`, or SignalR URLs
  that bypass a reviewed `*-endpoints.ts` catalog.
- Each entry records current and target ownership, the exact current route
  policy and module requirement, the target policy or explicit Phase 01
  deferral, tenant/company scope, offline policy, traced caller operations,
  request/response schema boundary, and a status of `aligned`, `mismatch`, or
  `deferred`.

Run the gate from `mobile-react/`:

```powershell
npm run check:contracts
```

After deliberately adding a route or endpoint leaf, refresh the traced manifest
with `npm run sync:contracts`, review the ownership, permission source, scope,
and offline decision, then run the gate. The sync command discovers a new
endpoint file, but gives an unknown path an `UNREVIEWED` boundary; the gate then
fails until its ownership and permission policy are explicitly classified.

## Ownership findings for Phase 01

The matrix records compatibility findings without changing runtime ownership in
Phase 00:

| Surface | Current mobile boundary | Target API boundary | Status |
|---|---|---|---|
| Countries, states, districts | `HR/basic-data` | `ReferenceData/geography` (global) | mismatch |
| Address types | `HR/basic-data` | `ReferenceData/addresses` (tenant/company) | mismatch |
| Company geographic scope | `HR/basic-data` | `Platform/tenant-administration` | mismatch |
| Appointments | `Platform/tools` and legacy `extras` route policy | `CRM/appointments` | mismatch |
| Users, roles, invitations, offline policy | Platform feature code with legacy `hr/administration` route requirement | `Platform/tenant-administration` | mismatch |
| Change logs and localization | Platform feature code with legacy HR route requirements | `Platform/tenant-administration` | mismatch |
| Hangfire, health, and API diagnostics | Platform feature code with legacy HR route requirements | `Platform/operations` | mismatch |
| Crystal/reporting | `Platform/reporting` | `Reporting/analytics` | mismatch |
| Fiscal years | `HR/finance` and `hr/workforce` route requirement | `Accounting/fiscal-years` (`acc/fiscal-years`) | mismatch |
| HR organizational structure, recruitment, workforce planning | HR module paths | corresponding HR module boundaries | aligned pending exact API permission parity |
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

Endpoint entries contain an `operations` array traced from non-test remote data
sources. Each operation records the actual caller method, transport/HTTP verb, request
argument, response schema (or the concrete API generic when no parser is
present), and the API permission boundary. Unwired constants are explicitly
`verb: ["UNUSED"]`, `status: "deferred"`, and carry no fabricated schema.
Profile, realtime token/hub, host health, Swagger, Hangfire, file upload,
authenticated download/stream, and binary report rendering are included in the
same catalog rather than being treated as invisible special cases.
The API module catalog and endpoint policy remain the authorization source of
truth. Phase 01 must replace any legacy mobile permission/module key with the
exact API claim and entitlement contract, then add fixture-backed contract tests
for super-admin, tenant admin, limited, read-only, and no-entitlement roles.

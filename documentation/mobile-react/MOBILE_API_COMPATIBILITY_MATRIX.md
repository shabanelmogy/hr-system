# Mobile API compatibility matrix

This document is the human-readable index for the canonical machine-readable
[MOBILE_API_COMPATIBILITY_MATRIX.json](MOBILE_API_COMPATIBILITY_MATRIX.json).
The JSON is the gate input; this page explains the decisions recorded in the
baseline and the release evidence intentionally postponed until a real build is
available.

## Baseline coverage

- 74 physical Expo Router files under `mobile-react/app/**/*.tsx` are listed,
  including layouts, public/authentication routes, dynamic routes, and pages.
- 27 endpoint source files under `mobile-react/src/**/*endpoints.ts` are listed,
  with all 193 exported leaf members and 226 caller operations recorded using full paths such as
  `openings.byId` and `applications.hire`. The checker also catches a new
  endpoint member or route file that is not added to the matrix. It rejects
  local endpoint objects and direct `apiService`, `axiosClient`, or SignalR URLs
  that bypass a reviewed `*-endpoints.ts` catalog.
- Each entry records current and target ownership, the exact current route
  policy and module requirement, tenant/company scope, offline policy, traced caller operations,
  request/response schema boundary, and a status of `aligned`. The checker fails
  on active `mismatch`, `deferred`, or `UNREVIEWED` entries.

Run the gate from `mobile-react/`:

```powershell
npm run check:contracts
```

After deliberately adding a route or endpoint leaf, refresh the traced manifest
with `npm run sync:contracts`, review the ownership, permission source, scope,
and offline decision, then run the gate. The sync command discovers a new
endpoint file, but gives an unknown path an `UNREVIEWED` boundary; the gate then
fails until its ownership and permission policy are explicitly classified.

## Ownership decisions closed before business development

The matrix now reflects runtime ownership and route policy after the foundation
migration:

| Surface | Current mobile boundary | Target API boundary | Status |
|---|---|---|---|
| Countries, states, districts | `ReferenceData/geography` | `ReferenceData/geography` (global) | aligned |
| Address types | `ReferenceData/addresses` | `ReferenceData/addresses` (tenant/company) | aligned |
| Company geographic scope | `Platform/tenant-administration` | `Platform/tenant-administration` | aligned |
| Appointments | `CRM/appointments` | `CRM/appointments` | aligned |
| Users, roles, invitations, offline policy | `Platform/tenant-administration` | `Platform/tenant-administration` | aligned |
| Change logs and localization | `Platform/tenant-administration` | `Platform/tenant-administration` | aligned |
| Hangfire, health, and API diagnostics | `Platform/operations` | `Platform/operations` | aligned |
| Crystal/reporting | `Platform/reporting` | `Platform/reporting` | aligned; Platform ownership is intentional until Reporting becomes a first-class mobile module |
| Fiscal years | `Accounting/fiscal-years` (`acc/fiscal-years`) | `Accounting/fiscal-years` | aligned |
| HR organizational structure, recruitment, workforce planning | HR module paths | corresponding HR module boundaries | aligned |
| Entitlement-driven `/apps` routes | Shell dynamic registry | installed module catalog and API module definition | aligned |

Composite Shell routes deliberately have no module requirement; only their child
routes require an entitlement. A registered submodule must expose at least one
entry candidate and route prefix, so deferred screens cannot appear as dead
launcher tiles. Attendance remains deferred and is not registered in the mobile
build until its device workflow is implemented.

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
present), and the API permission boundary. Endpoint initializer patterns are
copied from the actual TypeScript initializer. There are no unused endpoint
members in the active matrix: recruitment interview/offer `byId` and offer
accept/decline constants plus Address Type lookup/with-addresses constants were
removed after source-wide reference checks.
Profile, realtime token/hub, host health, Swagger, Hangfire, file upload,
authenticated download/stream, and binary report rendering are included in the
same catalog rather than being treated as invisible special cases.
The API module catalog and endpoint policy remain the authorization source of
truth. Mobile permissions are tested for exact parity against every current API
permission catalog; the mobile registry never grants permissions or entitlements.

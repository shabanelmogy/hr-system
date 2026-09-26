# ReferenceData Next.js documentation

ReferenceData owns active Next.js features under
`web-next/src/modules/reference-data`.

| Capability | Public route | Source owner | Status |
| --- | --- | --- | --- |
| Countries | `/super-admin/geography/countries` | `geographical-information/countries` | Applied |
| States | `/super-admin/geography/states` | `geographical-information/states` | Applied |
| Districts | `/super-admin/geography/districts` | `geographical-information/districts` | Applied |
| Address Types | `/basic-data/address-types` | `geographical-information/address-types` | Applied |
| Addresses | None | No standalone Web feature | Deferred |

The global geography pages are Platform super-admin routes. The
`referenceDataModuleDefinition` registers the company-scoped Address Types entry
under the tenant-entitled `addresses` submodule. This difference is intentional:
global geography is not a tenant navigation grant.

Applied list features keep API-facing types in the feature, HTTP calls in the
feature service, query/cache ownership in hooks, and page composition in pages
and components. They use the shared form, list, feedback, localization, RTL,
permission, report, and import systems described by their profiles. A standalone
Address page is deferred; owner workflows must use the documented shared Address
contract without inventing feature-local DTOs.

Use the [feature catalog](../features/README.md) for the master/API/Web/Mobile
books. The generated route inventory is maintained in
[`frontend-architecture-manifest.md`](../../../web-next/architecture/frontend-architecture-manifest.md)
and is navigation evidence, not a substitute for feature verification.

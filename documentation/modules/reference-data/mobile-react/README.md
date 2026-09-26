# ReferenceData Expo documentation

ReferenceData owns active Expo features under
`mobile-react/src/modules/reference-data`.

| Capability | Typed route | Source owner | Status |
| --- | --- | --- | --- |
| Countries | `/basic-data/geographical-information/countries` | `geography/countries` | Applied |
| States | `/basic-data/geographical-information/states` | `geography/states` | Applied |
| Districts | `/basic-data/geographical-information/districts` | `geography/districts` | Applied |
| Address Types | `/basic-data/geographical-information/address-types` | `addresses/address-types` | Applied |
| Addresses | None | No standalone Mobile feature | Deferred |

`mobile-react/src/modules/reference-data/moduleDefinition.ts` registers the
global `geography` and tenant-entitled `addresses` submodules. Thin Expo routes
wrap each applied screen in `RouteGuard`; action permissions and read-only mode
are still checked by the feature. The features use their documented Clean
Architecture layers, runtime Zod transport validation, React Query ownership,
shared list/form shells, EN/AR resources, RTL behavior, and native import/report
boundaries.

There is no standalone Address screen. Future Company, Branch/Work Location,
Employee, and Emergency Contact forms must follow the Address mobile reference,
preserve nullable structured fields, and apply owner-domain privacy and
permissions. They must not expose a generic company-wide PII list.

Use the [feature catalog](../features/README.md) for the master/API/Web/Mobile
books and required-file manifests. The general mobile architecture and feature
guides remain authoritative for shared client rules.
